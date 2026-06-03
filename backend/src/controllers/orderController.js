import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Post from '../models/Post.js'
import User from '../models/User.js'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import sendEmail from '../utils/sendEmail.js'
import { calculateShipping } from '../utils/shippingCalculator.js'
import {
  orderConfirmationEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  orderCancelledEmail,
  adminNewOrderEmail,
} from '../utils/emailTemplates.js'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// POST /api/orders/create-razorpay-order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('Razorpay error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/orders/checkout
export const checkout = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod = 'RAZORPAY',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items' })
    }

    if (paymentMethod === 'RAZORPAY') {
      const body = razorpayOrderId + '|' + razorpayPaymentId
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex')

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed',
        })
      }
    }

    let orderItems = []
    let subtotal = 0

    for (const item of items) {
      const post = await Post.findById(item.postId)
      if (!post) continue
      if (post.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${post.title} - only ${post.stock} left`,
        })
      }

      orderItems.push({
        post: post._id,
        title: post.title,
        price: post.price,
        quantity: item.quantity,
        image: post.images[0]?.url,
        category: post.category,
        requiresCustomization: post.requiresCustomization,
      })

      subtotal += post.price * item.quantity
      post.stock -= item.quantity
      await post.save()
    }

    // ⭐ Calculate shipping on backend (don't trust frontend)
    const shippingResult = calculateShipping(shippingAddress.pincode, subtotal)
    const shippingCost = shippingResult.cost
    const totalAmount = subtotal + shippingCost

    const hasCustomization = orderItems.some(
      (item) => item.requiresCustomization || item.category === 'gifting'
    )

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal,
      shippingCost,
      shippingZone: shippingResult.zone || '',
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'RAZORPAY' ? 'paid' : 'pending',
      orderStatus: 'placed',
      razorpayOrderId,
      razorpayPaymentId,
      hasCustomization,
    })

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] })

    // ⭐ Send confirmation emails (don't block on errors)
    try {
      // Customer email
      await sendEmail({
        to: req.user.email,
        subject: `✅ Order Confirmed #${order._id.toString().slice(-8).toUpperCase()}`,
        html: orderConfirmationEmail(order, req.user),
      })
      console.log('✅ Order confirmation email sent to customer')

      // Admin notification
      if (process.env.ADMIN_EMAIL) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `🔔 New Order #${order._id.toString().slice(-8).toUpperCase()} - ₹${order.totalAmount}`,
          html: adminNewOrderEmail(order, req.user),
        })
        console.log('✅ Admin notification sent')
      }
    } catch (emailErr) {
      console.error('❌ Order email failed:', emailErr.message)
    }

    res.status(201).json({ success: true, order })
  } catch (err) {
    console.error('Checkout error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/orders/my
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt')
    res.json({ success: true, orders })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ success: false, message: 'Not found' })
    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' })

    order.orderStatus = 'cancelled'
    await order.save()

    // Restore stock
    for (const item of order.items) {
      await Post.findByIdAndUpdate(item.post, { $inc: { stock: item.quantity } })
    }

    // ⭐ Send cancellation email
    try {
      const user = await User.findById(order.user)
      if (user) {
        await sendEmail({
          to: user.email,
          subject: `Order Cancelled #${order._id.toString().slice(-8).toUpperCase()}`,
          html: orderCancelledEmail(order, user),
        })
        console.log('✅ Cancellation email sent')
      }
    } catch (emailErr) {
      console.error('❌ Cancel email failed:', emailErr.message)
    }

    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/orders/:id/status (admin only - updates order status & sends email)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    order.orderStatus = status
    await order.save()

    // ⭐ Send status update email
    try {
      const user = await User.findById(order.user)
      if (user) {
        let subject = ''
        let html = ''
        const orderId = order._id.toString().slice(-8).toUpperCase()

        if (status === 'shipped') {
          subject = `🚚 Your Order #${orderId} has been Shipped!`
          html = orderShippedEmail(order, user)
        } else if (status === 'delivered') {
          subject = `🎉 Order #${orderId} Delivered!`
          html = orderDeliveredEmail(order, user)
        } else if (status === 'cancelled') {
          subject = `Order Cancelled #${orderId}`
          html = orderCancelledEmail(order, user)
        }

        if (subject) {
          await sendEmail({ to: user.email, subject, html })
          console.log(`✅ ${status} email sent to ${user.email}`)
        }
      }
    } catch (emailErr) {
      console.error('❌ Status email failed:', emailErr.message)
    }

    res.json({ success: true, order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/orders/admin/all (admin only - get all orders)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email phone')
      .sort('-createdAt')
    res.json({ success: true, orders })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}