import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, isLoading, openLoginModal } = useAuth()
  const location = useLocation()

  // FIXED: openLoginModal must be called inside useEffect, not during render.
  // Calling setState (which openLoginModal does internally) while another
  // component is rendering causes React's "setState during render" warning
  // and can lead to inconsistent UI state.
  useEffect(() => {
    if (!isLoading && !user) {
      openLoginModal()
    }
  }, [isLoading, user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cream-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute