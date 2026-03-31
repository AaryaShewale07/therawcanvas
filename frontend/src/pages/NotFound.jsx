import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineHome, HiOutlineArrowLeft } from 'react-icons/hi'

const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream-50 to-white px-4"
    >
      <div className="text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="relative"
        >
          <h1 className="text-[150px] md:text-[200px] font-heading font-bold text-cream-200 select-none">
            404
          </h1>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <span className="text-6xl">🍫</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-chocolate-900 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-chocolate-600 mb-8 max-w-md mx-auto">
            Looks like this chocolate melted away! The page you're looking for 
            doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-full shadow-lg hover:bg-primary-700 transition-colors"
              >
                <HiOutlineHome className="w-5 h-5" />
                Go Home
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-6 py-3 border-2 border-chocolate-300 text-chocolate-700 font-medium rounded-full hover:border-chocolate-400 transition-colors"
            >
              <HiOutlineArrowLeft className="w-5 h-5" />
              Go Back
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default NotFound