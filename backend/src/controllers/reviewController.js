import asyncHandler from 'express-async-handler'
import Review from '../models/Review.js'

// GET /api/reviews
export const getReviews = asyncHandler(async (req, res) => {
  const { featured, limit } = req.query

  const filter = { isApproved: true }
  if (featured === 'true') filter.isFeatured = true

  let query = Review.find(filter)
    .populate('user', 'name avatar')
    .sort('-createdAt')

  if (limit) query = query.limit(parseInt(limit))

  const reviews = await query

  res.json({
    success: true,
    count: reviews.length,
    data: reviews,
  })
})

// GET /api/reviews/stats
export const getReviewStats = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ isApproved: true })

  const total = reviews.length
  const average = total > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
    : 0

  const breakdown = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  }

  res.json({
    success: true,
    data: {
      total,
      average: Math.round(average * 10) / 10,
      breakdown,
    },
  })
})

// POST /api/reviews
export const createReview = asyncHandler(async (req, res) => {
  const { rating, title, comment, category } = req.body

  if (!rating || !title || !comment) {
    res.status(400)
    throw new Error('Rating, title, and comment are required')
  }

  if (rating < 1 || rating > 5) {
    res.status(400)
    throw new Error('Rating must be between 1 and 5')
  }

  // Check if user already reviewed
  const existing = await Review.findOne({ user: req.user._id })
  if (existing) {
    res.status(400)
    throw new Error('You have already submitted a review. You can edit your existing review.')
  }

  const review = await Review.create({
    user: req.user._id,
    name: req.user.name,
    avatar: req.user.avatar || '',
    rating,
    title,
    comment,
    category: category || 'overall',
  })

  res.status(201).json({
    success: true,
    message: 'Thank you for your review! 💝',
    data: review,
  })
})

// PUT /api/reviews/:id
export const updateReview = asyncHandler(async (req, res) => {
  const { rating, title, comment, category } = req.body

  const review = await Review.findById(req.params.id)
  if (!review) {
    res.status(404)
    throw new Error('Review not found')
  }

  // Only the owner can update
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Not authorized')
  }

  if (rating !== undefined) review.rating = rating
  if (title !== undefined) review.title = title
  if (comment !== undefined) review.comment = comment
  if (category !== undefined) review.category = category

  const updated = await review.save()

  res.json({
    success: true,
    message: 'Review updated!',
    data: updated,
  })
})

// DELETE /api/reviews/:id
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) {
    res.status(404)
    throw new Error('Review not found')
  }

  // Owner or admin can delete
  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403)
    throw new Error('Not authorized')
  }

  await review.deleteOne()
  res.json({ success: true, message: 'Review deleted' })
})

// GET /api/reviews/me
export const getMyReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ user: req.user._id })
  res.json({ success: true, data: review })
})

// PUT /api/reviews/:id/feature (admin)
export const toggleFeatureReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) {
    res.status(404)
    throw new Error('Review not found')
  }

  review.isFeatured = !review.isFeatured
  await review.save()

  res.json({ success: true, data: review })
})

// PUT /api/reviews/:id/approve (admin)
export const toggleApproveReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) {
    res.status(404)
    throw new Error('Review not found')
  }

  review.isApproved = !review.isApproved
  await review.save()

  res.json({ success: true, data: review })
})