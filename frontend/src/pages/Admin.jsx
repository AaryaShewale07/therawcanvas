// Admin.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import Dashboard from '../components/admin/Dashboard'
import PostList from '../components/admin/PostList'
import PostForm from '../components/admin/PostForm'
import UsersPage from '../components/admin/UsersPage'
import BookingsPage from '../components/admin/BookingsPage'
import AnalyticsPage from '../components/admin/AnalyticsPage'
import SettingsPage from '../components/admin/SettingsPage'
import AdminOrders from '../components/admin/AdminOrders'
import BannerAdmin from './admin/BannerAdmin'
import GalleryAdmin from './admin/GalleryAdmin'

const Admin = ({ section = 'dashboard' }) => {
  const [showPostForm, setShowPostForm] = useState(false)
  const [editingPost, setEditingPost] = useState(null)

  const handleAddPost = () => {
    setEditingPost(null)
    setShowPostForm(true)
  }

  const handleEditPost = (post) => {
    setEditingPost(post)
    setShowPostForm(true)
  }

  const handleCloseForm = () => {
    setShowPostForm(false)
    setEditingPost(null)
  }

  const handleSaved = () => {
    if (window.__refreshPosts) window.__refreshPosts()
  }

  const renderSection = () => {
    switch (section) {
      case 'posts':
      case 'art':
      case 'chocolates':
      case 'gifting':
      case 'workshops':
        return (
          <PostList
            category={section}
            onAddPost={handleAddPost}
            onEditPost={handleEditPost}
          />
        )
      case 'orders':
        return <AdminOrders />
      case 'users':
        return <UsersPage />
      case 'bookings':
        return <BookingsPage />
      case 'analytics':
        return <AnalyticsPage />
      case 'settings':
        return <SettingsPage />
      case 'banners':
        return <BannerAdmin />
      case 'gallery':
        return <GalleryAdmin />
      default:
        return <Dashboard onAddPost={handleAddPost} />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      // ⭐ Reset font to plain system font for all admin pages
      style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
    >
      {renderSection()}

      {showPostForm && (
        <PostForm
          post={editingPost}
          category={
            section !== 'dashboard' && section !== 'posts' ? section : null
          }
          onClose={handleCloseForm}
          onSaved={handleSaved}
        />
      )}
    </motion.div>
  )
}

export default Admin