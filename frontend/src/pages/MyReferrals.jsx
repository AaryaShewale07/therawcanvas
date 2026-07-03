import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineClipboardCopy, HiOutlineShare, HiOutlineGift } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { referralsAPI } from '../utils/api'

const MyReferrals = () => {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await referralsAPI.getMy()
        setInfo(data.data)
      } catch (err) {
        toast.error('Failed to load referral info')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const copyCode = () => {
    navigator.clipboard.writeText(info.referralCode)
    toast.success('Code copied!')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(info.shareLink)
    toast.success('Link copied!')
  }

  const shareViaWhatsApp = () => {
    const message = `Hey! Join TheRawCanvasStudio using my referral code ${info.referralCode} and check out amazing handmade art & chocolates! ${info.shareLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center">
        <div className="w-10 h-10 border-4 border-chocolate-200 border-t-chocolate-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (!info) return null

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-cream-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-heading font-bold text-chocolate-900 mb-2">
            🎁 Refer & Earn
          </h1>
          <p className="text-chocolate-500 mb-8">
            Invite friends and earn ₹100 off when they complete their first order!
          </p>
        </motion.div>

        {/* Referral Code Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-chocolate-700 to-chocolate-900 rounded-3xl p-8 text-white mb-8 shadow-2xl"
        >
          <p className="text-cream-200 text-sm mb-2 font-semibold uppercase tracking-wider">
            Your Referral Code
          </p>
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <p className="text-4xl md:text-5xl font-black tracking-widest">
              {info.referralCode}
            </p>
            <button
              onClick={copyCode}
              className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition"
            >
              <HiOutlineClipboardCopy className="w-6 h-6" />
            </button>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={copyLink}
              className="flex-1 min-w-[140px] bg-white text-chocolate-900 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-cream-100 transition"
            >
              <HiOutlineShare className="w-5 h-5" /> Copy Link
            </button>
            <button
              onClick={shareViaWhatsApp}
              className="flex-1 min-w-[140px] bg-green-500 text-white py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition"
            >
              💬 WhatsApp
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5 rounded-2xl shadow-elegant text-center"
          >
            <p className="text-3xl font-bold text-chocolate-900">
              {info.stats.totalReferred}
            </p>
            <p className="text-xs text-chocolate-500 mt-1">Total Referred</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-5 rounded-2xl shadow-elegant text-center"
          >
            <p className="text-3xl font-bold text-chocolate-900">
              {info.stats.totalRewarded}
            </p>
            <p className="text-xs text-chocolate-500 mt-1">Rewards Unlocked</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-5 rounded-2xl shadow-elegant text-center"
          >
            <p className="text-3xl font-bold text-green-600">
              ₹{info.stats.totalEarned}
            </p>
            <p className="text-xs text-chocolate-500 mt-1">Total Earned</p>
          </motion.div>
        </div>

        {/* How it works */}
        <div className="bg-cream-50 border border-cream-200 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-chocolate-900 mb-4 flex items-center gap-2">
            <HiOutlineGift className="w-5 h-5" /> How It Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <p className="font-semibold text-chocolate-800">Share your code</p>
                <p className="text-chocolate-500 text-xs">
                  Send it to friends via link, WhatsApp, or any platform
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <p className="font-semibold text-chocolate-800">Friend signs up</p>
                <p className="text-chocolate-500 text-xs">
                  They apply your code during signup or checkout
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <p className="font-semibold text-chocolate-800">You earn ₹100</p>
                <p className="text-chocolate-500 text-xs">
                  Get a coupon when their first order is delivered!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Referrals list */}
        <div className="bg-white rounded-2xl shadow-elegant p-6">
          <h2 className="text-xl font-bold text-chocolate-900 mb-4">Your Referrals</h2>
          {info.referrals.length === 0 ? (
            <p className="text-chocolate-500 text-center py-8">
              No referrals yet. Share your code to start earning! 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {info.referrals.map((r) => (
                <motion.div
                  key={r._id}
                  layout
                  className="flex justify-between items-center p-4 bg-cream-50 rounded-xl"
                >
                  <div>
                    <p className="font-semibold text-chocolate-900">
                      {r.referee?.name}
                    </p>
                    <p className="text-xs text-chocolate-500">
                      Joined {new Date(r.referee?.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    {r.status === 'rewarded' ? (
                      <>
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                          ✓ ₹100 Earned
                        </span>
                        {r.rewardCoupon && (
                          <p className="text-xs text-chocolate-500 mt-1 font-mono">
                            {r.rewardCoupon.code}
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
                        Awaiting first order
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyReferrals