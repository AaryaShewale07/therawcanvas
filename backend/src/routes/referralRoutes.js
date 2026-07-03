import express from 'express'
import { protect, admin } from '../middleware/authMiddleware.js'
import {
  getMyReferralInfo,
  applyReferralCode,
  getAllReferrals,
  manualTriggerReward,
} from '../controllers/referralController.js'

const router = express.Router()

router.get('/my', protect, getMyReferralInfo)
router.post('/apply', protect, applyReferralCode)
router.get('/admin/all', protect, admin, getAllReferrals)
router.post('/admin/trigger-reward/:orderId', protect, admin, manualTriggerReward)

export default router