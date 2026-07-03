import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'

// Layout
import Layout from './components/layout/Layout'
import AdminLayout from './components/admin/AdminLayout'

// Pages
import Home from './pages/Home'
import Art from './pages/Art'
import Chocolates from './pages/Chocolates'
import Gifting from './pages/Gifting'
import Workshops from './pages/Workshops'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProductDetail from './pages/ProductDetail'
import HeroVideosAdmin from './components/admin/HeroVideosAdmin'

// User Account Pages
import Profile from './pages/user/Profile'
import Wishlist from './pages/user/Wishlist'
import Orders from './pages/user/Orders'
import Settings from './pages/user/Settings'

// Cart / Checkout
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import CartDrawer from './components/cart/CartDrawer'

// Components
import ScrollToTop from './components/common/ScrollToTop'
import ProtectedRoute from './components/common/ProtectedRoute'
import { useAuth } from './context/AuthContext'

// Info & Content
import About from './pages/About'
import OurStory from './pages/OurStory'
import Blog from './pages/Blog'
import Careers from './pages/Careers'
import Contact from './pages/Contact'
import FAQs from './pages/FAQs'
import Shipping from './pages/Shipping'
import Returns from './pages/Returns'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import CollectionPage from './pages/CollectionPage'
import Gallery from './pages/Gallery'
import GalleryAdmin from './pages/admin/GalleryAdmin'
import BannerAdmin from './pages/admin/BannerAdmin'
import Commissions from './pages/Commissions'

// ⭐ Coupons & Referrals
import CouponsPage from './components/admin/CouponsPage'
import ReferralsPage from './components/admin/ReferralsPage'
import MyReferrals from './pages/MyReferrals'

const AdminRoute = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth()
  if (isLoading) return null
  if (!user || !isAdmin) return <Navigate to="/" replace />
  return children
}

function App() {
  const location = useLocation()

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    })
  }, [])

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode === 'true') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: document.documentElement.classList.contains('dark')
              ? '#1e293b'
              : '#3d2218',
            color: '#fefdfb',
            borderRadius: '12px',
            padding: '16px',
            fontFamily: 'Poppins, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#d4be3e',
              secondary: document.documentElement.classList.contains('dark')
                ? '#1e293b'
                : '#3d2218',
            },
          },
        }}
      />
      <ScrollToTop />

      <AnimatePresence mode="wait">
        {isAdminRoute ? (
          // ============ ADMIN ROUTES ============
          <Routes location={location} key="admin">
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Admin />} />
              <Route path="posts" element={<Admin section="posts" />} />
              <Route path="art" element={<Admin section="art" />} />
              <Route path="chocolates" element={<Admin section="chocolates" />} />
              <Route path="gifting" element={<Admin section="gifting" />} />
              <Route path="workshops" element={<Admin section="workshops" />} />
              <Route path="orders" element={<Admin section="orders" />} />
              <Route path="users" element={<Admin section="users" />} />
              <Route path="settings" element={<Admin section="settings" />} />
              <Route path="analytics" element={<Admin section="analytics" />} />
              <Route path="bookings" element={<Admin section="bookings" />} />
              <Route path="gallery" element={<GalleryAdmin />} />
              <Route path="banners" element={<BannerAdmin />} />
              <Route path="hero-videos" element={<HeroVideosAdmin />} />

              {/* ⭐ FIXED — relative paths (no leading /admin/) */}
              <Route path="coupons" element={<CouponsPage />} />
              <Route path="referrals" element={<ReferralsPage />} />
            </Route>
          </Routes>
        ) : (
          // ============ PUBLIC / USER ROUTES ============
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Layout />}>
              {/* Public pages */}
              <Route index element={<Home />} />
              <Route path="art" element={<Art />} />
              <Route path="chocolates" element={<Chocolates />} />
              <Route path="gifting" element={<Gifting />} />
              <Route path="workshops" element={<Workshops />} />
              <Route path="commissions" element={<Commissions />} />

              {/* Product Detail */}
              <Route path="product/:id" element={<ProductDetail />} />

              {/* Cart */}
              <Route path="cart" element={<Cart />} />

              {/* Protected routes */}
              <Route
                path="checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="order-success/:id"
                element={
                  <ProtectedRoute>
                    <OrderSuccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="wishlist"
                element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* ⭐ NEW — User referrals page (protected) */}
              <Route
                path="my-referrals"
                element={
                  <ProtectedRoute>
                    <MyReferrals />
                  </ProtectedRoute>
                }
              />

              {/* Info pages */}
              <Route path="about" element={<About />} />
              <Route path="story" element={<OurStory />} />
              <Route path="blog" element={<Blog />} />
              <Route path="careers" element={<Careers />} />
              <Route path="contact" element={<Contact />} />
              <Route path="faqs" element={<FAQs />} />
              <Route path="shipping" element={<Shipping />} />
              <Route path="returns" element={<Returns />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />

              {/* Collection + Gallery */}
              <Route path="collection" element={<CollectionPage />} />
              <Route path="gallery" element={<Gallery />} />

              {/* Reset password */}
              <Route path="reset-password" element={<ResetPasswordPage />} />

              {/* ⚠️ 404 — MUST be LAST */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        )}
      </AnimatePresence>

      <CartDrawer />
    </>
  )
}

export default App