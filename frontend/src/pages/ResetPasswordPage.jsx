import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import toast from 'react-hot-toast'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + `/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Reset failed')

      setIsDone(true)
      toast.success('Password reset! You can now log in.')
      setTimeout(() => navigate('/'), 2500)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-chocolate-600 text-center">
          Invalid or missing reset link. Please request a new one.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cream-50">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="h-20 bg-gradient-to-r from-primary-500 via-gold-500 to-chocolate-600" />

        <div className="p-8">
          <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto -mt-14 mb-6">
            <span className="text-2xl font-script bg-gradient-to-r from-primary-500 to-gold-500 bg-clip-text text-transparent">
              A&C
            </span>
          </div>

          {isDone ? (
            <div className="text-center py-6">
              <p className="text-2xl font-heading font-bold text-chocolate-900 mb-2">
                All done!
              </p>
              <p className="text-chocolate-500">
                Your password has been reset. Redirecting you to the home page...
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-heading font-bold text-chocolate-900 text-center mb-2">
                Set New Password
              </h2>
              <p className="text-chocolate-500 text-center mb-8">
                Choose a strong password for your account
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
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

                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="input-field pl-12"
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </motion.button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ResetPasswordPage