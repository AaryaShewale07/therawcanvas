import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      sparse: true,  // ⭐ Allows multiple nulls (won't conflict)
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
        title: String,
        price: Number,
        quantity: Number,
        image: String,
        category: String,
        requiresCustomization: Boolean,
      },
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
      name: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'RAZORPAY', 'UPI'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    hasCustomization: {
      type: Boolean,
      default: false,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    shippingZone: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

// ⭐ Auto-generate orderNumber before saving
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments()
    const timestamp = Date.now().toString().slice(-6)
    this.orderNumber = `ORD${timestamp}${(count + 1).toString().padStart(4, '0')}`
  }
  next()
})

const Order = mongoose.model('Order', orderSchema)
export default Order