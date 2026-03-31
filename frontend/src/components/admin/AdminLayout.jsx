import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import { HiOutlineBell, HiOutlineSearch } from 'react-icons/hi'

const AdminLayout = () => {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect if not admin
    if (!user || !isAdmin) {
      navigate('/')
    }
  }, [user, isAdmin, navigate])

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-8 py-4">
            {/* Search */}
            <div className="relative w-96">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-12 pr-4 py-2.5 bg-cream-50 rounded-xl border border-cream-200 focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-chocolate-600 hover:bg-cream-100 rounded-full transition-colors"
              >
                <HiOutlineBell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
              </motion.button>

              {/* User */}
              <div className="flex items-center gap-3 pl-4 border-l border-cream-200">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border-2 border-primary-200"
                />
                <div>
                  <p className="font-medium text-chocolate-900 text-sm">{user.name}</p>
                  <p className="text-xs text-chocolate-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout