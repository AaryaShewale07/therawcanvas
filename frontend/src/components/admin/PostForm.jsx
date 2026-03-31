import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineX, HiOutlinePhotograph, HiOutlineUpload } from 'react-icons/hi'
import toast from 'react-hot-toast'

const PostForm = ({ post, category, onClose }) => {
  const isEditing = !!post
  const [formData, setFormData] = useState({
    title: post?.title || '',
    description: post?.description || '',
    category: category || post?.category || 'Art',
    price: post?.price || '',
    status: post?.status || 'Draft',
    image: post?.image || '',
    // Additional fields based on category
    artist: post?.artist || '',
    instructor: post?.instructor || '',
    duration: post?.duration || '',
    capacity: post?.capacity || '',
    date: post?.date || '',
    occasion: post?.occasion || '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast.success(isEditing ? 'Post updated successfully!' : 'Post created successfully!')
    setIsSubmitting(false)
    onClose()
  }

  const categories = ['Art', 'Chocolates', 'Gifting', 'Workshops']

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white px-8 py-6 border-b border-cream-100 flex items-center justify-between z-10">
            <h2 className="text-2xl font-heading font-bold text-chocolate-900">
              {isEditing ? 'Edit Post' : 'Create New Post'}
            </h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-cream-100 rounded-full transition-colors"
            >
              <HiOutlineX className="w-6 h-6 text-chocolate-500" />
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-chocolate-700 mb-2">
                Featured Image
              </label>
              <div className="border-2 border-dashed border-cream-300 rounded-2xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
                {formData.image ? (
                  <div className="relative">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                    >
                      <HiOutlineX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto">
                      <HiOutlinePhotograph className="w-8 h-8 text-chocolate-400" />
                    </div>
                    <div>
                      <p className="text-chocolate-700 font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-chocolate-400">PNG, JPG up to 10MB</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg"
                    >
                      <HiOutlineUpload className="w-5 h-5" />
                      Upload Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-chocolate-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter title"
                className="input-field"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-chocolate-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                rows={4}
                className="input-field resize-none"
              />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!!category}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-chocolate-700 mb-2">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate-400">$</span>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="input-field pl-8"
                />
              </div>
            </div>

            {/* Category-specific fields */}
            {formData.category === 'Art' && (
              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-2">
                  Artist Name
                </label>
                <input
                  type="text"
                  name="artist"
                  value={formData.artist}
                  onChange={handleChange}
                  placeholder="Enter artist name"
                  className="input-field"
                />
              </div>
            )}

            {formData.category === 'Workshops' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-chocolate-700 mb-2">
                      Instructor
                    </label>
                    <input
                      type="text"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleChange}
                      placeholder="Instructor name"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-chocolate-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="e.g., 3 hours"
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-chocolate-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-chocolate-700 mb-2">
                      Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      placeholder="Max participants"
                      className="input-field"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.category === 'Gifting' && (
              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-2">
                  Occasion
                </label>
                <select
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select occasion</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Holiday">Holiday</option>
                </select>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-cream-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-chocolate-300 text-chocolate-700 font-medium rounded-xl hover:border-chocolate-400 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  isEditing ? 'Update Post' : 'Create Post'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PostForm