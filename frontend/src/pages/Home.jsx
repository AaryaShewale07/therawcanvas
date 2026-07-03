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
  HiOutlinePhotograph,
  HiOutlinePlay,
} from 'react-icons/hi'
import api from '../utils/api'
import toast from 'react-hot-toast'
import commissionsImage from '../assets/images/commissions-hero.png'
import WorkshopCard from '../components/home/WorkshopCard'

// ─── Static Data ──────────────────────────────────────────────────────────────

const features = [
  { icon: HiOutlineSparkles, title: 'Handcrafted', description: 'Each piece is carefully crafted by artisans with years of experience' },
  { icon: HiOutlineGift, title: 'Perfect Gifts', description: 'Beautifully packaged and ready to delight your loved ones' },
  { icon: HiOutlineTruck, title: 'Free Delivery', description: 'Complimentary shipping on all orders over ₹500' },
  { icon: HiOutlineHeart, title: 'Made with Love', description: 'Using only the finest natural ingredients' },
]

const categories = [
  { name: 'Art', path: '/art', image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600', color: 'from-pink-500 to-rose-500' },
  { name: 'Chocolates', path: '/chocolates', image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600', color: 'from-amber-600 to-yellow-800' },
  { name: 'Gifting', path: '/gifting', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600', color: 'from-yellow-500 to-amber-600' },
  { name: 'Workshops', path: '/workshops', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600', color: 'from-purple-500 to-indigo-600' },
]

// ─── Helper: Detect video URLs (matches Gallery.jsx exactly) ─────────────────
const isVideo = (url) => {
  if (!url) return false
  return /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(url) || url.includes('/video/')
}

// ─── Media Tile: renders image OR autoplay muted video ───────────────────────
const MediaTile = ({ src, withPlayIcon = false }) => {
  const itemIsVideo = isVideo(src)
  return (
    <div className="relative w-full h-full">
      {itemIsVideo ? (
        <video
          src={src}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      )}
      {withPlayIcon && itemIsVideo && (
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5">
          <HiOutlinePlay className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  )
}

// ─── Gallery Event Card (mirrors Gallery.jsx EventCard) ─────────────────────
const GalleryEventCard = ({ event }) => {
  const media = event.images || []
  const mediaCount = media.length
  const videoCount = media.filter(isVideo).length

  const renderMediaGrid = () => {
    if (mediaCount === 0) {
      return (
        <div className="aspect-[4/3] bg-cream-100 flex items-center justify-center">
          <HiOutlinePhotograph className="w-12 h-12 text-chocolate-300" />
        </div>
      )
    }

    if (mediaCount === 1) {
      return (
        <div className="aspect-[4/3] overflow-hidden">
          <MediaTile src={media[0]} withPlayIcon />
        </div>
      )
    }

    if (mediaCount === 2) {
      return (
        <div className="grid grid-cols-2 gap-0.5 aspect-[4/3]">
          {media.slice(0, 2).map((item, i) => (
            <div key={i} className="overflow-hidden">
              <MediaTile src={item} withPlayIcon />
            </div>
          ))}
        </div>
      )
    }

    if (mediaCount === 3) {
      return (
        <div className="grid grid-cols-2 gap-0.5 aspect-[4/3]">
          <div className="overflow-hidden row-span-2">
            <MediaTile src={media[0]} withPlayIcon />
          </div>
          <div className="overflow-hidden">
            <MediaTile src={media[1]} withPlayIcon />
          </div>
          <div className="overflow-hidden">
            <MediaTile src={media[2]} withPlayIcon />
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-0.5 aspect-[4/3]">
        <div className="overflow-hidden row-span-2">
          <MediaTile src={media[0]} withPlayIcon />
        </div>
        <div className="overflow-hidden">
          <MediaTile src={media[1]} withPlayIcon />
        </div>
        <div className="overflow-hidden relative">
          <MediaTile src={media[2]} withPlayIcon />
          {mediaCount > 3 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">+{mediaCount - 3}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Link
      to="/gallery"
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 block"
    >
      <div className="relative">
        {renderMediaGrid()}

        <div className="absolute top-3 left-3">
          <span
            className={`backdrop-blur-sm text-xs px-2 py-1 rounded-full font-medium
              ${
                event.category === 'Workshop'
                  ? 'bg-purple-900/70 text-purple-200'
                  : 'bg-chocolate-900/70 text-gold-300'
              }`}
          >
            {event.category === 'Workshop' ? '🎨' : '⭐'} {event.category}
          </span>
        </div>

        {mediaCount > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            {videoCount > 0
              ? `🎬 ${videoCount} · 📷 ${mediaCount - videoCount}`
              : `📷 ${mediaCount}`}
          </div>
        )}

        <div className="absolute inset-0 bg-chocolate-900/0 group-hover:bg-chocolate-900/40 transition-all duration-300 flex items-end justify-center pb-4 pointer-events-none">
          <span className="opacity-0 group-hover:opacity-100 transition bg-white/95 text-chocolate-800 text-xs font-bold px-4 py-2 rounded-full">
            View {mediaCount > 1 ? `all ${mediaCount}` : 'media'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-chocolate-800 text-lg leading-snug line-clamp-1 mb-1">
          {event.title}
        </h3>
        <p className="text-primary-600 text-sm font-medium mb-3">
          {event.date
            ? new Date(event.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : event.category}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-cream-100">
          <div className="flex items-center gap-1.5 text-primary-600 text-sm">
            <HiOutlinePhotograph className="w-4 h-4" />
            <span className="font-semibold">{mediaCount}</span>
          </div>
          <span className="text-primary-600 text-sm font-bold">{event.category}</span>
        </div>
      </div>
    </Link>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const Home = () => {
  const [latestPosts, setLatestPosts] = useState([])
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [galleryEvents, setGalleryEvents] = useState([])
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
        const [latestRes, featuredRes, statsRes, galleryRes] = await Promise.all([
          api.get('/posts/latest'),
          api.get('/posts/featured'),
          api.get('/posts/stats'),
          api.get('/gallery'),
        ])
        setLatestPosts(latestRes.data.data || [])
        setFeaturedPosts(featuredRes.data.data || [])
        setStats(statsRes.data.stats || {})
        setGalleryEvents(galleryRes.data.data || [])
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

  const galleryPreview = galleryEvents.slice(0, 4)

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* ── Hero ── */}
      <Hero />

      {/* ── Features Strip ── */}
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

      {/* ── Stats Counter ── */}
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

      {/* ── Categories Showcase ── */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[85%] bg-gradient-to-br from-chocolate-800 via-chocolate-900 to-chocolate-800 rounded-[3rem] mx-4 sm:mx-6 lg:mx-8 shadow-2xl overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4be3e' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block text-gold-400 font-semibold uppercase tracking-widest text-xs sm:text-sm mb-3">
              ✨ Our Specialties
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white mb-3">
              Explore Our{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500">
                Collections
              </span>
            </h2>
            <p className="text-cream-200 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Discover handcrafted art, artisan chocolates, curated gifts, and immersive workshops
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link to={cat.path} className="block group">
                  <div className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl hover:shadow-gold transition-all duration-500 ring-2 ring-gold-500/20 hover:ring-gold-400/60">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-70 group-hover:opacity-80 transition`} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold mb-2 drop-shadow-lg">{cat.name}</h3>
                      <span className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 text-xs sm:text-sm font-semibold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
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

      {/* ── Upcoming Workshops ── */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-12">
              <div>
                <span className="text-gold-600 font-semibold uppercase tracking-widest text-sm">🎨 Limited Seats</span>
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-chocolate-900 mt-2 pb-4 leading-[1.3] overflow-visible">
                  Upcoming <span className="text-yellow-600">Workshops</span>
                </h2>
                <p className="text-chocolate-600 mt-2">Join our hands-on workshops and learn from the best</p>
              </div>
              <Link to="/workshops" className="hidden md:flex items-center gap-2 text-chocolate-700 hover:text-chocolate-900 font-semibold">
                View All <HiOutlineArrowRight />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPosts.slice(0, 4).map((workshop) => (
                <WorkshopCard key={workshop._id} workshop={workshop} />
              ))}
            </div>

            <div className="text-center mt-8 md:hidden">
              <Link to="/workshops" className="inline-flex items-center gap-2 text-chocolate-700 font-semibold">
                View All Workshops <HiOutlineArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Latest Posts ── */}
      {latestPosts.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-cream-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-12">
              <div>
                <span className="text-primary-600 font-semibold uppercase tracking-widest text-sm">✨ Just In</span>
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-chocolate-900 mt-2 pb-4 leading-[1.3] overflow-visible">
                  Latest <span className="text-yellow-600">Arrivals</span>
                </h2>
              </div>
              <Link to="/art" className="hidden md:flex items-center gap-2 text-chocolate-700 hover:text-chocolate-900 font-semibold">
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

      {/* ── Gallery Preview ── */}
      {galleryPreview.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-12">
              <div>
                <span className="text-gold-600 font-semibold uppercase tracking-widest text-sm">📸 Memories</span>
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-chocolate-900 mt-2 pb-4 leading-[1.3] overflow-visible">
                  Our <span className="text-yellow-600">Gallery</span>
                </h2>
                <p className="text-chocolate-600 mt-2">Glimpses of our workshops and happy moments</p>
              </div>
              <Link to="/gallery" className="hidden md:flex items-center gap-2 text-chocolate-700 hover:text-chocolate-900 font-semibold group">
                View Full Gallery
                <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {galleryPreview.map((event, idx) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <GalleryEventCard event={event} />
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-10 md:hidden">
              <Link to="/gallery" className="inline-flex items-center gap-2 bg-chocolate-800 hover:bg-chocolate-700 text-white font-semibold px-6 py-3 rounded-full transition shadow-lg">
                View All Events
                <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Commissions CTA ── */}
      <section className="py-20 bg-gradient-to-br from-cream-50 via-white to-cream-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img src={commissionsImage} alt="Custom commissions" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900/70 via-transparent to-transparent" />

                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <span className="text-sm font-bold text-chocolate-800">✨ Custom Made</span>
                </div>

                <div className="absolute bottom-6 right-6 bg-gold-500 text-chocolate-900 px-4 py-2 rounded-full shadow-lg">
                  <span className="text-sm font-bold">100% Personalized</span>
                </div>
              </div>

              <div className="absolute -top-3 -right-3 w-20 h-20 border-t-4 border-r-4 border-gold-500 rounded-tr-3xl" />
              <div className="absolute -bottom-3 -left-3 w-20 h-20 border-b-4 border-l-4 border-primary-500 rounded-bl-3xl" />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="inline-block text-primary-600 font-semibold uppercase tracking-widest text-sm mb-3">
                🎨 Let's Create Together
              </span>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-chocolate-900 mb-6 leading-tight">
                Have a Vision?{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-gold-500">
                  Let Us Bring It to Life
                </span>
              </h2>

              <p className="text-lg text-chocolate-600 mb-8 leading-relaxed">
                From custom paintings tailored to your space to personalized chocolate gifts for special occasions — we craft one-of-a-kind pieces just for you. Have questions about our workshops? We'd love to help!
              </p>

              <div className="space-y-3 mb-8">
                {[
                  { icon: '🎨', text: 'Custom artwork & commissions' },
                  { icon: '🎓', text: 'Workshop enquiries & private sessions' },
                  { icon: '💝', text: 'Bulk orders & gifting consultations' },
                  { icon: '⚡', text: 'Response within 24 hours' },
                ].map((item, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-chocolate-700 font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="/commissions" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  Send an Enquiry
                  <HiOutlineArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/workshops" className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-chocolate-800 text-chocolate-800 font-bold rounded-full shadow-lg hover:bg-chocolate-800 hover:text-white transition-all hover:scale-105">
                  View Workshops
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <Testimonials />

      {/* ── CTA / Newsletter ── */}
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

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-full text-chocolate-900 placeholder-chocolate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button type="submit" className="px-6 py-3 bg-white text-chocolate-800 font-bold rounded-full hover:bg-cream-100 transition whitespace-nowrap">
                Subscribe 🎉
              </button>
            </form>

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