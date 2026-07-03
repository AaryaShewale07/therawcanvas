import express from 'express'
import { protect, admin } from '../middleware/authMiddleware.js'
import {
  checkout,
  getMyOrders,
  getOrderById,
  cancelOrder,
  createRazorpayOrder,
  updateOrderStatus,
  getAllOrders,
  checkReferralDiscount, // ⭐ NEW
} from '../controllers/orderController.js'

const router = express.Router()

// Payment
router.post('/create-razorpay-order', protect, createRazorpayOrder)
router.post('/checkout', protect, checkout)

// ⭐ NEW — Check if user is eligible for first-order referral discount
router.get('/check-referral-discount', protect, checkReferralDiscount)

// User
router.get('/my', protect, getMyOrders)

// Admin
router.get('/admin/all', protect, admin, getAllOrders)
router.put('/:id/status', protect, admin, updateOrderStatus)

// Single order
router.get('/:id', protect, getOrderById)
router.put('/:id/cancel', protect, cancelOrder)

export default router