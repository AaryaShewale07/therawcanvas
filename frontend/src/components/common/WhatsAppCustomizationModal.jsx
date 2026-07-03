import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { HiX, HiOutlinePhotograph, HiCheckCircle } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'

const WHATSAPP_NUMBER = '918291271695'

const WhatsAppCustomizationModal = ({ isOpen, onClose, order }) => {
  // ⭐ Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!order) return null

  const orderId = order._id?.slice(-8).toUpperCase()
  const customerName = order.shippingAddress?.name || 'Customer'

  const message = `Hello TheRawCanvasStudio! 👋

I just placed an order and need to send photos for customization.

📋 *Order Details:*
• Order ID: *#${orderId}*
• Name: ${customerName}
• Amount: ₹${order.totalAmount}

I'm ready to share my photos for the customized gift. 📸✨

Thank you!`

  const encodedMessage = encodeURIComponent(message)
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`

  const handleSendMessage = () => {
    window.open(whatsappLink, '_blank')
  }

  // ⭐ Modal content (rendered via portal to body)
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '448px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'white',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white relative flex-shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
              >
                <HiX className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 pr-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <FaWhatsapp className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
                </motion.div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold">One Last Step! 🎁</h2>
                  <p className="text-green-50 text-xs sm:text-sm">
                    Send us your photos for customization
                  </p>
                </div>
              </div>
            </div>

            {/* Body — scrollable */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
              }}
              className="space-y-5"
            >
              {/* Success */}
              <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-xl flex items-start gap-2">
                <HiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-chocolate-700">
                  Your order <strong>#{orderId}</strong> has been confirmed!
                </p>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="font-bold text-chocolate-900 mb-3 flex items-center gap-2">
                  <HiOutlinePhotograph className="w-5 h-5 text-chocolate-700" />
                  How it works:
                </h3>
                <ol className="space-y-2 text-sm text-chocolate-700">
                  {[
                    'Click the WhatsApp button below',
                    <>A message with your <strong>Order ID</strong> is pre-filled</>,
                    'Send the message and attach your photos 📸',
                    "We'll craft your gift and ship it ASAP! 🚀",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-chocolate-100 text-chocolate-700 rounded-full flex items-center justify-center font-bold text-xs">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Contact */}
              <div className="bg-cream-50 rounded-2xl p-4">
                <p className="text-xs text-chocolate-500 uppercase font-bold mb-1">
                  Send to
                </p>
                <div className="flex items-center gap-2">
                  <FaWhatsapp className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="font-mono font-bold text-chocolate-900 break-all">
                    +91 82912 71695
                  </p>
                </div>
              </div>

              {/* WhatsApp Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendMessage}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-3 transition"
              >
                <FaWhatsapp className="w-6 h-6" />
                Send Photos on WhatsApp
              </motion.button>

              <button
                onClick={onClose}
                className="w-full text-center text-chocolate-500 hover:text-chocolate-700 text-sm transition"
              >
                I'll do this later
              </button>

              <p className="text-xs text-chocolate-400 text-center">
                💡 You can always find your Order ID in "My Orders"
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // ⭐ Render into document.body — bypasses any parent CSS conflicts
  return createPortal(modalContent, document.body)
}

export default WhatsAppCustomizationModal