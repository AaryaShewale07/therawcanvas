import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  HiOutlinePlus, 
  HiOutlinePencil, 
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineSearch,
  HiOutlineFilter
} from 'react-icons/hi'
import { staggerContainer, staggerItem } from '../../utils/animations'

const mockPosts = {
  posts: [
    { id: 1, title: 'Abstract Sunset Dreams', category: 'Art', status: 'Published', views: 1234, date: '2024-01-15', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200' },
    { id: 2, title: 'Belgian Dark Truffle Collection', category: 'Chocolates', status: 'Published', views: 856, date: '2024-01-14', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200' },
    { id: 3, title: 'Romantic Indulgence Box', category: 'Gifting', status: 'Draft', views: 0, date: '2024-01-13', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200' },
    { id: 4, title: 'Chocolate Truffle Masterclass', category: 'Workshops', status: 'Published', views: 567, date: '2024-01-12', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200' },
  ],
  art: [
    { id: 1, title: 'Abstract Sunset Dreams', artist: 'Elena Rodriguez', status: 'Published', price: '$299', date: '2024-01-15', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200' },
    { id: 2, title: 'Ocean Whispers', artist: 'Marcus Chen', status: 'Published', price: '$189', date: '2024-01-14', image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200' },
  ],
  chocolates: [
    { id: 1, title: 'Belgian Dark Truffle Collection', type: 'Truffles', status: 'Published', price: '$49.99', stock: 45, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200' },
    { id: 2, title: 'Salted Caramel Bonbons', type: 'Milk Chocolate', status: 'Published', price: '$34.99', stock: 32, image: 'https://images.unsplash.com/photo-1548907040-4bea42c3d2fc?w=200' },
  ],
  gifting: [
    { id: 1, title: 'Romantic Indulgence Box', occasion: 'Anniversary', status: 'Published', price: '$129.99', date: '2024-01-13', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200' },
  ],
  workshops: [
    { id: 1, title: 'Chocolate Truffle Masterclass', instructor: 'Chef Marie', status: 'Published', price: '$89', enrolled: 8, capacity: 12, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200' },
  ],
}

const PostList = ({ category = 'posts', onAddPost, onEditPost }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const posts = mockPosts[category] || mockPosts.posts

  const getCategoryTitle = () => {
    const titles = {
      posts: 'All Posts',
      art: 'Art Collection',
      chocolates: 'Chocolates',
      gifting: 'Gift Sets',
      workshops: 'Workshops',
    }
    return titles[category] || 'Posts'
  }

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-chocolate-900">{getCategoryTitle()}</h1>
          <p className="text-chocolate-500 mt-1">Manage your {category} content</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddPost}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl shadow-lg hover:bg-primary-700 transition-colors"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add New
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-elegant">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-cream-50 rounded-xl border border-cream-200 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-cream-100 text-chocolate-700 rounded-xl hover:bg-cream-200 transition-colors">
          <HiOutlineFilter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Posts Grid/Table */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl shadow-elegant overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cream-50">
              <tr className="text-left text-sm text-chocolate-600">
                <th className="px-6 py-4 font-semibold">Item</th>
                <th className="px-6 py-4 font-semibold">
                  {category === 'art' ? 'Artist' : 
                   category === 'workshops' ? 'Instructor' : 
                   category === 'gifting' ? 'Occasion' : 
                   category === 'chocolates' ? 'Type' : 'Category'}
                </th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">
                  {category === 'chocolates' ? 'Stock' : 
                   category === 'workshops' ? 'Enrolled' : 'Views'}
                </th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post, index) => (
                <motion.tr
                  key={post.id}
                  variants={staggerItem}
                  className="border-b border-cream-100 hover:bg-cream-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                      <div>
                        <p className="font-semibold text-chocolate-900">{post.title}</p>
                        <p className="text-sm text-chocolate-500">{post.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-cream-100 text-chocolate-700 rounded-full text-sm">
                      {post.artist || post.instructor || post.occasion || post.type || post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      post.status === 'Published' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-chocolate-600">
                    {post.stock !== undefined ? post.stock : 
                     post.enrolled !== undefined ? `${post.enrolled}/${post.capacity}` : 
                     post.views?.toLocaleString() || '-'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-chocolate-900">
                    {post.price || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <HiOutlineEye className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEditPost(post)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <HiOutlinePencil className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-chocolate-500">No posts found</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default PostList