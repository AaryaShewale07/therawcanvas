import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // Optional CTA button
    buttonText: {
      type: String,
      trim: true,
      default: '',
    },
    buttonLink: {
      type: String,
      trim: true,
      default: '',
    },
    // Optional background image
    image: {
      type: String,
      default: '',
    },
    // Style theme: chocolate, gold, pink, purple, festive
    theme: {
      type: String,
      enum: ['chocolate', 'gold', 'pink', 'purple', 'festive', 'green'],
      default: 'chocolate',
    },
    // Optional emoji / icon prefix
    icon: {
      type: String,
      default: '🎉',
    },
    // Optional discount badge
    badge: {
      type: String,
      trim: true,
      default: '', // e.g. "50% OFF"
    },
    // Schedule
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0, // higher = shown first
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

// Helper to check if banner is currently live
bannerSchema.methods.isLive = function () {
  if (!this.isActive) return false
  const now = new Date()
  if (this.startDate && new Date(this.startDate) > now) return false
  if (this.endDate && new Date(this.endDate) < now) return false
  return true
}

const Banner = mongoose.model('Banner', bannerSchema)
export default Banner