import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  HiOutlinePlus,
  HiOutlineX,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUpload,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCalendar,
  HiOutlineSparkles,
} from 'react-icons/hi'
import api from '../../utils/api'

const THEMES = [
  { value: 'chocolate', label: 'Chocolate', color: 'from-chocolate-800 to-chocolate-900' },
  { value: 'gold', label: 'Gold', color: 'from-amber-500 to-yellow-600' },
  { value: 'pink', label: 'Pink', color: 'from-pink-500 to-rose-500' },
  { value: 'purple', label: 'Purple', color: 'from-purple-600 to-indigo-600' },
  { value: 'festive', label: 'Festive', color: 'from-red-600 to-orange-500' },
  { value: 'green', label: 'Green', color: 'from-emerald-600 to-green-600' },
]

// ─── Banner Form Modal ────────────────────────────────────────────────────────
const BannerModal = ({ banner, onClose, onSave }) => {
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    description: banner?.description || '',
    buttonText: banner?.buttonText || '',
    buttonLink: banner?.buttonLink || '',
    theme: banner?.theme || 'chocolate',
    icon: banner?.icon || '🎉',
    badge: banner?.badge || '',
    startDate: banner?.startDate
      ? new Date(banner.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    endDate: banner?.endDate
      ? new Date(banner.endDate).toISOString().split('T')[0]
      : '',
    isActive: banner?.isActive !== undefined ? banner.isActive : true,
    priority: banner?.priority || 0,
  })
  const [imagePreview, setImagePreview] = useState(banner?.image || '')
  const [newImageFile, setNewImageFile] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Only images allowed')
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
    setNewImageFile(file)
    setRemoveImage(false)
  }

  const handleRemoveImage = () => {
    setImagePreview('')
    setNewImageFile(null)
    setRemoveImage(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')

    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null) fd.append(k, v)
      })
      if (newImageFile) fd.append('image', newImageFile)
      if (removeImage && banner?._id) fd.append('removeImage', 'true')

      let res
      if (banner?._id) {
        res = await api.put(`/banners/${banner._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        res = await api.post('/banners', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      toast.success(banner?._id ? '✅ Banner updated!' : '🎉 Banner created!')
      onSave(res.data.data)
      onClose()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to save banner')
    } finally {
      setSaving(false)
    }
  }

  const selectedTheme = THEMES.find((t) => t.value === form.theme) || THEMES[0]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-cream-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
            <h2 className="text-xl font-heading font-bold text-chocolate-900">
              {banner?._id ? '✏️ Edit Banner' : '🎉 New Promotional Banner'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-cream-100 rounded-full transition"
            >
              <HiOutlineX className="w-5 h-5 text-chocolate-600" />
            </button>
          </div>

          {/* LIVE PREVIEW */}
          <div className="px-6 pt-4">
            <p className="text-xs font-semibold text-chocolate-500 uppercase mb-2">
              Live Preview
            </p>
            <div className={`bg-gradient-to-r ${selectedTheme.color} rounded-xl p-4 flex items-center justify-center gap-3 flex-wrap text-white shadow-md`}>
              {form.icon && <span className="text-2xl">{form.icon}</span>}
              {form.badge && (
                <span className="bg-white/90 text-chocolate-900 px-3 py-1 rounded-full text-xs font-bold uppercase">
                  {form.badge}
                </span>
              )}
              <div className="text-center">
                <p className="font-bold text-sm">{form.title || 'Your banner title'}</p>
                {form.subtitle && <p className="text-xs opacity-90">{form.subtitle}</p>}
              </div>
              {form.buttonText && (
                <span className="bg-white text-chocolate-900 px-4 py-1.5 rounded-full text-xs font-bold">
                  {form.buttonText} →
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-chocolate-700 mb-1.5">
                Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Winter Sale - 30% OFF on all chocolates!"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:border-chocolate-500 focus:outline-none focus:ring-2 focus:ring-chocolate-200 text-sm"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-semibold text-chocolate-700 mb-1.5">
                Subtitle
              </label>
              <input
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                placeholder="e.g. Limited time only - free shipping included"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:border-chocolate-500 focus:outline-none focus:ring-2 focus:ring-chocolate-200 text-sm"
              />
            </div>

            {/* Icon + Badge */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-chocolate-700 mb-1.5">
                  Icon / Emoji
                </label>
                <input
                  name="icon"
                  value={form.icon}
                  onChange={handleChange}
                  placeholder="🎉"
                  maxLength={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:border-chocolate-500 focus:outline-none text-lg text-center"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-chocolate-700 mb-1.5">
                  Badge Text
                </label>
                <input
                  name="badge"
                  value={form.badge}
                  onChange={handleChange}
                  placeholder="30% OFF"
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:border-chocolate-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Button */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-chocolate-700 mb-1.5">
                  Button Text
                </label>
                <input
                  name="buttonText"
                  value={form.buttonText}
                  onChange={handleChange}
                  placeholder="Shop Now"
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:border-chocolate-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-chocolate-700 mb-1.5">
                  Button Link
                </label>
                <input
                  name="buttonLink"
                  value={form.buttonLink}
                  onChange={handleChange}
                  placeholder="/chocolates"
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:border-chocolate-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Theme picker */}
            <div>
              <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, theme: t.value }))}
                    className={`relative h-12 rounded-lg bg-gradient-to-br ${t.color} ring-2 transition
                      ${form.theme === t.value
                        ? 'ring-chocolate-800 ring-offset-2 scale-105'
                        : 'ring-transparent hover:ring-cream-300'
                      }
                    `}
                    title={t.label}
                  >
                    {form.theme === t.value && (
                      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-chocolate-700 mb-1.5">
                  <HiOutlineCalendar className="inline w-4 h-4 mr-1" /> Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:border-chocolate-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-chocolate-700 mb-1.5">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:border-chocolate-500 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Optional image */}
            <div>
              <label className="block text-sm font-semibold text-chocolate-700 mb-1.5">
                Background Image (optional)
              </label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-24 rounded-lg border border-cream-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                  >
                    <HiOutlineX className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-cream-300 hover:border-chocolate-400 rounded-xl px-4 py-3 text-sm text-chocolate-500 flex items-center gap-2"
                >
                  <HiOutlineUpload className="w-4 h-4" /> Upload Image
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </div>

            {/* Priority + Active */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-sm font-semibold text-chocolate-700 mb-1.5">
                  Priority
                </label>
                <input
                  type="number"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 focus:border-chocolate-500 focus:outline-none text-sm"
                />
                <p className="text-xs text-chocolate-400 mt-1">Higher = shown first</p>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-chocolate-600 focus:ring-chocolate-500"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-chocolate-700">
                  Banner is Active
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-cream-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-chocolate-600 hover:text-chocolate-800 font-medium"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 bg-chocolate-800 hover:bg-chocolate-700 text-white font-semibold rounded-xl flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <HiOutlineSparkles className="w-4 h-4" />
                    {banner?._id ? 'Update Banner' : 'Publish Banner'}
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

// ─── Main Banner Admin Page ───────────────────────────────────────────────────
const BannerAdmin = () => {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const res = await api.get('/banners/all')
      setBanners(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (saved) => {
    setBanners((prev) => {
      const exists = prev.find((b) => b._id === saved._id)
      if (exists) return prev.map((b) => (b._id === saved._id ? saved : b))
      return [saved, ...prev]
    })
  }

  const handleEdit = (b) => {
    setEditing(b)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return
    try {
      await api.delete(`/banners/${id}`)
      setBanners((prev) => prev.filter((b) => b._id !== id))
      toast.success('🗑️ Banner deleted')
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/banners/${id}/toggle`)
      setBanners((prev) =>
        prev.map((b) => (b._id === id ? res.data.data : b))
      )
      toast.success(
        res.data.data.isActive ? '✅ Banner activated' : '⏸️ Banner deactivated'
      )
    } catch (err) {
      toast.error('Failed to toggle')
    }
  }

  const isLive = (b) => {
    if (!b.isActive) return false
    const now = new Date()
    if (b.startDate && new Date(b.startDate) > now) return false
    if (b.endDate && new Date(b.endDate) < now) return false
    return true
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-chocolate-900">
            🎉 Promotional Banners
          </h1>
          <p className="text-chocolate-500 mt-1 text-sm">
            Manage offers and promotions shown on your home page
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-chocolate-800 text-white font-semibold rounded-xl shadow-lg hover:bg-chocolate-700"
        >
          <HiOutlinePlus className="w-5 h-5" /> Add Banner
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Banners', value: banners.length, icon: '📊' },
          {
            label: 'Live Now',
            value: banners.filter(isLive).length,
            icon: '🟢',
          },
          {
            label: 'Inactive',
            value: banners.filter((b) => !b.isActive).length,
            icon: '⏸️',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 shadow-elegant border border-cream-100 text-center"
          >
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-chocolate-900">{s.value}</div>
            <div className="text-xs text-chocolate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-chocolate-200 border-t-chocolate-700 rounded-full animate-spin" />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-cream-100">
          <HiOutlineSparkles className="w-14 h-14 text-chocolate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-chocolate-700 mb-2">
            No banners yet
          </h3>
          <p className="text-chocolate-400 text-sm mb-6">
            Create your first promotional banner!
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-chocolate-800 text-white font-semibold rounded-xl hover:bg-chocolate-700"
          >
            <HiOutlinePlus className="w-5 h-5" /> Add Banner
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => {
            const theme = THEMES.find((t) => t.value === b.theme) || THEMES[0]
            const live = isLive(b)
            return (
              <motion.div
                layout
                key={b._id}
                className="bg-white rounded-2xl shadow-elegant border border-cream-100 overflow-hidden"
              >
                {/* Banner Preview */}
                <div className={`bg-gradient-to-r ${theme.color} p-4 flex items-center gap-3 flex-wrap`}>
                  {b.icon && <span className="text-2xl">{b.icon}</span>}
                  {b.badge && (
                    <span className="bg-white text-chocolate-900 px-3 py-1 rounded-full text-xs font-bold">
                      {b.badge}
                    </span>
                  )}
                  <div className="flex-1 text-white">
                    <p className="font-bold">{b.title}</p>
                    {b.subtitle && (
                      <p className="text-sm opacity-90">{b.subtitle}</p>
                    )}
                  </div>
                  {b.buttonText && (
                    <span className="bg-white text-chocolate-900 px-3 py-1.5 rounded-full text-xs font-bold">
                      {b.buttonText}
                    </span>
                  )}
                </div>

                {/* Meta + Actions */}
                <div className="p-3 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 text-xs text-chocolate-500 flex-wrap">
                    <span
                      className={`px-2 py-1 rounded-full font-bold
                        ${live
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                        }
                      `}
                    >
                      {live ? '🟢 LIVE' : '⏸️ INACTIVE'}
                    </span>
                    <span>Priority: {b.priority}</span>
                    {b.endDate && (
                      <span>
                        Ends: {new Date(b.endDate).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggle(b._id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cream-100 hover:bg-cream-200 text-chocolate-700 flex items-center gap-1"
                    >
                      {b.isActive ? (
                        <>
                          <HiOutlineEyeOff className="w-3.5 h-3.5" /> Hide
                        </>
                      ) : (
                        <>
                          <HiOutlineEye className="w-3.5 h-3.5" /> Show
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(b)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center gap-1"
                    >
                      <HiOutlinePencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-700 flex items-center gap-1"
                    >
                      <HiOutlineTrash className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <BannerModal
            banner={editing}
            onClose={() => {
              setModalOpen(false)
              setEditing(null)
            }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default BannerAdmin