import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  HiOutlineHome,
  HiOutlinePhotograph,
  HiOutlineCake,
  HiOutlineGift,
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineTicket,
  HiOutlineShoppingBag,
  HiOutlineCamera,
  HiOutlineSpeakerphone,
  HiOutlineVideoCamera,
  HiOutlineGift as HiOutlineGiftAlt,
  HiOutlineX,
  HiOutlineMenu,
} from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'

const menuItems = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', icon: HiOutlineHome, path: '/admin' },
      { name: 'Analytics', icon: HiOutlineChartBar, path: '/admin/analytics' },
    ],
  },
  {
    title: 'Orders',
    items: [
      { name: 'All Orders', icon: HiOutlineShoppingBag, path: '/admin/orders' },
      { name: 'Bookings', icon: HiOutlineTicket, path: '/admin/bookings' },
    ],
  },
  {
    title: 'Content',
    items: [
      { name: 'All Posts', icon: HiOutlineDocumentText, path: '/admin/posts' },
      { name: 'Hero Videos', icon: HiOutlineVideoCamera, path: '/admin/hero-videos' },
      { name: 'Promo Banners', icon: HiOutlineSpeakerphone, path: '/admin/banners' },
      { name: 'Art', icon: HiOutlinePhotograph, path: '/admin/art' },
      { name: 'Chocolates', icon: HiOutlineCake, path: '/admin/chocolates' },
      { name: 'Gifting', icon: HiOutlineGift, path: '/admin/gifting' },
      { name: 'Workshops', icon: HiOutlineAcademicCap, path: '/admin/workshops' },
      { name: 'Gallery', icon: HiOutlineCamera, path: '/admin/gallery' },
    ],
  },
  {
    title: 'Marketing',
    items: [
      { name: 'Coupons', icon: HiOutlineTicket, path: '/admin/coupons' },
      { name: 'Referrals', icon: HiOutlineGiftAlt, path: '/admin/referrals' },
    ],
  },
  {
    title: 'Management',
    items: [
      { name: 'Users', icon: HiOutlineUsers, path: '/admin/users' },
      { name: 'Settings', icon: HiOutlineCog, path: '/admin/settings' },
    ],
  },
]

const Sidebar = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close on route change
  useEffect(() => {
    if (isMobile) setIsOpen(false)
  }, [location.pathname, isMobile])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleNavClick = () => {
    if (isMobile) setIsOpen(false)
  }

  const sidebarStyle = {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    width: '256px',
    backgroundColor: '#3d1f0a',
    color: '#fefaf5',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 50,
    transition: 'transform 0.3s ease-in-out',
    transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
  }

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 40,
    display: isMobile && isOpen ? 'block' : 'none',
  }

  const hamburgerStyle = {
    position: 'fixed',
    top: '16px',
    left: '16px',
    zIndex: 30,
    padding: '12px',
    backgroundColor: '#3d1f0a',
    color: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: isMobile ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
  }

  // ⭐ Nav style with hidden scrollbar
  const navStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 0',
    // Hide scrollbar for Firefox
    scrollbarWidth: 'none',
    // Hide scrollbar for IE/Edge legacy
    msOverflowStyle: 'none',
  }

  return (
    <>
      {/* ⭐ Inline styles to hide webkit scrollbar */}
      <style>{`
        .sidebar-nav::-webkit-scrollbar {
          display: none;
          width: 0;
          background: transparent;
        }
      `}</style>

      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={hamburgerStyle}
        aria-label="Open menu"
      >
        <HiOutlineMenu style={{ width: '24px', height: '24px' }} />
      </button>

      {/* Overlay */}
      <div onClick={() => setIsOpen(false)} style={overlayStyle} />

      {/* Sidebar */}
      <aside style={sidebarStyle}>
        {/* Logo + Close */}
        <div className="p-4 sm:p-6 border-b border-chocolate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading font-bold text-base sm:text-lg text-white truncate">
                Admin Panel
              </h1>
              <p className="text-xs text-cream-400 truncate">TheRawCanvasStudio</p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            style={{
              display: isMobile ? 'flex' : 'none',
              padding: '8px',
              backgroundColor: 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '8px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close sidebar"
          >
            <HiOutlineX style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* ⭐ Navigation with hidden scrollbar */}
        <nav className="sidebar-nav" style={navStyle}>
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-4 sm:mb-6">
              <p className="px-6 text-xs font-semibold text-cream-500 uppercase tracking-wider mb-2 sm:mb-3">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/admin'}
                      onClick={handleNavClick}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all
                        ${isActive
                          ? 'bg-primary-500/20 text-primary-400 border-r-4 border-primary-500'
                          : 'text-cream-300 hover:bg-chocolate-800 hover:text-white'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-chocolate-800 space-y-2">
          <NavLink
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-cream-300 hover:bg-chocolate-800 hover:text-white rounded-xl transition-colors"
          >
            <HiOutlineHome className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Back to Website</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <HiOutlineLogout className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar