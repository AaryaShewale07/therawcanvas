import express from 'express'
import multer from 'multer'
import { protect, admin } from '../middleware/authMiddleware.js'
import { galleryStorage } from '../config/cloudinary.js'
import {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/galleryController.js'

const router = express.Router()

console.log('🟢🟢🟢 CLOUDINARY GALLERY ROUTE LOADED 🟢🟢🟢')

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true)
  } else {
    cb(new Error(`File type "${file.mimetype}" not allowed`), false)
  }
}

const upload = multer({
  storage: galleryStorage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 20,
  },
})

router.get('/', getAllEvents)
router.get('/:id', getEvent)
router.post(
  '/',
  (req, res, next) => {
    console.log('✅ GALLERY ROUTE HIT');
    next();
  },
  protect,
  admin,
  upload.array('images', 20),
  createEvent
)
router.put('/:id', protect, admin, upload.array('images', 20), updateEvent)
router.delete('/:id', protect, admin, deleteEvent)

export default router