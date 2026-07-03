import express from 'express'
import { protect, admin } from '../middleware/authMiddleware.js'
import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getMyCoupons,
} from '../controllers/couponController.js'

const router = express.Router()

// User routes
router.post('/validate', protect, validateCoupon)
router.get('/my', protect, getMyCoupons)

// Admin routes
router.get('/', protect, admin, getAllCoupons)
router.post('/', protect, admin, createCoupon)
router.put('/:id', protect, admin, updateCoupon)
router.delete('/:id', protect, admin, deleteCoupon)

export default router