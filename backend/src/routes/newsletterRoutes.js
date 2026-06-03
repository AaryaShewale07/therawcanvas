import express from 'express'
import { protect, admin } from '../middleware/authMiddleware.js'
import {
  subscribe,
  unsubscribe,
  getAllSubscribers,
} from '../controllers/newsletterController.js'

const router = express.Router()

router.post('/subscribe', subscribe)
router.post('/unsubscribe', unsubscribe)
router.get('/all', protect, admin, getAllSubscribers)

export default router