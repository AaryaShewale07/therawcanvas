// AdminLayout.jsx
import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'

const AdminLayout = () => {
  const { user } = useAuth()
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  return (
    <div className="admin-panel min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area — margin adapts to screen size */}
      <div
        className="min-h-screen flex flex-col transition-all duration-300"
        style={{ marginLeft: isDesktop ? '256px' : '0' }}
      >
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div
            className="flex items-center justify-end py-4 pr-4 sm:pr-6 lg:pr-8"
            style={{ paddingLeft: isDesktop ? '32px' : '80px' }}
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=D4A574&color=fff&size=200`
                }
                alt={user?.name}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-primary-200 flex-shrink-0"
              />
              <div className="hidden sm:block">
                <p className="font-medium text-sm text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout