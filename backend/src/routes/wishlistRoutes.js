import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
} from '../controllers/wishlistController.js'

const router = express.Router()

router.get('/', protect, getWishlist)
router.post('/toggle', protect, toggleWishlist)
router.delete('/:postId', protect, removeFromWishlist)

export default router