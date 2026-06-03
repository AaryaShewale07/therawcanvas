import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlinePhotograph } from 'react-icons/hi'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const PostList = ({ category, onAddPost, onEditPost }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (category && category !== 'posts') params.category = category
      // Admin sees all statuses
      params.status = undefined
      const res = await api.get('/posts', {
        params: { ...(category && category !== 'posts' ? { category } : {}) },
      })
      setPosts(res.data.data || [])
    } catch (err) {
      console.error('Fetch posts error:', err)
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    try {
      await api.delete(`/posts/${id}`)
      toast.success('Post deleted')
      fetchPosts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  // Expose refresh for parent (after save)
  useEffect(() => {
    window.__refreshPosts = fetchPosts
    return () => { delete window.__refreshPosts }
  }, [fetchPosts])

  const title =
    category && category !== 'posts'
      ? `${category.charAt(0).toUpperCase() + category.slice(1)} Posts`
      : 'All Posts'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-chocolate-900">{title}</h1>
          <p className="text-chocolate-500 mt-1">{posts.length} {posts.length === 1 ? 'post' : 'posts'}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddPost}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl shadow-lg hover:bg-primary-700 transition-colors"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add New Post
        </motion.button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
        </div>
      )}

      {/* Empty */}
      {!loading && posts.length === 0 && (
        <div className="bg-white rounded-2xl shadow-elegant p-12 text-center">
          <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlinePhotograph className="w-8 h-8 text-chocolate-400" />
          </div>
          <h3 className="text-xl font-heading font-bold text-chocolate-900 mb-2">No posts yet</h3>
          <p className="text-chocolate-500 mb-6">Create your first post to get started</p>
          <button
            onClick={onAddPost}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            Add Post
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && posts.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <motion.div
              key={post._id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-elegant overflow-hidden"
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-cream-100 relative overflow-hidden">
                {post.images?.[0] ? (
                  <img src={post.images[0].url} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <HiOutlinePhotograph className="w-12 h-12 text-chocolate-300" />
                  </div>
                )}
                <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded-full ${
                  post.status === 'published' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                }`}>
                  {post.status}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-cream-100 text-chocolate-700 text-xs rounded-full">
                    {post.category}
                  </span>
                  {post.featured && (
                    <span className="px-2 py-1 bg-gold-100 text-gold-700 text-xs rounded-full">★ Featured</span>
                  )}
                </div>
                <h3 className="font-heading font-bold text-chocolate-900 mb-1 truncate">{post.title}</h3>
                {post.price > 0 && (
                  <p className="text-primary-600 font-bold mb-3">₹{post.price}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => onEditPost(post)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-cream-100 text-chocolate-700 rounded-lg hover:bg-cream-200 transition-colors text-sm"
                  >
                    <HiOutlinePencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PostList