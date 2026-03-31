import { motion } from 'framer-motion'
import { 
  HiOutlinePhotograph, 
  HiOutlineCake, 
  HiOutlineGift,
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineCurrencyDollar,
  HiOutlineEye,
  HiOutlineTrendingUp,
  HiOutlinePlus
} from 'react-icons/hi'
import { staggerContainer, staggerItem } from '../../utils/animations'

const stats = [
  { name: 'Total Art', value: '156', change: '+12%', icon: HiOutlinePhotograph, color: 'bg-primary-500' },
  { name: 'Chocolates', value: '89', change: '+8%', icon: HiOutlineCake, color: 'bg-chocolate-600' },
  { name: 'Gift Sets', value: '45', change: '+23%', icon: HiOutlineGift, color: 'bg-gold-500' },
  { name: 'Workshops', value: '12', change: '+5%', icon: HiOutlineAcademicCap, color: 'bg-purple-500' },
]

const quickStats = [
  { name: 'Total Users', value: '2,847', icon: HiOutlineUsers },
  { name: 'Revenue', value: '$48,290', icon: HiOutlineCurrencyDollar },
  { name: 'Page Views', value: '124.5K', icon: HiOutlineEye },
  { name: 'Growth', value: '+18.2%', icon: HiOutlineTrendingUp },
]

const recentPosts = [
  { id: 1, title: 'Abstract Sunset Dreams', category: 'Art', status: 'Published', date: '2 hours ago' },
  { id: 2, title: 'Belgian Dark Truffle Collection', category: 'Chocolates', status: 'Draft', date: '5 hours ago' },
  { id: 3, title: 'Romantic Indulgence Box', category: 'Gifting', status: 'Published', date: '1 day ago' },
  { id: 4, title: 'Chocolate Truffle Masterclass', category: 'Workshops', status: 'Published', date: '2 days ago' },
]

const Dashboard = ({ onAddPost }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
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
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-4 gap-6"
      >
        {quickStats.map((stat, index) => (
          <motion.div
            key={index}
            variants={staggerItem}
            className="bg-white p-6 rounded-2xl shadow-elegant"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cream-100 rounded-xl flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-chocolate-900">{stat.value}</p>
            <p className="text-sm text-chocolate-500">{stat.name}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Content Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={staggerItem}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-elegant border border-cream-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-3xl font-bold text-chocolate-900">{stat.value}</p>
            <p className="text-sm text-chocolate-500 mt-1">{stat.name}</p>
          </motion.div>
        ))}
      </motion.div>

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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-chocolate-500 border-b border-cream-100">
                <th className="pb-4 font-medium">Title</th>
                <th className="pb-4 font-medium">Category</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Date</th>
                <th className="pb-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentPosts.map((post) => (
                <tr key={post.id} className="border-b border-cream-50">
                  <td className="py-4 font-medium text-chocolate-900">{post.title}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-cream-100 text-chocolate-700 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      post.status === 'Published' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="py-4 text-chocolate-500">{post.date}</td>
                  <td className="py-4">
                    <button className="text-primary-600 hover:text-primary-700 font-medium">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard