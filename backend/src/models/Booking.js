import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    // ⭐ NEW: Which slot was booked
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    slotDate: {
      type: Date,
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    peopleCount: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    pricePerTicket: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
)

bookingSchema.index({ event: 1, status: 1 })
bookingSchema.index({ email: 1 })
bookingSchema.index({ slotId: 1 })

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking