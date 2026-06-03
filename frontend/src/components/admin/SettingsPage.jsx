import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HiOutlineCog,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineCheckCircle,
  HiOutlineCamera,
} from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const SettingsPage = () => {
  const { user, setUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  // Profile form
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  })
  const [savingProfile, setSavingProfile] = useState(false)

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [savingPassword, setSavingPassword] = useState(false)

  const handleProfileSave = async () => {
    setSavingProfile(true)
    try {
      const res = await api.put('/auth/profile', profileData)
      setUser(res.data.data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSave = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setSavingPassword(true)
    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success('Password changed!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSavingPassword(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: HiOutlineUser },
    { id: 'password', label: 'Password', icon: HiOutlineLockClosed },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-chocolate-900">Settings</h1>
        <p className="text-chocolate-500 mt-1">Manage your admin account settings</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="bg-white rounded-2xl shadow-elegant p-4 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-500/10 text-primary-600'
                    : 'text-chocolate-600 hover:bg-cream-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="md:col-span-3 bg-white rounded-2xl shadow-elegant p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-heading font-bold text-chocolate-900">
                Profile Information
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=D4A574&color=fff&size=200`}
                    alt={user?.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-cream-200"
                  />
                </div>
                <div>
                  <p className="font-medium text-chocolate-900">{user?.name}</p>
                  <p className="text-sm text-chocolate-500">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-gold-100 text-gold-700 text-xs font-semibold rounded-full">
                    👑 Admin
                  </span>
                  <p className="text-xs text-chocolate-400 mt-2">
                    To change avatar, visit your{' '}
                    <a href="/profile" className="text-primary-600 hover:underline">
                      profile page
                    </a>
                  </p>
                </div>
              </div>

              {/* Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    value={profileData.name}
                    onChange={(e) => setProfileData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    value={user?.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-cream-200 rounded-xl bg-cream-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-chocolate-400 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    value={profileData.phone}
                    onChange={(e) => setProfileData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleProfileSave}
                  disabled={savingProfile}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {savingProfile ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <HiOutlineCheckCircle className="w-5 h-5" />
                  )}
                  Save Changes
                </button>
              </div>
            </motion.div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-heading font-bold text-chocolate-900">
                Change Password
              </h2>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />
                </div>

                {/* Password strength indicator */}
                {passwordData.newPassword && (
                  <div>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${
                            passwordData.newPassword.length >= i * 3
                              ? i <= 1 ? 'bg-red-400'
                                : i <= 2 ? 'bg-yellow-400'
                                : i <= 3 ? 'bg-blue-400'
                                : 'bg-green-400'
                              : 'bg-cream-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-chocolate-400 mt-1">
                      {passwordData.newPassword.length < 6 ? 'Too short'
                        : passwordData.newPassword.length < 9 ? 'Fair'
                        : passwordData.newPassword.length < 12 ? 'Good'
                        : 'Strong'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handlePasswordSave}
                  disabled={savingPassword}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {savingPassword ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <HiOutlineLockClosed className="w-5 h-5" />
                  )}
                  Change Password
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage