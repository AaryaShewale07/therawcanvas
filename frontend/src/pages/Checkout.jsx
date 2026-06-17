// src/pages/Checkout.jsx
import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineCreditCard,
  HiOutlineLocationMarker,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineCheckCircle,
  HiOutlineLockClosed,
  HiOutlineTruck,
} from 'react-icons/hi'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ordersAPI } from '../utils/api'
import {
  calculateShipping,
  SHIPPING_CONFIG,
  amountForFreeShipping,
} from '../utils/shippingCalculator'

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  /* ── Buy Now detection ── */
  const isBuyNow = location.state?.buyNow === true
  const buyNowProduct = location.state?.product || null

  /* ── Derive items + subtotal from either mode ── */
  const checkoutItems = isBuyNow
    ? [{ post: { _id: buyNowProduct._id, title: buyNowProduct.title, price: buyNowProduct.price, images: buyNowProduct.image ? [{ url: buyNowProduct.image }] : [] }, quantity: buyNowProduct.quantity }]
    : cart.items || []

  const subtotal = isBuyNow
    ? buyNowProduct.price * buyNowProduct.quantity
    : cartTotal

  const [loading, setLoading] = useState(false)

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.zipCode || '',
  })

  const shippingInfo = useMemo(
    () => calculateShipping(address.pincode, subtotal),
    [address.pincode, subtotal]
  )

  const finalTotal = subtotal + shippingInfo.cost
  const amountNeeded = amountForFreeShipping(subtotal)

  /* ── Redirect if nothing to checkout ── */
  useEffect(() => {
    if (!isBuyNow && (!cart.items || cart.items.length === 0)) {
      navigate('/cart')
    }
  }, [cart, navigate, isBuyNow])

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value })
  }

  const validateAddress = () => {
    if (!address.name || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      toast.error('Please fill all address fields')
      return false
    }
    if (address.phone.length < 10) {
      toast.error('Invalid phone number')
      return false
    }
    if (address.pincode.length !== 6) {
      toast.error('Invalid pincode')
      return false
    }
    if (!shippingInfo.isValid) {
      toast.error('We cannot deliver to this pincode')
      return false
    }
    return true
  }

  const placeOrder = async (razorpayData = {}) => {
    /* ── Build items array for API ── */
    const items = isBuyNow
      ? [{ postId: buyNowProduct._id, quantity: buyNowProduct.quantity }]
      : cart.items.map((i) => ({ postId: i.post._id, quantity: i.quantity }))

    const { data } = await ordersAPI.checkout({
      items,
      shippingAddress: address,
      paymentMethod: 'RAZORPAY',
      ...razorpayData,
    })

    if (data.success) {
      /* Only clear cart if it was a normal cart checkout */
      if (!isBuyNow) clearCart()
      toast.success('Order placed successfully! 🎉')
      navigate(`/order-success/${data.order._id}`)
    }
  }

  const handleRazorpayPayment = async () => {
    if (!validateAddress()) return
    setLoading(true)

    try {
      const { data } = await ordersAPI.createRazorpayOrder(finalTotal)
      if (!data.success) throw new Error('Failed to create payment')

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'TheRawCanvasStudio',
        description: `Order Payment (incl. ₹${shippingInfo.cost} shipping)`,
        order_id: data.orderId,
        prefill: {
          name: address.name,
          email: user.email,
          contact: address.phone,
        },
        theme: { color: '#7a4520' },
        handler: async (response) => {
          try {
            await placeOrder({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
          } catch (err) {
            toast.error('Payment verification failed')
          }
          setLoading(false)
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            toast.error('Payment cancelled')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Payment failed')
      setLoading(false)
    }
  }

  if (!isBuyNow && (!cart.items || cart.items.length === 0)) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-cream-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page title + Buy Now badge */}
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-4xl font-heading font-bold text-chocolate-900">Checkout</h1>
          {isBuyNow && (
            <span className="px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-bold rounded-full border border-primary-300">
              ⚡ Buy Now
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ══════════════════════════════════════════
              LEFT — Address + Payment
          ══════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Shipping Address */}
            <div className="bg-white rounded-3xl shadow-elegant p-6">
              <h2 className="text-2xl font-bold text-chocolate-900 mb-4 flex items-center gap-2">
                <HiOutlineLocationMarker className="w-6 h-6" />
                Shipping Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-chocolate-700 mb-2">Full Name</label>
                  <div className="relative">
                    <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
                    <input
                      name="name"
                      value={address.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-cream-50 rounded-xl border-2 border-transparent focus:border-chocolate-500 focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-chocolate-700 mb-2">Phone</label>
                  <div className="relative">
                    <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
                    <input
                      name="phone"
                      type="tel"
                      value={address.phone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-cream-50 rounded-xl border-2 border-transparent focus:border-chocolate-500 focus:outline-none"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-chocolate-700 mb-2">Street Address</label>
                  <input
                    name="street"
                    value={address.street}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-cream-50 rounded-xl border-2 border-transparent focus:border-chocolate-500 focus:outline-none"
                    placeholder="123 Main Street, Apt 4B"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-chocolate-700 mb-2">City</label>
                  <input
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-cream-50 rounded-xl border-2 border-transparent focus:border-chocolate-500 focus:outline-none"
                    placeholder="Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-chocolate-700 mb-2">State</label>
                  <input
                    name="state"
                    value={address.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-cream-50 rounded-xl border-2 border-transparent focus:border-chocolate-500 focus:outline-none"
                    placeholder="Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                    Pincode
                    {shippingInfo.zoneLabel && (
                      <span className="ml-2 text-xs font-bold text-green-600">
                        ✓ {shippingInfo.zoneLabel}
                      </span>
                    )}
                  </label>
                  <input
                    name="pincode"
                    value={address.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    className={`w-full px-4 py-3 bg-cream-50 rounded-xl border-2 focus:outline-none transition ${
                      address.pincode.length === 6 && shippingInfo.isValid
                        ? 'border-green-500'
                        : address.pincode.length === 6 && !shippingInfo.isValid
                        ? 'border-red-500'
                        : 'border-transparent focus:border-chocolate-500'
                    }`}
                    placeholder="400001"
                  />
                  {address.pincode.length === 6 && !shippingInfo.isValid && (
                    <p className="text-xs text-red-600 mt-1">⚠️ We don't deliver to this pincode yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl shadow-elegant p-6">
              <h2 className="text-2xl font-bold text-chocolate-900 mb-4 flex items-center gap-2">
                <HiOutlineCreditCard className="w-6 h-6" />
                Payment Method
              </h2>

              <div className="bg-gradient-to-br from-chocolate-700 to-chocolate-900 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <HiOutlineCreditCard className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">Secure Online Payment</h3>
                    <p className="text-sm text-cream-200">Powered by Razorpay</p>
                  </div>
                  <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    SECURE
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { icon: '💳', label: 'Cards' },
                    { icon: '📱', label: 'UPI' },
                    { icon: '🏦', label: 'Net Banking' },
                    { icon: '💰', label: 'Wallets' },
                  ].map((m) => (
                    <div key={m.label} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                      <div className="text-2xl mb-1">{m.icon}</div>
                      <p className="text-xs font-semibold">{m.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-cream-200">
                  <HiOutlineLockClosed className="w-4 h-4" />
                  <span>256-bit SSL encrypted • Your data is safe</span>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT — Order Summary
          ══════════════════════════════════════════ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-elegant p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-chocolate-900 mb-4">Order Summary</h2>

              {/* Items list */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {checkoutItems.map((item) => (
                  <div key={item.post._id} className="flex gap-3 items-center">
                    {item.post.images?.[0]?.url ? (
                      <img
                        src={item.post.images[0].url}
                        alt={item.post.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-cream-100 flex items-center justify-center flex-shrink-0 text-2xl">
                        🎨
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-chocolate-900 text-sm line-clamp-1">
                        {item.post.title}
                      </p>
                      <p className="text-xs text-chocolate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-chocolate-900 text-sm flex-shrink-0">
                      ₹{item.post.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Buy Now info banner */}
              {isBuyNow && (
                <div className="mb-4 p-3 bg-primary-50 rounded-xl border border-primary-200">
                  <p className="text-xs text-primary-700 font-semibold flex items-center gap-1.5">
                    ⚡ Direct purchase — not added to your cart
                  </p>
                </div>
              )}

              <hr className="my-4" />

              <div className="space-y-2 text-chocolate-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1">
                    <HiOutlineTruck className="w-4 h-4" />
                    <span>Shipping</span>
                    {shippingInfo.zoneLabel && (
                      <span className="text-xs text-chocolate-500">({shippingInfo.zoneLabel})</span>
                    )}
                  </div>
                  <span className={`font-semibold ${shippingInfo.isFree ? 'text-green-600' : ''}`}>
                    {!shippingInfo.isValid
                      ? 'Enter pincode'
                      : shippingInfo.isFree
                      ? '✓ FREE'
                      : `₹${shippingInfo.cost}`}
                  </span>
                </div>
              </div>

              {shippingInfo.isValid && !shippingInfo.isFree && amountNeeded > 0 && (
                <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs text-amber-800">
                    💡 Add <strong>₹{amountNeeded}</strong> more for FREE shipping!
                  </p>
                </div>
              )}

              {shippingInfo.isFree && shippingInfo.isValid && (
                <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs text-green-800 font-semibold">
                    🎉 You saved ₹{SHIPPING_CONFIG.zones[shippingInfo.zone]?.below500 || 100} on shipping!
                  </p>
                </div>
              )}

              <hr className="my-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-chocolate-900">Total</span>
                <span className="text-2xl font-bold text-chocolate-900">₹{finalTotal}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRazorpayPayment}
                disabled={loading || !shippingInfo.isValid}
                className="w-full bg-gradient-to-r from-chocolate-700 to-chocolate-900 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <HiOutlineLockClosed className="w-5 h-5" />
                    Pay ₹{finalTotal} Securely
                  </>
                )}
              </motion.button>

              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-chocolate-500">
                <HiOutlineCheckCircle className="w-4 h-4 text-green-500" />
                <span>100% Secure Payment</span>
              </div>

              <p className="text-xs text-chocolate-500 text-center mt-3">
                By placing an order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}

export default Checkout