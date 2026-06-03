import mongoose from 'mongoose'

const slotSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    maxAttendees: {
        type: Number,
        default: 20,
    },
    bookingsCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { _id: true })

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        shortDescription: {
            type: String,
            trim: true,
            maxlength: 300,
            default: '',
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['art', 'chocolates', 'gifting', 'workshops'],
            lowercase: true,
        },
        subCategory: {
            type: String,
            trim: true,
            default: '',
        },
        price: {
            type: Number,
            default: 0,
            min: 0,
        },
        originalPrice: {
            type: Number,
            default: null,
        },
        images: [
            {
                url: { type: String, required: true },
                publicId: { type: String, required: true },
            },
        ],
        status: {
            type: String,
            enum: ['draft', 'published'],
            default: 'published',
        },
        featured: {
            type: Boolean,
            default: false,
        },
        isNew: {
            type: Boolean,
            default: true,
        },
        inStock: {
            type: Boolean,
            default: true,
        },
        artist: {
            type: String,
            trim: true,
            default: '',
        },
        tags: [{ type: String, trim: true }],
        likes: {
            type: Number,
            default: 0,
        },
        views: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // ============ WORKSHOP-SPECIFIC FIELDS ============
        // Legacy single date (kept for backward compatibility)
        eventDate: {
            type: Date,
            default: null,
        },
        venue: {
            type: String,
            trim: true,
            default: '',
        },
        maxAttendees: {
            type: Number,
            default: 20,
        },
        bookingsCount: {
            type: Number,
            default: 0,
        },
        // ⭐ NEW: Multiple slots for workshops
        slots: [slotSchema],

        stock: {
            type: Number,
            default: 100,
            min: 0,
        },
        requiresCustomization: {
            type: Boolean,
            default: false,
        },
        customizationInstructions: {
            type: String,
            default: 'After payment, please send your photos via WhatsApp with your Order ID.',
        },
    },
    { timestamps: true }
)

postSchema.index({ category: 1, status: 1, createdAt: -1 })
postSchema.index({ featured: 1, status: 1 })
postSchema.index({ eventDate: 1 })
postSchema.index({ 'slots.date': 1 })

const Post = mongoose.model('Post', postSchema)

export default Post