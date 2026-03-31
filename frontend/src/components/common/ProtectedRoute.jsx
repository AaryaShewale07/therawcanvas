import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, isLoading, openLoginModal } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cream-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    // Open login modal and redirect to home
    openLoginModal()
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute