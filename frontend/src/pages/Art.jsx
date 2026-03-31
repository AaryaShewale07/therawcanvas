import { useState } from 'react'
import { motion } from 'framer-motion'
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations'
import { HiOutlineHeart, HiOutlineEye, HiOutlineShoppingBag, HiOutlineFilter, HiOutlineSearch } from 'react-icons/hi'

const categories = ['All', 'Paintings', 'Digital Art', 'Illustrations', 'Photography', 'Mixed Media']

const artworks = [
  {
    id: 1,
    title: 'Abstract Sunset Dreams',
    artist: 'Elena Rodriguez',
    price: '$299',
    originalPrice: '$399',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600',
    category: 'Paintings',
    likes: 234,
    isNew: true,
  },
  {
    id: 2,
    title: 'Ocean Whispers',
    artist: 'Marcus Chen',
    price: '$189',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600',
    category: 'Digital Art',
    likes: 156,
    isNew: false,
  },
  {
    id: 3,
    title: 'Golden Hour Forest',
    artist: 'Sophie Williams',
    price: '$449',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    category: 'Photography',
    likes: 312,
    isNew: true,
  },
  {
    id: 4,
    title: 'Urban Symphony',
    artist: 'David Park',
    price: '$259',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600',
    category: 'Illustrations',
    likes: 189,
    isNew: false,
  },
  {
    id: 5,
    title: 'Floral Elegance',
    artist: 'Isabella Martinez',
    price: '$179',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600',
    category: 'Paintings',
    likes: 267,
    isNew: false,
  },
  {
    id: 6,
    title: 'Cosmic Journey',
    artist: 'Alex Turner',
    price: '$349',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    category: 'Digital Art',
    likes: 421,
    isNew: true,
  },
  {
    id: 7,
    title: 'Mountain Serenity',
    artist: 'Lisa Thompson',
    price: '$279',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    category: 'Photography',
    likes: 198,
    isNew: false,
  },
  {
    id: 8,
    title: 'Neon Dreams',
    artist: 'Ryan Cooper',
    price: '$229',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600',
    category: 'Digital Art',
    likes: 345,
    isNew: true,
  },
  {
    id: 9,
    title: 'Vintage Botanicals',
    artist: 'Emma Davis',
    price: '$199',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600',
    category: 'Illustrations',
    likes: 276,
    isNew: false,
  },
]

const Art = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [likedItems, setLikedItems] = useState([])

  const filteredArtworks = artworks.filter(art => {
    const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         art.artist.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleLike = (id) => {
    setLikedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="pt-24"
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-cream-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-chocolate-900 mb-6">
              Art <span className="gradient-text">Collection</span>
            </h1>
            <p className="text-lg text-chocolate-600 mb-8">
              Discover unique artworks from talented artists around the world. 
              Each piece tells a story and brings beauty to your space.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
              <input
                type="text"
                placeholder="Search artworks or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-full shadow-elegant border-2 border-transparent focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-12 overflow-x-auto pb-4"
          >
            <div className="flex items-center gap-2 text-chocolate-700 flex-shrink-0">
              <HiOutlineFilter className="w-5 h-5" />
              <span className="font-medium">Filter:</span>
            </div>
            <div className="flex gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-cream-100 text-chocolate-700 hover:bg-cream-200'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-chocolate-500 mb-6"
          >
            Showing {filteredArtworks.length} {filteredArtworks.length === 1 ? 'artwork' : 'artworks'}
          </motion.p>

          {/* Artworks Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredArtworks.map((art) => (
              <motion.div
                key={art.id}
                variants={staggerItem}
                whileHover={{ y: -10 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-elegant hover:shadow-elegant-lg transition-all duration-500"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Actions */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleLike(art.id)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                        likedItems.includes(art.id) 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-white text-primary-500'
                      }`}
                    >
                      <HiOutlineHeart className={`w-6 h-6 ${likedItems.includes(art.id) ? 'fill-current' : ''}`} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <HiOutlineEye className="w-6 h-6 text-chocolate-700" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <HiOutlineShoppingBag className="w-6 h-6 text-white" />
                    </motion.button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {art.isNew && (
                      <span className="px-3 py-1 bg-gold-500 text-chocolate-900 text-xs font-bold rounded-full">
                        NEW
                      </span>
                    )}
                    {art.originalPrice && (
                      <span className="px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">
                        SALE
                      </span>
                    )}
                  </div>

                  {/* Category Tag */}
                  <span className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-chocolate-700">
                    {art.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-heading font-bold text-xl text-chocolate-900 mb-1 group-hover:text-primary-600 transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-chocolate-500 text-sm mb-4">by {art.artist}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-primary-600">{art.price}</span>
                      {art.originalPrice && (
                        <span className="text-sm text-chocolate-400 line-through">{art.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-chocolate-400">
                      <HiOutlineHeart className="w-4 h-4" />
                      <span className="text-sm">{art.likes + (likedItems.includes(art.id) ? 1 : 0)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredArtworks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HiOutlineSearch className="w-12 h-12 text-chocolate-300" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-chocolate-900 mb-2">
                No artworks found
              </h3>
              <p className="text-chocolate-500 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedCategory('All')
                  setSearchQuery('')
                }}
                className="btn-primary"
              >
                Clear Filters
              </motion.button>
            </motion.div>
          )}

          {/* Load More */}
          {filteredArtworks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary"
              >
                Load More Artworks
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>
    </motion.div>
  )
}

export default Art