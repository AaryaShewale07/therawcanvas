import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  HiOutlineShoppingBag, 
  HiOutlineEye,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineTruck,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineX
} from 'react-icons/hi'
import { pageTransition } from '../../utils/animations'

// Mock orders data
const ordersData = [
  {
    id: 'ORD-2024-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 189.99,
    items: [
      { 
        name: 'Belgian Dark Truffle Collection', 
        quantity: 2, 
        price: 49.99, 
        image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=100'
      },
      { 
        name: 'Abstract Sunset Dreams', 
        quantity: 1, 
        price: 90.01, 
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100'
      },
    ],
    shippingAddress: '123 Main St, New York, NY 10001',
    trackingNumber: 'TRK123456789',
  },
  {
    id: 'ORD-2024-002',
    date: '2024-01-20',
    status: 'shipped',
    total: 129.99,
    items: [
      { 
        name: 'Romantic Indulgence Box', 
        quantity: 1, 
        price: 129.99, 
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100'
      },
    ],
    shippingAddress: '456 Oak Ave, Los Angeles, CA 90001',
    trackingNumber: 'TRK987654321',
  },
  {
    id: 'ORD-2024-003',
    date: '2024-01-22',
    status: 'processing',
    total: 75.00,
    items: [
      { 
        name: 'Chocolate Truffle Masterclass', 
        quantity: 1, 
        price: 75.00, 
        image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=100'
      },
    ],
    shippingAddress: 'Workshop - Main Studio',
    trackingNumber: null,
  },
  {
    id: 'ORD-2024-004',
    date: '2024-01-10',
    status: 'cancelled',
    total: 299.00,
    items: [
      { 
        name: 'Ocean Whispers Canvas', 
        quantity: 1, 
        price: 299.00, 
        image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=100'
      },
    ],
    shippingAddress: '789 Pine Rd, Chicago, IL 60601',
    trackingNumber: null,
  },
]

const statusConfig = {
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-700',
    icon: HiOutlineCheck,
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-blue-100 text-blue-700',
    icon: HiOutlineTruck,
  },
  processing: {
    label: 'Processing',
    color: 'bg-yellow-100 text-yellow-700',
    icon: HiOutlineClock,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700',
    icon: HiOutlineX,
  },
}

const Orders = () => {
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredOrders = filterStatus === 'all' 
    ? ordersData 
    : ordersData.filter(order => order.status === filterStatus)

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="pt-24 pb-16"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-heading font-bold text-chocolate-900 mb-2">
            My Orders
          </h1>
          <p className="text-chocolate-600">
            Track and manage your orders
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'processing', label: 'Processing' },
            { key: 'shipped', label: 'Shipped' },
            { key: 'delivered', label: 'Delivered' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterStatus === tab.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-cream-100 text-chocolate-700 hover:bg-cream-200'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredOrders.map((order, index) => {
              const StatusIcon = statusConfig[order.status].icon
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-elegant overflow-hidden"
                >
                  {/* Order Header */}
                  <div
                    onClick={() => toggleOrder(order.id)}
                    className="p-6 cursor-pointer hover:bg-cream-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cream-100 rounded-xl flex items-center justify-center">
                          <HiOutlineShoppingBag className="w-6 h-6 text-chocolate-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-chocolate-900">{order.id}</p>
                          <p className="text-sm text-chocolate-500">{formatDate(order.date)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusConfig[order.status].color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusConfig[order.status].label}
                        </span>
                        <span className="font-bold text-chocolate-900">
                          ${order.total.toFixed(2)}
                        </span>
                        {expandedOrder === order.id ? (
                          <HiOutlineChevronUp className="w-5 h-5 text-chocolate-500" />
                        ) : (
                          <HiOutlineChevronDown className="w-5 h-5 text-chocolate-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <AnimatePresence>
                    {expandedOrder === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-cream-200 overflow-hidden"
                      >
                        <div className="p-6 bg-cream-50">
                          {/* Items */}
                          <div className="mb-6">
                            <h4 className="font-semibold text-chocolate-900 mb-4">Order Items</h4>
                            <div className="space-y-3">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-xl">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium text-chocolate-900">{item.name}</p>
                                    <p className="text-sm text-chocolate-500">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="font-semibold text-chocolate-900">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping Info */}
                          <div className="grid sm:grid-cols-2 gap-4 mb-6">
                            <div>
                              <h4 className="font-semibold text-chocolate-900 mb-2">Shipping Address</h4>
                              <p className="text-chocolate-600 text-sm">{order.shippingAddress}</p>
                            </div>
                            {order.trackingNumber && (
                              <div>
                                <h4 className="font-semibold text-chocolate-900 mb-2">Tracking Number</h4>
                                <p className="text-primary-600 font-mono text-sm">{order.trackingNumber}</p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                              View Details
                            </motion.button>
                            {order.status === 'shipped' && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-4 py-2 border border-chocolate-300 text-chocolate-700 rounded-lg text-sm font-medium hover:border-chocolate-400 transition-colors"
                              >
                                <HiOutlineTruck className="w-4 h-4" />
                                Track Order
                              </motion.button>
                            )}
                            {order.status === 'delivered' && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-4 py-2 border border-chocolate-300 text-chocolate-700 rounded-lg text-sm font-medium hover:border-chocolate-400 transition-colors"
                              >
                                Reorder
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineShoppingBag className="w-16 h-16 text-cream-400" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-chocolate-900 mb-4">
              No orders found
            </h2>
            <p className="text-chocolate-500 mb-8 max-w-md mx-auto">
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet. Start shopping to see your orders here."
                : `No ${filterStatus} orders found.`
              }
            </p>
            <Link to="/chocolates">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                Start Shopping
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default Orders