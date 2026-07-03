import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import Referral from '../models/Referral.js'
import Coupon from '../models/Coupon.js'
import { generateCouponCode } from '../utils/generateCode.js'

// GET /api/referrals/my
export const getMyReferralInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    'name referralCode referralStats'
  )

  const referrals = await Referral.find({ referrer: req.user._id })
    .populate('referee', 'name email createdAt')
    .populate('rewardCoupon', 'code discountValue discountType validUntil')
    .sort('-createdAt')

  const shareLink = `${process.env.FRONTEND_URL}/signup?ref=${user.referralCode}`

  res.json({
    success: true,
    data: {
      referralCode: user.referralCode,
      shareLink,
      stats: user.referralStats,
      referrals,
    },
  })
})

// POST /api/referrals/apply
export const applyReferralCode = asyncHandler(async (req, res) => {
  const { referralCode } = req.body

  if (!referralCode) {
    res.status(400)
    throw new Error('No referral code provided')
  }

  const referrer = await User.findOne({
    referralCode: referralCode.toUpperCase(),
  })

  if (!referrer) {
    res.status(404)
    throw new Error('Invalid referral code')
  }

  if (referrer._id.toString() === req.user._id.toString()) {
    res.status(400)
    throw new Error('You cannot refer yourself')
  }

  const currentUser = await User.findById(req.user._id)
  if (currentUser.referredBy) {
    res.status(400)
    throw new Error('You have already used a referral code')
  }

  currentUser.referredBy = referrer._id
  await currentUser.save({ validateBeforeSave: false })

  await Referral.create({
    referrer: referrer._id,
    referee: currentUser._id,
    referralCodeUsed: referralCode.toUpperCase(),
    status: 'pending',
  })

  referrer.referralStats.totalReferred += 1
  await referrer.save({ validateBeforeSave: false })

  res.json({
    success: true,
    message: `Referral code applied! You'll unlock rewards for your referrer on your first order.`,
  })
})

// GET /api/referrals/admin/all (admin)
export const getAllReferrals = asyncHandler(async (req, res) => {
  const referrals = await Referral.find({})
    .populate('referrer', 'name email referralCode')
    .populate('referee', 'name email createdAt')
    .populate('rewardCoupon', 'code discountValue')
    .sort('-createdAt')

  res.json({ success: true, data: referrals })
})

// ⭐ Internal helper: reward referrer with ₹100 coupon (valid 6 months)
export const rewardReferrer = async (orderId) => {
  try {
    console.log(`🎁 Checking referral reward for order: ${orderId}`)

    const Order = (await import('../models/Order.js')).default
    const order = await Order.findById(orderId).populate('user')

    if (!order) {
      console.log('   ⚠️ Order not found')
      return null
    }

    if (!order.user?.referredBy) {
      console.log('   ℹ️ User was not referred by anyone')
      return null
    }

    const referral = await Referral.findOne({
      referee: order.user._id,
      status: 'pending',
    })

    if (!referral) {
      console.log('   ℹ️ No pending referral (already rewarded or none exists)')
      return null
    }

    const referrer = await User.findById(referral.referrer)
    if (!referrer) {
      console.log('   ⚠️ Referrer not found')
      return null
    }

    // ⭐ Valid for 6 months (as per user requirement)
    const validUntil = new Date()
    validUntil.setMonth(validUntil.getMonth() + 6)

    const coupon = await Coupon.create({
      code: generateCouponCode('REF'),
      description: `Referral reward — thanks for inviting ${order.user.name}!`,
      discountType: 'flat',
      discountValue: 100,
      minOrderAmount: 200,
      applicableRoles: ['all'],
      usageLimit: 1,
      perUserLimit: 1,
      validUntil,
      isActive: true,
      isReferralReward: true,
      assignedTo: referrer._id,
    })

    referral.status = 'rewarded'
    referral.triggerOrder = order._id
    referral.rewardCoupon = coupon._id
    referral.rewardedAt = new Date()
    await referral.save()

    referrer.referralStats.totalRewarded += 1
    referrer.referralStats.totalEarned += 100
    await referrer.save({ validateBeforeSave: false })

    console.log(`   ✅ Reward issued to ${referrer.email}: ${coupon.code}`)

    // Send email (don't block if fails)
    try {
      const sendEmail = (await import('../utils/sendEmail.js')).default
      await sendEmail({
        to: referrer.email,
        subject: `🎉 You earned ₹100 off! Coupon: ${coupon.code}`,
        html: `
          <div style="font-family: Arial; max-width: 500px; margin: 0 auto; padding: 24px; background: #fdf8f4; border-radius: 16px;">
            <h2 style="color: #3d1f0a;">🎁 Referral Reward Unlocked!</h2>
            <p style="color: #7a4f35;">Your friend <strong>${order.user.name}</strong> just completed their first order!</p>
            <p style="color: #7a4f35;">As a thank you, here's your reward:</p>
            <div style="background: white; border: 2px dashed #e8732a; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
              <p style="font-size: 12px; color: #b07050; margin: 0;">YOUR COUPON CODE</p>
              <p style="font-size: 28px; font-weight: bold; color: #e8732a; margin: 8px 0;">${coupon.code}</p>
              <p style="font-size: 14px; color: #7a4f35;">₹100 OFF · Min order ₹200</p>
              <p style="font-size: 12px; color: #b07050; margin-top: 8px;">Valid until ${validUntil.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <p style="color: #7a4f35;">Use it on your next purchase at checkout!</p>
          </div>
        `,
      })
      console.log('   ✅ Reward email sent')
    } catch (err) {
      console.error('   ⚠️ Reward email failed:', err.message)
    }

    return coupon
  } catch (err) {
    console.error('❌ rewardReferrer error:', err.message)
    return null
  }
}

// ⭐ NEW — Manual trigger reward (admin only, for testing/recovery)
export const manualTriggerReward = asyncHandler(async (req, res) => {
  const { orderId } = req.params
  const coupon = await rewardReferrer(orderId)

  if (coupon) {
    res.json({
      success: true,
      message: 'Referral reward triggered successfully!',
      coupon: {
        code: coupon.code,
        discountValue: coupon.discountValue,
        validUntil: coupon.validUntil,
      },
    })
  } else {
    res.status(400).json({
      success: false,
      message: 'Could not trigger reward — check server logs for details',
    })
  }
})