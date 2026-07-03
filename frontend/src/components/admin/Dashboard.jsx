import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlinePhotograph,
  HiOutlineCake,
  HiOutlineGift,
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineEye,
  HiOutlineTrendingUp,
  HiOutlinePlus,
  HiOutlineShoppingBag,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineUpload,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePencil,
  HiOutlineCalendar,
  HiOutlineTag,
} from 'react-icons/hi'
import { FaRupeeSign } from 'react-icons/fa'
import { staggerContainer, staggerItem } from '../../utils/animations'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const GALLERY_CATEGORIES = ['Workshop', 'Testimonials']

const isVideoSrc = (src) => {
  if (typeof src !== 'string') return false
  return (
    /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(src) ||
    src.startsWith('data:video/')
  )
}

// ─── Image / Video Lightbox ───────────────────────────────────────────────────
const ImageLightbox = ({ images, startIndex, onClose }) => {
  const [isOpen, setIsOpen] = useState(false) 
  const [current, setCurrent] = useState(startIndex)
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }, [current])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft')
        setCurrent((i) => (i - 1 + images.length) % images.length)
      if (e.key === 'ArrowRight')
        setCurrent((i) => (i + 1) % images.length)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [images.length, onClose])

  const currentSrc = images[current]
  const currentIsVideo = isVideoSrc(currentSrc)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="relative max-w-4xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-10 sm:-top-12 right-0 text-white hover:text-gold-400 transition z-10"
          >
            <HiOutlineX className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>

          {currentIsVideo ? (
            <video
              ref={videoRef}
              src={currentSrc}
              controls
              autoPlay
              loop
              playsInline
              className="w-full max-h-[75vh] sm:max-h-[80vh] object-contain rounded-2xl bg-black"
            />
          ) : (
            <img
              src={currentSrc}
              alt={`Preview ${current + 1}`}
              className="w-full max-h-[75vh] sm:max-h-[80vh] object-contain rounded-2xl"
            />
          )}

          {currentIsVideo && (
            <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold">
              🎬 Video
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrent((i) => (i - 1 + images.length) % images.length)
                }
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1.5 sm:p-2 transition"
              >
                <HiOutlineChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={() => setCurrent((i) => (i + 1) % images.length)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1.5 sm:p-2 transition"
              >
                <HiOutlineChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 flex-wrap px-2">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 transition flex-shrink-0
                      ${idx === current
                        ? 'border-white'
                        : 'border-white/20 opacity-50 hover:opacity-100'
                      }
                    `}
                  >
                    {isVideoSrc(src) ? (
                      <div className="w-full h-full bg-purple-900 flex items-center justify-center text-white text-base sm:text-lg">
                        🎬
                      </div>
                    ) : (
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>

              <p className="text-center text-white/70 text-xs sm:text-sm mt-2 sm:mt-3">
                {current + 1} / {images.length}
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Add / Edit Event Modal ───────────────────────────────────────────────────
const EventModal = ({ event, onClose, onSave }) => {
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    category: event?.category || 'Workshop',
    date: event?.date
      ? new Date(event.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    tags: event?.tags?.join(', ') || '',
  })
  const [previews, setPreviews] = useState(event?.images || [])
  const [newFiles, setNewFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const processFiles = (files) => {
    const validFiles = Array.from(files).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/')
    )
    if (validFiles.length === 0)
      return toast.error('Please select image or video files only')

    validFiles.forEach((file) => {
      const isVideo = file.type.startsWith('video/')
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error(
          `${file.name} is too large (max ${isVideo ? '100MB' : '10MB'})`
        )
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target.result])
        setNewFiles((prev) => [...prev, file])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = (e) => processFiles(e.target.files)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    processFiles(e.dataTransfer.files)
  }

  const removeImage = (idx) => {
    setPreviews((prev) => prev.filter((_, i) => i !== idx))
    const existingCount = (event?.images || []).length
    if (idx >= existingCount) {
      setNewFiles((prev) => prev.filter((_, i) => i !== idx - existingCount))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    if (previews.length === 0)
      return toast.error('Add at least one image or video')

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('category', form.category)
      formData.append('date', form.date)
      formData.append('tags', form.tags)

      const existingCount = (event?.images || []).length
      const keptExisting = previews
        .slice(0, existingCount)
        .filter((p) => typeof p === 'string' && !p.startsWith('data:'))
      keptExisting.forEach((url) => formData.append('existingImages', url))

      newFiles.forEach((file) => {
        formData.append('images', file)
      })

      let res
      if (event?._id) {
        res = await api.put(`/gallery/${event._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        res = await api.post('/gallery', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      toast.success(event?._id ? '✅ Event updated!' : '🎉 Event created!')
      onSave(res.data.data)
      onClose()
    } catch (err) {
      console.error('❌ Upload failed:', err.response?.data || err.message || err)
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to save event — check console'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-cream-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-3xl z-10">
            <h2 className="text-lg sm:text-xl font-heading font-bold text-chocolate-900 truncate pr-2">
              {event?._id ? '✏️ Edit Gallery Event' : '📸 New Gallery Event'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-cream-100 rounded-full transition flex-shrink-0"
            >
              <HiOutlineX className="w-5 h-5 text-chocolate-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                Event Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Chocolate Tempering Workshop"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-cream-300 focus:border-chocolate-500 focus:outline-none focus:ring-2 focus:ring-chocolate-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                  <HiOutlineTag className="inline w-4 h-4 mr-1" />
                  Category *
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-cream-300 focus:border-chocolate-500 focus:outline-none focus:ring-2 focus:ring-chocolate-200 text-sm bg-white"
                >
                  {GALLERY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                  <HiOutlineCalendar className="inline w-4 h-4 mr-1" />
                  Event Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-cream-300 focus:border-chocolate-500 focus:outline-none focus:ring-2 focus:ring-chocolate-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe the event..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-cream-300 focus:border-chocolate-500 focus:outline-none focus:ring-2 focus:ring-chocolate-200 text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                Tags{' '}
                <span className="font-normal text-chocolate-400 text-xs">
                  (comma-separated)
                </span>
              </label>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="chocolate, workshop, hands-on"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-cream-300 focus:border-chocolate-500 focus:outline-none focus:ring-2 focus:ring-chocolate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                Photos & Videos *{' '}
                <span className="font-normal text-chocolate-400 text-xs">
                  ({previews.length} selected)
                </span>
              </label>

              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 sm:p-8 text-center cursor-pointer transition-all duration-200
                  ${dragOver
                    ? 'border-chocolate-500 bg-chocolate-50'
                    : 'border-cream-300 hover:border-chocolate-400 hover:bg-cream-50'
                  }
                `}
              >
                <HiOutlineUpload className="w-8 h-8 sm:w-10 sm:h-10 text-chocolate-400 mx-auto mb-2 sm:mb-3" />
                <p className="text-chocolate-600 font-medium text-sm sm:text-base">
                  <span className="hidden sm:inline">Drop images or videos here or </span>
                  <span className="text-primary-600 underline">browse</span>
                </p>
                <p className="text-xs text-chocolate-400 mt-1">
                  Images (max 10MB) · Videos (max 100MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/quicktime,video/webm,video/x-m4v"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {previews.length > 0 && (
                <div className="mt-3 sm:mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                  {previews.map((src, idx) => {
                    const isVid = isVideoSrc(src)
                    return (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-xl overflow-hidden border border-cream-200 shadow-sm bg-black"
                      >
                        {isVid ? (
                          <video
                            src={src}
                            muted
                            autoPlay
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={src}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}

                        {isVid && (
                          <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold leading-none">
                            🎬
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition shadow-lg z-10"
                        >
                          <HiOutlineX className="w-3 h-3" />
                        </button>

                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                          {idx + 1}
                        </div>
                      </div>
                    )
                  })}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-cream-300 hover:border-chocolate-400 flex flex-col items-center justify-center text-chocolate-400 hover:text-chocolate-600 transition"
                  >
                    <HiOutlinePlus className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-xs mt-1 hidden sm:block">Add More</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3 pt-2 border-t border-cream-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3 sm:px-5 py-2 sm:py-2.5 text-chocolate-600 hover:text-chocolate-800 font-medium transition text-sm"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-chocolate-800 hover:bg-chocolate-700 text-white font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <HiOutlineUpload className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {event?._id ? 'Update Event' : 'Publish Event'}
                    </span>
                    <span className="sm:hidden">
                      {event?._id ? 'Update' : 'Publish'}
                    </span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Gallery Event Card ───────────────────────────────────────────────────────
const EventCard = ({ event, onEdit, onDelete }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [currentThumb, setCurrentThumb] = useState(0)

  const media = event.images || []

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-elegant border border-cream-100 overflow-hidden group"
      >
        <div
          className="relative aspect-video bg-cream-100 cursor-pointer overflow-hidden"
          onClick={() => media.length > 0 && setLightboxIndex(currentThumb)}
        >
          {media.length > 0 ? (
            isVideoSrc(media[currentThumb]) ? (
              <video
                src={media[currentThumb]}
                muted
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <img
                src={media[currentThumb]}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HiOutlinePhotograph className="w-12 h-12 text-chocolate-300" />
            </div>
          )}

          {media.length > 1 && !isVideoSrc(media[currentThumb]) && (
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
              {media.some(isVideoSrc) ? '🎬' : '📷'} {media.length}
            </div>
          )}

          {media.length > 0 && isVideoSrc(media[currentThumb]) && (
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-purple-600/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
              🎬 Video
            </div>
          )}

          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm
                ${event.category === 'Workshop'
                  ? 'bg-purple-900/70 text-purple-200'
                  : 'bg-chocolate-900/70 text-gold-300'
                }
              `}
            >
              {event.category === 'Workshop' ? '🎨' : '⭐'} {event.category}
            </span>
          </div>

          <div className="absolute inset-0 bg-chocolate-900/0 group-hover:bg-chocolate-900/30 transition-all duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition bg-white/90 text-chocolate-800 text-xs font-bold px-3 py-1.5 rounded-full">
              {isVideoSrc(media[currentThumb]) ? 'Play' : 'View'}
            </span>
          </div>
        </div>

        {media.length > 1 && (
          <div className="flex gap-1.5 px-3 pt-3 overflow-x-auto scrollbar-hide">
            {media.map((src, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentThumb(idx)}
                className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden border-2 transition bg-black
                  ${currentThumb === idx
                    ? 'border-chocolate-600'
                    : 'border-transparent opacity-60 hover:opacity-100'
                  }
                `}
              >
                {isVideoSrc(src) ? (
                  <div className="w-full h-full bg-purple-900 flex items-center justify-center text-white text-base">
                    🎬
                  </div>
                ) : (
                  <img src={src} alt="" className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}

        <div className="p-3 sm:p-4">
          <h3 className="font-heading font-bold text-chocolate-900 text-sm leading-snug line-clamp-2 mb-1">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-xs text-chocolate-500 line-clamp-2 mb-3">
              {event.description}
            </p>
          )}

          <div className="flex items-center justify-between mb-3 gap-2">
            <span className="text-xs text-chocolate-400 flex items-center gap-1 min-w-0">
              <HiOutlineCalendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {event.date
                  ? new Date(event.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
              </span>
            </span>
            <span className="text-xs text-chocolate-400 flex-shrink-0">
              {media.length} item{media.length !== 1 ? 's' : ''}
            </span>
          </div>

          {event.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {event.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-cream-100 text-chocolate-600 px-2 py-0.5 rounded-full truncate max-w-[100px]"
                >
                  #{tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="text-xs text-chocolate-400">
                  +{event.tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-3 border-t border-cream-100">
            <button
              onClick={() => onEdit(event)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-chocolate-600 hover:text-chocolate-800 hover:bg-cream-50 rounded-lg transition"
            >
              <HiOutlinePencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              onClick={() => onDelete(event._id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
            >
              <HiOutlineTrash className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </motion.div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={media}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}

// ─── Gallery Manager ──────────────────────────────────────────────────────────
export const GalleryManager = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const res = await api.get('/gallery')
      setEvents(res.data.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load gallery events')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (savedEvent) => {
    setEvents((prev) => {
      const exists = prev.find((e) => e._id === savedEvent._id)
      if (exists) return prev.map((e) => (e._id === savedEvent._id ? savedEvent : e))
      return [savedEvent, ...prev]
    })
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this gallery event? This cannot be undone.')) return
    try {
      await api.delete(`/gallery/${id}`)
      setEvents((prev) => prev.filter((e) => e._id !== id))
      toast.success('🗑️ Event deleted')
    } catch (err) {
      toast.error('Failed to delete event')
    }
  }

  const openAddModal = () => {
    setEditingEvent(null)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingEvent(null)
  }

  const filtered =
    activeFilter === 'All'
      ? events
      : events.filter((e) => e.category === activeFilter)

  const totalPhotos = events.reduce((sum, e) => sum + (e.images?.length || 0), 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-chocolate-900">
            📸 Gallery Manager
          </h2>
          <p className="text-chocolate-500 text-xs sm:text-sm mt-1">
            {events.length} events · {totalPhotos} total media items
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-chocolate-800 text-white font-semibold rounded-xl shadow-lg hover:bg-chocolate-700 transition text-sm"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Gallery Event
        </motion.button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: 'Total Events', value: events.length, icon: '🗂️' },
          {
            label: 'Workshops',
            value: events.filter((e) => e.category === 'Workshop').length,
            icon: '🎨',
          },
          {
            label: 'Testimonials',
            value: events.filter((e) => e.category === 'Testimonials').length,
            icon: '⭐',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-elegant border border-cream-100 text-center"
          >
            <div className="text-xl sm:text-2xl mb-1">{s.icon}</div>
            <div className="text-lg sm:text-2xl font-bold text-chocolate-900">{s.value}</div>
            <div className="text-[10px] sm:text-xs text-chocolate-500 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['All', 'Workshop', 'Testimonials'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition border
              ${activeFilter === cat
                ? 'bg-chocolate-800 text-white border-chocolate-800'
                : 'bg-white text-chocolate-600 border-cream-200 hover:border-chocolate-400'
              }
            `}
          >
            {cat}
            {cat !== 'All' && (
              <span className="ml-1 sm:ml-2 text-xs opacity-70">
                {events.filter((e) => e.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12 sm:py-16">
          <div className="w-10 h-10 border-4 border-chocolate-200 border-t-chocolate-700 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-cream-100 shadow-elegant px-4">
          <HiOutlinePhotograph className="w-12 h-12 sm:w-14 sm:h-14 text-chocolate-300 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-chocolate-700 mb-2">
            No gallery events yet
          </h3>
          <p className="text-chocolate-400 text-xs sm:text-sm mb-6">
            Click "Add Gallery Event" to upload your first photos or videos
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-chocolate-800 text-white font-semibold rounded-xl hover:bg-chocolate-700 transition text-sm"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Gallery Event
          </button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filtered.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {modalOpen && (
          <EventModal
            event={editingEvent}
            onClose={handleCloseModal}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = ({ onAddPost }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard')
        setStats(res.data.data)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-20 text-chocolate-500 px-4">
        Failed to load dashboard data.
      </div>
    )
  }

  const quickStats = [
    {
      name: 'Total Users',
      value: stats.quickStats.totalUsers.toLocaleString(),
      icon: HiOutlineUsers,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Revenue',
      value: `₹${stats.quickStats.revenue.toLocaleString()}`,
      icon: FaRupeeSign,
      color: 'bg-green-500',
    },
    {
      name: 'Page Views',
      value: stats.quickStats.pageViews.toLocaleString(),
      icon: HiOutlineEye,
      color: 'bg-purple-500',
    },
    {
      name: 'Growth',
      value: stats.quickStats.growth,
      icon: HiOutlineTrendingUp,
      color: 'bg-amber-500',
    },
  ]

  const contentStats = [
    {
      name: 'Art',
      value: stats.contentStats.art.value,
      change: stats.contentStats.art.change,
      revenue: stats.contentStats.art.revenue,
      itemsSold: stats.contentStats.art.itemsSold,
      icon: HiOutlinePhotograph,
      color: 'bg-pink-500',
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      name: 'Chocolates',
      value: stats.contentStats.chocolates.value,
      change: stats.contentStats.chocolates.change,
      revenue: stats.contentStats.chocolates.revenue,
      itemsSold: stats.contentStats.chocolates.itemsSold,
      icon: HiOutlineCake,
      color: 'bg-chocolate-600',
      gradient: 'from-amber-700 to-chocolate-800',
    },
    {
      name: 'Gift Sets',
      value: stats.contentStats.gifting.value,
      change: stats.contentStats.gifting.change,
      revenue: stats.contentStats.gifting.revenue,
      itemsSold: stats.contentStats.gifting.itemsSold,
      icon: HiOutlineGift,
      color: 'bg-gold-500',
      gradient: 'from-yellow-500 to-amber-600',
    },
    {
      name: 'Workshops',
      value: stats.contentStats.workshops.value,
      change: stats.contentStats.workshops.change,
      revenue: stats.contentStats.workshops.revenue,
      itemsSold: stats.contentStats.workshops.itemsSold,
      icon: HiOutlineAcademicCap,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-indigo-600',
    },
  ]

  return (
    <div className="space-y-8 sm:space-y-12 px-3 sm:px-0">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-chocolate-900">
            Dashboard
          </h1>
          <p className="text-chocolate-500 mt-1 text-sm sm:text-base">
            Welcome back! Here's what's happening.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddPost}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-600 text-white font-medium rounded-xl shadow-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add New Post
        </motion.button>
      </div>

      {/* Quick Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
      >
        {quickStats.map((stat, index) => (
          <motion.div
            key={index}
            variants={staggerItem}
            className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-elegant"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-chocolate-900 leading-tight break-words">
              {stat.value}
            </p>
            <p className="text-xs sm:text-sm text-chocolate-500">{stat.name}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Revenue by Category */}
      <div>
        <h2 className="text-lg sm:text-xl font-heading font-bold text-chocolate-900 mb-3 sm:mb-4">
          💰 Revenue by Category
        </h2>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {contentStats.map((stat, index) => {
            const isPositive = stat.change.startsWith('+')
            return (
              <motion.div
                key={index}
                variants={staggerItem}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-elegant border border-cream-100 overflow-hidden"
              >
                <div className={`bg-gradient-to-br ${stat.gradient} p-4 sm:p-5 text-white`}>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        isPositive ? 'text-green-700 bg-white/90' : 'text-red-700 bg-white/90'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold">{stat.name}</h3>
                  <p className="text-xs text-white/80">
                    {stat.value} {stat.value === 1 ? 'product' : 'products'} listed
                  </p>
                </div>

                <div className="p-4 sm:p-5 space-y-2 sm:space-y-3">
                  <div>
                    <p className="text-xs text-chocolate-500 uppercase font-semibold">Revenue</p>
                    <p className="text-xl sm:text-2xl font-bold text-chocolate-900 break-words">
                      ₹{stat.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-cream-100">
                    <div className="flex items-center gap-2">
                      <HiOutlineShoppingBag className="w-4 h-4 text-chocolate-400" />
                      <span className="text-xs text-chocolate-500">Sold</span>
                    </div>
                    <span className="font-bold text-chocolate-900 text-sm">
                      {stat.itemsSold} units
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Recent Posts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-elegant p-4 sm:p-6"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <h2 className="text-lg sm:text-xl font-heading font-bold text-chocolate-900">
            Recent Posts
          </h2>
          <button className="text-primary-600 font-medium text-xs sm:text-sm hover:text-primary-700 flex-shrink-0">
            View All →
          </button>
        </div>

        {stats.recentPosts.length === 0 ? (
          <p className="text-center py-8 text-chocolate-500 text-sm">No posts yet</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-chocolate-500 border-b border-cream-100">
                    <th className="pb-4 font-medium">Title</th>
                    <th className="pb-4 font-medium">Category</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium">Date</th>
                    <th className="pb-4 font-medium">Author</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {stats.recentPosts.map((post) => (
                    <tr key={post.id} className="border-b border-cream-50">
                      <td className="py-4 font-medium text-chocolate-900">{post.title}</td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-cream-100 text-chocolate-700 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            post.status === 'Published'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="py-4 text-chocolate-500">{post.date}</td>
                      <td className="py-4 text-chocolate-600">{post.author}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {stats.recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-cream-50 rounded-xl p-3 border border-cream-100"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-chocolate-900 text-sm line-clamp-2 flex-1">
                      {post.title}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                        post.status === 'Published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-white text-chocolate-700 rounded-full font-medium">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-2 text-chocolate-500">
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.author}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      <div className="border-t-2 border-dashed border-cream-200" />

      <GalleryManager />
    </div>
  )
}

export default Dashboard