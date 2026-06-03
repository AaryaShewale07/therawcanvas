import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations'
import {
  HiOutlineHeart,
  HiOutlineEye,
  HiOutlineShoppingBag,
  HiOutlineFilter,
  HiOutlineSearch,
  HiHeart,
} from 'react-icons/hi'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'

const Art = () => {
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { user, openLoginModal } = useAuth()
  const navigate = useNavigate()

  // Fetch art posts from backend
  useEffect(() => {
    const fetchArt = async () => {
      try {
        const res = await api.get('/posts', { params: { category: 'art' } })
        setArtworks(res.data.data || [])
      } catch (err) {
        console.error('Failed to load art:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchArt()
  }, [])

  // Build categories from data
  const categories = ['All', ...new Set(artworks.map((a) => a.subCategory).filter(Boolean))]

  const filteredArtworks = artworks.filter((art) => {
    const matchesCategory =
      selectedCategory === 'All' || art.subCategory === selectedCategory
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.artist || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // ===== Card Action Handlers =====
  const handleWishlistClick = (e, productId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      openLoginModal()
      return
    }
    toggleWishlist(productId)
  }

  const handleAddToCart = (e, productId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      openLoginModal()
      return
    }
    addToCart(productId, 1)
  }

  const handleViewClick = (e, productId) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/product/${productId}`)
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="pt-24"
    >
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-cream-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-chocolate-900 mb-6">
              Art <span className="gradient-text">Collection</span>
            </h1>
            <p className="text-lg text-chocolate-600 mb-8">
              Discover unique artworks. Each piece tells a story and brings beauty to your space.
            </p>

            <div className="relative max-w-md mx-auto">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
              <input
                type="text"
                placeholder="Search artworks or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-full shadow-elegant border-2 border-transparent focus:border-primary-500 focus:outline-none"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Categories */}
          {categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 mb-12 overflow-x-auto pb-4"
            >
              <div className="flex items-center gap-2 text-chocolate-700 flex-shrink-0">
                <HiOutlineFilter className="w-5 h-5" />
                <span className="font-medium">Filter:</span>
              </div>
              <div className="flex gap-3">
                {categories.map((cat) => (
                  <motion.button
                    key={cat}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-cream-100 text-chocolate-700 hover:bg-cream-200'
                    }`}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <p className="text-chocolate-500 mb-6">
            Showing {filteredArtworks.length} {filteredArtworks.length === 1 ? 'artwork' : 'artworks'}
          </p>

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
            </div>
          )}

          {/* Grid */}
          {!loading && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredArtworks.map((art) => {
                const inWishlist = isInWishlist(art._id)
                return (
                  <motion.div
                    key={art._id}
                    variants={staggerItem}
                    whileHover={{ y: -10 }}
                    className="group bg-white rounded-3xl overflow-hidden shadow-elegant hover:shadow-elegant-lg transition-all duration-500"
                  >
                    <Link to={`/product/${art._id}`}>
                      <div className="relative aspect-[4/5] overflow-hidden bg-cream-100">
                        {art.images?.[0] ? (
                          <img
                            src={art.images[0].url}
                            alt={art.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-chocolate-300">
                            No image
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          {/* Wishlist */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleWishlistClick(e, art._id)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                              inWishlist
                                ? 'bg-red-500 text-white'
                                : 'bg-white text-red-500 hover:bg-red-50'
                            }`}
                          >
                            {inWishlist ? (
                              <HiHeart className="w-6 h-6" />
                            ) : (
                              <HiOutlineHeart className="w-6 h-6" />
                            )}
                          </motion.button>

                          {/* View */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleViewClick(e, art._id)}
                            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-cream-100 transition-colors"
                          >
                            <HiOutlineEye className="w-6 h-6 text-chocolate-700" />
                          </motion.button>

                          {/* Add to Cart */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleAddToCart(e, art._id)}
                            className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors"
                          >
                            <HiOutlineShoppingBag className="w-6 h-6 text-white" />
                          </motion.button>
                        </div>

                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          {art.isNew && (
                            <span className="px-3 py-1 bg-gold-500 text-chocolate-900 text-xs font-bold rounded-full">NEW</span>
                          )}
                          {art.originalPrice && (
                            <span className="px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">SALE</span>
                          )}
                        </div>

                        {art.subCategory && (
                          <span className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-chocolate-700">
                            {art.subCategory}
                          </span>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="font-heading font-bold text-xl text-chocolate-900 mb-1 group-hover:text-primary-600 transition-colors">
                          {art.title}
                        </h3>
                        {art.artist && (
                          <p className="text-chocolate-500 text-sm mb-4">by {art.artist}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {art.price > 0 && (
                              <span className="text-xl font-bold text-primary-600">₹{art.price}</span>
                            )}
                            {art.originalPrice && (
                              <span className="text-sm text-chocolate-400 line-through">₹{art.originalPrice}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-chocolate-400">
                            <HiOutlineHeart className="w-4 h-4" />
                            <span className="text-sm">{art.likes || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Empty */}
          {!loading && filteredArtworks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HiOutlineSearch className="w-12 h-12 text-chocolate-300" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-chocolate-900 mb-2">
                No artworks found
              </h3>
              <p className="text-chocolate-500 mb-6">
                {artworks.length === 0
                  ? 'No artworks have been added yet. Check back soon!'
                  : 'Try adjusting your search or filter criteria'}
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </motion.div>
  )
}

export default Art