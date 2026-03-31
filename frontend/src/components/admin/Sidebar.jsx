import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  HiOutlineHome,
  HiOutlinePhotograph,
  HiOutlineCake,
  HiOutlineGift,
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineDocumentText,
  HiOutlineChartBar
} from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'

const menuItems = [
  { 
    title: 'Overview',
    items: [
      { name: 'Dashboard', icon: HiOutlineHome, path: '/admin' },
      { name: 'Analytics', icon: HiOutlineChartBar, path: '/admin/analytics' },
    ]
  },
  {
    title: 'Content',
    items: [
      { name: 'All Posts', icon: HiOutlineDocumentText, path: '/admin/posts' },
      { name: 'Art', icon: HiOutlinePhotograph, path: '/admin/art' },
      { name: 'Chocolates', icon: HiOutlineCake, path: '/admin/chocolates' },
      { name: 'Gifting', icon: HiOutlineGift, path: '/admin/gifting' },
      { name: 'Workshops', icon: HiOutlineAcademicCap, path: '/admin/workshops' },
    ]
  },
  {
    title: 'Management',
    items: [
      { name: 'Users', icon: HiOutlineUsers, path: '/admin/users' },
      { name: 'Settings', icon: HiOutlineCog, path: '/admin/settings' },
    ]
  }
]

const Sidebar = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-chocolate-900 text-cream-100 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-chocolate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-gold-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-script text-lg">A&C</span>
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg text-white">Admin Panel</h1>
            <p className="text-xs text-cream-400">TheRawCanvasStudio</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        {menuItems.map((section, idx) => (
          <div key={idx} className="mb-6">
            <p className="px-6 text-xs font-semibold text-cream-500 uppercase tracking-wider mb-3">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all
                      ${isActive 
                        ? 'bg-primary-500/20 text-primary-400 border-r-4 border-primary-500' 
                        : 'text-cream-300 hover:bg-chocolate-800 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Back to Site & Logout */}
      <div className="p-4 border-t border-chocolate-800 space-y-2">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-cream-300 hover:bg-chocolate-800 hover:text-white rounded-xl transition-colors"
        >
          <HiOutlineHome className="w-5 h-5" />
          Back to Website
        </NavLink>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <HiOutlineLogout className="w-5 h-5" />
          Logout
        </motion.button>
      </div>
    </aside>
  )
}

export default Sidebar