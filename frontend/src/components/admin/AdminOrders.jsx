import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineSearch,
  HiOutlineDownload,
  HiOutlineEye,
  HiOutlineCheck,
  HiOutlineTruck,
  HiOutlineXCircle,
  HiOutlineRefresh,
  HiOutlineShoppingBag,
  HiOutlineClock,
  HiOutlineGift, // ⭐ NEW
} from 'react-icons/hi'
import { FaWhatsapp, FaRupeeSign } from 'react-icons/fa'
import toast from 'react-hot-toast'
import api from '../../utils/api'

const STATUS_COLORS = {
  placed: 'bg-blue-100 text-blue-700 border-blue-300',
  confirmed: 'bg-purple-100 text-purple-700 border-purple-300',
  shipped: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  delivered: 'bg-green-100 text-green-700 border-green-300',
  cancelled: 'bg-red-100 text-red-700 border-red-300',
}

const CATEGORY_COLORS = {
  art: 'bg-pink-100 text-pink-700',
  chocolates: 'bg-amber-100 text-amber-700',
  gifting: 'bg-yellow-100 text-yellow-700',
  workshops: 'bg-purple-100 text-purple-700',
}

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [triggeringReward, setTriggeringReward] = useState(null) // ⭐ NEW

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = {}
      if (categoryFilter !== 'all') params.category = categoryFilter
      if (statusFilter !== 'all') params.status = statusFilter
      if (search) params.search = search

      const [ordersRes, statsRes] = await Promise.all([
        api.get('/dashboard/orders', { params }),
        api.get('/dashboard/orders/stats'),
      ])
      setOrders(ordersRes.data.data || [])
      setStats(statsRes.data.data)
    } catch (err) {
      console.error('Fetch error:', err)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [categoryFilter, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => fetchOrders(), 500)
    return () => clearTimeout(timer)
  }, [search])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus })
      toast.success(`Order marked as ${newStatus}! Email sent.`)

      // ⭐ Show extra toast if reward may have been triggered
      if (newStatus === 'delivered') {
        setTimeout(() => {
          toast.success('🎁 Referral reward auto-triggered (if applicable)', {
            duration: 4000,
          })
        }, 500)
      }

      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    } finally {
      setUpdating(null)
    }
  }

  // ⭐ NEW — Manual trigger referral reward
  const handleTriggerReward = async (orderId, e) => {
    e.stopPropagation()
    if (!window.confirm('Manually trigger referral reward for this order?')) return

    setTriggeringReward(orderId)
    try {
      const { data } = await api.post(`/referrals/admin/trigger-reward/${orderId}`)
      if (data.success) {
        toast.success(`🎁 Reward issued! Code: ${data.coupon.code}`, {
          duration: 5000,
        })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not trigger reward')
    } finally {
      setTriggeringReward(null)
    }
  }

  const exportToCSV = () => {
    if (orders.length === 0) {
      toast.error('No orders to export')
      return
    }

    const headers = [
      'Order ID', 'Date', 'Customer Name', 'Email', 'Phone', 'Items',
      'Categories', 'Subtotal', 'Shipping', 'Total', 'Payment Method',
      'Payment Status', 'Order Status', 'Street', 'City', 'State', 'Pincode', 'Customization',
    ]

    const rows = orders.map((order) => [
      `#${order._id.slice(-8).toUpperCase()}`,
      new Date(order.createdAt).toLocaleString('en-IN'),
      order.user?.name || order.shippingAddress?.name || '',
      order.user?.email || '',
      order.shippingAddress?.phone || '',
      order.items.map((i) => `${i.title} (${i.quantity})`).join('; '),
      [...new Set(order.items.map((i) => i.category))].join(', '),
      order.subtotal || order.totalAmount,
      order.shippingCost || 0,
      order.totalAmount,
      order.paymentMethod,
      order.paymentStatus,
      order.orderStatus,
      order.shippingAddress?.street || '',
      order.shippingAddress?.city || '',
      order.shippingAddress?.state || '',
      order.shippingAddress?.pincode || '',
      order.hasCustomization ? 'YES' : 'NO',
    ])

    const escapeCsv = (val) => {
      const str = String(val ?? '')
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const csvContent = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateStr = new Date().toISOString().split('T')[0]
    link.href = url
    link.download = `orders-${categoryFilter}-${dateStr}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${orders.length} orders!`)
  }

  const getNextAction = (currentStatus) => {
    switch (currentStatus) {
      case 'placed':
        return { label: 'Confirm', next: 'confirmed', color: 'bg-purple-500 hover:bg-purple-600' }
      case 'confirmed':
        return { label: 'Dispatch', next: 'shipped', color: 'bg-indigo-500 hover:bg-indigo-600', icon: HiOutlineTruck }
      case 'shipped':
        return { label: 'Delivered', next: 'delivered', color: 'bg-green-500 hover:bg-green-600', icon: HiOutlineCheck }
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">Orders Management</h1>
          <p className="text-sm text-gray-500 mt-1">View, manage, and track all customer orders</p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm"
          >
            <HiOutlineRefresh className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-green-600 text-white font-bold rounded-xl shadow hover:bg-green-700 text-sm"
          >
            <HiOutlineDownload className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{orders.length}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Total" value={stats.totalOrders} icon={HiOutlineShoppingBag} color="bg-blue-500" />
          <StatCard label="Placed" value={stats.placedOrders} icon={HiOutlineClock} color="bg-yellow-500" />
          <StatCard label="Shipped" value={stats.shippedOrders} icon={HiOutlineTruck} color="bg-indigo-500" />
          <StatCard label="Delivered" value={stats.deliveredOrders} icon={HiOutlineCheck} color="bg-green-500" />
          <StatCard label="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={FaRupeeSign} color="bg-amber-500" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-stretch md:items-center">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Order ID, name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg border-2 border-transparent focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 md:flex-initial px-3 py-2 bg-gray-50 rounded-lg border-2 border-transparent focus:border-blue-500 focus:outline-none cursor-pointer text-sm"
            >
              <option value="all">All Categories</option>
              <option value="art">🎨 Art</option>
              <option value="chocolates">🍫 Chocolates</option>
              <option value="gifting">🎁 Gifting</option>
              <option value="workshops">📚 Workshops</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 md:flex-initial px-3 py-2 bg-gray-50 rounded-lg border-2 border-transparent focus:border-blue-500 focus:outline-none cursor-pointer text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="placed">📋 Placed</option>
              <option value="confirmed">✅ Confirmed</option>
              <option value="shipped">🚚 Shipped</option>
              <option value="delivered">📦 Delivered</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <HiOutlineShoppingBag className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-lg">No orders found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs text-gray-600 uppercase">
                  <th className="px-3 py-3 font-semibold">Order</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Items</th>
                  <th className="px-3 py-3 font-semibold">Total</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Date</th>
                  <th className="px-3 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const categories = [...new Set(order.items.map((i) => i.category))]
                  const nextAction = getNextAction(order.orderStatus)
                  const isUpdating = updating === order._id
                  const isTriggeringReward = triggeringReward === order._id

                  return (
                    <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                      {/* Order ID + Categories */}
                      <td className="px-3 py-3 align-top">
                        <p className="font-mono font-bold text-gray-900 text-xs">
                          #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {categories.map((cat) => (
                            <span
                              key={cat}
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-700'}`}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                        {order.hasCustomization && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                            <FaWhatsapp className="w-3 h-3" /> Custom
                          </span>
                        )}
                        {/* ⭐ NEW — Referral badge */}
                        {order.referralApplied && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-1 ml-1">
                            🎁 Referred
                          </span>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="px-3 py-3 align-top max-w-[180px]">
                        <p className="font-semibold text-gray-900 text-xs truncate">
                          {order.user?.name || order.shippingAddress?.name}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">{order.user?.email}</p>
                        <p className="text-[11px] text-gray-500">📱 {order.shippingAddress?.phone}</p>
                      </td>

                      {/* Items */}
                      <td className="px-3 py-3 align-top max-w-[200px]">
                        <p className="text-xs text-gray-700 line-clamp-2">
                          {order.items.map((i) => `${i.title} (${i.quantity})`).join(', ')}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1">{order.items.length} item(s)</p>
                      </td>

                      {/* Total */}
                      <td className="px-3 py-3 align-top">
                        <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                        <p className="text-[11px] text-green-600 font-semibold">{order.paymentMethod}</p>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3 align-top">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full border whitespace-nowrap ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {order.orderStatus?.toUpperCase()}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-3 align-top text-[11px] text-gray-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: '2-digit',
                        })}
                        <br />
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3 align-top">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg"
                            title="View details"
                          >
                            <HiOutlineEye className="w-4 h-4 text-gray-600" />
                          </button>

                          {nextAction && order.orderStatus !== 'cancelled' && (
                            <button
                              onClick={() => handleStatusChange(order._id, nextAction.next)}
                              disabled={isUpdating}
                              className={`flex items-center gap-1 px-2.5 py-1.5 text-white text-[11px] font-bold rounded-lg shadow whitespace-nowrap ${nextAction.color} disabled:opacity-50`}
                            >
                              {isUpdating ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  {nextAction.icon && <nextAction.icon className="w-3 h-3" />}
                                  {nextAction.label}
                                </>
                              )}
                            </button>
                          )}

                          {/* ⭐ NEW — Trigger Reward button for delivered orders with referral */}
                          {order.orderStatus === 'delivered' && order.referralApplied && (
                            <button
                              onClick={(e) => handleTriggerReward(order._id, e)}
                              disabled={isTriggeringReward}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-primary-500 to-gold-500 text-white text-[11px] font-bold rounded-lg shadow hover:shadow-md disabled:opacity-50"
                              title="Manually trigger referral reward"
                            >
                              {isTriggeringReward ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <HiOutlineGift className="w-3 h-3" />
                                  Reward
                                </>
                              )}
                            </button>
                          )}

                          {['placed', 'confirmed'].includes(order.orderStatus) && (
                            <button
                              onClick={() => {
                                if (window.confirm('Cancel this order?')) {
                                  handleStatusChange(order._id, 'cancelled')
                                }
                              }}
                              className="p-1.5 hover:bg-red-50 rounded-lg"
                              title="Cancel"
                            >
                              <HiOutlineXCircle className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onTriggerReward={handleTriggerReward}
            isTriggeringReward={triggeringReward === selectedOrder?._id}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl shadow p-4">
    <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center mb-2`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
)

// Order Details Modal
const OrderDetailsModal = ({ order, onClose, onTriggerReward, isTriggeringReward }) => {
  const orderId = order._id.slice(-8).toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-300">Order ID</p>
              <h2 className="text-2xl font-bold font-mono">#{orderId}</h2>
              <p className="text-sm text-gray-400 mt-1">
                {new Date(order.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
              <HiOutlineXCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[order.orderStatus]}`}>
              {order.orderStatus?.toUpperCase()}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
              {order.paymentMethod} - {order.paymentStatus?.toUpperCase()}
            </span>
            {order.hasCustomization && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                🎨 CUSTOMIZATION
              </span>
            )}
            {order.referralApplied && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                🎁 REFERRED USER
              </span>
            )}
            {order.coupon?.code && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                🎟️ {order.coupon.code}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="font-bold text-gray-900 mb-2">👤 Customer</h3>
            <p className="text-gray-700"><strong>{order.user?.name || order.shippingAddress?.name}</strong></p>
            <p className="text-sm text-gray-600">📧 {order.user?.email}</p>
            <p className="text-sm text-gray-600">📱 {order.shippingAddress?.phone}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="font-bold text-gray-900 mb-2">📍 Shipping Address</h3>
            <p className="text-gray-700">
              {order.shippingAddress?.street}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
              <strong>PIN: {order.shippingAddress?.pincode}</strong>
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-3">📦 Items ({order.items.length})</h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 bg-gray-50 rounded-xl p-3 items-center">
                  <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {item.category} • Qty: {item.quantity} × ₹{item.price}
                    </p>
                    {item.requiresCustomization && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                        📸 Needs photos
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-gray-900 flex-shrink-0">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white">
            <h3 className="font-bold mb-3">💰 Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{order.subtotal || order.totalAmount}</span>
              </div>

              {order.coupon?.code && (
                <div className="flex justify-between text-green-300">
                  <span>Discount ({order.coupon.code}):</span>
                  <span>-₹{order.coupon.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping {order.shippingZone && `(${order.shippingZone})`}:</span>
                <span className={order.shippingCost === 0 ? 'text-green-300 font-bold' : ''}>
                  {order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost || 0}`}
                </span>
              </div>
              <hr className="border-white/20 my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* ⭐ NEW — Trigger Reward CTA in modal */}
          {order.orderStatus === 'delivered' && order.referralApplied && (
            <button
              onClick={(e) => onTriggerReward(order._id, e)}
              disabled={isTriggeringReward}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-500 via-primary-600 to-gold-500 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50"
            >
              {isTriggeringReward ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Triggering...
                </>
              ) : (
                <>
                  <HiOutlineGift className="w-5 h-5" />
                  Trigger Referral Reward (₹100 coupon to referrer)
                </>
              )}
            </button>
          )}

          {order.shippingAddress?.phone && (
            <a
              href={`https://wa.me/91${order.shippingAddress.phone.replace(/\D/g, '').slice(-10)}?text=Hi%20${encodeURIComponent(order.shippingAddress?.name || '')}%2C%20regarding%20your%20order%20%23${orderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600"
            >
              <FaWhatsapp className="w-5 h-5" />
              Message Customer on WhatsApp
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default AdminOrders