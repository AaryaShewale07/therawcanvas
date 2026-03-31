import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiOutlineUser, 
  HiOutlineHeart, 
  HiOutlineShoppingBag,
  HiOutlineCog,
  HiOutlineLogout 
} from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    toast.success('Logged out successfully')
  }

  const menuItems = [
    { icon: HiOutlineUser, label: 'My Profile', path: '/profile' },
    { icon: HiOutlineHeart, label: 'Wishlist', path: '/wishlist' },
    { icon: HiOutlineShoppingBag, label: 'My Orders', path: '/orders' },
    { icon: HiOutlineCog, label: 'Settings', path: '/settings' },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-cream-100 transition-colors"
      >
        <img
          src={user?.avatar}
          alt={user?.name}
          className="w-9 h-9 rounded-full border-2 border-primary-500 object-cover"
        />
        <span className="hidden md:block text-sm font-medium text-chocolate-700">
          {user?.name?.split(' ')[0]}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-elegant-lg border border-cream-100 overflow-hidden z-50"
          >
            {/* User Info Header */}
            <div className="p-4 bg-gradient-to-r from-cream-50 to-cream-100 border-b border-cream-200">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                />
                <div>
                  <p className="font-semibold text-chocolate-900">{user?.name}</p>
                  <p className="text-sm text-chocolate-500">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-chocolate-700 hover:bg-cream-50 rounded-xl transition-colors group"
                >
                  <item.icon className="w-5 h-5 text-chocolate-400 group-hover:text-primary-500 transition-colors" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              {/* Admin Link - Only visible for admin users */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-gold-600 hover:bg-gold-50 rounded-xl transition-colors group border-t border-cream-100 mt-2 pt-4"
                >
                  <HiOutlineCog className="w-5 h-5" />
                  <span className="font-medium">Admin Dashboard</span>
                </Link>
              )}
            </div>

            {/* Logout */}
            <div className="p-2 border-t border-cream-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
              >
                <HiOutlineLogout className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserDropdown