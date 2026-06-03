import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Hero from '../components/home/Hero'
import Testimonials from '../components/home/Testimonials'
import GalleryItem from '../components/gallery/GalleryItem'
import { pageTransition } from '../utils/animations'
import {
  HiOutlineGift,
  HiOutlineSparkles,
  HiOutlineTruck,
  HiOutlineHeart,
  HiOutlineArrowRight,
} from 'react-icons/hi'
import api from '../utils/api'
import toast from 'react-hot-toast'
import WorkshopCard from '../components/home/WorkshopCard'

const features = [
  { icon: HiOutlineSparkles, title: 'Handcrafted', description: 'Each piece is carefully crafted by artisans with years of experience' },
  { icon: HiOutlineGift, title: 'Perfect Gifts', description: 'Beautifully packaged and ready to delight your loved ones' },
  { icon: HiOutlineTruck, title: 'Free Delivery', description: 'Complimentary shipping on all orders over ₹500' },
  { icon: HiOutlineHeart, title: 'Made with Love', description: 'Using only the finest natural ingredients' },
]

const categories = [
  { name: 'Art', path: '/art', image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600', color: 'from-pink-500 to-rose-500' },
  { name: 'Chocolates', path: '/chocolates', image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600', color: 'from-amber-600 to-chocolate-700' },
  { name: 'Gifting', path: '/gifting', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600', color: 'from-yellow-500 to-gold-600' },
  { name: 'Workshops', path: '/workshops', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600', color: 'from-purple-500 to-indigo-600' },
]

const Home = () => {
  const [latestPosts, setLatestPosts] = useState([])
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [stats, setStats] = useState({
    artPieces: 0,
    chocolateVarieties: 0,
    happyCustomers: 0,
    ordersDelivered: 0,
  })
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [latestRes, featuredRes, statsRes] = await Promise.all([
          api.get('/posts/latest'),
          api.get('/posts/featured'),
          api.get('/posts/stats'),
        ])
        setLatestPosts(latestRes.data.data || [])
        setFeaturedPosts(featuredRes.data.data || [])
        setStats(statsRes.data.stats || {})
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email) return
    toast.success('🎉 Thanks for subscribing!')
    setEmail('')
  }

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit">
      <Hero />

      {/* Features Strip */}
      <section className="bg-gradient-to-r from-chocolate-800 to-chocolate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gold-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-cream-300 hidden md:block">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Art Pieces', value: stats.artPieces, suffix: '+', icon: '🎨' },
              { label: 'Chocolate Varieties', value: stats.chocolateVarieties, suffix: '+', icon: '🍫' },
              { label: 'Happy Customers', value: stats.happyCustomers, suffix: '+', icon: '😊' },
              { label: 'Orders Delivered', value: stats.ordersDelivered, suffix: '+', icon: '📦' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl mb-2">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-bold text-chocolate-900">
                  {stat.value}{stat.suffix}
                </div>
                <p className="text-chocolate-600 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-16 bg-gradient-to-b from-cream-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-chocolate-900 mb-3">
              Explore Our <span className="gradient-text">Collections</span>
            </h2>
            <p className="text-chocolate-600 text-lg max-w-2xl mx-auto">
              Discover handcrafted art, artisan chocolates, curated gifts, and immersive workshops
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link to={cat.path} className="block group">
                  <div className="relative aspect-square rounded-3xl overflow-hidden shadow-elegant hover:shadow-elegant-lg transition">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-70 group-hover:opacity-80 transition`} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                      <h3 className="text-2xl md:text-3xl font-heading font-bold mb-2">{cat.name}</h3>
                      <span className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 text-sm font-semibold">
                        Explore <HiOutlineArrowRight />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Workshops */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <span className="text-gold-600 font-semibold uppercase tracking-widest text-sm">
                  🎨 Limited Seats
                </span>
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-chocolate-900 mt-2">
                  Upcoming <span className="gradient-text">Workshops</span>
                </h2>
                <p className="text-chocolate-600 mt-2">
                  Join our hands-on workshops and learn from the best
                </p>
              </div>
              <Link
                to="/workshops"
                className="hidden md:flex items-center gap-2 text-chocolate-700 hover:text-chocolate-900 font-semibold"
              >
                View All <HiOutlineArrowRight />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPosts.slice(0, 4).map((workshop) => (
                <WorkshopCard key={workshop._id} workshop={workshop} />
              ))}
            </div>

            {/* Mobile View All Button */}
            <div className="text-center mt-8 md:hidden">
              <Link
                to="/workshops"
                className="inline-flex items-center gap-2 text-chocolate-700 font-semibold"
              >
                View All Workshops <HiOutlineArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Latest Posts */}
      {latestPosts.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-cream-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-end justify-between mb-12"
            >
              <div>
                <span className="text-primary-600 font-semibold uppercase tracking-widest text-sm">
                  ✨ Just In
                </span>
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-chocolate-900 mt-2">
                  Latest <span className="gradient-text">Arrivals</span>
                </h2>
              </div>
              <Link
                to="/art"
                className="hidden md:flex items-center gap-2 text-chocolate-700 hover:text-chocolate-900 font-semibold"
              >
                View All <HiOutlineArrowRight />
              </Link>
            </motion.div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-chocolate-200 border-t-chocolate-700 rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {latestPosts.slice(0, 8).map((post) => (
                  <GalleryItem key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <Testimonials />

      {/* CTA / Newsletter */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-500 to-gold-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">
              Ready to Indulge in Sweetness?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join our exclusive community and be the first to know about new collections, special offers, and artisan secrets.
            </p>
            <motion.form
              onSubmit={handleSubscribe}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur border border-white/30 text-white placeholder-white/70 focus:outline-none focus:border-white transition-colors"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Subscribe Now
              </motion.button>
            </motion.form>
            <p className="text-sm text-white/70 mt-4">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}

export default Home