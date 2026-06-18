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

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay keys missing in environment')
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured',
      })
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)
    console.log('✅ Razorpay order created:', order.id)

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('❌ Razorpay error:', err)
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

    console.log('🛒 Checkout request received')
    console.log('  user:', req.user?._id)
    console.log('  items:', items?.length)
    console.log('  paymentMethod:', paymentMethod)

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items' })
    }

    // ⭐ Verify Razorpay signature
    if (paymentMethod === 'RAZORPAY') {
      console.log('🔐 Verifying payment signature...')

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        console.error('❌ Missing payment fields')
        return res.status(400).json({
          success: false,
          message: 'Missing payment details',
        })
      }

      if (!process.env.RAZORPAY_KEY_SECRET) {
        console.error('❌ RAZORPAY_KEY_SECRET not set')
        return res.status(500).json({
          success: false,
          message: 'Server configuration error',
        })
      }

      const body = razorpayOrderId + '|' + razorpayPaymentId
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex')

      if (expectedSignature !== razorpaySignature) {
        console.error('❌ Signature mismatch')
        console.error('  expected:', expectedSignature)
        console.error('  received:', razorpaySignature)
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed - signature mismatch',
        })
      }

      console.log('✅ Signature verified')
    }

    // ⭐ Build order items
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

    console.log('✅ Order created:', order._id)

    // Clear cart (don't block on this either)
    Cart.findOneAndUpdate({ user: req.user._id }, { items: [] })
      .then(() => console.log('✅ Cart cleared'))
      .catch((err) => console.error('❌ Cart clear failed:', err.message))

    // ⭐ SEND RESPONSE IMMEDIATELY — don't wait for emails
    res.status(201).json({ success: true, order })

    // 📧 Send emails AFTER response (fire & forget — never blocks)
    sendOrderEmails(order, req.user).catch((err) => {
      console.error('❌ Email background task failed:', err.message)
    })
  } catch (err) {
    console.error('❌ Checkout error:', err)
    // Only send error response if we haven't already responded
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message })
    }
  }
}

// 📧 Helper: Send order emails in background (never blocks API response)
const sendOrderEmails = async (order, user) => {
  const orderId = order._id.toString().slice(-8).toUpperCase()

  // Customer email
  try {
    await sendEmail({
      to: user.email,
      subject: `✅ Order Confirmed #${orderId}`,
      html: orderConfirmationEmail(order, user),
    })
    console.log('✅ Customer email sent to', user.email)
  } catch (err) {
    console.error('❌ Customer email failed:', err.message)
  }

  // Admin email
  if (process.env.ADMIN_EMAIL) {
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `🔔 New Order #${orderId} - ₹${order.totalAmount}`,
        html: adminNewOrderEmail(order, user),
      })
      console.log('✅ Admin email sent')
    } catch (err) {
      console.error('❌ Admin email failed:', err.message)
    }
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

    // Send response first, email after
    res.json({ success: true, order })

    // 📧 Cancellation email (fire & forget)
    ;(async () => {
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
      } catch (err) {
        console.error('❌ Cancel email failed:', err.message)
      }
    })()
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message })
    }
  }
}

// PUT /api/orders/:id/status (admin only)
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

    // Send response first, email after
    res.json({ success: true, order })

    // 📧 Status update email (fire & forget)
    ;(async () => {
      try {
        const user = await User.findById(order.user)
        if (!user) return

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
      } catch (err) {
        console.error('❌ Status email failed:', err.message)
      }
    })()
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message })
    }
  }
}

// GET /api/orders/admin/all (admin only)
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