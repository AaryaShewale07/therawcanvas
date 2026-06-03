import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineArrowRight, HiOutlineHeart, HiOutlineShoppingBag } from 'react-icons/hi'
import api from '../../utils/api'

const FeaturedSection = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/posts', {
          params: { featured: 'true', limit: 6 },
        })
        setPosts(res.data.data || [])
      } catch (err) {
        console.error('Failed to load featured posts:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
        </div>
      </section>
    )
  }

  if (posts.length === 0) return null

  // Map category → public route
  const categoryLink = (category) => {
    switch (category) {
      case 'art': return '/art'
      case 'chocolates': return '/chocolates'
      case 'gifting': return '/gifting'
      case 'workshops': return '/workshops'
      default: return '/'
    }
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary-600 font-semibold uppercase tracking-wider text-sm">
            ✨ Handpicked for You
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-chocolate-900 mt-4 mb-4">
            Featured <span className="gradient-text">Collection</span>
          </h2>
          <p className="text-lg text-chocolate-600 max-w-2xl mx-auto">
            Explore our most-loved pieces — crafted with passion and curated just for you.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-3xl overflow-hidden shadow-elegant hover:shadow-elegant-lg transition-all duration-500"
            >
              <Link to={categoryLink(post.category)}>
                <div className="relative aspect-[4/5] overflow-hidden bg-cream-100">
                  {post.images?.[0] ? (
                    <img
                      src={post.images[0].url}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-chocolate-300">No image</div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 bg-gold-500 text-chocolate-900 text-xs font-bold rounded-full">
                      ★ Featured
                    </span>
                    {post.isNew && (
                      <span className="px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">NEW</span>
                    )}
                  </div>

                  <span className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-chocolate-700 capitalize">
                    {post.category}
                  </span>

                  <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <button className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg text-primary-500">
                      <HiOutlineHeart className="w-5 h-5" />
                    </button>
                    <button className="w-11 h-11 bg-primary-500 rounded-full flex items-center justify-center shadow-lg text-white">
                      <HiOutlineShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-heading font-bold text-xl text-chocolate-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
                    {post.title}
                  </h3>
                  {post.shortDescription && (
                    <p className="text-chocolate-500 text-sm mb-4 line-clamp-2">{post.shortDescription}</p>
                  )}

                  <div className="flex items-center justify-between">
                    {post.price > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary-600">${post.price}</span>
                        {post.originalPrice && (
                          <span className="text-sm text-chocolate-400 line-through">${post.originalPrice}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-primary-600 font-semibold text-sm">View Details</span>
                    )}
                    <HiOutlineArrowRight className="w-5 h-5 text-chocolate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/art"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors shadow-lg"
          >
            Explore All Collections
            <HiOutlineArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturedSection