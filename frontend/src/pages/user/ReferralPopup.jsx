import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import {
  HiOutlineGift,
  HiOutlineClipboardCopy,
  HiOutlineX,
  HiOutlineShare,
  HiOutlineSparkles,
} from 'react-icons/hi'
import toast from 'react-hot-toast'

const ReferralPopup = ({ onClose, referralCode }) => {
  const shareLink = `${window.location.origin}/signup?ref=${referralCode}`

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode)
    toast.success('Code copied! 🎉')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    toast.success('Link copied! 📎')
  }

  const shareWhatsApp = () => {
    const message = `Hey! 🎨 I just placed an order at TheRawCanvasStudio — amazing handmade art & chocolates! Use my code *${referralCode}* for exclusive deals: ${shareLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
      }}
      className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-chocolate-700 p-6 text-white overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/30 rounded-full transition z-10"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>

          <div className="relative text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3"
            >
              <HiOutlineGift className="w-10 h-10" />
            </motion.div>
            <h2 className="text-2xl font-heading font-bold mb-1">
              🎉 Refer & Earn ₹100!
            </h2>
            <p className="text-sm text-white/90">Share your code and earn rewards</p>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-5">
            <p className="text-chocolate-600 text-sm">
              Loved your experience? Invite friends using your referral code and{' '}
              <strong className="text-primary-600">earn ₹100 off</strong> when they
              complete their first order!
            </p>
          </div>

          {/* Referral code box */}
          <div className="bg-gradient-to-br from-cream-50 to-white border-2 border-dashed border-primary-300 rounded-2xl p-4 mb-4">
            <p className="text-xs text-chocolate-500 uppercase tracking-wider font-semibold mb-2 text-center">
              Your Personal Code
            </p>
            <div className="flex items-center justify-center gap-3">
              <p className="text-3xl font-black tracking-widest font-mono text-primary-600">
                {referralCode}
              </p>
              <button
                onClick={copyCode}
                className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition"
                title="Copy code"
              >
                <HiOutlineClipboardCopy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={copyLink}
              className="flex items-center justify-center gap-2 py-3 bg-chocolate-100 hover:bg-chocolate-200 text-chocolate-800 rounded-xl text-sm font-semibold transition"
            >
              <HiOutlineShare className="w-4 h-4" /> Copy Link
            </button>
            <button
              onClick={shareWhatsApp}
              className="flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition"
            >
              💬 WhatsApp
            </button>
          </div>

          {/* How it works */}
          <div className="bg-cream-50 rounded-xl p-3 text-xs text-chocolate-600 space-y-1.5">
            <p className="font-semibold flex items-center gap-1">
              <HiOutlineSparkles className="w-4 h-4 text-primary-500" />
              How it works:
            </p>
            <p>1️⃣ Share your code with friends</p>
            <p>2️⃣ They sign up and place their first order</p>
            <p>
              3️⃣ You get a <strong>₹100 coupon</strong> in your account!
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 py-3 text-chocolate-500 hover:text-chocolate-700 font-medium transition"
          >
            Maybe later
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}

export default ReferralPopup