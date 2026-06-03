import { createContext, useContext, useState, useEffect } from 'react'
import { cartAPI } from '../utils/api'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(false)
  const { user, isLoading: authLoading, openLoginModal } = useAuth()

  const fetchCart = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setCart({ items: [] })
      return
    }
    try {
      setLoading(true)
      const { data } = await cartAPI.get()
      setCart(data.cart)
    } catch (err) {
      console.error('Fetch cart error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ⭐ Wait until auth check completes
  useEffect(() => {
    if (!authLoading) {
      fetchCart()
    }
  }, [user, authLoading])

  const addToCart = async (postId, quantity = 1) => {
    const token = localStorage.getItem('token')
    
    // ⭐ Check token directly (not user state)
    if (!token) {
      toast.error('Please login to add items to cart')
      openLoginModal()
      return false
    }
    
    try {
      const { data } = await cartAPI.add(postId, quantity)
      setCart(data.cart)
      toast.success('Added to cart')
      return true
    } catch (err) {
      // If token is invalid, ask to login again
      if (err.response?.status === 401) {
        toast.error('Session expired, please login again')
        openLoginModal()
      } else {
        toast.error(err.response?.data?.message || 'Failed to add')
      }
      return false
    }
  }

  const updateQty = async (postId, quantity) => {
    try {
      const { data } = await cartAPI.update(postId, quantity)
      setCart(data.cart)
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  const removeItem = async (postId) => {
    try {
      const { data } = await cartAPI.remove(postId)
      setCart(data.cart)
      toast.success('Removed from cart')
    } catch (err) {
      toast.error('Failed to remove')
    }
  }

  const clearCart = async () => {
    try {
      await cartAPI.clear()
      setCart({ items: [] })
    } catch (err) {
      console.error(err)
    }
  }

  const cartCount = cart.items?.reduce((acc, i) => acc + i.quantity, 0) || 0
  const cartTotal =
    cart.items?.reduce((acc, i) => acc + (i.post?.price || 0) * i.quantity, 0) || 0

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        loading,
        addToCart,
        updateQty,
        removeItem,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)