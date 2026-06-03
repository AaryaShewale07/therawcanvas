import express from 'express'
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getPostStats,
  getFeatured,
  getLatest,
  getHomeStats,
} from '../controllers/postController.js'

import { protect, admin } from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

// ⭐ PUBLIC — Specific routes BEFORE /:id
router.get('/stats', getHomeStats)
router.get('/featured', getFeatured)
router.get('/latest', getLatest)

// PUBLIC
router.get('/', getPosts)

// ADMIN STATS
router.get('/stats/overview', protect, admin, getPostStats)

// PUBLIC - Get single post (MUST be last to avoid matching /featured, /latest, etc.)
router.get('/:id', getPost)

// ADMIN — upload up to 5 images per post
router.post('/', protect, admin, upload.array('images', 5), createPost)
router.put('/:id', protect, admin, upload.array('images', 5), updatePost)
router.delete('/:id', protect, admin, deletePost)

export default router