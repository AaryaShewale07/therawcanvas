import { createContext, useContext, useState, useEffect } from 'react'
import { wishlistAPI } from '../utils/api'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState({ posts: [] })
  const { user, isLoading: authLoading, openLoginModal } = useAuth()

  const fetchWishlist = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setWishlist({ posts: [] })
      return
    }
    try {
      const { data } = await wishlistAPI.get()
      setWishlist(data.wishlist)
    } catch (err) {
      console.error('Fetch wishlist error:', err)
    }
  }

  // ⭐ Wait until auth check completes
  useEffect(() => {
    if (!authLoading) {
      fetchWishlist()
    }
  }, [user, authLoading])

  const toggleWishlist = async (postId) => {
    const token = localStorage.getItem('token')
    
    // ⭐ Check token directly (not user state)
    if (!token) {
      toast.error('Please login to use wishlist')
      openLoginModal()
      return
    }
    
    try {
      const { data } = await wishlistAPI.toggle(postId)
      setWishlist(data.wishlist)
      const exists = data.wishlist.posts.some((p) => p._id === postId)
      toast.success(exists ? 'Added to wishlist' : 'Removed from wishlist')
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Session expired, please login again')
        openLoginModal()
      } else {
        toast.error(err.response?.data?.message || 'Failed')
      }
    }
  }

  const isInWishlist = (postId) =>
    wishlist.posts?.some((p) => p._id === postId || p === postId)

  const wishlistCount = wishlist.posts?.length || 0

  return (
    <WishlistContext.Provider
      value={{ wishlist, wishlistCount, toggleWishlist, isInWishlist, fetchWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)