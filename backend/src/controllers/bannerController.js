import Banner from '../models/Banner.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const getFullImageUrl = (req, imagePath) => {
  if (!imagePath) return ''
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  return `${req.protocol}://${req.get('host')}${imagePath}`
}

const transformBanner = (req, banner) => {
  if (!banner) return banner
  return {
    ...banner,
    image: getFullImageUrl(req, banner.image),
  }
}

const deleteFileFromDisk = (relativePath) => {
  try {
    if (!relativePath) return
    let cleanPath = relativePath
    if (cleanPath.includes('/uploads/')) {
      cleanPath = '/uploads/' + cleanPath.split('/uploads/')[1]
    }
    const filePath = path.join(__dirname, '..', '..', 'public', cleanPath)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  } catch (err) {
    console.error('Failed to delete file:', err.message)
  }
}

// ─── GET /api/banners — active banners for public display ────────────────────
export const getActiveBanners = async (req, res) => {
  try {
    const now = new Date()
    const banners = await Banner.find({
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: { $lte: now } },
            { startDate: null },
          ],
        },
        {
          $or: [
            { endDate: { $gte: now } },
            { endDate: null },
          ],
        },
      ],
    })
      .sort({ priority: -1, createdAt: -1 })
      .lean()

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners.map((b) => transformBanner(req, b)),
    })
  } catch (err) {
    console.error('Get active banners error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
    })
  }
}

// ─── GET /api/banners/all — all banners (admin) ──────────────────────────────
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
      .sort({ priority: -1, createdAt: -1 })
      .lean()

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners.map((b) => transformBanner(req, b)),
    })
  } catch (err) {
    console.error('Get all banners error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
    })
  }
}

// ─── POST /api/banners — create new banner ───────────────────────────────────
export const createBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      theme,
      icon,
      badge,
      startDate,
      endDate,
      isActive,
      priority,
    } = req.body

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      })
    }

    let imageUrl = ''
    if (req.file) {
      imageUrl = `/uploads/banners/${req.file.filename}`
    }

    const banner = await Banner.create({
      title,
      subtitle: subtitle || '',
      description: description || '',
      buttonText: buttonText || '',
      buttonLink: buttonLink || '',
      image: imageUrl,
      theme: theme || 'chocolate',
      icon: icon || '🎉',
      badge: badge || '',
      startDate: startDate || Date.now(),
      endDate: endDate || null,
      isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true,
      priority: Number(priority) || 0,
      createdBy: req.user?._id,
    })

    res.status(201).json({
      success: true,
      data: transformBanner(req, banner.toObject()),
    })
  } catch (err) {
    console.error('Create banner error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to create banner',
    })
  }
}

// ─── PUT /api/banners/:id — update banner ────────────────────────────────────
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      })
    }

    const {
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      theme,
      icon,
      badge,
      startDate,
      endDate,
      isActive,
      priority,
      removeImage,
    } = req.body

    if (title !== undefined) banner.title = title
    if (subtitle !== undefined) banner.subtitle = subtitle
    if (description !== undefined) banner.description = description
    if (buttonText !== undefined) banner.buttonText = buttonText
    if (buttonLink !== undefined) banner.buttonLink = buttonLink
    if (theme !== undefined) banner.theme = theme
    if (icon !== undefined) banner.icon = icon
    if (badge !== undefined) banner.badge = badge
    if (startDate !== undefined) banner.startDate = startDate
    if (endDate !== undefined) banner.endDate = endDate || null
    if (isActive !== undefined) {
      banner.isActive = isActive === 'true' || isActive === true
    }
    if (priority !== undefined) banner.priority = Number(priority) || 0

    // Handle image
    if (removeImage === 'true' || removeImage === true) {
      deleteFileFromDisk(banner.image)
      banner.image = ''
    }
    if (req.file) {
      // Delete old image
      deleteFileFromDisk(banner.image)
      banner.image = `/uploads/banners/${req.file.filename}`
    }

    await banner.save()

    res.status(200).json({
      success: true,
      data: transformBanner(req, banner.toObject()),
    })
  } catch (err) {
    console.error('Update banner error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to update banner',
    })
  }
}

// ─── DELETE /api/banners/:id ─────────────────────────────────────────────────
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      })
    }

    deleteFileFromDisk(banner.image)
    await Banner.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully',
    })
  } catch (err) {
    console.error('Delete banner error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner',
    })
  }
}

// ─── PATCH /api/banners/:id/toggle — quick on/off ────────────────────────────
export const toggleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      })
    }

    banner.isActive = !banner.isActive
    await banner.save()

    res.status(200).json({
      success: true,
      data: transformBanner(req, banner.toObject()),
    })
  } catch (err) {
    console.error('Toggle banner error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to toggle banner',
    })
  }
}