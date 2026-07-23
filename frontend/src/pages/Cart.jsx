import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, Truck } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import {
  SHIPPING_CONFIG,
  amountForFreeShipping,
  freeShippingProgress,
} from '../utils/shippingCalculator'

const Cart = () => {
  const { cart, cartTotal, updateQty, removeItem, clearCart, loading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return <div className="p-20 text-center text-amber-900">Loading...</div>
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <ShoppingBag size={80} className="mx-auto text-amber-300 mb-4" />
        <h2 className="text-3xl font-bold text-amber-900 mb-3">Please login</h2>
        <p className="text-gray-600 mb-6">Login to see your cart</p>
        <Link to="/" className="bg-amber-700 text-white px-8 py-3 rounded-full inline-block">
          Go Home
        </Link>
      </div>
    )
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <ShoppingBag size={80} className="mx-auto text-amber-300 mb-4" />
        <h2 className="text-3xl font-bold text-amber-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some beautiful artworks to get started!</p>
        <Link to="/" className="bg-amber-700 text-white px-8 py-3 rounded-full inline-block hover:bg-amber-800">
          Browse Art
        </Link>
      </div>
    )
  }

  const amountNeeded = amountForFreeShipping(cartTotal)
  const progress = freeShippingProgress(cartTotal)
  const isFreeShipping = cartTotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 pt-28">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-900">Your Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800 text-sm font-semibold"
        >
          Clear Cart
        </button>
      </div>

      {/* ⭐ FREE SHIPPING PROGRESS BAR */}
      <div className={`mb-6 p-4 rounded-2xl ${isFreeShipping ? 'bg-green-50 border-2 border-green-500' : 'bg-amber-50 border-2 border-amber-300'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
          <Truck className={`w-6 h-6 ${isFreeShipping ? 'text-green-600' : 'text-amber-700'}`} />
          <p className={`font-bold ${isFreeShipping ? 'text-green-800' : 'text-amber-900'}`}>
            {isFreeShipping ? (
              '🎉 FREE Shipping Unlocked!'
            ) : (
              <>Add <span className="text-red-600">₹{amountNeeded}</span> more for FREE shipping!</>
            )}
          </p>
        </div>
        <div className="w-full bg-white rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isFreeShipping ? 'bg-green-500' : 'bg-gradient-to-r from-amber-500 to-amber-700'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          ₹{cartTotal} / ₹{SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.post._id}
              className="bg-white rounded-2xl shadow-md p-4 flex flex-col sm:flex-row gap-4 sm:items-center"
            >
              <img
                src={item.post.images?.[0]?.url || '/placeholder.png'}
                alt={item.post.title}
                className="w-28 h-28 sm:w-24 sm:h-24 mx-auto sm:mx-0 object-cover rounded-xl" />

              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-amber-900">{item.post.title}</h3>
                {item.post.artist && (
                  <p className="text-sm text-amber-700">by {item.post.artist}</p>
                )}
                <p className="text-lg font-bold text-amber-900 mt-1">
                  ₹{item.post.price}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex justify-center sm:justify-start items-center gap-3 bg-amber-50 rounded-full px-3 py-2">                <button
                onClick={() => updateQty(item.post._id, item.quantity - 1)}
                className="p-1 hover:bg-amber-200 rounded-full"
              >
                <Minus size={16} />
              </button>
                <span className="font-bold min-w-[24px] text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.post._id, item.quantity + 1)}
                  className="p-1 hover:bg-amber-200 rounded-full"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="text-center sm:text-right">
                <p className="font-bold text-sm sm:text-base text-amber-900 text-lg">
                  ₹{item.post.price * item.quantity}
                </p>
                <button
                  onClick={() => removeItem(item.post._id)}
                  className="text-red-500 hover:text-red-700 mt-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6 h-fit sticky top-28">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">Order Summary</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Shipping</span>
              <span className="text-amber-700 text-sm">Calculated at checkout</span>
            </div>
            <hr />
            <div className="flex justify-between text-xl font-bold text-amber-900">
              <span>Estimated Total</span>
              <span>₹{cartTotal}+</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-amber-700 text-white py-3 rounded-full font-bold hover:bg-amber-800 transition"
          >
            Proceed to Checkout
          </button>
          <Link
            to="/"
            className="block text-center mt-3 text-amber-700 hover:text-amber-900"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div >
  )
}

export default Cart