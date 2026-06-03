import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  HiOutlineUsers,
  HiOutlineSearch,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineBan,
  HiOutlineCheckCircle,
} from 'react-icons/hi'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const { user: currentUser } = useAuth()

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/auth/users')
      setUsers(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleToggleRole = async (userId) => {
    try {
      const res = await api.put(`/auth/users/${userId}/role`)
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? res.data.data : u))
      )
      toast.success('Role updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role')
    }
  }

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.put(`/auth/users/${userId}/status`)
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? res.data.data : u))
      )
      toast.success('Status updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    }
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const adminCount = users.filter((u) => u.role === 'admin').length
  const activeCount = users.filter((u) => u.isActive).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-chocolate-900">Users</h1>
        <p className="text-chocolate-500 mt-1">{users.length} total users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'bg-blue-500', icon: HiOutlineUsers },
          { label: 'Admins', value: adminCount, color: 'bg-gold-500', icon: HiOutlineShieldCheck },
          { label: 'Active', value: activeCount, color: 'bg-green-500', icon: HiOutlineCheckCircle },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow-elegant p-6"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-chocolate-900">{stat.value}</p>
            <p className="text-sm text-chocolate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-elegant p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-elegant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 border-b border-cream-100">
                <tr className="text-left text-sm text-chocolate-500">
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isCurrentUser = u._id === currentUser?._id
                  return (
                    <tr key={u._id} className="border-b border-cream-50 hover:bg-cream-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=D4A574&color=fff&size=80`}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-cream-200"
                          />
                          <div>
                            <p className="font-medium text-chocolate-900">
                              {u.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-primary-500">(You)</span>
                              )}
                            </p>
                            <p className="text-xs text-chocolate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'admin'
                            ? 'bg-gold-100 text-gold-700'
                            : 'bg-cream-100 text-chocolate-700'
                        }`}>
                          {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-chocolate-500">
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        {!isCurrentUser ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleRole(u._id)}
                              className="flex items-center gap-1 px-2 py-1.5 bg-gold-50 text-gold-700 rounded-lg hover:bg-gold-100 transition-colors text-xs font-medium"
                              title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                            >
                              <HiOutlineShieldCheck className="w-4 h-4" />
                              {u.role === 'admin' ? 'Demote' : 'Promote'}
                            </button>
                            <button
                              onClick={() => handleToggleStatus(u._id)}
                              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors text-xs font-medium ${
                                u.isActive
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'
                              }`}
                              title={u.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {u.isActive
                                ? <><HiOutlineBan className="w-4 h-4" /> Ban</>
                                : <><HiOutlineCheckCircle className="w-4 h-4" /> Activate</>
                              }
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-chocolate-400 italic">Current user</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersPage