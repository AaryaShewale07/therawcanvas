import { useState } from 'react'
import { motion } from 'framer-motion'
import Dashboard from '../components/admin/Dashboard'
import PostList from '../components/admin/PostList'
import PostForm from '../components/admin/PostForm'

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
      case 'users':
        return <div className="text-chocolate-600">User management coming soon...</div>
      case 'settings':
        return <div className="text-chocolate-600">Settings coming soon...</div>
      default:
        return <Dashboard onAddPost={handleAddPost} />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {renderSection()}
      
      {showPostForm && (
        <PostForm 
          post={editingPost} 
          category={section !== 'dashboard' && section !== 'posts' ? section : null}
          onClose={handleCloseForm} 
        />
      )}
    </motion.div>
  )
}

export default Admin