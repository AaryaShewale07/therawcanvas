import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  HiOutlineX,
  HiOutlineShoppingBag,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineMinus,
} from 'react-icons/hi'
import { useCart } from '../../context/CartContext'

const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingCost,
    total,
    amountToFreeShipping,
    SHIPPING_THRESHOLD,
    totalItems,
  } = useCart()

  const navigate = useNavigate()

  const handleCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-chocolate-900/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between bg-gradient-to-r from-cream-50 to-white">
              <div>
                <h2 className="text-xl font-heading font-bold text-chocolate-900">
                  Your Cart
                </h2>
                <p className="text-xs text-chocolate-500">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </p>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-cream-100 rounded-full transition-colors"
              >
                <HiOutlineX className="w-5 h-5 text-chocolate-500" />
              </button>
            </div>

            {/* Free shipping banner */}
            {cart.items.length > 0 && (
              <div className="px-6 py-3 bg-gradient-to-r from-primary-50 to-gold-50 border-b border-cream-200">
                {amountToFreeShipping > 0 ? (
                  <>
                    <p className="text-xs text-chocolate-700">
                      Add <strong className="text-primary-600">₹{amountToFreeShipping}</strong> more for <strong>FREE SHIPPING</strong>
                    </p>
                    <div className="mt-2 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-gold-500 transition-all"
                        style={{ width: `${Math.min(100, (subtotal / SHIPPING_THRESHOLD) * 100)}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-green-700 font-semibold flex items-center gap-1">
                    🎉 You've unlocked FREE SHIPPING!
                  </p>
                )}
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-24 h-24 bg-cream-100 rounded-full flex items-center justify-center mb-4">
                    <HiOutlineShoppingBag className="w-12 h-12 text-chocolate-300" />
                  </div>
                  <h3 className="font-heading font-bold text-chocolate-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-chocolate-500 mb-6">
                    Add some beautiful items to get started!
                  </p>
                  <button
                    onClick={closeCart}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {cart.items.map((item) => {
                    const product = item.product
                    if (!product) return null
                    return (
                      <motion.div
                        key={product._id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-cream-50/50 rounded-2xl p-3 flex gap-3 group"
                      >
                        {/* Image */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream-200 flex-shrink-0">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-chocolate-300">
                              <HiOutlineShoppingBag className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-chocolate-900 truncate">
                            {product.title}
                          </h4>
                          <p className="text-xs text-chocolate-400 capitalize">
                            {product.category}
                          </p>
                          {product.requiresCustomization && (
                            <span className="inline-block mt-1 text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-semibold">
                              📸 Photos req'd
                            </span>
                          )}

                          {/* Qty + Remove */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 bg-white rounded-lg border border-cream-200">
                              <button
                                onClick={() => updateQuantity(product._id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-7 h-7 flex items-center justify-center text-chocolate-600 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <HiOutlineMinus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold text-chocolate-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(product._id, item.quantity + 1)}
                                disabled={item.quantity >= product.stock}
                                className="w-7 h-7 flex items-center justify-center text-chocolate-600 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <HiOutlinePlus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(product._id)}
                              className="p-1.5 text-chocolate-400 hover:text-red-500 transition-colors"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-bold text-primary-600">
                            ₹{product.price * item.quantity}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-chocolate-400">
                              ₹{product.price} each
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.items.length > 0 && (
              <div className="border-t border-cream-200 p-6 bg-cream-50/50 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-chocolate-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-chocolate-600">
                    <span>Shipping</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-green-600 font-semibold">FREE</span>
                      ) : (
                        `₹${shippingCost}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-cream-200 font-bold text-chocolate-900">
                    <span>Total</span>
                    <span className="text-xl text-primary-600">₹{total}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/30"
                >
                  Checkout →
                </button>
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="block text-center text-sm text-chocolate-600 hover:text-primary-600 transition-colors"
                >
                  View full cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer