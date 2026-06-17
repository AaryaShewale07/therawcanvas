import Gallery from '../models/Gallery.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── Helper: build full URL for an image path ─────────────────────────────────
const getFullImageUrl = (req, imagePath) => {
  if (!imagePath) return ''
  // If already a full URL (e.g. Cloudinary), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  // Otherwise prepend the server URL
  return `${req.protocol}://${req.get('host')}${imagePath}`
}

// Transform a single event's images into full URLs
const transformEvent = (req, event) => {
  if (!event) return event
  return {
    ...event,
    images: (event.images || []).map((img) => getFullImageUrl(req, img)),
  }
}

const deleteFileFromDisk = (relativePath) => {
  try {
    // Strip any full URL prefix if it exists
    let cleanPath = relativePath
    if (cleanPath.includes('/uploads/')) {
      cleanPath = '/uploads/' + cleanPath.split('/uploads/')[1]
    }
    const filePath = path.join(__dirname, '..', '..', 'public', cleanPath)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (err) {
    console.error('Failed to delete file:', err.message)
  }
}

// ─── GET /api/gallery ─────────────────────────────────────────────────────────
export const getAllEvents = async (req, res) => {
  try {
    const { category } = req.query
    const filter = {}
    if (category && category !== 'All') {
      filter.category = category
    }

    const events = await Gallery.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .lean()

    // ⭐ Transform images to full URLs
    const transformed = events.map((e) => transformEvent(req, e))

    res.status(200).json({
      success: true,
      count: transformed.length,
      data: transformed,
    })
  } catch (err) {
    console.error('Get gallery events error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery events',
    })
  }
}

// ─── GET /api/gallery/:id ─────────────────────────────────────────────────────
export const getEvent = async (req, res) => {
  try {
    const event = await Gallery.findById(req.params.id).lean()
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }
    res.status(200).json({ success: true, data: transformEvent(req, event) })
  } catch (err) {
    console.error('Get event error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch event' })
  }
}

// ─── POST /api/gallery ────────────────────────────────────────────────────────
export const createEvent = async (req, res) => {
  try {
    const { title, description, category, date, tags } = req.body

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required',
      })
    }

    const images = []
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // Store relative path in DB — transform to full URL on read
        images.push(`/uploads/gallery/${file.filename}`)
      })
    }

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required',
      })
    }

    let parsedTags = []
    if (tags) {
      parsedTags = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)
    }

    const event = await Gallery.create({
      title,
      description: description || '',
      category,
      date: date || Date.now(),
      tags: parsedTags,
      images,
      createdBy: req.user?._id,
    })

    // ⭐ Return with full URLs
    res.status(201).json({
      success: true,
      data: transformEvent(req, event.toObject()),
    })
  } catch (err) {
    console.error('Create gallery event error:', err)
    res.status(500).json({ success: false, message: 'Failed to create gallery event' })
  }
}

// ─── PUT /api/gallery/:id ─────────────────────────────────────────────────────
export const updateEvent = async (req, res) => {
  try {
    const { title, description, category, date, tags, existingImages } = req.body

    const event = await Gallery.findById(req.params.id)
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    // Existing images user kept — strip the full URL prefix back to relative
    let keptImages = []
    if (existingImages) {
      const arr = Array.isArray(existingImages) ? existingImages : [existingImages]
      keptImages = arr.map((url) => {
        if (url.includes('/uploads/')) {
          return '/uploads/' + url.split('/uploads/')[1]
        }
        return url
      })
    }

    // New uploads
    const newImages = []
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        newImages.push(`/uploads/gallery/${file.filename}`)
      })
    }

    const images = [...keptImages, ...newImages]

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required',
      })
    }

    // Delete removed images from disk
    const removedImages = event.images.filter((img) => !keptImages.includes(img))
    removedImages.forEach(deleteFileFromDisk)

    let parsedTags = []
    if (tags) {
      parsedTags = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)
    }

    event.title = title || event.title
    event.description = description !== undefined ? description : event.description
    event.category = category || event.category
    event.date = date || event.date
    event.tags = parsedTags
    event.images = images

    await event.save()

    res.status(200).json({
      success: true,
      data: transformEvent(req, event.toObject()),
    })
  } catch (err) {
    console.error('Update gallery event error:', err)
    res.status(500).json({ success: false, message: 'Failed to update event' })
  }
}

// ─── DELETE /api/gallery/:id ──────────────────────────────────────────────────
export const deleteEvent = async (req, res) => {
  try {
    const event = await Gallery.findById(req.params.id)
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' })
    }

    event.images.forEach(deleteFileFromDisk)

    await Gallery.findByIdAndDelete(req.params.id)

    res.status(200).json({ success: true, message: 'Event deleted successfully' })
  } catch (err) {
    console.error('Delete gallery event error:', err)
    res.status(500).json({ success: false, message: 'Failed to delete event' })
  }
}