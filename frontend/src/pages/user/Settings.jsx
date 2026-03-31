import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    HiOutlineLockClosed,
    HiOutlineBell,
    HiOutlineGlobe,
    HiOutlineMoon,
    HiOutlineTrash,
    HiOutlineShieldCheck,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineExclamationCircle
} from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'
import { pageTransition } from '../../utils/animations'
import toast from 'react-hot-toast'

const Settings = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('password')
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)

    // Password Form
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
    })

    // Preferences
    const [preferences, setPreferences] = useState({
        language: 'en',
        currency: 'USD',
        darkMode: false,
    })

    // 2FA
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
    const [backupCodes, setBackupCodes] = useState([])
    const [showBackupCodes, setShowBackupCodes] = useState(false)

    // Active Sessions
    const [activeSessions, setActiveSessions] = useState([])

    // Account Deletion
    const [deletePassword, setDeletePassword] = useState('')
    const [deleteReason, setDeleteReason] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const tabs = [
        { id: 'password', label: 'Password', icon: HiOutlineLockClosed },
        { id: 'preferences', label: 'Preferences', icon: HiOutlineGlobe },
        { id: 'security', label: 'Security', icon: HiOutlineShieldCheck },
    ]

    // Fetch all settings on mount
    useEffect(() => {
        fetchAllSettings()
    }, [])

    const fetchAllSettings = async () => {
        setIsFetching(true)
        try {
            const token = localStorage.getItem('token')

            const res = await fetch('http://localhost:5000/api/settings', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await res.json()

            if (res.ok) {
                setPreferences(data.data.preferences)
                setTwoFactorEnabled(data.data.twoFactorAuth.enabled)
            } else {
                toast.error(data.message || 'Failed to load settings')
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
            toast.error('Failed to load settings')
        } finally {
            setIsFetching(false)
        }
    }

    const fetchActiveSessions = async () => {
        try {
            const token = localStorage.getItem('token')

            const res = await fetch('http://localhost:5000/api/settings/sessions', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await res.json()

            if (res.ok) {
                setActiveSessions(data.data.sessions)
            }
        } catch (error) {
            console.error('Error fetching sessions:', error)
        }
    }

    useEffect(() => {
        if (activeTab === 'security') {
            fetchActiveSessions()
        }
    }, [activeTab])

    // ==================== PASSWORD ====================
    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordForm(prev => ({ ...prev, [name]: value }))
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()

        if (passwordForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')

            const res = await fetch('http://localhost:5000/api/auth/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(passwordForm),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message || 'Failed to update password')

            toast.success('Password updated successfully!')
            setPasswordForm({ currentPassword: '', newPassword: '' })
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // ==================== PREFERENCES ====================
    const handlePreferenceChange = async (key, value) => {
        const updatedPreferences = {
            ...preferences,
            [key]: value,
        }

        setPreferences(updatedPreferences)

        try {
            const token = localStorage.getItem('token')

            const res = await fetch('http://localhost:5000/api/settings/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedPreferences),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message)

            toast.success('Preferences updated')
        } catch (error) {
            toast.error(error.message)
            // Revert on error
            setPreferences(preferences)
        }
    }

    // ==================== TWO-FACTOR AUTH ====================
    const handleEnable2FA = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')

            const res = await fetch('http://localhost:5000/api/settings/2fa/enable', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message)

            setTwoFactorEnabled(true)
            setBackupCodes(data.data.backupCodes)
            setShowBackupCodes(true)
            toast.success('Two-factor authentication enabled!')
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDisable2FA = async () => {
        const password = prompt('Enter your password to disable 2FA:')
        if (!password) return

        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')

            const res = await fetch('http://localhost:5000/api/settings/2fa/disable', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ password }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message)

            setTwoFactorEnabled(false)
            toast.success('Two-factor authentication disabled')
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // ==================== ACTIVE SESSIONS ====================
    const handleRevokeSession = async (sessionId) => {
        if (!window.confirm('Are you sure you want to revoke this session?')) return

        try {
            const token = localStorage.getItem('token')

            const res = await fetch(`http://localhost:5000/api/settings/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message)

            toast.success('Session revoked')
            fetchActiveSessions()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleRevokeAllSessions = async () => {
        if (!window.confirm('This will log you out from all other devices. Continue?')) return

        try {
            const token = localStorage.getItem('token')

            const res = await fetch('http://localhost:5000/api/settings/sessions', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message)

            toast.success('All other sessions revoked')
            fetchActiveSessions()
        } catch (error) {
            toast.error(error.message)
        }
    }

    // ==================== DELETE ACCOUNT ====================
    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            toast.error('Password is required')
            return
        }

        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')

            const res = await fetch('http://localhost:5000/api/settings/delete-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    password: deletePassword,
                    reason: deleteReason,
                }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message)

            toast.success('Account deletion scheduled for 30 days from now')
            setShowDeleteModal(false)

            // Logout and redirect
            setTimeout(() => {
                logout()
                navigate('/')
            }, 2000)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isFetching) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="w-12 h-12 border-4 border-cream-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <motion.div
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="pt-24 pb-16"
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-heading font-bold text-chocolate-900 mb-2">
                        Settings
                    </h1>
                    <p className="text-chocolate-600">
                        Manage your account settings and preferences
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-1"
                    >
                        <nav className="space-y-2">
                            {tabs.map((tab) => (
                                <motion.button
                                    key={tab.id}
                                    whileHover={{ x: 5 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id
                                        ? 'bg-primary-600 text-white'
                                        : 'text-chocolate-700 hover:bg-cream-100'
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    <span className="font-medium">{tab.label}</span>
                                </motion.button>
                            ))}
                        </nav>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="md:col-span-3"
                    >
                        <div className="bg-white rounded-2xl shadow-elegant p-6">

                            {/* Password Tab */}
                            {activeTab === 'password' && (
                                <div>
                                    <h2 className="text-xl font-heading font-bold text-chocolate-900 mb-6">
                                        Change Password
                                    </h2>
                                    <form onSubmit={handlePasswordSubmit} className="space-y-5">
                                        {/* Current Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-chocolate-700 mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPassword ? 'text' : 'password'}
                                                    name="currentPassword"
                                                    value={passwordForm.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder="Enter current password"
                                                    className="input-field pr-12"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-chocolate-400 hover:text-chocolate-600"
                                                >
                                                    {showCurrentPassword ? (
                                                        <HiOutlineEyeOff className="w-5 h-5" />
                                                    ) : (
                                                        <HiOutlineEye className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-chocolate-700 mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    name="newPassword"
                                                    value={passwordForm.newPassword}
                                                    onChange={handlePasswordChange}
                                                    placeholder="Enter new password"
                                                    className="input-field pr-12"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-chocolate-400 hover:text-chocolate-600"
                                                >
                                                    {showNewPassword ? (
                                                        <HiOutlineEyeOff className="w-5 h-5" />
                                                    ) : (
                                                        <HiOutlineEye className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-chocolate-400 mt-1">
                                                Must be at least 6 characters
                                            </p>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <HiOutlineCheck className="w-5 h-5" />
                                                    Update Password
                                                </>
                                            )}
                                        </motion.button>
                                    </form>
                                </div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
                                <div>
                                    <h2 className="text-xl font-heading font-bold text-chocolate-900 mb-6">
                                        Preferences
                                    </h2>

                                    <div className="space-y-6">
                                        {/* Language */}
                                        <div className="p-4 bg-cream-50 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <HiOutlineGlobe className="w-6 h-6 text-chocolate-600" />
                                                    <div>
                                                        <p className="font-medium text-chocolate-900">Language</p>
                                                        <p className="text-sm text-chocolate-500">Select your preferred language</p>
                                                    </div>
                                                </div>
                                                <select
                                                    value={preferences.language}
                                                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                                                    className="px-4 py-2 bg-white border border-cream-200 rounded-xl focus:outline-none focus:border-primary-500"
                                                >
                                                    <option value="en">English</option>
                                                    <option value="hi">Hindi</option>
                                                    <option value="bn">Bengali</option>
                                                    <option value="ta">Tamil</option>
                                                    <option value="te">Telugu</option>
                                                    <option value="mr">Marathi</option>
                                                    <option value="gu">Gujarati</option>
                                                    <option value="kn">Kannada</option>
                                                    <option value="ml">Malayalam</option>
                                                    <option value="pa">Punjabi</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Currency */}
                                        <div className="p-4 bg-cream-50 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">💰</span>
                                                    <div>
                                                        <p className="font-medium text-chocolate-900">Currency</p>
                                                        <p className="text-sm text-chocolate-500">Select your preferred currency</p>
                                                    </div>
                                                </div>
                                                <select
                                                    value="INR"
                                                    disabled
                                                    className="px-4 py-2 bg-white border border-cream-200 rounded-xl focus:outline-none appearance-none cursor-not-allowed"
                                                >
                                                    <option value="INR">INR (₹)</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Dark Mode */}
                                        <div className="p-4 bg-cream-50 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <HiOutlineMoon className="w-6 h-6 text-chocolate-600" />
                                                    <div>
                                                        <p className="font-medium text-chocolate-900">Dark Mode</p>
                                                        <p className="text-sm text-chocolate-500">Switch to dark theme</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={preferences.darkMode}
                                                        onChange={() => handlePreferenceChange('darkMode', !preferences.darkMode)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-cream-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div>
                                    <h2 className="text-xl font-heading font-bold text-chocolate-900 mb-6">
                                        Security Settings
                                    </h2>

                                    <div className="space-y-6">
                                        {/* Two Factor Auth */}
                                        <div className="p-4 bg-cream-50 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <HiOutlineShieldCheck className="w-6 h-6 text-chocolate-600" />
                                                    <div>
                                                        <p className="font-medium text-chocolate-900">Two-Factor Authentication</p>
                                                        <p className="text-sm text-chocolate-500">
                                                            {twoFactorEnabled ? 'Enabled ✓' : 'Add an extra layer of security'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={twoFactorEnabled ? handleDisable2FA : handleEnable2FA}
                                                    disabled={isLoading}
                                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${twoFactorEnabled
                                                        ? 'border border-red-300 text-red-600 hover:bg-red-50'
                                                        : 'bg-primary-600 text-white hover:bg-primary-700'
                                                        } disabled:opacity-50`}
                                                >
                                                    {twoFactorEnabled ? 'Disable' : 'Enable'}
                                                </motion.button>
                                            </div>
                                        </div>

                                        {/* Backup Codes Modal */}
                                        {showBackupCodes && (
                                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-900/60 backdrop-blur-sm">
                                                <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                                                    <h3 className="text-lg font-bold text-chocolate-900 mb-4">
                                                        Save Your Backup Codes
                                                    </h3>
                                                    <p className="text-sm text-chocolate-600 mb-4">
                                                        Store these codes in a safe place. You can use them to access your account if you lose your device.
                                                    </p>
                                                    <div className="bg-cream-50 rounded-xl p-4 mb-4 font-mono text-sm grid grid-cols-2 gap-2">
                                                        {backupCodes.map((code, idx) => (
                                                            <div key={idx} className="text-chocolate-900">{code}</div>
                                                        ))}
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setShowBackupCodes(false)}
                                                        className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium"
                                                    >
                                                        I've Saved These Codes
                                                    </motion.button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Active Sessions */}
                                        <div className="p-4 bg-cream-50 rounded-xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">💻</span>
                                                    <div>
                                                        <p className="font-medium text-chocolate-900">Active Sessions</p>
                                                        <p className="text-sm text-chocolate-500">
                                                            {activeSessions.length} active session(s)
                                                        </p>
                                                    </div>
                                                </div>
                                                {activeSessions.length > 1 && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={handleRevokeAllSessions}
                                                        className="px-4 py-2 border border-red-300 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                                                    >
                                                        Revoke All Others
                                                    </motion.button>
                                                )}
                                            </div>

                                            {activeSessions.length > 0 && (
                                                <div className="space-y-2 mt-4">
                                                    {activeSessions.map((session) => (
                                                        <div
                                                            key={session.id}
                                                            className="flex items-center justify-between p-3 bg-white rounded-lg"
                                                        >
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-chocolate-900">
                                                                    {session.device} {session.isCurrent && '(Current)'}
                                                                </p>
                                                                <p className="text-xs text-chocolate-500">
                                                                    {session.browser} • {session.location}
                                                                </p>
                                                            </div>
                                                            {!session.isCurrent && (
                                                                <button
                                                                    onClick={() => handleRevokeSession(session.id)}
                                                                    className="text-xs text-red-600 hover:text-red-700"
                                                                >
                                                                    Revoke
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Delete Account */}
                                        <div className="border-t border-cream-200 pt-6 mt-6">
                                            <h3 className="font-semibold text-red-600 mb-4">Danger Zone</h3>
                                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <HiOutlineTrash className="w-6 h-6 text-red-600" />
                                                        <div>
                                                            <p className="font-medium text-red-600">Delete Account</p>
                                                            <p className="text-sm text-red-500">Permanently delete your account and all data</p>
                                                        </div>
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setShowDeleteModal(true)}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                                                    >
                                                        Delete
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 max-w-md w-full"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <HiOutlineExclamationCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-chocolate-900">Delete Account</h3>
                                <p className="text-sm text-chocolate-500">This action cannot be undone</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-chocolate-700 mb-2">
                                    Enter your password to confirm
                                </label>
                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Password"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-chocolate-700 mb-2">
                                    Why are you leaving? (Optional)
                                </label>
                                <textarea
                                    value={deleteReason}
                                    onChange={(e) => setDeleteReason(e.target.value)}
                                    placeholder="Tell us why..."
                                    rows={3}
                                    className="input-field resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-3 border-2 border-chocolate-300 text-chocolate-700 rounded-xl font-medium"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleDeleteAccount}
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isLoading ? 'Deleting...' : 'Delete My Account'}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    )
}

export default Settings