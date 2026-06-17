// src/pages/OrderSuccess.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiCheckCircle,
  HiOutlineShoppingBag,
  HiOutlineDocumentText,
  HiOutlineGift,
  HiOutlineTruck,
  HiOutlineCreditCard,
  HiOutlineLocationMarker,
} from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import api from '../utils/api'
import WhatsAppCustomizationModal from '../components/common/WhatsAppCustomizationModal'

/* ── tiny confetti burst on mount ── */
const ConfettiBurst = () => (
  <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
    {Array.from({ length: 24 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2.5 h-2.5 rounded-sm"
        style={{
          left: `${Math.random() * 100}%`,
          top: '-10px',
          background: ['#a3482a', '#aa941e', '#cf6f4d', '#2a160e', '#d4a06a'][i % 5],
          rotate: Math.random() * 360,
        }}
        animate={{
          y: ['0vh', `${80 + Math.random() * 40}vh`],
          x: [(Math.random() - 0.5) * 200],
          rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
          opacity: [1, 1, 0],
        }}
        transition={{
          duration: 2 + Math.random() * 1.5,
          delay: Math.random() * 0.8,
          ease: 'easeIn',
        }}
      />
    ))}
  </div>
)

/* ── status colour map ── */
const statusColors = {
  placed:    'bg-blue-100 text-blue-700',
  confirmed: 'bg-purple-100 text-purple-700',
  shipped:   'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const OrderSuccess = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(true)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`)
        setOrder(data.order)
        if (data.order?.hasCustomization) {
          setTimeout(() => setShowWhatsAppModal(true), 1500)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
    /* hide confetti after 3 s */
    const t = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(t)
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-16 h-16 border-4 border-chocolate-200 border-t-chocolate-700 rounded-full animate-spin" />
      </div>
    )
  }

  /* derive amounts safely */
  const itemsTotal = order?.items?.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  ) ?? 0
  const shippingCost = order ? (order.totalAmount - itemsTotal) : 0

  return (
    <>
      {/* Confetti */}
      {showConfetti && <ConfettiBurst />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-cream-50 to-white"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ══════════════════════════════════════
              SUCCESS HERO
          ══════════════════════════════════════ */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-28 h-28 bg-green-100 rounded-full mb-5 shadow-lg">
              <HiCheckCircle className="w-20 h-20 text-green-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-chocolate-900 mb-3">
              Order Placed! 🎉
            </h1>
            <p className="text-lg text-chocolate-600 mb-1">
              Thank you for your order. We'll get it ready for you soon.
            </p>
            {order && (
              <p className="text-sm text-chocolate-500 font-mono">
                Order ID: <span className="font-bold text-chocolate-800">#{order._id.slice(-8).toUpperCase()}</span>
              </p>
            )}
          </motion.div>

          {/* ══════════════════════════════════════
              CUSTOMIZATION BANNER
          ══════════════════════════════════════ */}
          {order?.hasCustomization && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-6 mb-6 text-white shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-white rounded-full flex items-center justify-center">
                  <HiOutlineGift className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">
                    📸 Action Required: Send Your Photos
                  </h3>
                  <p className="text-green-50 text-sm mb-4">
                    Your order includes customized items. Send us your photos via
                    WhatsApp with your Order ID so we can personalise it perfectly.
                  </p>
                  <button
                    onClick={() => setShowWhatsAppModal(true)}
                    className="bg-white text-green-600 font-bold px-6 py-3 rounded-full hover:bg-green-50 transition inline-flex items-center gap-2 shadow-md"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    Send Photos on WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              MAIN ORDER CARD
          ══════════════════════════════════════ */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-elegant overflow-hidden mb-6"
            >

              {/* ── Header strip ── */}
              <div className="bg-gradient-to-r from-chocolate-800 to-chocolate-900 px-8 py-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-cream-300 text-xs font-semibold uppercase tracking-wider mb-0.5">Order ID</p>
                  <p className="text-white font-mono font-bold text-lg">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-cream-300 text-xs font-semibold uppercase tracking-wider mb-0.5">Order Date</p>
                  <p className="text-white font-semibold">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="p-8 space-y-8">

                {/* ── Status pills ── */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${statusColors[order.orderStatus] ?? 'bg-gray-100 text-gray-700'}`}>
                    📦 {order.orderStatus?.toUpperCase()}
                  </span>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                    order.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    💳 {order.paymentMethod} — {order.paymentStatus?.toUpperCase()}
                  </span>
                  {order.hasCustomization && (
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-gold-100 text-gold-700">
                      🎨 CUSTOMIZATION
                    </span>
                  )}
                </div>

                {/* ── Items ordered ── */}
                <div>
                  <h3 className="font-bold text-chocolate-900 text-lg mb-3 flex items-center gap-2">
                    <HiOutlineShoppingBag className="w-5 h-5" />
                    Items Ordered
                  </h3>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 items-center bg-cream-50 rounded-2xl p-4"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-cream-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-cream-200 flex items-center justify-center flex-shrink-0 text-2xl">
                            🎨
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-chocolate-900 line-clamp-1">{item.title}</p>
                          <p className="text-sm text-chocolate-500">
                            ₹{item.price} × {item.quantity}
                          </p>
                          {(item.requiresCustomization || item.category === 'gifting') && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                              <FaWhatsapp className="w-3 h-3" /> Send photos
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-chocolate-900 flex-shrink-0">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Price breakdown ── */}
                <div>
                  <h3 className="font-bold text-chocolate-900 text-lg mb-3 flex items-center gap-2">
                    <HiOutlineCreditCard className="w-5 h-5" />
                    Price Breakdown
                  </h3>
                  <div className="bg-cream-50 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between text-chocolate-700">
                      <span>Subtotal ({order.items.length} item{order.items.length !== 1 ? 's' : ''})</span>
                      <span>₹{itemsTotal}</span>
                    </div>

                    <div className="flex justify-between text-chocolate-700">
                      <span className="flex items-center gap-1.5">
                        <HiOutlineTruck className="w-4 h-4" />
                        Shipping
                      </span>
                      {shippingCost === 0 ? (
                        <span className="text-green-600 font-semibold">✓ FREE</span>
                      ) : (
                        <span>₹{shippingCost}</span>
                      )}
                    </div>

                    {shippingCost === 0 && (
                      <p className="text-xs text-green-600 font-medium">
                        🎉 You got free shipping on this order!
                      </p>
                    )}

                    <div className="border-t border-cream-200 pt-3 flex justify-between items-center">
                      <span className="text-lg font-bold text-chocolate-900">Total Paid</span>
                      <span className="text-2xl font-bold text-chocolate-900">₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* ── Shipping address ── */}
                <div>
                  <h3 className="font-bold text-chocolate-900 text-lg mb-3 flex items-center gap-2">
                    <HiOutlineLocationMarker className="w-5 h-5" />
                    Shipping To
                  </h3>
                  <div className="bg-cream-50 rounded-2xl p-5">
                    <p className="font-bold text-chocolate-900 text-base mb-1">
                      {order.shippingAddress?.name}
                    </p>
                    <p className="text-chocolate-700 leading-relaxed">
                      {order.shippingAddress?.street}
                      <br />
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                    </p>
                    <p className="text-chocolate-600 mt-2 text-sm">
                      📞 {order.shippingAddress?.phone}
                    </p>
                  </div>
                </div>

                {/* ── What happens next ── */}
                <div>
                  <h3 className="font-bold text-chocolate-900 text-lg mb-3">What happens next?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { icon: '✅', step: '1', title: 'Order Confirmed', desc: "We've received your order and payment" },
                      { icon: '🎨', step: '2', title: 'Being Prepared', desc: 'Our artisans are crafting your order' },
                      { icon: '🚚', step: '3', title: 'Out for Delivery', desc: 'Your order will be shipped shortly' },
                    ].map((s) => (
                      <div key={s.step} className="bg-cream-50 rounded-2xl p-4 text-center">
                        <div className="text-3xl mb-2">{s.icon}</div>
                        <p className="font-bold text-chocolate-900 text-sm mb-1">{s.title}</p>
                        <p className="text-xs text-chocolate-500">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════
              ACTION BUTTONS
          ══════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Link
              to="/orders"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-chocolate-700 text-chocolate-700 font-bold rounded-full hover:bg-chocolate-50 transition"
            >
              <HiOutlineDocumentText className="w-5 h-5" />
              View My Orders
            </Link>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-chocolate-700 to-chocolate-900 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition"
            >
              <HiOutlineShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Link>
          </motion.div>

          {/* ── WhatsApp button for customization orders ── */}
          {order?.hasCustomization && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-4"
            >
              <button
                onClick={() => setShowWhatsAppModal(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition"
              >
                <FaWhatsapp className="w-5 h-5" />
                Send Customization Photos on WhatsApp
              </button>
            </motion.div>
          )}

        </div>
      </motion.div>

      {/* WhatsApp Modal */}
      <WhatsAppCustomizationModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        order={order}
      />
    </>
  )
}

export default OrderSuccess