import asyncHandler from 'express-async-handler'
import Post from '../models/Post.js'
import User from '../models/User.js'
import Order from '../models/Order.js'
import cloudinary from '../config/cloudinary.js'

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (buffer, mimetype, folder) => {
    return new Promise((resolve, reject) => {
        const b64 = Buffer.from(buffer).toString('base64')
        const dataURI = `data:${mimetype};base64,${b64}`
        cloudinary.uploader.upload(
            dataURI,
            {
                folder: `therawcanvasstudio/${folder}`,
                transformation: [
                    { width: 1200, height: 1200, crop: 'limit' },
                    { quality: 'auto', fetch_format: 'auto' },
                ],
            },
            (error, result) => {
                if (error) return reject(error)
                resolve(result)
            }
        )
    })
}

// Helper: parse slots from request body
const parseSlots = (rawSlots) => {
    if (!rawSlots) return []
    try {
        const parsed = typeof rawSlots === 'string' ? JSON.parse(rawSlots) : rawSlots
        return parsed.map((s) => ({
            ...(s._id && { _id: s._id }),
            date: new Date(s.date),
            maxAttendees: parseInt(s.maxAttendees) || 20,
            bookingsCount: parseInt(s.bookingsCount) || 0,
            isActive: s.isActive !== false,
        }))
    } catch (err) {
        console.error('Failed to parse slots:', err)
        return []
    }
}

// ============== PUBLIC ==============

export const getPosts = asyncHandler(async (req, res) => {
    const { category, status, featured, limit, sort } = req.query
    const filter = {}
    if (category && category !== 'all') filter.category = category.toLowerCase()
    filter.status = status || 'published'
    if (featured === 'true') filter.featured = true

    let query = Post.find(filter).populate('createdBy', 'name email')
    if (sort === 'oldest') query = query.sort({ createdAt: 1 })
    else if (sort === 'popular') query = query.sort({ likes: -1 })
    else query = query.sort({ createdAt: -1 })
    if (limit) query = query.limit(parseInt(limit))

    const posts = await query
    res.json({ success: true, count: posts.length, data: posts })
})

export const getFeatured = asyncHandler(async (req, res) => {
    const now = new Date()
    const posts = await Post.find({
        category: 'workshops',
        status: 'published',
        $or: [
            { eventDate: { $gte: now } },
            { 'slots.date': { $gte: now } },
        ],
    })
        .sort('eventDate')
        .limit(8)
    res.json({ success: true, data: posts })
})

export const getLatest = asyncHandler(async (req, res) => {
    const posts = await Post.find({
        category: { $in: ['art', 'chocolates', 'gifting'] },
        status: 'published',
    })
        .sort('-createdAt')
        .limit(8)
    res.json({ success: true, data: posts })
})

export const getHomeStats = asyncHandler(async (req, res) => {
    const [artCount, chocolateCount, userCount, orderCount] = await Promise.all([
        Post.countDocuments({ category: 'art', status: 'published' }),
        Post.countDocuments({ category: 'chocolates', status: 'published' }),
        User.countDocuments(),
        Order.countDocuments({ orderStatus: { $ne: 'cancelled' } }),
    ])
    res.json({
        success: true,
        stats: {
            artPieces: artCount || 0,
            chocolateVarieties: chocolateCount || 0,
            happyCustomers: userCount || 0,
            ordersDelivered: orderCount || 0,
        },
    })
})

export const getPost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id).populate('createdBy', 'name email')
    if (!post) {
        res.status(404)
        throw new Error('Post not found')
    }
    post.views += 1
    await post.save()
    res.json({ success: true, data: post })
})

// ============== ADMIN ==============

export const createPost = asyncHandler(async (req, res) => {
    const {
        title, description, shortDescription, category, subCategory,
        price, originalPrice, status, featured, isNew, inStock,
        artist, tags, eventDate, venue, maxAttendees, stock,
        requiresCustomization, customizationInstructions, slots,
    } = req.body

    if (!title || !description || !category) {
        res.status(400)
        throw new Error('Title, description and category are required')
    }

    const isWorkshop = category.toLowerCase() === 'workshops'
    const parsedSlots = isWorkshop ? parseSlots(slots) : []

    if (isWorkshop) {
        if (!venue) {
            res.status(400)
            throw new Error('Venue is required for workshops')
        }
        if (parsedSlots.length === 0 && !eventDate) {
            res.status(400)
            throw new Error('At least one event slot is required for workshops')
        }
        for (const slot of parsedSlots) {
            if (slot.date <= new Date()) {
                res.status(400)
                throw new Error('All slot dates must be in the future')
            }
        }
    }

    const uploadedImages = []
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const result = await uploadToCloudinary(
                file.buffer, file.mimetype, `posts/${category.toLowerCase()}`
            )
            uploadedImages.push({ url: result.secure_url, publicId: result.public_id })
        }
    }

    let parsedTags = []
    if (tags) {
        parsedTags = typeof tags === 'string'
            ? tags.split(',').map((t) => t.trim()).filter(Boolean)
            : tags
    }

    let finalEventDate = eventDate ? new Date(eventDate) : null
    if (isWorkshop && parsedSlots.length > 0) {
        const earliestSlot = parsedSlots.reduce((earliest, slot) =>
            slot.date < earliest.date ? slot : earliest
        )
        finalEventDate = earliestSlot.date
    }

    let finalMaxAttendees = maxAttendees ? parseInt(maxAttendees) : 20
    if (isWorkshop && parsedSlots.length > 0) {
        finalMaxAttendees = parsedSlots.reduce((sum, s) => sum + s.maxAttendees, 0)
    }

    const post = await Post.create({
        title,
        description,
        shortDescription: shortDescription || '',
        category: category.toLowerCase(),
        subCategory: subCategory || '',
        price: price || 0,
        originalPrice: originalPrice || null,
        images: uploadedImages,
        status: status || 'published',
        featured: featured === 'true' || featured === true,
        isNew: isNew === 'true' || isNew === true || isNew === undefined,
        inStock: inStock !== 'false' && inStock !== false,
        artist: artist || '',
        tags: parsedTags,
        createdBy: req.user._id,
        eventDate: finalEventDate,
        venue: venue || '',
        maxAttendees: finalMaxAttendees,
        slots: parsedSlots,
        stock: stock !== undefined ? parseInt(stock) : 100,
        requiresCustomization: requiresCustomization === 'true' || requiresCustomization === true,
        customizationInstructions: customizationInstructions || 'After payment, please send your photos via WhatsApp with your Order ID.',
    })

    res.status(201).json({ success: true, data: post })
})

export const updatePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
    if (!post) {
        res.status(404)
        throw new Error('Post not found')
    }

    const fields = [
        'title', 'description', 'shortDescription', 'category', 'subCategory',
        'price', 'originalPrice', 'status', 'featured', 'isNew', 'inStock',
        'artist', 'venue', 'stock', 'requiresCustomization', 'customizationInstructions',
    ]

    fields.forEach((field) => {
        if (req.body[field] !== undefined) {
            if (['featured', 'isNew', 'inStock'].includes(field)) {
                post[field] = req.body[field] === 'true' || req.body[field] === true
            } else if (field === 'category') {
                post[field] = req.body[field].toLowerCase()
            } else {
                post[field] = req.body[field]
            }
        }
    })

    if (req.body.eventDate !== undefined) {
        post.eventDate = req.body.eventDate ? new Date(req.body.eventDate) : null
    }

    if (req.body.maxAttendees !== undefined) {
        post.maxAttendees = parseInt(req.body.maxAttendees) || 20
    }

    if (req.body.slots !== undefined) {
        const parsedSlots = parseSlots(req.body.slots)

        // Preserve bookingsCount for existing slots
        if (post.slots && post.slots.length > 0) {
            parsedSlots.forEach((newSlot) => {
                if (newSlot._id) {
                    const existing = post.slots.id(newSlot._id)
                    if (existing) {
                        newSlot.bookingsCount = existing.bookingsCount
                    }
                }
            })
        }

        post.slots = parsedSlots

        if (parsedSlots.length > 0) {
            const earliestSlot = parsedSlots.reduce((earliest, slot) =>
                slot.date < earliest.date ? slot : earliest
            )
            post.eventDate = earliestSlot.date
            post.maxAttendees = parsedSlots.reduce((sum, s) => sum + s.maxAttendees, 0)
        }
    }

    if (req.body.tags !== undefined) {
        post.tags = typeof req.body.tags === 'string'
            ? req.body.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : req.body.tags
    }

    if (req.body.imagesToDelete) {
        const toDelete = typeof req.body.imagesToDelete === 'string'
            ? JSON.parse(req.body.imagesToDelete)
            : req.body.imagesToDelete
        for (const publicId of toDelete) {
            try {
                await cloudinary.uploader.destroy(publicId)
            } catch (err) {
                console.error('Cloudinary delete error:', err.message)
            }
        }
        post.images = post.images.filter((img) => !toDelete.includes(img.publicId))
    }

    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const result = await uploadToCloudinary(file.buffer, file.mimetype, `posts/${post.category}`)
            post.images.push({ url: result.secure_url, publicId: result.public_id })
        }
    }

    const updated = await post.save()
    res.json({ success: true, data: updated })
})

export const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
    if (!post) {
        res.status(404)
        throw new Error('Post not found')
    }
    for (const img of post.images) {
        try {
            await cloudinary.uploader.destroy(img.publicId)
        } catch (err) {
            console.error('Cloudinary delete error:', err.message)
        }
    }
    await post.deleteOne()
    res.json({ success: true, message: 'Post deleted' })
})

export const getPostStats = asyncHandler(async (req, res) => {
    const [art, chocolates, gifting, workshops, total, recent] = await Promise.all([
        Post.countDocuments({ category: 'art' }),
        Post.countDocuments({ category: 'chocolates' }),
        Post.countDocuments({ category: 'gifting' }),
        Post.countDocuments({ category: 'workshops' }),
        Post.countDocuments({}),
        Post.find().sort({ createdAt: -1 }).limit(5).select('title category status createdAt'),
    ])
    res.json({
        success: true,
        data: {
            counts: { art, chocolates, gifting, workshops, total },
            recent,
        },
    })
})