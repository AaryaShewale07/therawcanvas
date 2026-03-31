import { motion } from 'framer-motion'

const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  const loader = (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizes[size]} border-4 border-cream-200 border-t-primary-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream-50">
        <div className="text-center">
          {loader}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-chocolate-600 font-medium"
          >
            Loading...
          </motion.p>
        </div>
      </div>
    )
  }

  return loader
}

export default Loader