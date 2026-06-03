import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations'
import {
  HiHeart,
  HiOutlineHeart,
  HiOutlineEye,
  HiOutlineShoppingBag,
  HiOutlineFilter,
  HiOutlineSearch,
  HiOutlineGift,
} from 'react-icons/hi'
import api from '../utils/api'
import { useNavigate } from 'react-router-dom'

import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const Gifting = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/posts', { params: { category: 'gifting' } })
        setItems(res.data.data || [])
      } catch (err) {
        console.error('Failed to load gifting:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const categories = ['All', ...new Set(items.map((a) => a.subCategory).filter(Boolean))]

  const filtered = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.subCategory === selectedCategory
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit" className="pt-24">
      <section className="bg-gradient-to-b from-gold-50 to-cream-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-100 rounded-full mb-6">
              <HiOutlineGift className="w-8 h-8 text-gold-600" />
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-chocolate-900 mb-6">
              Curated <span className="gradient-text">Gift Sets</span>
            </h1>
            <p className="text-lg text-chocolate-600 mb-8">
              Thoughtfully curated gift collections, beautifully packaged for every occasion.
            </p>

            <div className="relative max-w-md mx-auto">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
              <input
                type="text"
                placeholder="Search gift sets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-full shadow-elegant border-2 border-transparent focus:border-gold-500 focus:outline-none"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 mb-12 overflow-x-auto pb-4"
            >
              <div className="flex items-center gap-2 text-chocolate-700 flex-shrink-0">
                <HiOutlineFilter className="w-5 h-5" />
                <span className="font-medium">Occasion:</span>
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
                        ? 'bg-gold-500 text-white shadow-md'
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
            Showing {filtered.length} {filtered.length === 1 ? 'gift set' : 'gift sets'}
          </p>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-gold-200 border-t-gold-500 rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((item) => {
                const inWish = isInWishlist?.(item._id)

                return (
                  <motion.div
                    key={item._id}
                    variants={staggerItem}
                    whileHover={{ y: -10 }}
                    className="group bg-white rounded-3xl overflow-hidden shadow-elegant hover:shadow-elegant-lg transition-all duration-500"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-cream-100">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0].url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-chocolate-300">No image</div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        {/* Wishlist */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleWishlist(item._id)
                          }}
                          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                            inWish ? 'bg-gold-500 text-white' : 'bg-white text-gold-500'
                          }`}
                        >
                          {inWish ? (
                            <HiHeart className="w-6 h-6" />
                          ) : (
                            <HiOutlineHeart className="w-6 h-6" />
                          )}
                        </motion.button>

                        {/* Preview */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/product/${item._id}`)
                          }}
                          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
                        >
                          <HiOutlineEye className="w-6 h-6 text-chocolate-700" />
                        </motion.button>

                        {/* Cart */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            addToCart(item._id, 1)
                          }}
                          className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <HiOutlineShoppingBag className="w-6 h-6 text-white" />
                        </motion.button>
                      </div>

                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {item.isNew && <span className="px-3 py-1 bg-gold-500 text-chocolate-900 text-xs font-bold rounded-full">NEW</span>}
                        {item.originalPrice && <span className="px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">SALE</span>}
                      </div>

                      {item.subCategory && (
                        <span className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-chocolate-700">
                          {item.subCategory}
                        </span>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="font-heading font-bold text-xl text-chocolate-900 mb-1 group-hover:text-gold-600 transition-colors">
                        {item.title}
                      </h3>

                      {item.shortDescription && (
                        <p className="text-chocolate-500 text-sm mb-4 line-clamp-2">{item.shortDescription}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.price > 0 && <span className="text-xl font-bold text-gold-600">₹{item.price}</span>}
                          {item.originalPrice && <span className="text-sm text-chocolate-400 line-through">₹{item.originalPrice}</span>}
                        </div>

                        <div className="flex items-center gap-1 text-chocolate-400">
                          <span className="text-sm">{item.likes + (inWish ? 1 : 0)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {!loading && filtered.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
              <div className="w-24 h-24 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HiOutlineGift className="w-12 h-12 text-chocolate-300" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-chocolate-900 mb-2">No gift sets found</h3>
              <p className="text-chocolate-500 mb-6">
                {items.length === 0 ? 'No gift sets added yet. Check back soon!' : 'Try adjusting your filters'}
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </motion.div>
  )
}

export default Gifting