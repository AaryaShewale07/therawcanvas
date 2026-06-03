import express from 'express'
import { protect, admin } from '../middleware/authMiddleware.js'
import {
  getReviews,
  getReviewStats,
  createReview,
  updateReview,
  deleteReview,
  getMyReview,
  toggleFeatureReview,
  toggleApproveReview,
} from '../controllers/reviewController.js'

const router = express.Router()

// Public
router.get('/', getReviews)
router.get('/stats', getReviewStats)

// User
router.get('/me', protect, getMyReview)
router.post('/', protect, createReview)
router.put('/:id', protect, updateReview)
router.delete('/:id', protect, deleteReview)

// Admin
router.put('/:id/feature', protect, admin, toggleFeatureReview)
router.put('/:id/approve', protect, admin, toggleApproveReview)

export default router