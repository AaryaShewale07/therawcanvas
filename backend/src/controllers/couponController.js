import asyncHandler from 'express-async-handler'
import Coupon from '../models/Coupon.js'
import Order from '../models/Order.js'

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
    assignedTo: null,
    isActive: true,
  })

  console.log('✅ Coupon created:', {
    code: coupon.code,
    applicableRoles: coupon.applicableRoles,
    assignedTo: coupon.assignedTo,
    isActive: coupon.isActive,
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

  const check = await coupon.isValidFor(req.user, orderAmount)
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

// GET /api/coupons/my (user)
// ⭐ Shows: assigned + public + loyalty (if 5+ delivered orders)
export const getMyCoupons = asyncHandler(async (req, res) => {
  const now = new Date()

  console.log('═══════════════════════════════════════════')
  console.log('🎫 getMyCoupons called')
  console.log('   User ID:', req.user._id)
  console.log('   User email:', req.user.email)

  // Get ALL user orders for debugging
  const allUserOrders = await Order.find({ user: req.user._id }).select(
    'orderStatus paymentStatus totalAmount createdAt'
  )
  console.log('   📦 Total orders in DB:', allUserOrders.length)

  const statusBreakdown = allUserOrders.reduce((acc, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1
    return acc
  }, {})
  console.log('   📊 Status breakdown:', statusBreakdown)

  // Count delivered orders
  const deliveredCount = await Order.countDocuments({
    user: req.user._id,
    orderStatus: 'delivered',
  })
  console.log('   ✅ Delivered orders count:', deliveredCount)

  const isLoyalCustomer = deliveredCount >= 5
  console.log('   👑 Is loyal customer (5+):', isLoyalCustomer)

  // Debug — check all loyalty coupons in DB
  const allLoyaltyCoupons = await Coupon.find({ applicableRoles: 'user' })
  console.log('   🎟️ Loyalty coupons in DB:', allLoyaltyCoupons.length)
  allLoyaltyCoupons.forEach((c) => {
    console.log(`      • ${c.code}:`, {
      isActive: c.isActive,
      applicableRoles: c.applicableRoles,
      assignedTo: c.assignedTo,
      validUntil: c.validUntil,
      isExpired: new Date(c.validUntil) < now,
      usedCount: c.usedCount,
      usageLimit: c.usageLimit,
    })
  })

  // Main query
  const coupons = await Coupon.find({
    isActive: true,
    validUntil: { $gt: now },
    $or: [
      // 1. Personally assigned coupons
      { assignedTo: req.user._id },

      // 2. Public coupons
      {
        applicableRoles: 'all',
        $or: [
          { assignedTo: null },
          { assignedTo: { $exists: false } },
        ],
      },

      // 3. Loyalty coupons (only if 5+ delivered)
      ...(isLoyalCustomer
        ? [
            {
              applicableRoles: 'user',
              $or: [
                { assignedTo: null },
                { assignedTo: { $exists: false } },
              ],
            },
          ]
        : []),
    ],
  }).sort('-createdAt')

  console.log('   🔍 Coupons matched by query:', coupons.length)
  coupons.forEach((c) =>
    console.log(`      • ${c.code} (roles: ${c.applicableRoles.join(',')})`)
  )

  // Filter out fully-used coupons
  const availableCoupons = coupons.filter((coupon) => {
    const userUsageCount = (coupon.usedBy || []).filter(
      (u) => u.user && u.user.toString() === req.user._id.toString()
    ).length

    if (userUsageCount >= (coupon.perUserLimit || 1)) {
      console.log(
        `      ✗ ${coupon.code} filtered — user used ${userUsageCount}/${coupon.perUserLimit}`
      )
      return false
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      console.log(
        `      ✗ ${coupon.code} filtered — global usage ${coupon.usedCount}/${coupon.usageLimit}`
      )
      return false
    }
    return true
  })

  console.log('   ✅ Final coupons sent to user:', availableCoupons.length)
  availableCoupons.forEach((c) => console.log(`      → ${c.code}`))
  console.log('═══════════════════════════════════════════')

  res.json({
    success: true,
    data: availableCoupons,
    meta: {
      deliveredCount,
      isLoyalCustomer,
      totalOrders: allUserOrders.length,
      statusBreakdown,
    },
  })
})