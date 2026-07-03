import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HiOutlineGift,
  HiOutlineClipboardCopy,
  HiOutlineShare,
  HiOutlineCheck,
} from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'  // ⭐ 2 levels up from pages/user/
import toast from 'react-hot-toast'

const ReferralCard = () => {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  if (!user?.referralCode) return null

  const shareLink = `${window.location.origin}/signup?ref=${user.referralCode}`

  const copyCode = () => {
    navigator.clipboard.writeText(user.referralCode)
    setCopied(true)
    toast.success('Code copied! 🎉')
    setTimeout(() => setCopied(false), 2000)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    toast.success('Share link copied! 📎')
  }

  const shareWhatsApp = () => {
    const message = `Hey! 🎨 I just discovered TheRawCanvasStudio — amazing handmade art & chocolates! Use my referral code *${user.referralCode}* to sign up: ${shareLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary-500 via-primary-600 to-chocolate-700 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden"
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-white/5 rounded-full pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <HiOutlineGift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Refer & Earn ₹100</h3>
            <p className="text-xs text-white/80">Share your code with friends</p>
          </div>
        </div>

        {/* Referral code display */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/20">
          <p className="text-xs text-white/70 uppercase tracking-wider font-semibold mb-2">
            Your Referral Code
          </p>
          <div className="flex items-center justify-between gap-3">
            <p className="text-2xl md:text-3xl font-black tracking-widest font-mono">
              {user.referralCode}
            </p>
            <button
              onClick={copyCode}
              className="flex-shrink-0 p-3 bg-white/20 hover:bg-white/30 rounded-xl transition"
              title="Copy code"
            >
              {copied ? (
                <HiOutlineCheck className="w-5 h-5 text-green-300" />
              ) : (
                <HiOutlineClipboardCopy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-semibold transition backdrop-blur"
          >
            <HiOutlineShare className="w-4 h-4" /> Copy Link
          </button>
          <button
            onClick={shareWhatsApp}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-500 hover:bg-green-600 rounded-xl text-sm font-semibold transition"
          >
            💬 WhatsApp
          </button>
        </div>

        {/* Stats + view all link */}
        <div className="flex items-center justify-between pt-3 border-t border-white/20">
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-white/70 text-xs">Referred</p>
              <p className="font-bold">{user.referralStats?.totalReferred || 0}</p>
            </div>
            <div>
              <p className="text-white/70 text-xs">Earned</p>
              <p className="font-bold">₹{user.referralStats?.totalEarned || 0}</p>
            </div>
          </div>
          <Link
            to="/my-referrals"
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full font-semibold transition"
          >
            View All →
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default ReferralCard