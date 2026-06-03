import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiX, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineKey
} from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'
import { modalVariants, backdropVariants } from '../../utils/animations'
import toast from 'react-hot-toast'

const MAX_BACKUP_ATTEMPTS = 3

const LoginModal = () => {
  const {
    isLoginModalOpen, closeModals, openSignupModal,
    login, verifyBackupCode, forgotPassword, isLoading
  } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // View: 'password' | 'backup'
  const [view, setView] = useState('password')
  const [backupCode, setBackupCode] = useState('')
  const [backupAttempts, setBackupAttempts] = useState(0)
  const [backupLocked, setBackupLocked] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)

  const attemptsLeft = MAX_BACKUP_ATTEMPTS - backupAttempts

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.success) {
      toast.success('Welcome back!')
    } else {
      toast.error(result.error)
    }
  }

  const handleSwitchToBackup = () => {
    if (!email) {
      toast.error('Please enter your email address first')
      return
    }
    setView('backup')
  }

  const handleVerifyBackupCode = async () => {
    if (!email) {
      toast.error('Please enter your email address first')
      return
    }
    if (!backupCode.trim()) {
      toast.error('Please enter a backup code')
      return
    }

    setIsVerifying(true)
    const result = await verifyBackupCode(email, backupCode.trim())
    setIsVerifying(false)

    if (result.success) {
      toast.success('Backup code verified! Logging you in...')
      return
    }

    const newAttempts = backupAttempts + 1
    setBackupAttempts(newAttempts)
    setBackupCode('')

    if (newAttempts >= MAX_BACKUP_ATTEMPTS) {
      setBackupLocked(true)
      toast.error('Too many failed attempts. Please use Forgot Password.')
    } else {
      toast.error(`Invalid backup code. ${MAX_BACKUP_ATTEMPTS - newAttempts} attempt(s) left.`)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first')
      return
    }
    setIsSendingReset(true)
    const result = await forgotPassword(email)
    setIsSendingReset(false)

    if (result.success) {
      toast.success('Reset link sent! Check your inbox — valid for 10 minutes.', { duration: 6000 })
    } else {
      toast.error(result.error)
    }
  }

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-chocolate-900/60 backdrop-blur-sm"
          onClick={closeModals}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Decorative Header */}
            <div className="h-24 bg-gradient-to-r from-primary-500 via-gold-500 to-chocolate-600 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 w-20 h-20 border-4 border-white rounded-full" />
                <div className="absolute -bottom-6 right-8 w-32 h-32 border-4 border-white rounded-full" />
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeModals}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <HiX className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="p-8 -mt-8">
              {/* Avatar */}
              <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-script bg-gradient-to-r from-primary-500 to-gold-500 bg-clip-text text-transparent">
                  A&C
                </span>
              </div>

              <h2 className="text-2xl font-heading font-bold text-chocolate-900 text-center mb-2">
                Welcome Back!
              </h2>
              <p className="text-chocolate-500 text-center mb-8">
                Sign in to access your sweet account
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                {/* Email — always visible */}
                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="input-field pl-12"
                      required
                    />
                  </div>
                </div>

                {/* ── PASSWORD VIEW ── */}
                <AnimatePresence mode="wait">
                  {view === 'password' ? (
                    <motion.div
                      key="password-view"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-5"
                    >
                      <div>
                        <label className="block text-sm font-medium text-chocolate-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="input-field pl-12 pr-12"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-chocolate-400 hover:text-chocolate-600"
                          >
                            {showPassword
                              ? <HiOutlineEyeOff className="w-5 h-5" />
                              : <HiOutlineEye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Remember me + Enter backup code */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 text-primary-600 rounded border-cream-300 focus:ring-primary-500"
                          />
                          <span className="text-sm text-chocolate-600">Remember me</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleSwitchToBackup}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Enter backup code
                        </button>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Signing in...
                          </span>
                        ) : 'Sign In'}
                      </motion.button>
                    </motion.div>

                  ) : (

                    /* ── BACKUP CODE VIEW ── */
                    <motion.div
                      key="backup-view"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-5"
                    >
                      <div>
                        <label className="block text-sm font-medium text-chocolate-700 mb-2">
                          Backup Code
                        </label>
                        <div className="relative">
                          <HiOutlineKey className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
                          <input
                            type="text"
                            value={backupCode}
                            onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                            placeholder="e.g. ABCD-EFGH-1234"
                            className="input-field pl-12 font-mono tracking-widest uppercase disabled:bg-cream-100 disabled:cursor-not-allowed"
                            maxLength={20}
                            disabled={backupLocked}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                if (!backupLocked) handleVerifyBackupCode()
                              }
                            }}
                          />
                        </div>

                        {/* Attempt counter */}
                        {backupAttempts > 0 && !backupLocked && (
                          <p className="text-xs text-amber-600 mt-1.5 font-medium">
                            {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
                          </p>
                        )}

                        {/* Locked message */}
                        {backupLocked && (
                          <p className="text-xs text-red-500 mt-1.5 font-medium">
                            Backup code entry locked. Please use Forgot Password.
                          </p>
                        )}
                      </div>

                      {/* Remember me + Forgot password — always shown in backup view */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 text-primary-600 rounded border-cream-300 focus:ring-primary-500"
                          />
                          <span className="text-sm text-chocolate-600">Remember me</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          disabled={isSendingReset}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                        >
                          {isSendingReset ? 'Sending...' : 'Forgot password?'}
                        </button>
                      </div>

                      {/* Verify button */}
                      <motion.button
                        type="button"
                        whileHover={!backupLocked ? { scale: 1.02 } : {}}
                        whileTap={!backupLocked ? { scale: 0.98 } : {}}
                        onClick={handleVerifyBackupCode}
                        disabled={isVerifying || backupLocked || !backupCode.trim()}
                        className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isVerifying ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Verifying...
                          </span>
                        ) : 'Verify & Log In'}
                      </motion.button>

                      {/* Back to password */}
                      <button
                        type="button"
                        onClick={() => setView('password')}
                        className="w-full text-sm text-chocolate-400 hover:text-chocolate-600 text-center"
                      >
                        ← Back to password login
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              <p className="text-center text-chocolate-500 mt-6">
                Don't have an account?{' '}
                <button
                  onClick={openSignupModal}
                  className="text-primary-600 font-semibold hover:text-primary-700"
                >
                  Sign up
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoginModal