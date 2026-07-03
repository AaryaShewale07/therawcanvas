import asyncHandler from 'express-async-handler'
import Coupon from '../models/Coupon.js'

// POST /api/coupons (admin)
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    maxDiscount,
    minOrderAmount,
    applicableRoles,
    usageLimit,
    perUserLimit,
    validFrom,
    validUntil,
  } = req.body

  const existing = await Coupon.findOne({ code: code.toUpperCase() })
  if (existing) {
    res.status(400)
    throw new Error('Coupon code already exists')
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    maxDiscount: maxDiscount || null,
    minOrderAmount: minOrderAmount || 0,
    applicableRoles: applicableRoles || ['all'],
    usageLimit: usageLimit || null,
    perUserLimit: perUserLimit || 1,
    validFrom: validFrom || new Date(),
    validUntil,
  })

  res.status(201).json({ success: true, data: coupon })
})

// GET /api/coupons (admin — all coupons)
export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({})
    .populate('assignedTo', 'name email')
    .sort('-createdAt')
  res.json({ success: true, data: coupons })
})

// PUT /api/coupons/:id (admin)
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)
  if (!coupon) {
    res.status(404)
    throw new Error('Coupon not found')
  }

  Object.assign(coupon, req.body)
  if (req.body.code) coupon.code = req.body.code.toUpperCase()

  await coupon.save()
  res.json({ success: true, data: coupon })
})

// DELETE /api/coupons/:id (admin)
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id)
  if (!coupon) {
    res.status(404)
    throw new Error('Coupon not found')
  }
  res.json({ success: true, message: 'Coupon deleted' })
})

// POST /api/coupons/validate (user)
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body

  const coupon = await Coupon.findOne({ code: code.toUpperCase() })
  if (!coupon) {
    res.status(404)
    throw new Error('Invalid coupon code')
  }

  const check = coupon.isValidFor(req.user, orderAmount)
  if (!check.valid) {
    res.status(400)
    throw new Error(check.reason)
  }

  const discount = coupon.calculateDiscount(orderAmount)

  res.json({
    success: true,
    data: {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discount),
      couponId: coupon._id,
    },
  })
})

// GET /api/coupons/my (user) — ⭐ FILTERS OUT EXPIRED & USED COUPONS
export const getMyCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({
    $or: [
      { assignedTo: req.user._id, isActive: true },
      { applicableRoles: 'all', isActive: true, assignedTo: null },
    ],
    validUntil: { $gt: new Date() },
  }).sort('-createdAt')

  // ⭐ Filter out coupons the user has already fully used
  const availableCoupons = coupons.filter((coupon) => {
    const userUsageCount = coupon.usedBy.filter(
      (u) => u.user && u.user.toString() === req.user._id.toString()
    ).length

    // Hide if user has hit their per-user limit
    if (userUsageCount >= (coupon.perUserLimit || 1)) return false

    // Hide if global usage limit reached
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return false

    return true
  })

  res.json({ success: true, data: availableCoupons })
})