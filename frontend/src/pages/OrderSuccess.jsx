import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiCheckCircle,
  HiOutlineShoppingBag,
  HiOutlineDocumentText,
  HiOutlineGift,
} from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import api from '../utils/api'
import WhatsAppCustomizationModal from '../components/common/WhatsAppCustomizationModal'

const OrderSuccess = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`)
        setOrder(data.order)

        // ⭐ Auto-open WhatsApp modal if order has gifting/customization
        if (data.order?.hasCustomization) {
          // Small delay for better UX
          setTimeout(() => setShowWhatsAppModal(true), 1500)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-16 h-16 border-4 border-chocolate-200 border-t-chocolate-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-cream-50 to-white"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4">
              <HiCheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-chocolate-900 mb-3">
              Order Placed! 🎉
            </h1>
            <p className="text-lg text-chocolate-600">
              Thank you for your order. We'll get it ready for you soon.
            </p>
          </motion.div>

          {/* ⭐ Customization Required Banner */}
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
                    Your order includes customized items. Send us your photos
                    via WhatsApp with your Order ID.
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

          {/* Order Details Card */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-elegant p-8 mb-6"
            >
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-cream-200">
                <div>
                  <p className="text-sm text-chocolate-500">Order ID</p>
                  <p className="text-lg font-mono font-bold text-chocolate-900">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-chocolate-500">Total Amount</p>
                  <p className="text-2xl font-bold text-chocolate-900">
                    ₹{order.totalAmount}
                  </p>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full">
                  📦 {order.orderStatus?.toUpperCase()}
                </span>
                <span
                  className={`text-sm font-semibold px-4 py-2 rounded-full ${
                    order.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  💳 {order.paymentMethod} - {order.paymentStatus?.toUpperCase()}
                </span>
                {order.hasCustomization && (
                  <span className="bg-gold-100 text-gold-700 text-sm font-semibold px-4 py-2 rounded-full">
                    🎨 CUSTOMIZATION
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="space-y-3 mb-6">
                <h3 className="font-bold text-chocolate-900 text-lg">
                  Items Ordered
                </h3>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 items-center bg-cream-50 rounded-xl p-3"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-chocolate-900">
                        {item.title}
                      </p>
                      <p className="text-sm text-chocolate-500">
                        ₹{item.price} × {item.quantity}
                      </p>
                      {(item.requiresCustomization ||
                        item.category === 'gifting') && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                          <FaWhatsapp className="w-3 h-3" />
                          Send photos
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-chocolate-900">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* Shipping Address */}
              <div className="bg-cream-50 rounded-xl p-4">
                <h3 className="font-bold text-chocolate-900 mb-2">
                  📍 Shipping To
                </h3>
                <p className="text-chocolate-700">
                  <strong>{order.shippingAddress?.name}</strong>
                  <br />
                  {order.shippingAddress?.street}
                  <br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} -{' '}
                  {order.shippingAddress?.pincode}
                  <br />
                  📞 {order.shippingAddress?.phone}
                </p>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
        </div>
      </motion.div>

      {/* ⭐ WhatsApp Customization Modal */}
      <WhatsAppCustomizationModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        order={order}
      />
    </>
  )
}

export default OrderSuccess