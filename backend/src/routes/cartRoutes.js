import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
  getCart,
  addToCart,
  updateCartQty,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js'

const router = express.Router()

router.get('/', protect, getCart)
router.post('/add', protect, addToCart)
router.put('/update', protect, updateCartQty)
router.delete('/remove/:postId', protect, removeFromCart)
router.delete('/clear', protect, clearCart)

export default router