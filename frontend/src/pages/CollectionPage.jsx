// src/pages/CollectionPage.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  HiOutlineArrowRight,
  HiOutlineArrowNarrowRight,
  HiHeart,
  HiOutlineHeart,
  HiOutlineEye,
  HiOutlineShoppingBag,
  HiOutlineGift,
} from 'react-icons/hi'
import { HiOutlineBolt } from 'react-icons/hi2'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'

/* ═══════════════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════════════ */

const SectionHeader = ({ title, subtitle, href, accentColor }) => (
  <div className="flex items-end justify-between mb-8">
    <div>
      <motion.p
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-xs font-semibold tracking-widest uppercase mb-1"
        style={{ color: accentColor }}
      >
        {subtitle}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl sm:text-4xl font-heading font-bold text-chocolate-900"
      >
        {title}
      </motion.h2>
    </div>

    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Link
        to={href}
        className="group flex items-center gap-2 text-sm font-semibold text-chocolate-600 hover:text-chocolate-900 transition-colors duration-200"
      >
        <span className="hidden sm:inline">Show More</span>
        <span className="sm:hidden">All</span>
        <motion.span
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border-2 border-chocolate-300 group-hover:border-chocolate-800 group-hover:bg-chocolate-800 transition-all duration-300"
          whileHover={{ x: 4 }}
        >
          <HiOutlineArrowNarrowRight className="w-4 h-4 text-chocolate-600 group-hover:text-white transition-colors duration-300" />
        </motion.span>
      </Link>
    </motion.div>
  </div>
)

/* ═══════════════════════════════════════════════════
   SECTION DIVIDER
   ═══════════════════════════════════════════════════ */

const SectionDivider = ({ flip = false }) => (
  <div className={`w-full overflow-hidden leading-none pointer-events-none ${flip ? 'rotate-180' : ''}`}>
    <svg viewBox="0 0 1440 60" className="w-full h-12" preserveAspectRatio="none">
      <path
        d="M0,30 C240,60 480,0 720,30 C960,60 1200,10 1440,30 L1440,60 L0,60 Z"
        fill="rgba(42,22,14,0.04)"
      />
      <path
        d="M0,40 C360,10 720,60 1080,30 C1260,18 1380,45 1440,40"
        fill="none"
        stroke="rgba(163,72,42,0.08)"
        strokeWidth="1"
      />
    </svg>
  </div>
)

/* ═══════════════════════════════════════════════════
   SKELETON CARD
   ═══════════════════════════════════════════════════ */

const SkeletonCard = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-cream-100 animate-pulse">
    <div className="aspect-[4/5] bg-cream-100" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-cream-200 rounded w-3/4" />
      <div className="h-3 bg-cream-100 rounded w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 bg-cream-200 rounded w-1/4" />
        <div className="h-8 w-20 bg-cream-200 rounded-full" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-9 flex-1 bg-cream-100 rounded-full" />
        <div className="h-9 flex-1 bg-cream-200 rounded-full" />
      </div>
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════
   PRODUCT CARD
   ═══════════════════════════════════════════════════ */

const ProductCard = ({ item, index, accentBg = 'bg-primary-500', accentText = 'text-primary-600', borderColor = 'border-primary-500', hoverBg = 'hover:bg-primary-50' }) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { user, openLoginModal } = useAuth()

  const inWishlist = isInWishlist?.(item._id)

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { openLoginModal(); return }
    toggleWishlist(item._id)
  }

  const handleCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { openLoginModal(); return }
    addToCart(item._id, 1)
  }

  const handleView = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/product/${item._id}`)
  }

  /* ── Buy Now — no cart, go straight to checkout with state ── */
  const handleBuyNow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { openLoginModal(); return }
    navigate('/checkout', {
      state: {
        buyNow: true,
        product: {
          _id: item._id,
          title: item.title,
          price: item.price,
          image: item.images?.[0]?.url || null,
          quantity: 1,
        },
      },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-elegant hover:shadow-elegant-lg transition-all duration-500 border border-cream-100 cursor-pointer"
      onClick={() => navigate(`/product/${item._id}`)}
    >
      {/* ── IMAGE ── */}
      <div className="relative aspect-[4/5] overflow-hidden bg-cream-100">
        {item.images?.[0] ? (
          <img
            src={item.images[0].url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-chocolate-200 text-5xl">
            🎨
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover icon buttons */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWishlist}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              inWishlist ? 'bg-red-500 text-white' : 'bg-white text-red-500 hover:bg-red-50'
            }`}
          >
            {inWishlist ? <HiHeart className="w-5 h-5" /> : <HiOutlineHeart className="w-5 h-5" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleView}
            className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-cream-100 transition-colors"
          >
            <HiOutlineEye className="w-5 h-5 text-chocolate-700" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCart}
            className={`w-11 h-11 ${accentBg} rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity`}
          >
            <HiOutlineShoppingBag className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {item.isNew && (
            <span className="px-2.5 py-1 bg-gold-500 text-chocolate-900 text-[10px] font-bold rounded-full">NEW</span>
          )}
          {item.originalPrice && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full">SALE</span>
          )}
        </div>

        {item.subCategory && (
          <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-semibold text-chocolate-700">
            {item.subCategory}
          </span>
        )}
      </div>

      {/* ── INFO ── */}
      <div className="p-5">
        <h3 className="font-heading font-bold text-lg text-chocolate-900 mb-0.5 line-clamp-1 group-hover:text-chocolate-700 transition-colors">
          {item.title}
        </h3>

        {item.artist && (
          <p className="text-chocolate-500 text-xs mb-2">by {item.artist}</p>
        )}
        {item.shortDescription && !item.artist && (
          <p className="text-chocolate-500 text-xs mb-2 line-clamp-1">{item.shortDescription}</p>
        )}

        <div className="flex items-center justify-between mt-1 mb-4">
          <div className="flex items-center gap-2">
            {item.price > 0 && (
              <span className={`text-lg font-bold ${accentText}`}>₹{item.price}</span>
            )}
            {item.originalPrice && (
              <span className="text-xs text-chocolate-400 line-through">₹{item.originalPrice}</span>
            )}
            {item.price === 0 && (
              <span className="text-sm font-semibold text-green-600">Free</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-chocolate-400">
            <HiOutlineHeart className="w-3.5 h-3.5" />
            <span className="text-xs">{(item.likes || 0) + (inWishlist ? 1 : 0)}</span>
          </div>
        </div>

        {/* ── Add to Cart + Buy Now buttons ── */}
        <div className="flex gap-2 pt-3 border-t border-cream-100">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCart}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full border-2 ${borderColor} ${accentText} font-semibold text-xs ${hoverBg} transition-colors`}
          >
            <HiOutlineShoppingBag className="w-3.5 h-3.5" />
            Add to Cart
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleBuyNow}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full ${accentBg} text-white font-semibold text-xs hover:opacity-90 transition-opacity shadow-md`}
          >
            <HiOutlineBolt className="w-3.5 h-3.5" />
            Buy Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════ */

const EmptyState = ({ icon: Icon, message }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-chocolate-300" />
    </div>
    <p className="text-chocolate-400 text-sm">{message}</p>
  </div>
)

/* ═══════════════════════════════════════════════════
   COLLECTION PAGE
   ═══════════════════════════════════════════════════ */

const CollectionPage = () => {
  const [artItems, setArtItems] = useState([])
  const [chocolateItems, setChocolateItems] = useState([])
  const [giftItems, setGiftItems] = useState([])
  const [loading, setLoading] = useState({ art: true, chocolate: true, gifting: true })

  useEffect(() => {
    const fetchAll = async () => {
      const [artRes, chocoRes, giftRes] = await Promise.allSettled([
        api.get('/posts', { params: { category: 'art' } }),
        api.get('/posts', { params: { category: 'chocolates' } }),
        api.get('/posts', { params: { category: 'gifting' } }),
      ])

      if (artRes.status === 'fulfilled') setArtItems(artRes.value.data.data || [])
      if (chocoRes.status === 'fulfilled') setChocolateItems(chocoRes.value.data.data || [])
      if (giftRes.status === 'fulfilled') setGiftItems(giftRes.value.data.data || [])

      setLoading({ art: false, chocolate: false, gifting: false })
    }
    fetchAll()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pt-20">

      {/* ══════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-chocolate-900 via-chocolate-800 to-primary-900 py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="w-[600px] h-[600px] border border-gold-500/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute w-[400px] h-[400px] border border-primary-400/10 rounded-full"
          />
          <div className="absolute w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-gold-400 text-sm font-semibold tracking-widest uppercase mb-4"
          >
            TheRawCanvas Studio
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-6"
          >
            Our{' '}
            <span
              style={{
                backgroundImage: 'linear-gradient(to right, #aa941e, #cf6f4d, #a3482a)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Collections
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-cream-200 text-lg max-w-2xl mx-auto"
          >
            Explore handcrafted art, artisan chocolates, and curated gift sets — each made with
            intention and love.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mt-8"
          >
            {[
              { label: '🎨 Art Collection', href: '#art' },
              { label: '🍫 Chocolates', href: '#chocolate' },
              { label: '🎁 Gifting', href: '#gifting' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-105"
              >
                {item.label}
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════
          SECTION 1 — ART
      ══════════════════════════════════════════ */}
      <section id="art" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <SectionHeader
          title="Art Collection"
          subtitle="Original Artwork"
          href="/art"
          accentColor="#a3482a"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading.art
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : artItems.length === 0
            ? <EmptyState icon={HiOutlineShoppingBag} message="No artworks added yet. Check back soon!" />
            : artItems.slice(0, 4).map((item, i) => (
                <ProductCard
                  key={item._id}
                  item={item}
                  index={i}
                  accentBg="bg-primary-500"
                  accentText="text-primary-600"
                  borderColor="border-primary-500"
                  hoverBg="hover:bg-primary-50"
                />
              ))
          }
        </div>
        {artItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex justify-center"
          >
            <Link
              to="/art"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-chocolate-800 text-chocolate-800 font-semibold rounded-full hover:bg-chocolate-800 hover:text-white transition-all duration-300"
            >
              Browse All Art Pieces
              <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </section>

      <SectionDivider flip />

      {/* ══════════════════════════════════════════
          SECTION 2 — CHOCOLATES
      ══════════════════════════════════════════ */}
      <section id="chocolate" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-chocolate-50/40 to-transparent scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Chocolate Collection"
            subtitle="Artisan Chocolates"
            href="/chocolates"
            accentColor="#aa941e"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading.chocolate
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : chocolateItems.length === 0
              ? <EmptyState icon={HiOutlineShoppingBag} message="No chocolates added yet. Check back soon!" />
              : chocolateItems.slice(0, 4).map((item, i) => (
                  <ProductCard
                    key={item._id}
                    item={item}
                    index={i}
                    accentBg="bg-chocolate-700"
                    accentText="text-chocolate-700"
                    borderColor="border-chocolate-700"
                    hoverBg="hover:bg-chocolate-50"
                  />
                ))
            }
          </div>
          {chocolateItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex justify-center"
            >
              <Link
                to="/chocolates"
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-chocolate-800 text-chocolate-800 font-semibold rounded-full hover:bg-chocolate-800 hover:text-white transition-all duration-300"
              >
                Browse All Chocolates
                <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      <SectionDivider />

      {/* ══════════════════════════════════════════
          SECTION 3 — GIFTING
      ══════════════════════════════════════════ */}
      <section id="gifting" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
        <SectionHeader
          title="Gifting Collection"
          subtitle="Curated Gift Sets"
          href="/gifting"
          accentColor="#a3482a"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading.gifting
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : giftItems.length === 0
            ? <EmptyState icon={HiOutlineGift} message="No gift sets added yet. Check back soon!" />
            : giftItems.slice(0, 4).map((item, i) => (
                <ProductCard
                  key={item._id}
                  item={item}
                  index={i}
                  accentBg="bg-gold-500"
                  accentText="text-gold-600"
                  borderColor="border-gold-500"
                  hoverBg="hover:bg-gold-50"
                />
              ))
          }
        </div>
        {giftItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex justify-center"
          >
            <Link
              to="/gifting"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-chocolate-800 text-chocolate-800 font-semibold rounded-full hover:bg-chocolate-800 hover:text-white transition-all duration-300"
            >
              Browse All Gift Sets
              <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          WORKSHOP FOOTER BANNER
      ══════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-chocolate-900 to-primary-900 py-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gold-400 text-xs font-semibold tracking-widest uppercase mb-3">
            Learn · Create · Celebrate
          </p>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-3">
            Want to create something together?
          </h2>
          <p className="text-cream-300 mb-8 max-w-xl mx-auto">
            Join our workshops and learn the art of chocolate-making and painting from our master artisans.
          </p>
          <Link
            to="/workshops"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Join a Workshop
            <HiOutlineArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

    </div>
  )
}

export default CollectionPage