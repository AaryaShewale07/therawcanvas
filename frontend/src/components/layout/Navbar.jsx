import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiOutlineMenuAlt3, 
  HiX, 
  HiOutlineShoppingBag,
  HiOutlineHeart
} from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'
import UserDropdown from '../auth/UserDropdown'
import LoginModal from '../auth/LoginModal'
import SignupModal from '../auth/SignupModal'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Art', path: '/art' },
  { name: 'Chocolates', path: '/chocolates' },
  { name: 'Gifting', path: '/gifting' },
  { name: 'Workshops', path: '/workshops' },
]

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isLoginModalOpen, isSignupModalOpen, openLoginModal, openSignupModal } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 dark:bg-dark-900/95 backdrop-blur-md shadow-elegant dark:shadow-dark-elegant py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-gold-500 to-chocolate-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-script text-xl">A&C</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-heading font-bold text-xl text-chocolate-900 dark:text-dark-50">
                    Art & Chocolates
                  </h1>
                  <p className="text-xs text-chocolate-500 dark:text-dark-400 font-script">
                    Handcrafted Elegance
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => `
                    relative font-medium text-sm uppercase tracking-wider
                    transition-colors duration-300 link-hover
                    ${isActive 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-chocolate-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {link.name}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.span>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="hidden sm:flex relative p-2 text-chocolate-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <HiOutlineHeart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="hidden sm:flex relative p-2 text-chocolate-700 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <HiOutlineShoppingBag className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 text-chocolate-900 text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </motion.button>

              <div className="hidden sm:block w-px h-6 bg-chocolate-200 dark:bg-dark-600" />

              {user ? (
                <UserDropdown />
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openLoginModal}
                    className="px-4 py-2 text-chocolate-700 dark:text-dark-300 font-medium text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openSignupModal}
                    className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium text-sm rounded-full shadow-md hover:shadow-lg transition-all"
                  >
                    Sign Up
                  </motion.button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-chocolate-700 dark:text-dark-300"
              >
                {isMobileMenuOpen ? (
                  <HiX className="w-6 h-6" />
                ) : (
                  <HiOutlineMenuAlt3 className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white dark:bg-dark-900 border-t border-cream-200 dark:border-dark-700"
            >
              <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavLink
                      to={link.path}
                      className={({ isActive }) => `
                        block py-2 text-lg font-medium transition-colors
                        ${isActive 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-chocolate-700 dark:text-dark-300'
                        }
                      `}
                    >
                      {link.name}
                    </NavLink>
                  </motion.div>
                ))}
                
                {!user && (
                  <div className="pt-4 border-t border-cream-200 dark:border-dark-700 space-y-3">
                    <button
                      onClick={openLoginModal}
                      className="w-full py-3 text-center font-medium text-chocolate-700 dark:text-dark-300 border border-chocolate-300 dark:border-dark-600 rounded-xl"
                    >
                      Login
                    </button>
                    <button
                      onClick={openSignupModal}
                      className="w-full py-3 text-center font-medium text-white bg-primary-600 rounded-xl"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <LoginModal />
      <SignupModal />
    </>
  )
}

export default Navbar