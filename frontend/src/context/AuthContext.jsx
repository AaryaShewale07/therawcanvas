import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

// ============ API HELPER ============
const API_URL = import.meta.env.VITE_API_URL

const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token')

  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_URL}${endpoint}`, config)
  return response
}

// ============ HOOK ============
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ============ PROVIDER ============
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)

  const fetchUserProfile = async (token) => {
    try {
      const res = await apiFetch('/auth/me')
      const data = await res.json()

      if (res.ok) {
        const userData = data.data?.user || data.user
        if (userData) {
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
          return userData
        }
      } else {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        return null
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')

      if (savedUser && savedUser !== 'undefined') {
        try {
          setUser(JSON.parse(savedUser))
        } catch (e) {
          localStorage.removeItem('user')
        }
      }

      if (!token || token === 'undefined' || token === 'null') {
        localStorage.removeItem('token')
        setIsLoading(false)
        return
      }

      await fetchUserProfile(token)
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  // ✅ Login
  const login = async (email, password) => {
    setIsLoading(true)
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')

      const token = data.data?.token
      const userData = data.data?.user

      if (!token) throw new Error('Server did not return a token!')

      localStorage.setItem('token', token)

      if (userData) {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      }

      setIsLoginModalOpen(false)
      return { success: true }
    } catch (error) {
      console.error('Login error:', error.message)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Signup — now accepts referralCode
  const signup = async (name, email, password, referralCode) => {
    setIsLoading(true)
    try {
      const payload = { name, email, password }
      // ⭐ Only include referralCode if provided (avoid sending empty strings)
      if (referralCode && referralCode.trim()) {
        payload.referralCode = referralCode.trim().toUpperCase()
      }

      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Signup failed')

      const token = data.data?.token
      const userData = data.data?.user

      if (!token) throw new Error('Server did not return a token!')

      localStorage.setItem('token', token)

      if (userData) {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      }

      setIsSignupModalOpen(false)
      return { success: true }
    } catch (error) {
      console.error('Signup error:', error.message)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Google Login/Signup — now accepts referralCode
  const googleLogin = async (credential, referralCode) => {
    setIsLoading(true)
    try {
      const payload = { credential }
      // ⭐ Only include referralCode if provided
      if (referralCode && referralCode.trim()) {
        payload.referralCode = referralCode.trim().toUpperCase()
      }

      const res = await apiFetch('/auth/google', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Google login failed')

      const token = data.data?.token
      const userData = data.data?.user

      if (!token) throw new Error('Server did not return a token!')

      localStorage.setItem('token', token)

      if (userData) {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      }

      setIsLoginModalOpen(false)
      setIsSignupModalOpen(false)
      return { success: true, isNewUser: data.isNewUser }
    } catch (error) {
      console.error('Google login error:', error.message)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Verify Backup Code
  const verifyBackupCode = async (email, code) => {
    try {
      const res = await apiFetch('/auth/verify-backup', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Invalid backup code')

      const token = data.data?.token
      const userData = data.data?.user

      if (token) localStorage.setItem('token', token)
      if (userData) {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      }

      setIsLoginModalOpen(false)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ✅ Forgot Password
  const forgotPassword = async (email) => {
    try {
      const res = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send reset email')
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const refreshUser = async () => {
    const token = localStorage.getItem('token')
    if (token) await fetchUserProfile(token)
  }

  const openLoginModal = () => {
    setIsSignupModalOpen(false)
    setIsLoginModalOpen(true)
  }

  const openSignupModal = () => {
    setIsLoginModalOpen(false)
    setIsSignupModalOpen(true)
  }

  const closeModals = () => {
    setIsLoginModalOpen(false)
    setIsSignupModalOpen(false)
  }

  const value = {
    user,
    setUser,
    isLoading,
    isLoginModalOpen,
    isSignupModalOpen,
    login,
    signup,
    googleLogin,
    logout,
    refreshUser,
    openLoginModal,
    openSignupModal,
    closeModals,
    verifyBackupCode,
    forgotPassword,
    isAdmin: user?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}