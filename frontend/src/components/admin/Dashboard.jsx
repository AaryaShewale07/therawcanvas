import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  HiOutlinePhotograph,
  HiOutlineCake,
  HiOutlineGift,
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineEye,
  HiOutlineTrendingUp,
  HiOutlinePlus,
  HiOutlineShoppingBag,
} from 'react-icons/hi'
import { FaRupeeSign } from 'react-icons/fa'
import { staggerContainer, staggerItem } from '../../utils/animations'
import api from '../../utils/api'

const Dashboard = ({ onAddPost }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard')
        setStats(res.data.data)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-20 text-chocolate-500">
        Failed to load dashboard data.
      </div>
    )
  }

  const quickStats = [
    {
      name: 'Total Users',
      value: stats.quickStats.totalUsers.toLocaleString(),
      icon: HiOutlineUsers,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Revenue',
      value: `₹${stats.quickStats.revenue.toLocaleString()}`,
      icon: FaRupeeSign,
      color: 'bg-green-500',
    },
    {
      name: 'Page Views',
      value: stats.quickStats.pageViews.toLocaleString(),
      icon: HiOutlineEye,
      color: 'bg-purple-500',
    },
    {
      name: 'Growth',
      value: stats.quickStats.growth,
      icon: HiOutlineTrendingUp,
      color: 'bg-amber-500',
    },
  ]

  const contentStats = [
    {
      name: 'Art',
      value: stats.contentStats.art.value,
      change: stats.contentStats.art.change,
      revenue: stats.contentStats.art.revenue,
      itemsSold: stats.contentStats.art.itemsSold,
      icon: HiOutlinePhotograph,
      color: 'bg-pink-500',
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      name: 'Chocolates',
      value: stats.contentStats.chocolates.value,
      change: stats.contentStats.chocolates.change,
      revenue: stats.contentStats.chocolates.revenue,
      itemsSold: stats.contentStats.chocolates.itemsSold,
      icon: HiOutlineCake,
      color: 'bg-chocolate-600',
      gradient: 'from-amber-700 to-chocolate-800',
    },
    {
      name: 'Gift Sets',
      value: stats.contentStats.gifting.value,
      change: stats.contentStats.gifting.change,
      revenue: stats.contentStats.gifting.revenue,
      itemsSold: stats.contentStats.gifting.itemsSold,
      icon: HiOutlineGift,
      color: 'bg-gold-500',
      gradient: 'from-yellow-500 to-amber-600',
    },
    {
      name: 'Workshops',
      value: stats.contentStats.workshops.value,
      change: stats.contentStats.workshops.change,
      revenue: stats.contentStats.workshops.revenue,
      itemsSold: stats.contentStats.workshops.itemsSold,
      icon: HiOutlineAcademicCap,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-indigo-600',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-chocolate-900">Dashboard</h1>
          <p className="text-chocolate-500 mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddPost}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl shadow-lg hover:bg-primary-700 transition-colors"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add New Post
        </motion.button>
      </div>

      {/* Quick Stats */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <motion.div key={index} variants={staggerItem} className="bg-white p-6 rounded-2xl shadow-elegant">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-chocolate-900">{stat.value}</p>
            <p className="text-sm text-chocolate-500">{stat.name}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Category Revenue Cards */}
      <div>
        <h2 className="text-xl font-heading font-bold text-chocolate-900 mb-4">
          💰 Revenue by Category
        </h2>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contentStats.map((stat, index) => {
            const isPositive = stat.change.startsWith('+')
            return (
              <motion.div
                key={index}
                variants={staggerItem}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-elegant border border-cream-100 overflow-hidden"
              >
                {/* Top Gradient Header */}
                <div className={`bg-gradient-to-br ${stat.gradient} p-5 text-white`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        isPositive
                          ? 'text-green-700 bg-white/90'
                          : 'text-red-700 bg-white/90'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">{stat.name}</h3>
                  <p className="text-xs text-white/80">{stat.value} {stat.value === 1 ? 'product' : 'products'} listed</p>
                </div>

                {/* Bottom Stats */}
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-xs text-chocolate-500 uppercase font-semibold">Revenue</p>
                    <p className="text-2xl font-bold text-chocolate-900">
                      ₹{stat.revenue.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-cream-100">
                    <div className="flex items-center gap-2">
                      <HiOutlineShoppingBag className="w-4 h-4 text-chocolate-400" />
                      <span className="text-xs text-chocolate-500">Sold</span>
                    </div>
                    <span className="font-bold text-chocolate-900">{stat.itemsSold} units</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Recent Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-elegant p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold text-chocolate-900">Recent Posts</h2>
          <button className="text-primary-600 font-medium text-sm hover:text-primary-700">
            View All →
          </button>
        </div>

        {stats.recentPosts.length === 0 ? (
          <p className="text-center py-8 text-chocolate-500">No posts yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-chocolate-500 border-b border-cream-100">
                  <th className="pb-4 font-medium">Title</th>
                  <th className="pb-4 font-medium">Category</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium">Date</th>
                  <th className="pb-4 font-medium">Author</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats.recentPosts.map((post) => (
                  <tr key={post.id} className="border-b border-cream-50">
                    <td className="py-4 font-medium text-chocolate-900">{post.title}</td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-cream-100 text-chocolate-700 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          post.status === 'Published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="py-4 text-chocolate-500">{post.date}</td>
                    <td className="py-4 text-chocolate-600">{post.author}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Dashboard