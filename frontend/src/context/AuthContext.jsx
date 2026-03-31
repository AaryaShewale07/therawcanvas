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

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    // Simulated login - replace with actual API call
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const userData = {
        id: '1',
        name: 'John Doe',
        email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        role: email.includes('admin') ? 'admin' : 'user'
      }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      setIsLoginModalOpen(false)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Login failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name, email, password) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const userData = {
        id: Date.now().toString(),
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        role: 'user'
      }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      setIsSignupModalOpen(false)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Signup failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
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
    isLoading,
    isLoginModalOpen,
    isSignupModalOpen,
    login,
    signup,
    logout,
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