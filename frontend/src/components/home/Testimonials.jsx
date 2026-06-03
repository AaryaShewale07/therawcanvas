import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineStar, HiStar, HiOutlinePlus, HiOutlineX, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const Testimonials = () => {
  const { user, openLoginModal } = useAuth()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ total: 0, average: 0 })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [myReview, setMyReview] = useState(null)

  const fetchReviews = async () => {
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        api.get('/reviews', { params: { limit: 6 } }),
        api.get('/reviews/stats'),
      ])
      setReviews(reviewsRes.data.data || [])
      setStats(statsRes.data.data || { total: 0, average: 0 })

      // Check if user has a review
      if (user) {
        try {
          const myRes = await api.get('/reviews/me')
          setMyReview(myRes.data.data)
        } catch (err) {
          // User has no review yet
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [user])

  const handleAddReview = () => {
    if (!user) {
      toast.error('Please login to add a review')
      openLoginModal()
      return
    }
    setShowModal(true)
  }

  const handleDeleteReview = async () => {
    if (!myReview) return
    if (!window.confirm('Delete your review?')) return

    try {
      await api.delete(`/reviews/${myReview._id}`)
      toast.success('Review deleted')
      setMyReview(null)
      fetchReviews()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <section className="py-20 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-gold-600 font-semibold uppercase tracking-widest text-sm">
            💝 Customer Love
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-chocolate-900 mt-2 mb-4">
            What Our <span className="gradient-text">Customers Say</span>
          </h2>

          {/* Rating Summary */}
          {stats.total > 0 && (
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-elegant">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <HiStar
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(stats.average)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-chocolate-700 font-bold">
                {stats.average} <span className="font-normal text-chocolate-500">out of 5</span>
              </p>
              <span className="text-chocolate-500">•</span>
              <p className="text-chocolate-600 text-sm">
                {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Add Review Button */}
        <div className="flex justify-center mb-12 gap-3 flex-wrap">
          {myReview ? (
            <>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-chocolate-700 font-semibold rounded-full shadow-elegant border-2 border-chocolate-300 hover:border-chocolate-500 transition"
              >
                <HiOutlinePencil className="w-5 h-5" />
                Edit Your Review
              </button>
              <button
                onClick={handleDeleteReview}
                className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 font-semibold rounded-full shadow-elegant border-2 border-red-300 hover:border-red-500 transition"
              >
                <HiOutlineTrash className="w-5 h-5" />
                Delete Review
              </button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddReview}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition"
            >
              <HiOutlinePlus className="w-5 h-5" />
              Write a Review
            </motion.button>
          )}
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-chocolate-200 border-t-chocolate-700 rounded-full animate-spin mx-auto" />
          </div>
        ) : reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-16 bg-white rounded-3xl shadow-elegant max-w-2xl mx-auto"
          >
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-2xl font-bold text-chocolate-900 mb-2">No reviews yet</h3>
            <p className="text-chocolate-600 mb-6">Be the first to share your experience!</p>
            <button
              onClick={handleAddReview}
              className="bg-primary-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-700 transition"
            >
              Write the First Review
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, idx) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl shadow-elegant p-6 hover:shadow-elegant-lg transition-all"
              >
                {/* Stars */}
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <HiStar
                      key={star}
                      className={`w-5 h-5 ${
                        star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-chocolate-900 mb-2">
                  {review.title}
                </h3>

                {/* Comment */}
                <p className="text-chocolate-700 mb-4 line-clamp-4">
                  "{review.comment}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-cream-100">
                  <img
                    src={
                      review.avatar ||
                      review.user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=D4A574&color=fff`
                    }
                    alt={review.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-chocolate-900 text-sm">{review.name}</p>
                    <p className="text-xs text-chocolate-500">{formatDate(review.createdAt)}</p>
                  </div>
                  {review.isFeatured && (
                    <span className="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full font-semibold">
                      ⭐ Featured
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showModal && (
          <ReviewModal
            existingReview={myReview}
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false)
              fetchReviews()
            }}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

// ============ REVIEW MODAL ============
const ReviewModal = ({ existingReview, onClose, onSuccess }) => {
  const [rating, setRating] = useState(existingReview?.rating || 5)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState(existingReview?.title || '')
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [category, setCategory] = useState(existingReview?.category || 'overall')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !comment.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      if (existingReview) {
        await api.put(`/reviews/${existingReview._id}`, {
          rating, title, comment, category,
        })
        toast.success('Review updated! 💝')
      } else {
        await api.post('/reviews', {
          rating, title, comment, category,
        })
        toast.success('Thank you for your review! 💝')
      }
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-8 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {existingReview ? 'Edit Your Review' : 'Write a Review'} 💝
              </h2>
              <p className="text-primary-100 text-sm mt-1">
                Share your experience with us
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <HiOutlineX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Rating Stars */}
          <div>
            <label className="block text-sm font-semibold text-chocolate-700 mb-3">
              Your Rating *
            </label>
            <div className="flex items-center gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transform transition-transform hover:scale-110"
                >
                  <HiStar
                    className={`w-12 h-12 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-chocolate-600 mt-2 font-semibold">
              {rating === 5 ? '🤩 Excellent!' :
               rating === 4 ? '😊 Great!' :
               rating === 3 ? '🙂 Good' :
               rating === 2 ? '😐 Okay' :
               '😞 Poor'}
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-chocolate-700 mb-2">
              What are you reviewing?
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-cream-50 rounded-xl border-2 border-transparent focus:border-primary-500 focus:outline-none"
            >
              <option value="overall">🌟 Overall Experience</option>
              <option value="art">🎨 Art</option>
              <option value="chocolates">🍫 Chocolates</option>
              <option value="gifting">🎁 Gifting</option>
              <option value="workshops">📚 Workshops</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-chocolate-700 mb-2">
              Review Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
              placeholder="Sum it up in one line..."
              className="w-full px-4 py-3 bg-cream-50 rounded-xl border-2 border-transparent focus:border-primary-500 focus:outline-none"
            />
            <p className="text-xs text-chocolate-500 mt-1">{title.length}/100</p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-chocolate-700 mb-2">
              Your Review *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              required
              rows={4}
              placeholder="Share your thoughts, experience, or favorite moment..."
              className="w-full px-4 py-3 bg-cream-50 rounded-xl border-2 border-transparent focus:border-primary-500 focus:outline-none resize-none"
            />
            <p className="text-xs text-chocolate-500 mt-1">{comment.length}/500</p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-chocolate-300 text-chocolate-700 font-semibold rounded-xl hover:bg-cream-50 transition"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition"
            >
              {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default Testimonials