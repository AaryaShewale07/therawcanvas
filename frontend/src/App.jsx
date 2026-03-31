import { Routes, Route, useLocation } from 'react-router-dom'
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

// Components
import ScrollToTop from './components/common/ScrollToTop'

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

  // Check if current route is admin
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#3d2218',
            color: '#fefdfb',
            borderRadius: '12px',
            padding: '16px',
            fontFamily: 'Poppins, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#d4be3e',
              secondary: '#3d2218',
            },
          },
        }}
      />
      <ScrollToTop />
      <AnimatePresence mode="wait">
        {isAdminRoute ? (
          <Routes location={location} key="admin">
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<Admin />} />
              <Route path="posts" element={<Admin section="posts" />} />
              <Route path="art" element={<Admin section="art" />} />
              <Route path="chocolates" element={<Admin section="chocolates" />} />
              <Route path="gifting" element={<Admin section="gifting" />} />
              <Route path="workshops" element={<Admin section="workshops" />} />
              <Route path="users" element={<Admin section="users" />} />
              <Route path="settings" element={<Admin section="settings" />} />
            </Route>
          </Routes>
        ) : (
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="art" element={<Art />} />
              <Route path="chocolates" element={<Chocolates />} />
              <Route path="gifting" element={<Gifting />} />
              <Route path="workshops" element={<Workshops />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        )}
      </AnimatePresence>
    </>
  )
}

export default App