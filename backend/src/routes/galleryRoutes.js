import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { protect, admin } from '../middleware/authMiddleware.js'
import {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/galleryController.js'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── Ensure upload folder exists ─────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'gallery')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// ─── Multer storage ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `gallery-${uniqueSuffix}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only image files (JPG, PNG, WEBP, GIF) are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 20,                   // max 20 files
  },
})

// ─── Public routes ────────────────────────────────────────────────────────────
router.get('/', getAllEvents)
router.get('/:id', getEvent)

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.post('/', protect, admin, upload.array('images', 20), createEvent)
router.put('/:id', protect, admin, upload.array('images', 20), updateEvent)
router.delete('/:id', protect, admin, deleteEvent)

export default router