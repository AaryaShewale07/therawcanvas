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

// ─── ✅ FIX 1: Allow images AND videos ───────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    // Videos
    'video/mp4',
    'video/quicktime', // .mov
    'video/webm',
    'video/x-m4v',
    'video/ogg',
  ]

  if (
    allowed.includes(file.mimetype) ||
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('video/')
  ) {
    cb(null, true)
  } else {
    cb(
      new Error(
        `File type "${file.mimetype}" not allowed. Use images (JPG, PNG, WEBP, GIF) or videos (MP4, MOV, WEBM)`
      ),
      false
    )
  }
}

// ─── ✅ FIX 2: Increase file size limit to 100MB for videos ──────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per file (was 10MB)
    files: 20, // max 20 files
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