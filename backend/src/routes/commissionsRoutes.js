import express from 'express'
import { protect, admin } from '../middleware/authMiddleware.js'
import {
  createCommission,
  getAllCommissions,
  getCommissionById,
  updateCommission,
  deleteCommission,
} from '../controllers/commissionsController.js'

const router = express.Router()

// Public
router.post('/', createCommission)

// Admin
router.get('/', protect, admin, getAllCommissions)
router.get('/:id', protect, admin, getCommissionById)
router.put('/:id', protect, admin, updateCommission)
router.delete('/:id', protect, admin, deleteCommission)

export default router