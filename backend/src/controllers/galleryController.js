import Gallery from '../models/Gallery.js'
import cloudinary from '../config/cloudinary.js'

console.log('🔵🔵🔵 CLOUDINARY GALLERY CONTROLLER LOADED 🔵🔵🔵')

// ─── Helper: Extract Cloudinary public_id from URL ───────────────────────────
const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null
  try {
    const parts = url.split('/upload/')
    if (parts.length < 2) return null
    const withoutVersion = parts[1].replace(/^v\d+\//, '')
    const publicId = withoutVersion.replace(/\.[^/.]+$/, '')
    return publicId
  } catch {
    return null
  }
}

// ─── Helper: Detect if URL is a video ────────────────────────────────────────
const isVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  return /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(url) || url.includes('/video/upload/')
}

// ─── Helper: Delete file from Cloudinary ─────────────────────────────────────
const deleteFromCloudinary = async (url) => {
  try {
    const publicId = getPublicIdFromUrl(url)
    if (!publicId) return
    const resourceType = isVideoUrl(url) ? 'video' : 'image'
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
    console.log(`🗑️  Deleted from Cloudinary: ${publicId}`)
  } catch (err) {
    console.error('Failed to delete from Cloudinary:', err.message)
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

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
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
    res.status(200).json({ success: true, data: event })
  } catch (err) {
    console.error('Get event error:', err)
    res.status(500).json({ success: false, message: 'Failed to fetch event' })
  }
}

// ─── POST /api/gallery ────────────────────────────────────────────────────────
export const createEvent = async (req, res) => {
  console.log('🔥 createEvent CALLED');

  try {
    console.log("========== FILES ==========");
    console.dir(req.files, { depth: null });
    console.log("===========================");

    const { title, description, category, date, tags } = req.body

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required',
      })
    }

    // ⭐ Cloudinary URLs come from req.files[].path
    console.log("============== FILES ==============");
    console.dir(req.files, { depth: null });
    console.log("===================================");

    const images = [];

    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        console.log(`File ${index}:`);
        console.log("path:", file.path);
        console.log("filename:", file.filename);
        console.log("secure_url:", file.secure_url);
        console.log("--------------------------------");

        images.push(file.path);
      });
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

    res.status(201).json({
      success: true,
      data: event,
    })
  } catch (err) {
    console.error('Create gallery event error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to create gallery event',
      error: err.message,
    })
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

    let keptImages = []
    if (existingImages) {
      const arr = Array.isArray(existingImages) ? existingImages : [existingImages]
      keptImages = arr.filter(Boolean)
    }

    const newImages = []
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        newImages.push(file.path)
      })
    }

    const images = [...keptImages, ...newImages]

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required',
      })
    }

    // Delete removed images from Cloudinary
    const removedImages = event.images.filter((img) => !keptImages.includes(img))
    await Promise.all(removedImages.map(deleteFromCloudinary))

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
      data: event,
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

    await Promise.all(event.images.map(deleteFromCloudinary))

    await Gallery.findByIdAndDelete(req.params.id)

    res.status(200).json({ success: true, message: 'Event deleted successfully' })
  } catch (err) {
    console.error('Delete gallery event error:', err)
    res.status(500).json({ success: false, message: 'Failed to delete event' })
  }
}