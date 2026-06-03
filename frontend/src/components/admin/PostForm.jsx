import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineX,
  HiOutlinePhotograph,
  HiOutlineTrash,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlinePlus,
} from 'react-icons/hi'
import api from '../../utils/api'
import toast from 'react-hot-toast'

// Helper: convert ISO date to <input type="datetime-local"> format
const toLocalDateTimeInput = (isoDate) => {
  if (!isoDate) return ''
  const d = new Date(isoDate)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const PostForm = ({ post, category, onClose, onSaved }) => {
  const isEdit = Boolean(post)
  const fileInputRef = useRef(null)

  const initialCategory = post?.category || category || 'art'
  const isWorkshop = (cat) => cat === 'workshops'

  // Initialize slots (or migrate single eventDate to slots array)
  const initialSlots = post?.slots?.length > 0
    ? post.slots.map(s => ({
        _id: s._id,
        date: toLocalDateTimeInput(s.date),
        maxAttendees: s.maxAttendees,
        bookingsCount: s.bookingsCount,
      }))
    : post?.eventDate
      ? [{ date: toLocalDateTimeInput(post.eventDate), maxAttendees: post.maxAttendees || 20, bookingsCount: post.bookingsCount || 0 }]
      : [{ date: '', maxAttendees: 20, bookingsCount: 0 }]

  const [formData, setFormData] = useState({
    title: post?.title || '',
    description: post?.description || '',
    shortDescription: post?.shortDescription || '',
    category: initialCategory,
    subCategory: post?.subCategory || '',
    price: post?.price || '',
    originalPrice: post?.originalPrice || '',
    artist: post?.artist || '',
    tags: post?.tags?.join(', ') || '',
    status: post?.status || 'published',
    featured: post?.featured || false,
    isNew: post?.isNew !== undefined ? post.isNew : true,
    inStock: post?.inStock !== undefined ? post.inStock : true,
    stock: post?.stock !== undefined ? post.stock : 100,
    requiresCustomization: post?.requiresCustomization || false,
    venue: post?.venue || '',
  })

  const [slots, setSlots] = useState(initialSlots)
  const [newImages, setNewImages] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [existingImages, setExistingImages] = useState(post?.images || [])
  const [imagesToDelete, setImagesToDelete] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  const showWorkshopFields = isWorkshop(formData.category)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Slot management
  const addSlot = () => {
    setSlots([...slots, { date: '', maxAttendees: 20, bookingsCount: 0 }])
  }

  const removeSlot = (index) => {
    if (slots.length === 1) {
      toast.error('At least one slot is required')
      return
    }
    if (slots[index].bookingsCount > 0) {
      toast.error('Cannot remove slot with existing bookings')
      return
    }
    setSlots(slots.filter((_, i) => i !== index))
  }

  const updateSlot = (index, field, value) => {
    const updated = [...slots]
    updated[index] = { ...updated[index], [field]: value }
    setSlots(updated)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = []
    const newPreviews = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`)
        continue
      }
      validFiles.push(file)
      newPreviews.push(URL.createObjectURL(file))
    }

    setNewImages((prev) => [...prev, ...validFiles])
    setPreviewUrls((prev) => [...prev, ...newPreviews])
  }

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (publicId) => {
    setImagesToDelete((prev) => [...prev, publicId])
    setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required')
      return
    }

    if (showWorkshopFields) {
      if (!formData.venue.trim()) {
        toast.error('Venue is required for workshops')
        return
      }

      // Validate all slots
      const validSlots = slots.filter(s => s.date)
      if (validSlots.length === 0) {
        toast.error('Please add at least one time slot')
        return
      }

      for (let i = 0; i < validSlots.length; i++) {
        const slot = validSlots[i]
        if (!slot.date) {
          toast.error(`Slot ${i + 1}: Date is required`)
          return
        }
        if (new Date(slot.date) <= new Date()) {
          toast.error(`Slot ${i + 1}: Date must be in the future`)
          return
        }
        if (!slot.maxAttendees || slot.maxAttendees < 1) {
          toast.error(`Slot ${i + 1}: Max attendees must be at least 1`)
          return
        }
      }
    }

    setIsSaving(true)

    try {
      const data = new FormData()

      const fieldsToSend = showWorkshopFields
        ? {
            title: formData.title,
            description: formData.description,
            shortDescription: formData.shortDescription,
            category: formData.category,
            price: formData.price || 0,
            status: formData.status,
            featured: formData.featured,
            isNew: formData.isNew,
            venue: formData.venue,
          }
        : {
            title: formData.title,
            description: formData.description,
            shortDescription: formData.shortDescription,
            category: formData.category,
            subCategory: formData.subCategory,
            price: formData.price,
            originalPrice: formData.originalPrice,
            artist: formData.artist,
            tags: formData.tags,
            status: formData.status,
            featured: formData.featured,
            isNew: formData.isNew,
            inStock: formData.inStock,
            stock: formData.stock,
            requiresCustomization: formData.requiresCustomization,
          }

      Object.entries(fieldsToSend).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          data.append(key, value)
        }
      })

      // ⭐ Send slots as JSON for workshops
      if (showWorkshopFields) {
        const slotsToSend = slots
          .filter(s => s.date)
          .map(s => ({
            _id: s._id,
            date: new Date(s.date).toISOString(),
            maxAttendees: parseInt(s.maxAttendees),
            bookingsCount: s.bookingsCount || 0,
          }))
        data.append('slots', JSON.stringify(slotsToSend))

        // Set eventDate to earliest slot (for backward compatibility)
        const earliestSlot = slotsToSend.reduce((earliest, slot) =>
          new Date(slot.date) < new Date(earliest.date) ? slot : earliest
        )
        data.append('eventDate', earliestSlot.date)

        // Total max attendees (sum of all slots)
        const totalMax = slotsToSend.reduce((sum, s) => sum + s.maxAttendees, 0)
        data.append('maxAttendees', totalMax)
      }

      newImages.forEach((file) => data.append('images', file))

      if (imagesToDelete.length > 0) {
        data.append('imagesToDelete', JSON.stringify(imagesToDelete))
      }

      if (isEdit) {
        await api.put(`/posts/${post._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Post updated successfully!')
      } else {
        await api.post('/posts', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Post created successfully!')
      }

      onSaved?.()
      onClose()
    } catch (err) {
      console.error('Save error:', err)
      toast.error(err.response?.data?.message || 'Failed to save post')
    } finally {
      setIsSaving(false)
    }
  }

  const modalTitle = isEdit
    ? showWorkshopFields ? 'Edit Workshop Event' : 'Edit Post'
    : showWorkshopFields ? 'Add New Workshop Event' : 'Add New Post'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-900/60 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-cream-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 className="text-xl font-heading font-bold text-chocolate-900">
              {modalTitle}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-cream-100 rounded-full transition-colors"
            >
              <HiOutlineX className="w-5 h-5 text-chocolate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-chocolate-700 mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
              >
                <option value="art">Art</option>
                <option value="chocolates">Chocolates</option>
                <option value="gifting">Gifting</option>
                <option value="workshops">Workshops</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-chocolate-700 mb-1">
                {showWorkshopFields ? 'Event Name *' : 'Title *'}
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={showWorkshopFields ? 'e.g., Chocolate Truffle Masterclass' : 'Enter post title'}
                className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-chocolate-700 mb-1">Short Description</label>
              <input
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="One-line summary (optional)"
                className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-chocolate-700 mb-1">
                {showWorkshopFields ? 'Event Description *' : 'Description *'}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder={showWorkshopFields ? 'What will attendees learn?' : 'Detailed description'}
                className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none"
                required
              />
            </div>

            {/* ============ WORKSHOP FIELDS ============ */}
            {showWorkshopFields && (
              <>
                {/* Venue */}
                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-1">
                    <HiOutlineLocationMarker className="inline w-4 h-4 mr-1" />
                    Venue *
                  </label>
                  <input
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    placeholder="e.g., 123 Main St, Mumbai"
                    className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-1">
                    Price per Ticket (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    placeholder="500"
                    className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    required
                  />
                </div>

                {/* ⭐ MULTIPLE SLOTS SECTION */}
                <div className="border-2 border-purple-200 bg-purple-50 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-chocolate-900 flex items-center gap-2">
                      <HiOutlineCalendar className="w-5 h-5 text-purple-600" />
                      Available Date Slots * ({slots.length})
                    </h3>
                    <button
                      type="button"
                      onClick={addSlot}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition"
                    >
                      <HiOutlinePlus className="w-4 h-4" /> Add Slot
                    </button>
                  </div>

                  <p className="text-xs text-chocolate-600 mb-4">
                    💡 Add multiple dates/times for the same workshop. Customers can choose which slot works for them.
                  </p>

                  <div className="space-y-3">
                    {slots.map((slot, index) => (
                      <div key={index} className="bg-white p-4 rounded-xl border border-purple-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-purple-700">Slot {index + 1}</span>
                          {slots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSlot(index)}
                              className="text-red-500 hover:bg-red-50 p-1 rounded transition"
                              disabled={slot.bookingsCount > 0}
                              title={slot.bookingsCount > 0 ? 'Cannot delete - has bookings' : 'Remove slot'}
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-chocolate-600 mb-1">
                              Date & Time *
                            </label>
                            <input
                              type="datetime-local"
                              value={slot.date}
                              onChange={(e) => updateSlot(index, 'date', e.target.value)}
                              className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-chocolate-600 mb-1">
                              <HiOutlineUserGroup className="inline w-3 h-3 mr-1" />
                              Max Seats
                            </label>
                            <input
                              type="number"
                              value={slot.maxAttendees}
                              onChange={(e) => updateSlot(index, 'maxAttendees', e.target.value)}
                              min="1"
                              max="100"
                              className="w-full px-3 py-2 border border-cream-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                              required
                            />
                          </div>
                        </div>

                        {slot.bookingsCount > 0 && (
                          <div className="mt-2 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg">
                            ✓ {slot.bookingsCount} ticket(s) already booked for this slot
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ============ NON-WORKSHOP FIELDS ============ */}
            {!showWorkshopFields && (
              <>
                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-1">Sub Category</label>
                  <input
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    placeholder="e.g., Paintings, Truffles, LED Frame"
                    className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-chocolate-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-chocolate-700 mb-1">
                      Original Price (₹) <span className="text-xs text-chocolate-400">(for sales)</span>
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-chocolate-700 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      placeholder="100"
                      className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-chocolate-700 mb-1">Artist / Creator</label>
                    <input
                      name="artist"
                      value={formData.artist}
                      onChange={handleChange}
                      placeholder="Artist name"
                      className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-1">
                    Tags <span className="text-xs text-chocolate-400">(comma-separated)</span>
                  </label>
                  <input
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="abstract, modern, colorful"
                    className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="requiresCustomization"
                      checked={formData.requiresCustomization}
                      onChange={handleChange}
                      className="w-4 h-4 mt-1 accent-primary-500"
                    />
                    <div>
                      <span className="font-medium text-chocolate-900">📸 Requires customer photos</span>
                      <p className="text-xs text-chocolate-600 mt-1">
                        Check for custom products like LED frames where customers send their photos via WhatsApp after payment
                      </p>
                    </div>
                  </label>
                </div>
              </>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-chocolate-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className="text-sm text-chocolate-700">Featured (homepage)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isNew"
                  checked={formData.isNew}
                  onChange={handleChange}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className="text-sm text-chocolate-700">Mark as New</span>
              </label>
              {!showWorkshopFields && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleChange}
                    className="w-4 h-4 accent-primary-500"
                  />
                  <span className="text-sm text-chocolate-700">In Stock</span>
                </label>
              )}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-chocolate-700 mb-2">
                {showWorkshopFields ? 'Event Image' : 'Images'}
                <span className="text-xs text-chocolate-400 ml-2">(max 5, each ≤ 5MB)</span>
              </label>

              {existingImages.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {existingImages.map((img) => (
                    <div key={img.publicId} className="relative group">
                      <img src={img.url} alt="" className="w-full h-24 object-cover rounded-lg border border-cream-200" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.publicId)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <HiOutlineTrash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img src={url} alt="" className="w-full h-24 object-cover rounded-lg border-2 border-green-300" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <HiOutlineTrash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-cream-300 rounded-xl p-6 text-center hover:border-primary-400 hover:bg-cream-50 transition-all"
              >
                <HiOutlinePhotograph className="w-8 h-8 text-chocolate-400 mx-auto mb-2" />
                <p className="text-sm text-chocolate-600">Click to add images</p>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-cream-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border-2 border-chocolate-300 text-chocolate-700 rounded-xl hover:border-chocolate-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  isEdit ? 'Update' : 'Create'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PostForm