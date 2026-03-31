import { motion } from 'framer-motion'

const AnimatedCard = ({ children, className = '', delay = 0, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)' }}
      className={`bg-white rounded-2xl shadow-elegant overflow-hidden transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedCard