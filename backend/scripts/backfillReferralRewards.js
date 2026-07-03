import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Order from '../src/models/Order.js'
import User from '../src/models/User.js'
import Referral from '../src/models/Referral.js'
import Coupon from '../src/models/Coupon.js'

dotenv.config()

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'REF'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅ Connected to MongoDB\n')

  const pendingReferrals = await Referral.find({ status: 'pending' })
    .populate('referee', 'name email')
    .populate('referrer', 'name email referralStats')

  console.log(`Found ${pendingReferrals.length} pending referrals\n`)

  let rewarded = 0

  for (const referral of pendingReferrals) {
    const deliveredOrder = await Order.findOne({
      user: referral.referee._id,
      orderStatus: 'delivered',
    })

    if (!deliveredOrder) {
      console.log(`⏭️  ${referral.referee.email} — no delivered orders yet`)
      continue
    }

    const validUntil = new Date()
    validUntil.setMonth(validUntil.getMonth() + 6)

    const coupon = await Coupon.create({
      code: generateCode(),
      description: `Referral reward — thanks for inviting ${referral.referee.name}!`,
      discountType: 'flat',
      discountValue: 100,
      minOrderAmount: 200,
      applicableRoles: ['all'],
      usageLimit: 1,
      perUserLimit: 1,
      validUntil,
      isActive: true,
      isReferralReward: true,
      assignedTo: referral.referrer._id,
    })

    referral.status = 'rewarded'
    referral.triggerOrder = deliveredOrder._id
    referral.rewardCoupon = coupon._id
    referral.rewardedAt = new Date()
    await referral.save()

    const referrer = await User.findById(referral.referrer._id)
    referrer.referralStats.totalRewarded += 1
    referrer.referralStats.totalEarned += 100
    await referrer.save({ validateBeforeSave: false })

    console.log(
      `✅ Rewarded ${referral.referrer.email} for ${referral.referee.email} → ${coupon.code}`
    )
    rewarded++
  }

  console.log(`\n🎉 Done! Rewarded ${rewarded} referrals`)
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})