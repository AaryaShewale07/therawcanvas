import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

// ⭐ This export MUST exist
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)

  // Fetch full user data
  const fetchUserProfile = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
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

      // Use cached user immediately
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

  const login = async (email, password) => {
    setIsLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      console.log('🔍 LOGIN RESPONSE:', data)

      if (!res.ok) throw new Error(data.message || 'Login failed')

      const token = data.data?.token
      const userData = data.data?.user

      if (!token) {
        throw new Error('Server did not return a token!')
      }

      localStorage.setItem('token', token)
      console.log('✅ Token saved:', localStorage.getItem('token')?.substring(0, 30))

      if (userData) {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      }

      setIsLoginModalOpen(false)
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name, email, password) => {
    setIsLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()
      console.log('🔍 SIGNUP RESPONSE:', data)

      if (!res.ok) throw new Error(data.message || 'Signup failed')

      const token = data.data?.token
      const userData = data.data?.user

      if (!token) {
        throw new Error('Server did not return a token!')
      }

      localStorage.setItem('token', token)

      if (userData) {
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      }

      setIsSignupModalOpen(false)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const verifyBackupCode = async (email, code) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const forgotPassword = async (email) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    logout,
    refreshUser,
    openLoginModal,
    openSignupModal,
    closeModals,
    verifyBackupCode,
    forgotPassword,
    isAdmin: user?.role === 'admin',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}