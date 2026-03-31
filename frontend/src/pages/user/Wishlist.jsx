import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  HiOutlineHeart, 
  HiOutlineShoppingBag, 
  HiOutlineTrash,
  HiOutlineEye
} from 'react-icons/hi'
import { pageTransition, staggerContainer, staggerItem } from '../../utils/animations'
import toast from 'react-hot-toast'

// Mock wishlist data
const initialWishlist = [
  {
    id: 1,
    name: 'Abstract Sunset Dreams',
    category: 'Art',
    price: 299,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
    inStock: true,
  },
  {
    id: 2,
    name: 'Belgian Dark Truffle Collection',
    category: 'Chocolates',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400',
    inStock: true,
  },
  {
    id: 3,
    name: 'Romantic Indulgence Box',
    category: 'Gifting',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
    inStock: true,
  },
  {
    id: 4,
    name: 'Ocean Whispers Canvas',
    category: 'Art',
    price: 189,
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400',
    inStock: false,
  },
  {
    id: 5,
    name: 'Salted Caramel Bonbons',
    category: 'Chocolates',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1548907040-4bea42c3d2fc?w=400',
    inStock: true,
  },
]

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(initialWishlist)

  const removeFromWishlist = (id) => {
    setWishlist(prev => prev.filter(item => item.id !== id))
    toast.success('Removed from wishlist')
  }

  const addToCart = (item) => {
    toast.success(`${item.name} added to cart!`)
  }

  const clearWishlist = () => {
    setWishlist([])
    toast.success('Wishlist cleared')
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="pt-24 pb-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12"
        >
          <div>
            <h1 className="text-4xl font-heading font-bold text-chocolate-900 mb-2">
              My Wishlist
            </h1>
            <p className="text-chocolate-600">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          {wishlist.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearWishlist}
              className="mt-4 sm:mt-0 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <HiOutlineTrash className="w-5 h-5" />
              Clear All
            </motion.button>
          )}
        </motion.div>

        {/* Wishlist Items */}
        {wishlist.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {wishlist.map((item) => (
                <motion.div
                  key={item.id}
                  variants={staggerItem}
                  layout
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-2xl shadow-elegant overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Out of Stock Overlay */}
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-chocolate-900/60 flex items-center justify-center">
                        <span className="px-4 py-2 bg-white text-chocolate-900 font-semibold rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    {/* Actions Overlay */}
                    <div className="absolute inset-0 bg-chocolate-900/0 group-hover:bg-chocolate-900/20 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
                      >
                        <HiOutlineEye className="w-5 h-5 text-chocolate-700" />
                      </motion.button>
                    </div>

                    {/* Category Badge */}
                    <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-chocolate-700">
                      {item.category}
                    </span>

                    {/* Remove Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <HiOutlineHeart className="w-5 h-5 fill-current" />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-chocolate-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {item.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-chocolate-900">
                          ${item.price}
                        </span>
                        {item.originalPrice && (
                          <span className="text-sm text-chocolate-400 line-through">
                            ${item.originalPrice}
                          </span>
                        )}
                      </div>
                      {item.originalPrice && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                          {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addToCart(item)}
                      disabled={!item.inStock}
                      className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                        item.inStock
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-cream-200 text-chocolate-400 cursor-not-allowed'
                      }`}
                    >
                      <HiOutlineShoppingBag className="w-5 h-5" />
                      {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineHeart className="w-16 h-16 text-cream-400" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-chocolate-900 mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-chocolate-500 mb-8 max-w-md mx-auto">
              Start adding items you love to your wishlist. They'll appear here for easy access later.
            </p>
            <Link to="/chocolates">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                Explore Products
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default Wishlist
