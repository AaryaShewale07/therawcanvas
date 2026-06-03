import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  HiOutlineChartBar,
  HiOutlineTrendingUp,
  HiOutlineUsers,
  HiOutlineTicket,
  HiOutlineShoppingBag,
  HiOutlinePhotograph,
  HiOutlineCake,
  HiOutlineGift,
  HiOutlineAcademicCap,
  HiOutlineRefresh,
} from 'react-icons/hi'
import { FaRupeeSign } from 'react-icons/fa'
import api from '../../utils/api'

const COLORS = ['#ec4899', '#d97706', '#eab308', '#9333ea']

const AnalyticsPage = () => {
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [bookingsRes, usersRes, ordersRes] = await Promise.all([
        api.get('/bookings').catch(() => ({ data: { data: [] } })),
        api.get('/auth/users').catch(() => ({ data: { data: [] } })),
        api.get('/dashboard/orders').catch(() => ({ data: { data: [] } })),
      ])
      
      console.log('📊 Analytics Data:')
      console.log('Bookings:', bookingsRes.data.data)
      console.log('Users:', usersRes.data.data)
      console.log('Orders:', ordersRes.data.data)
      
      setBookings(bookingsRes.data.data || [])
      setUsers(usersRes.data.data || [])
      setOrders(ordersRes.data.data || [])
    } catch (err) {
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  // ============== HELPERS ==============

  // Paid orders only
  const paidOrders = orders.filter(
    (o) => o.paymentStatus === 'paid' && o.orderStatus !== 'cancelled'
  )

  // Paid bookings only
  const paidBookings = bookings.filter((b) => b.status === 'paid')

  // Calculate revenue per category from orders
  const getCategoryRevenue = (category) => {
    return paidOrders.reduce((sum, order) => {
      const categoryItems = order.items?.filter((i) => i.category === category) || []
      const categoryTotal = categoryItems.reduce(
        (s, item) => s + (item.price * item.quantity),
        0
      )
      return sum + categoryTotal
    }, 0)
  }

  const getCategoryUnitsSold = (category) => {
    return paidOrders.reduce((sum, order) => {
      const categoryItems = order.items?.filter((i) => i.category === category) || []
      return sum + categoryItems.reduce((s, item) => s + item.quantity, 0)
    }, 0)
  }

  // Workshop revenue from bookings + orders
  const workshopBookingRevenue = paidBookings.reduce((s, b) => s + (b.totalAmount || 0), 0)
  const workshopOrderRevenue = getCategoryRevenue('workshops')
  const totalWorkshopRevenue = workshopBookingRevenue + workshopOrderRevenue

  const workshopBookingTickets = paidBookings.reduce((s, b) => s + (b.peopleCount || 0), 0)
  const workshopOrderUnits = getCategoryUnitsSold('workshops')
  const totalWorkshopUnits = workshopBookingTickets + workshopOrderUnits

  // Build monthly revenue (orders + bookings)
  const buildMonthlyRevenue = () => {
    const months = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' })

      const monthOrders = paidOrders.filter((o) => {
        const od = new Date(o.createdAt)
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear()
      })

      const monthBookings = paidBookings.filter((b) => {
        const bd = new Date(b.createdAt)
        return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear()
      })

      const orderRevenue = monthOrders.reduce((s, o) => s + o.totalAmount, 0)
      const bookingRevenue = monthBookings.reduce((s, b) => s + b.totalAmount, 0)

      months.push({
        month: label,
        revenue: orderRevenue + bookingRevenue,
        orders: monthOrders.length,
        bookings: monthBookings.length,
      })
    }
    return months
  }

  // Category revenue (workshops includes bookings)
  const buildCategoryRevenueData = () => {
    return [
      { 
        category: '🎨 Art', 
        revenue: getCategoryRevenue('art'),
        units: getCategoryUnitsSold('art'),
        color: '#ec4899'
      },
      { 
        category: '🍫 Chocolates', 
        revenue: getCategoryRevenue('chocolates'),
        units: getCategoryUnitsSold('chocolates'),
        color: '#d97706'
      },
      { 
        category: '🎁 Gifting', 
        revenue: getCategoryRevenue('gifting'),
        units: getCategoryUnitsSold('gifting'),
        color: '#eab308'
      },
      { 
        category: '📚 Workshops', 
        revenue: totalWorkshopRevenue,
        units: totalWorkshopUnits,
        color: '#9333ea'
      },
    ]
  }

  const buildUserGrowth = () => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' })
      const count = users.filter((u) => {
        const ud = new Date(u.createdAt)
        return ud.getMonth() === d.getMonth() && ud.getFullYear() === d.getFullYear()
      }).length
      months.push({ month: label, users: count })
    }
    return months
  }

  // Data
  const monthlyRevenue = buildMonthlyRevenue()
  const categoryRevenueData = buildCategoryRevenueData()
  const userGrowth = buildUserGrowth()

  // Totals
  const totalOrderRevenue = paidOrders.reduce((s, o) => s + o.totalAmount, 0)
  const totalRevenue = totalOrderRevenue + workshopBookingRevenue

  // Pie chart data (by revenue)
  const revenuePieData = categoryRevenueData
    .filter((c) => c.revenue > 0)
    .map((c) => ({ name: c.category, value: c.revenue, color: c.color }))

  return (
    <div className="space-y-8">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-chocolate-900">Analytics</h1>
          <p className="text-chocolate-500 mt-1">Overview of your business performance</p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-xl shadow hover:bg-primary-700 transition"
        >
          <HiOutlineRefresh className="w-5 h-5" />
          Refresh Data
        </button>
      </div>

      {/* Top Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: HiOutlineUsers, color: 'bg-blue-500' },
          { label: 'Total Orders', value: paidOrders.length, icon: HiOutlineShoppingBag, color: 'bg-indigo-500' },
          { label: 'Total Bookings', value: paidBookings.length, icon: HiOutlineTicket, color: 'bg-purple-500' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: FaRupeeSign, color: 'bg-green-500' },
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow-elegant p-6"
          >
            <div className={`w-12 h-12 ${m.color} rounded-xl flex items-center justify-center mb-3`}>
              <m.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-chocolate-900">{m.value}</p>
            <p className="text-sm text-chocolate-500">{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Category Revenue Cards */}
      <div>
        <h2 className="text-xl font-heading font-bold text-chocolate-900 mb-4">
          💰 Revenue by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Art', revenue: getCategoryRevenue('art'), units: getCategoryUnitsSold('art'), icon: HiOutlinePhotograph, gradient: 'from-pink-500 to-rose-600' },
            { name: 'Chocolates', revenue: getCategoryRevenue('chocolates'), units: getCategoryUnitsSold('chocolates'), icon: HiOutlineCake, gradient: 'from-amber-700 to-chocolate-800' },
            { name: 'Gifting', revenue: getCategoryRevenue('gifting'), units: getCategoryUnitsSold('gifting'), icon: HiOutlineGift, gradient: 'from-yellow-500 to-amber-600' },
            { name: 'Workshops', revenue: totalWorkshopRevenue, units: totalWorkshopUnits, icon: HiOutlineAcademicCap, gradient: 'from-purple-500 to-indigo-600' },
          ].map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className={`bg-gradient-to-br ${cat.gradient} rounded-2xl p-5 text-white shadow-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <cat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white/90 mb-1">{cat.name}</h3>
              <p className="text-2xl font-bold mb-1">₹{cat.revenue.toLocaleString()}</p>
              <p className="text-xs text-white/80">{cat.units} {cat.name === 'Workshops' ? 'tickets' : 'units'} sold</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Revenue Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-elegant p-6"
      >
        <h2 className="text-lg font-heading font-bold text-chocolate-900 mb-1">
          📈 Revenue Trend (Last 6 Months)
        </h2>
        <p className="text-xs text-chocolate-500 mb-6">Combined orders + workshop bookings</p>
        {monthlyRevenue.some((d) => d.revenue > 0) ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5ede4" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-chocolate-400">
            No revenue data yet
          </div>
        )}
      </motion.div>

      {/* Category Revenue Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-elegant p-6"
      >
        <h2 className="text-lg font-heading font-bold text-chocolate-900 mb-6">
          📊 Revenue by Category
        </h2>
        {categoryRevenueData.some((d) => d.revenue > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5ede4" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                {categoryRevenueData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-chocolate-400">
            No category revenue data yet
          </div>
        )}
      </motion.div>

      {/* Orders + Users */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div className="bg-white rounded-2xl shadow-elegant p-6">
          <h2 className="text-lg font-heading font-bold text-chocolate-900 mb-6">
            🛍️ Orders per Month
          </h2>
          {monthlyRevenue.some((d) => d.orders > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5ede4" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bookings" fill="#9333ea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-chocolate-400">
              No order data yet
            </div>
          )}
        </motion.div>

        <motion.div className="bg-white rounded-2xl shadow-elegant p-6">
          <h2 className="text-lg font-heading font-bold text-chocolate-900 mb-6">
            👥 User Signups per Month
          </h2>
          {userGrowth.some((d) => d.users > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5ede4" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fill="url(#userGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-chocolate-400">
              No user data yet
            </div>
          )}
        </motion.div>
      </div>

      {/* Revenue Pie */}
      {revenuePieData.length > 0 && (
        <motion.div className="bg-white rounded-2xl shadow-elegant p-6">
          <h2 className="text-lg font-heading font-bold text-chocolate-900 mb-6">
            🥧 Revenue Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenuePieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {revenuePieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  )
}

export default AnalyticsPage