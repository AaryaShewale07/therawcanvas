import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'

const AdminLayout = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-end px-8 py-4">
            {/* User */}
            <div className="flex items-center gap-3">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=D4A574&color=fff&size=200`}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-primary-200"
              />
              <div>
                <p className="font-medium text-chocolate-900 text-sm">{user.name}</p>
                <p className="text-xs text-chocolate-500">Administrator</p>
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