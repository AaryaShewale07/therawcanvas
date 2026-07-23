import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition } from '../utils/animations'
import {
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePhotograph,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlinePlay,
} from 'react-icons/hi'
import api from '../utils/api'

const CATEGORIES = ['All', 'Workshop', 'Testimonials']

// ─── Helper: Detect if a URL is a video ──────────────────────────────────────
const isVideo = (url) => {
  if (!url || typeof url !== 'string') return false
  return /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(url) || url.includes('/video/')
}

// ─── ⭐ Helper: Extract URL from string or object ─────────────────────────────
const getMediaUrl = (item) => {
  if (!item) return ''
  if (typeof item === 'string') return item
  return item.url || item.secure_url || item.src || ''
}

// ─── ⭐ Media Tile — SIMPLE & RELIABLE ───────────────────────────────────────
const MediaTile = ({ src, withPlayIcon = false }) => {
  const url = getMediaUrl(src)
  const itemIsVideo = isVideo(url)
  const [error, setError] = useState(false)

  if (!url || error) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center">
        <HiOutlinePhotograph className="w-10 h-10 text-chocolate-300" />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-cream-100">
      {itemIsVideo ? (
        <video
          src={url}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          onError={() => setError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <img
          src={url}
          alt=""
          loading="lazy"
          onError={() => setError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      )}

      {withPlayIcon && itemIsVideo && (
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-black/60 backdrop-blur-sm rounded-full p-1 sm:p-1.5">
          <HiOutlinePlay className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
        </div>
      )}
    </div>
  )
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({ event, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex)

  // ⭐ Normalize all media to string URLs
  const media = (event.images || [])
    .map(getMediaUrl)
    .filter(Boolean)

  const prevMedia = () =>
    setCurrentIndex((i) => (i - 1 + media.length) % media.length)
  const nextMedia = () =>
    setCurrentIndex((i) => (i + 1) % media.length)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prevMedia()
      if (e.key === 'ArrowRight') nextMedia()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!media.length) return null

  const currentSrc = media[currentIndex]
  const currentIsVideo = isVideo(currentSrc)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="relative max-w-5xl w-full bg-chocolate-900 rounded-3xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row">
            <div className="relative md:w-2/3 bg-black flex items-center justify-center min-h-[300px] md:min-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {currentIsVideo ? (
                    <video
                      key={currentSrc}
                      src={currentSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls
                      className="w-full h-full object-contain max-h-[60vh] md:max-h-[80vh]"
                    />
                  ) : (
                    <img
                      src={currentSrc}
                      alt={event.title}
                      className="w-full h-full object-contain max-h-[60vh] md:max-h-[80vh]"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {media.length > 1 && (
                <>
                  <button
                    onClick={prevMedia}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition z-10"
                  >
                    <HiOutlineChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextMedia}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition z-10"
                  >
                    <HiOutlineChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full z-10">
                {currentIndex + 1} / {media.length}
                {currentIsVideo && ' 🎬'}
              </div>
            </div>

            <div className="md:w-1/3 p-6 flex flex-col">
              <div className="flex-1">
                <span className="inline-block bg-gold-500/20 text-gold-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                  {event.category}
                </span>
                <h3 className="text-xl font-heading font-bold text-white mb-3">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-cream-300 text-sm leading-relaxed mb-4">
                    {event.description}
                  </p>
                )}
                <p className="text-chocolate-400 text-xs">{event.date}</p>

                {event.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-chocolate-700 text-cream-300 px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {media.length > 1 && (
                <div className="mt-4 pt-4 border-t border-chocolate-700">
                  <p className="text-chocolate-400 text-xs uppercase tracking-wider mb-2">
                    All Media ({media.length})
                  </p>
                  <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-chocolate-700">
                    {media.map((item, idx) => {
                      const itemIsVideo = isVideo(item)
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition
                            ${currentIndex === idx
                              ? 'border-gold-400 scale-105'
                              : 'border-transparent opacity-60 hover:opacity-100'
                            }
                          `}
                        >
                          {itemIsVideo ? (
                            <>
                              <video
                                src={item}
                                muted
                                playsInline
                                preload="metadata"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <HiOutlinePlay className="w-4 h-4 text-white" />
                              </div>
                            </>
                          ) : (
                            <img
                              src={item}
                              alt=""
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Event Card ───────────────────────────────────────────────────────────────
const EventCard = ({ event, onOpen }) => {
  const media = event.images || []
  const mediaCount = media.length
  const videoCount = media.filter((m) => isVideo(getMediaUrl(m))).length

  const renderMediaGrid = () => {
    if (mediaCount === 0) {
      return (
        <div className="aspect-[4/3] bg-cream-100 flex items-center justify-center">
          <HiOutlinePhotograph className="w-8 h-8 sm:w-12 sm:h-12 text-chocolate-300" />
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
              <span className="text-white text-lg sm:text-2xl font-bold">
                +{mediaCount - 3}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={onOpen}
    >
      <div className="relative">
        {renderMediaGrid()}

        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3">
          <span
            className={`backdrop-blur-sm text-[9px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium
              ${event.category === 'Workshop'
                ? 'bg-purple-900/70 text-purple-200'
                : 'bg-chocolate-900/70 text-gold-300'
              }
            `}
          >
            {event.category === 'Workshop' ? '🎨' : '⭐'}{' '}
            <span className="hidden sm:inline">{event.category}</span>
          </span>
        </div>

        {mediaCount > 1 && (
          <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 bg-black/60 backdrop-blur-sm text-white text-[9px] sm:text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex items-center gap-1">
            {videoCount > 0 ? `🎬${videoCount} 📷${mediaCount - videoCount}` : `📷${mediaCount}`}
          </div>
        )}

        <div className="absolute inset-0 bg-chocolate-900/0 group-hover:bg-chocolate-900/40 transition-all duration-300 flex items-end justify-center pb-4 pointer-events-none">
          <span className="opacity-0 group-hover:opacity-100 transition bg-white/95 text-chocolate-800 text-xs font-bold px-4 py-2 rounded-full">
            View {mediaCount > 1 ? `all ${mediaCount}` : 'media'}
          </span>
        </div>
      </div>

      <div className="p-2 sm:p-4">
        <h3 className="font-heading font-bold text-chocolate-900 text-xs sm:text-base leading-snug line-clamp-1 mb-0.5 sm:mb-1">
          {event.title}
        </h3>
        {event.description && (
          <p className="hidden sm:block text-xs text-chocolate-500 line-clamp-2 mb-2">
            {event.description}
          </p>
        )}
        <p className="text-[10px] sm:text-xs text-chocolate-400">{event.date}</p>

        {event.tags?.length > 0 && (
          <div className="hidden sm:flex flex-wrap gap-1 mt-2">
            {event.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-cream-100 text-chocolate-600 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Gallery Page ─────────────────────────────────────────────────────────────
const Gallery = () => {
  const [events, setEvents] = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [lightboxEvent, setLightboxEvent] = useState(null)
  const [visibleCount, setVisibleCount] = useState(9)
  const loaderRef = useRef(null)

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await api.get('/gallery')
        console.log('🔍 RAW API DATA:', res.data.data)

        const fetched = (res.data.data || []).map((event) => ({
          ...event,
          // ⭐ NORMALIZE: extract URL string from object OR keep string as-is
          images: (event.images || [])
            .map(getMediaUrl)
            .filter(Boolean),
          date: event.date
            ? new Date(event.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
            : '',
        }))

        console.log('📦 PROCESSED EVENTS:', fetched)
        fetched.forEach((ev, idx) => {
          console.log(`   Event ${idx}: "${ev.title}" has ${ev.images?.length || 0} images:`, ev.images)
        })

        setEvents(fetched)
      } catch (err) {
        console.error('Failed to load gallery:', err)
      } finally {
        setPageLoading(false)
      }
    }
    fetchGallery()
  }, [])

  const filtered = events.filter((ev) => {
    const matchCat = activeCategory === 'All' || ev.category === activeCategory
    const matchSearch =
      search === '' ||
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      (ev.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (ev.tags || []).some((t) => t.includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  const visible = filtered.slice(0, visibleCount)

  const totalMedia = events.reduce(
    (sum, ev) => sum + (ev.images?.length || 0),
    0
  )

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 6, filtered.length))
        }
      },
      { threshold: 0.1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [filtered.length])

  useEffect(() => {
    setVisibleCount(9)
  }, [activeCategory, search])

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen"
    >
      {/* Hero Banner */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-chocolate-900 via-chocolate-800 to-chocolate-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4be3e' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-gold-400 font-semibold uppercase tracking-widest text-sm mb-4">
              📸 Captured Moments
            </span>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
              Our{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500">
                Gallery
              </span>
            </h1>
            <p className="text-cream-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              A visual journey through our workshops and the happy moments shared
              with our wonderful customers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-10"
          >
            {[
              { label: 'Total Events', value: events.length },
              { label: 'Total Media', value: totalMedia },
              {
                label: 'Workshops',
                value: events.filter((e) => e.category === 'Workshop').length,
              },
              {
                label: 'Testimonials',
                value: events.filter((e) => e.category === 'Testimonials').length,
              },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gold-400">
                  {s.value}+
                </div>
                <div className="text-cream-300 text-xs sm:text-sm">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Filter & Search */}
      <section className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-cream-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 border
                    ${activeCategory === cat
                      ? 'bg-chocolate-800 text-white border-chocolate-800 shadow-lg'
                      : 'bg-white text-chocolate-600 border-cream-300 hover:border-chocolate-400 hover:text-chocolate-800'
                    }
                  `}
                >
                  {cat}
                  {cat !== 'All' && (
                    <span
                      className={`ml-1.5 text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full
                        ${activeCategory === cat
                          ? 'bg-white/20'
                          : 'bg-cream-100'
                        }
                      `}
                    >
                      {events.filter((e) => e.category === cat).length}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-chocolate-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl border border-cream-300 focus:border-chocolate-500 focus:outline-none focus:ring-2 focus:ring-chocolate-200 text-xs sm:text-sm bg-cream-50"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-chocolate-400 hover:text-chocolate-600"
                >
                  <HiOutlineX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-[10px] sm:text-xs text-chocolate-500">
            <HiOutlineFilter className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>
              Showing <strong>{visible.length}</strong> of{' '}
              <strong>{filtered.length}</strong> event
              {filtered.length !== 1 ? 's' : ''}
              {activeCategory !== 'All' && ` in "${activeCategory}"`}
              {search && ` matching "${search}"`}
            </span>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-8 sm:py-12 bg-gradient-to-b from-cream-50 to-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {pageLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-chocolate-200 border-t-chocolate-700 rounded-full animate-spin" />
            </div>
          ) : visible.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <HiOutlinePhotograph className="w-16 h-16 text-chocolate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-chocolate-700 mb-2">
                No events found
              </h3>
              <p className="text-chocolate-500">
                Try adjusting your filters or search term.
              </p>
              <button
                onClick={() => {
                  setActiveCategory('All')
                  setSearch('')
                }}
                className="mt-6 px-6 py-2 bg-chocolate-800 text-white rounded-full text-sm font-semibold hover:bg-chocolate-700 transition"
              >
                Reset Filters
              </button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {visible.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    onOpen={() => setLightboxEvent(event)}
                  />
                ))}
              </div>

              {visibleCount < filtered.length && (
                <div ref={loaderRef} className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-chocolate-200 border-t-chocolate-700 rounded-full animate-spin" />
                </div>
              )}

              {visibleCount >= filtered.length && filtered.length > 6 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-chocolate-400 py-8 text-sm"
                >
                  ✨ You've seen all {filtered.length} event
                  {filtered.length !== 1 ? 's' : ''}!
                </motion.p>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-chocolate-800 to-chocolate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Share Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500">
                Experience
              </span>
            </h2>
            <p className="text-cream-200 text-lg mb-8 max-w-2xl mx-auto">
              Attended one of our workshops or received a gift? Tag us on social
              media and your photo could be featured here!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://www.instagram.com/the_.rawcanvas._/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-pink-500/30 transition"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/TheRawCanvas21"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-600/30 transition"
              >
                Facebook
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {lightboxEvent && (
        <Lightbox
          event={lightboxEvent}
          startIndex={0}
          onClose={() => setLightboxEvent(null)}
        />
      )}
    </motion.div>
  )
}

export default Gallery