import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ['art', 'chocolates', 'gifting', 'workshops', 'overall'],
      default: 'overall',
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approve, admin can hide if needed
    },
    isFeatured: {
      type: Boolean,
      default: false, // Admin can feature best reviews
    },
  },
  { timestamps: true }
)

reviewSchema.index({ isApproved: 1, createdAt: -1 })
reviewSchema.index({ user: 1 })

const Review = mongoose.model('Review', reviewSchema)
export default Review