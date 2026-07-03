import { useState, useEffect, useRef } from 'react'
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
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Art', path: '/art' },
  { name: 'Chocolates', path: '/chocolates' },
  { name: 'Gifting', path: '/gifting' },
  { name: 'Workshops', path: '/workshops' },
  { name: 'Gallery', path: '/gallery' },
]


const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const lastScrollY = useRef(0)
  const { user, openLoginModal, openSignupModal } = useAuth()
  const location = useLocation()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsScrolled(currentScrollY > 50)

      if (currentScrollY < 10) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false)
        setIsMobileMenuOpen(false)
      } else {
        setIsVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 right-0 z-50 text-white transition-all duration-300 ${isScrolled
          ? 'bg-[#471701]/95 backdrop-blur-md shadow-lg py-2'
          : 'bg-[#471701] py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2"
              >
                {/* Big logo that overflows navbar */}
                <div className="w-24 h-24 flex items-center justify-center flex-shrink-0 -ml-2 -my-4">
                  <img
                    src="/logo.png"
                    alt="TheRawCanvasStudio Logo"
                    className="w-full h-full object-contain"
                  />
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
                    transition-colors duration-300
                    ${isActive
                      ? 'text-gold-400'
                      : 'text-white hover:text-gold-400'
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
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold-400 rounded-full"
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
              {/* ⭐ Wishlist — now Link + live counter */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  to="/wishlist"
                  className="hidden sm:flex relative p-2 text-white hover:text-gold-400 transition-colors"
                >
                  <HiOutlineHeart className="w-6 h-6" />
                  {wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={wishlistCount}
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gold-500 text-chocolate-900 text-xs rounded-full flex items-center justify-center font-bold"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* ⭐ Cart — now Link + live counter */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  to="/cart"
                  className="hidden sm:flex relative p-2 text-white hover:text-gold-400 transition-colors"
                >
                  <HiOutlineShoppingBag className="w-6 h-6" />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={cartCount}
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gold-500 text-chocolate-900 text-xs rounded-full flex items-center justify-center font-bold"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              <div className="hidden sm:block w-px h-6 bg-cream-300/30" />

              {user ? (
                <UserDropdown />
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openLoginModal}
                    className="px-4 py-2 text-white font-medium text-sm hover:text-gold-400 transition-colors"
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
                className="lg:hidden p-2 text-white"
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
              className="lg:hidden bg-[#471701] border-t border-chocolate-700"
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
                          ? 'text-gold-400'
                          : 'text-white hover:text-gold-400'
                        }
                      `}
                    >
                      {link.name}
                    </NavLink>
                  </motion.div>
                ))}

                {/* ⭐ Mobile: Wishlist + Cart links */}
                <div className="pt-4 border-t border-chocolate-700 space-y-3">
                  <Link
                    to="/wishlist"
                    className="flex items-center justify-between py-2 text-white hover:text-gold-400"
                  >
                    <span className="flex items-center gap-2">
                      <HiOutlineHeart className="w-5 h-5" /> Wishlist
                    </span>
                    {wishlistCount > 0 && (
                      <span className="bg-gold-500 text-chocolate-900 text-xs font-bold px-2 py-0.5 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/cart"
                    className="flex items-center justify-between py-2 text-white hover:text-gold-400"
                  >
                    <span className="flex items-center gap-2">
                      <HiOutlineShoppingBag className="w-5 h-5" /> Cart
                    </span>
                    {cartCount > 0 && (
                      <span className="bg-gold-500 text-chocolate-900 text-xs font-bold px-2 py-0.5 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>

                {!user && (
                  <div className="pt-4 border-t border-chocolate-700 space-y-3">
                    <button
                      onClick={openLoginModal}
                      className="w-full py-3 text-center font-medium text-white border border-cream-300/30 rounded-xl"
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