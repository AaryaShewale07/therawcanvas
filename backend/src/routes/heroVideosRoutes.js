import express from 'express'
import multer from 'multer'
import streamifier from 'streamifier'
import HeroVideo from '../models/HeroVideo.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import cloudinary from '../config/cloudinary.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
})

// Public: Get active videos
router.get('/', async (req, res) => {
  try {
    const videos = await HeroVideo.find({ isActive: true }).sort({ order: 1, createdAt: -1 })
    res.json({ success: true, data: videos })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Admin: Get all
router.get('/all', protect, admin, async (req, res) => {
  try {
    const videos = await HeroVideo.find().sort({ order: 1, createdAt: -1 })
    res.json({ success: true, data: videos })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Admin: Upload video
router.post('/', protect, admin, upload.single('video'), async (req, res) => {
  try {
    const { title, isActive, order } = req.body
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file' })
    }

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder: 'hero-videos',
          },
          (error, result) => (result ? resolve(result) : reject(error))
        )
        streamifier.createReadStream(req.file.buffer).pipe(stream)
      })

    const result = await streamUpload()

    const video = await HeroVideo.create({
      title,
      videoUrl: result.secure_url,
      publicId: result.public_id,
      thumbnail: result.secure_url.replace(/\.[^/.]+$/, '.jpg'),
      isActive: isActive !== 'false',
      order: Number(order) || 0,
    })

    res.status(201).json({ success: true, data: video })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Admin: Update
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const video = await HeroVideo.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ success: true, data: video })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Admin: Delete
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const video = await HeroVideo.findById(req.params.id)
    if (!video) return res.status(404).json({ success: false })

    if (video.publicId) {
      await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' })
    }
    await video.deleteOne()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router