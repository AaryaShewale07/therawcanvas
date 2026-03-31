import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineX } from 'react-icons/hi'
import { modalVariants, backdropVariants } from '../../utils/animations'

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-900/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden`}
          >
            {/* Header */}
            {title && (
              <div className="px-6 py-4 border-b border-cream-100 flex items-center justify-between">
                <h2 className="text-xl font-heading font-bold text-chocolate-900">
                  {title}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-cream-100 rounded-full transition-colors"
                >
                  <HiOutlineX className="w-5 h-5 text-chocolate-500" />
                </motion.button>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Modal