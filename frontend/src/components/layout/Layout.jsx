import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import PromoBanner from '../home/PromoBanner'

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ⭐ Wrapper with top padding equal to navbar height */}
      <div className="pt-20">
        {/* Promo Banner — appears just below the fixed navbar */}
        <PromoBanner />

        <motion.main
          className="flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.main>
      </div>

      <Footer />
    </div>
  )
}

export default Layout