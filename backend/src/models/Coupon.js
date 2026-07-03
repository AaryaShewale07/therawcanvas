import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    applicableRoles: {
      type: [String],
      enum: ['user', 'admin', 'all'],
      default: ['all'],
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        usedAt: { type: Date, default: Date.now },
      },
    ],
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isReferralReward: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
)

couponSchema.methods.isValidFor = function (user, orderAmount) {
  const now = new Date()

  if (!this.isActive) return { valid: false, reason: 'Coupon is inactive' }
  if (now < this.validFrom) return { valid: false, reason: 'Coupon not yet active' }
  if (now > this.validUntil) return { valid: false, reason: 'Coupon expired' }

  if (this.usageLimit && this.usedCount >= this.usageLimit)
    return { valid: false, reason: 'Coupon usage limit reached' }

  if (orderAmount < this.minOrderAmount)
    return {
      valid: false,
      reason: `Minimum order amount is ₹${this.minOrderAmount}`,
    }

  if (!this.applicableRoles.includes('all') && !this.applicableRoles.includes(user.role))
    return { valid: false, reason: 'Not applicable to your account type' }

  if (this.assignedTo && this.assignedTo.toString() !== user._id.toString())
    return { valid: false, reason: 'This coupon is not assigned to you' }

  const userUsageCount = this.usedBy.filter(
    (u) => u.user.toString() === user._id.toString()
  ).length
  if (userUsageCount >= this.perUserLimit)
    return { valid: false, reason: 'You have already used this coupon' }

  return { valid: true }
}

couponSchema.methods.calculateDiscount = function (orderAmount) {
  let discount = 0
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100
    if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount)
  } else {
    discount = this.discountValue
  }
  return Math.min(discount, orderAmount)
}

export default mongoose.model('Coupon', couponSchema)