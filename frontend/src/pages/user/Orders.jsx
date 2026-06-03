import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineShoppingBag, HiOutlineChevronRight, HiOutlineXCircle } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import toast from 'react-hot-toast'
import api from '../../utils/api'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my')
      setOrders(data.orders || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return
    try {
      await api.put(`/orders/${orderId}/cancel`)
      toast.success('Order cancelled')
      fetchOrders()
    } catch (err) {
      toast.error('Failed to cancel')
    }
  }

  const handleSendPhotos = (order) => {
    const orderId = order._id.slice(-8).toUpperCase()
    const message = encodeURIComponent(
      `Hello TheRawCanvasStudio! 👋

I need to send photos for customization.

📋 *Order Details:*
• Order ID: *#${orderId}*
• Name: ${order.shippingAddress?.name}
• Amount: ₹${order.totalAmount}

I'm ready to share my photos. 📸✨`
    )
    window.open(`https://wa.me/918291271695?text=${message}`, '_blank')
  }

  const statusColors = {
    placed: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-purple-100 text-purple-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-16 h-16 border-4 border-chocolate-200 border-t-chocolate-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <HiOutlineShoppingBag className="w-24 h-24 text-chocolate-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-chocolate-900 mb-3">No orders yet</h2>
          <p className="text-chocolate-600 mb-6">Start shopping to see your orders here!</p>
          <Link
            to="/art"
            className="inline-block bg-chocolate-700 text-white px-8 py-3 rounded-full font-bold hover:bg-chocolate-800 transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-cream-50 to-white"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold text-chocolate-900 mb-8">
          My Orders ({orders.length})
        </h1>

        <div className="space-y-4">
          {orders.map((order, idx) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl shadow-elegant p-6 hover:shadow-elegant-lg transition"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-cream-200">
                <div>
                  <p className="text-sm text-chocolate-500">Order ID</p>
                  <p className="font-mono font-bold text-chocolate-900">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-chocolate-500">Date</p>
                  <p className="font-semibold text-chocolate-900">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-chocolate-500">Total</p>
                  <p className="font-bold text-chocolate-900 text-lg">₹{order.totalAmount}</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
                    {order.orderStatus?.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.paymentMethod}
                  </span>
                  {order.hasCustomization && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold-100 text-gold-700 flex items-center gap-1">
                      🎨 CUSTOMIZE
                    </span>
                  )}
                </div>
              </div>

              {/* Customization Alert Banner */}
              {order.hasCustomization && (
                <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-r-xl flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-sm text-chocolate-700">
                    <FaWhatsapp className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>
                      <strong>Photos needed!</strong> Send your photos via WhatsApp with Order ID.
                    </span>
                  </div>
                  <button
                    onClick={() => handleSendPhotos(order)}
                    className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-full transition flex items-center gap-2"
                  >
                    <FaWhatsapp className="w-4 h-4" /> Send Now
                  </button>
                </div>
              )}

              {/* Items */}
              <div className="flex flex-wrap gap-3 mb-4">
                {order.items.slice(0, 4).map((item, i) => (
                  <img
                    key={i}
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-cream-200"
                  />
                ))}
                {order.items.length > 4 && (
                  <div className="w-16 h-16 rounded-xl bg-cream-100 flex items-center justify-center font-bold text-chocolate-700">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>

              <p className="text-chocolate-600 mb-4 text-sm">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''} •{' '}
                {order.items.map((i) => i.title).join(', ').slice(0, 60)}...
              </p>

              {/* Action Buttons — ALL inside the map */}
              <div className="flex flex-wrap gap-4 items-center">
                <Link
                  to={`/order-success/${order._id}`}
                  className="flex items-center gap-1 text-chocolate-700 hover:text-chocolate-900 font-semibold text-sm"
                >
                  View Details <HiOutlineChevronRight />
                </Link>

                {['placed', 'confirmed'].includes(order.orderStatus) && (
                  <button
                    onClick={() => handleCancel(order._id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold text-sm"
                  >
                    <HiOutlineXCircle className="w-4 h-4" /> Cancel Order
                  </button>
                )}

                {order.hasCustomization && (
                  <button
                    onClick={() => handleSendPhotos(order)}
                    className="flex items-center gap-1 text-green-600 hover:text-green-800 font-semibold text-sm"
                  >
                    <FaWhatsapp className="w-4 h-4" /> Send Photos
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default Orders