import express from 'express'
import {
  createOrder,
  verifyPayment,
  getBooking,
  getEventBookings,
  getAllBookings,
} from '../controllers/bookingController.js'
import { protect, admin, optionalAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

// PUBLIC (optional auth so we can link to user if logged in)
router.post('/create-order', optionalAuth, createOrder)
router.post('/verify', optionalAuth, verifyPayment)
router.get('/:id', getBooking)

// ADMIN
router.get('/', protect, admin, getAllBookings)
router.get('/event/:eventId', protect, admin, getEventBookings)

export default router