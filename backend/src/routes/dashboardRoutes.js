import express from 'express'
import {
  getDashboardStats,
  getAdminOrders,
  getOrderStats,
} from '../controllers/dashboardController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Dashboard overview
router.get('/', protect, admin, getDashboardStats)

// ⭐ Admin orders management
router.get('/orders', protect, admin, getAdminOrders)
router.get('/orders/stats', protect, admin, getOrderStats)

export default router