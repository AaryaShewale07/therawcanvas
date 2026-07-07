import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiX,
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineGift,
} from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'
import { modalVariants, backdropVariants } from '../../utils/animations'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'

const SignupModal = () => {
  const {
    isSignupModalOpen,
    closeModals,
    openLoginModal,
    signup,
    isLoading,
    googleLogin,
  } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [showReferralField, setShowReferralField] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    agreeToTerms: false,
  })

  // ⭐ Password requirements checker
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  }
  const allPasswordChecksPassed = Object.values(passwordChecks).every(Boolean)

  // Auto-fill referral code from URL (?ref=CODE)
  useEffect(() => {
    if (isSignupModalOpen) {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get('ref')
      if (ref) {
        setFormData((prev) => ({ ...prev, referralCode: ref.toUpperCase() }))
        setShowReferralField(true)
      }
    }
  }, [isSignupModalOpen])

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'referralCode'
            ? value.toUpperCase()
            : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (!allPasswordChecksPassed) {
      toast.error('Password does not meet all requirements')
      return
    }
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions')
      return
    }
    const result = await signup(
      formData.name,
      formData.email,
      formData.password,
      formData.referralCode || undefined
    )
    if (result.success) {
      toast.success('Account created successfully!')
      if (formData.referralCode) {
        toast.success(`🎁 Referral code ${formData.referralCode} applied!`, {
          duration: 4000,
        })
      }
    } else {
      toast.error(result.error)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await googleLogin(
      credentialResponse.credential,
      formData.referralCode || undefined
    )
    if (result.success) {
      toast.success(
        result.isNewUser ? 'Account created successfully!' : 'Welcome back!'
      )
      if (result.isNewUser && formData.referralCode) {
        toast.success(`🎁 Referral code ${formData.referralCode} applied!`, {
          duration: 4000,
        })
      }
    } else {
      toast.error(result.error || 'Google signup failed')
    }
  }

  const handleGoogleError = () => {
    toast.error('Google signup failed. Please try again.')
  }

  return (
    <AnimatePresence>
      {isSignupModalOpen && (
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
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto hide-scrollbar"
          >
            {/* Decorative Header */}
            <div className="h-24 bg-gradient-to-r from-gold-400 via-primary-500 to-chocolate-600 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 right-4 w-20 h-20 border-4 border-white rounded-full" />
                <div className="absolute -bottom-6 left-8 w-32 h-32 border-4 border-white rounded-full" />
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

            <div className="p-8 -mt-10">
              {/* LOGO */}
              <div className="w-32 h-32 flex items-center justify-center mx-auto mt-2 mb-0">
                <img
                  src="/logo2.png"
                  alt="TheRawCanvasStudio Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <h2 className="text-2xl font-heading font-bold text-chocolate-900 text-center mb-2 -mt-2">
                Join Our Community
              </h2>
              <p className="text-chocolate-500 text-center mb-8">
                Create an account to start your sweet journey
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-chocolate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full pl-14 pr-4 py-4 text-base bg-cream-50 border-2 border-cream-200 rounded-xl text-chocolate-900 placeholder-chocolate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-chocolate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full pl-14 pr-4 py-4 text-base bg-cream-50 border-2 border-cream-200 rounded-xl text-chocolate-900 placeholder-chocolate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-chocolate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className="w-full pl-14 pr-14 py-4 text-base bg-cream-50 border-2 border-cream-200 rounded-xl text-chocolate-900 placeholder-chocolate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-chocolate-400 hover:text-chocolate-600"
                    >
                      {showPassword ? (
                        <HiOutlineEyeOff className="w-5 h-5" />
                      ) : (
                        <HiOutlineEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* ⭐ NEW — Password requirements hint with live validation */}
                  {!formData.password ? (
                    <p className="text-xs text-chocolate-500 mt-2 flex items-start gap-1">
                      <span className="text-chocolate-400 mt-0.5">ℹ️</span>
                      <span>
                        Must be at least <strong>8 characters</strong> with{' '}
                        <strong>uppercase</strong>, <strong>lowercase</strong>,{' '}
                        <strong>number</strong>, and a <strong>special character</strong>{' '}
                        (e.g. !@#$%^&*)
                      </span>
                    </p>
                  ) : (
                    <div className="mt-2 p-3 bg-cream-50 rounded-lg space-y-1">
                      <p className="text-xs font-semibold text-chocolate-700 mb-1">
                        Password requirements:
                      </p>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        <p
                          className={`text-xs flex items-center gap-1 ${passwordChecks.length ? 'text-green-600' : 'text-chocolate-500'
                            }`}
                        >
                          {passwordChecks.length ? '✓' : '○'} At least 8 characters
                        </p>
                        <p
                          className={`text-xs flex items-center gap-1 ${passwordChecks.uppercase ? 'text-green-600' : 'text-chocolate-500'
                            }`}
                        >
                          {passwordChecks.uppercase ? '✓' : '○'} Uppercase (A–Z)
                        </p>
                        <p
                          className={`text-xs flex items-center gap-1 ${passwordChecks.lowercase ? 'text-green-600' : 'text-chocolate-500'
                            }`}
                        >
                          {passwordChecks.lowercase ? '✓' : '○'} Lowercase (a–z)
                        </p>
                        <p
                          className={`text-xs flex items-center gap-1 ${passwordChecks.number ? 'text-green-600' : 'text-chocolate-500'
                            }`}
                        >
                          {passwordChecks.number ? '✓' : '○'} Number (0–9)
                        </p>
                        <p
                          className={`text-xs flex items-center gap-1 col-span-2 ${passwordChecks.special ? 'text-green-600' : 'text-chocolate-500'
                            }`}
                        >
                          {passwordChecks.special ? '✓' : '○'} Special character (e.g. !@#$%^&*)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-chocolate-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full pl-14 pr-4 py-4 text-base bg-cream-50 border-2 border-cream-200 rounded-xl text-chocolate-900 placeholder-chocolate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                      required
                    />
                  </div>
                  {/* ⭐ Password match indicator */}
                  {formData.confirmPassword && (
                    <p
                      className={`text-xs mt-2 flex items-center gap-1 ${formData.password === formData.confirmPassword
                        ? 'text-green-600'
                        : 'text-red-600'
                        }`}
                    >
                      {formData.password === formData.confirmPassword
                        ? '✓ Passwords match'
                        : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                {/* ⭐ REFERRAL CODE SECTION */}
                <div>
                  {!showReferralField ? (
                    <button
                      type="button"
                      onClick={() => setShowReferralField(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl border-2 border-dashed border-primary-200 transition"
                    >
                      <HiOutlineGift className="w-4 h-4" />
                      Have a referral code?
                    </button>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-chocolate-700 mb-2 flex items-center gap-1">
                        <HiOutlineGift className="w-4 h-4 text-primary-500" />
                        Referral Code{' '}
                        <span className="text-chocolate-400 font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <HiOutlineGift className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-chocolate-400" />
                        <input
                          type="text"
                          name="referralCode"
                          value={formData.referralCode}
                          onChange={handleChange}
                          placeholder="FRIEND123"
                          maxLength={12}
                          className="w-full pl-14 pr-14 py-4 text-base bg-cream-50 border-2 border-cream-200 rounded-xl text-chocolate-900 placeholder-chocolate-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all uppercase font-mono tracking-wider"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowReferralField(false)
                            setFormData((prev) => ({ ...prev, referralCode: '' }))
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-chocolate-400 hover:text-red-500"
                        >
                          <HiX className="w-5 h-5" />
                        </button>
                      </div>
                      {formData.referralCode && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                          🎁 Your friend will earn ₹100 when you place your first order!
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="w-4 h-4 mt-1 text-primary-600 rounded border-cream-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-chocolate-600">
                    I agree to the{' '}
                    <a href="/Terms" className="text-primary-600 hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/Privacy" className="text-primary-600 hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-gold-500 to-primary-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </motion.button>
              </form>

              {/* ✅ DIVIDER */}
              <div className="relative flex items-center my-6">
                <div className="flex-grow border-t border-cream-200"></div>
                <span className="flex-shrink mx-4 text-chocolate-400 text-sm">OR</span>
                <div className="flex-grow border-t border-cream-200"></div>
              </div>

              {/* ✅ GOOGLE SIGNUP BUTTON */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="pill"
                  width="320"
                />
              </div>

              {formData.referralCode && (
                <p className="text-xs text-center text-primary-600 mt-3">
                  ✓ Referral code <strong>{formData.referralCode}</strong> will be applied
                </p>
              )}

              <p className="text-center text-chocolate-500 mt-6">
                Already have an account?{' '}
                <button
                  onClick={openLoginModal}
                  className="text-primary-600 font-semibold hover:text-primary-700"
                >
                  Sign in
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SignupModal