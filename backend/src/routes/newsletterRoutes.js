import express from 'express'
import { protect, admin } from '../middleware/authMiddleware.js'
import {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  deleteSubscriber,
  sendNewsletterCampaign,
} from '../controllers/newsletterController.js'

const router = express.Router()

// ── Public routes ─────────────────────────────────────────────────────────────
router.post('/subscribe', subscribe)
router.post('/unsubscribe', unsubscribe)

// ── Admin-only routes ─────────────────────────────────────────────────────────
router.get('/all', protect, admin, getAllSubscribers)
router.delete('/:id', protect, admin, deleteSubscriber)
router.post('/campaign', protect, admin, sendNewsletterCampaign)

export default router