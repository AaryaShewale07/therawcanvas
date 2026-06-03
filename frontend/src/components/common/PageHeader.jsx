import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiOutlineHome, HiOutlineChevronRight } from 'react-icons/hi'

const PageHeader = ({ title, subtitle, icon: Icon, breadcrumb }) => {
  return (
    <section className="relative pt-32 pb-16 bg-gradient-to-br from-chocolate-800 via-chocolate-900 to-chocolate-800 overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {Icon && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full mb-6 shadow-xl"
            >
              <Icon className="w-10 h-10 text-chocolate-900" />
            </motion.div>
          )}

          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-cream-300 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}

          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-sm text-cream-400 mt-6">
            <Link to="/" className="hover:text-gold-400 flex items-center gap-1">
              <HiOutlineHome className="w-4 h-4" /> Home
            </Link>
            <HiOutlineChevronRight className="w-4 h-4" />
            <span className="text-gold-400">{breadcrumb || title}</span>
          </nav>
        </motion.div>
      </div>
    </section>
  )
}

export default PageHeader