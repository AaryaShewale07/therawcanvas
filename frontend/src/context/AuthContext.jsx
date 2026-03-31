import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (res.ok) {
        setUser(data.data.user)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        return data.data.user
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

      if (!token) {
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

      if (!res.ok) throw new Error(data.message || 'Login failed')

      // Save token first
      localStorage.setItem('token', data.data.token)

      // Fetch full user profile (with all fields)
      const fullUser = await fetchUserProfile(data.data.token)

      if (!fullUser) {
        // Fallback to login response if fetch fails
        setUser(data.data.user)
        localStorage.setItem('user', JSON.stringify(data.data.user))
      }

      setIsLoginModalOpen(false)
      return { success: true }
    } catch (error) {
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

      if (!res.ok) throw new Error(data.message || 'Signup failed')

      // Save token first
      localStorage.setItem('token', data.data.token)

      // Fetch full user profile (with all fields)
      const fullUser = await fetchUserProfile(data.data.token)

      if (!fullUser) {
        // Fallback to signup response if fetch fails
        setUser(data.data.user)
        localStorage.setItem('user', JSON.stringify(data.data.user))
      }

      setIsSignupModalOpen(false)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')  // ← Also remove token
  }

  // Refresh user data (useful after profile updates)
  const refreshUser = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      await fetchUserProfile(token)
    }
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
    refreshUser,            // ← ADD THIS
    openLoginModal,
    openSignupModal,
    closeModals,
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}