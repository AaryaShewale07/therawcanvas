import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations'
import { 
  HiOutlineHeart, 
  HiOutlineShoppingBag, 
  HiOutlineFilter, 
  HiOutlineStar,
  HiOutlineX,
  HiOutlinePlus,
  HiOutlineMinus
} from 'react-icons/hi'

const categories = ['All', 'Dark Chocolate', 'Milk Chocolate', 'White Chocolate', 'Truffles', 'Gift Boxes']

const chocolates = [
  {
    id: 1,
    name: 'Belgian Dark Truffle Collection',
    description: '12 handcrafted dark chocolate truffles with various fillings',
    price: 49.99,
    originalPrice: 65.99,
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600',
    category: 'Truffles',
    rating: 4.9,
    reviews: 128,
    isNew: true,
    isBestseller: true,
  },
  {
    id: 2,
    name: 'Salted Caramel Bonbons',
    description: 'Smooth milk chocolate filled with buttery salted caramel',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1548907040-4bea42c3d2fc?w=600',
    category: 'Milk Chocolate',
    rating: 4.8,
    reviews: 89,
    isNew: false,
    isBestseller: true,
  },
  {
    id: 3,
    name: 'Single Origin 85% Cacao Bar',
    description: 'Intense dark chocolate from Madagascar cocoa beans',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600',
    category: 'Dark Chocolate',
    rating: 4.7,
    reviews: 156,
    isNew: false,
    isBestseller: false,
  },
  {
    id: 4,
    name: 'Luxury Assortment Box',
    description: '24 pieces of our finest chocolates in an elegant gift box',
    price: 89.99,
    originalPrice: 110.00,
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600',
    category: 'Gift Boxes',
    rating: 5.0,
    reviews: 234,
    isNew: true,
    isBestseller: true,
  },
  {
    id: 5,
    name: 'Raspberry White Chocolate Bars',
    description: 'Creamy white chocolate with freeze-dried raspberries',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600',
    category: 'White Chocolate',
    rating: 4.6,
    reviews: 67,
    isNew: true,
    isBestseller: false,
  },
  {
    id: 6,
    name: 'Hazelnut Praline Selection',
    description: 'Crunchy hazelnut praline in milk and dark chocolate',
    price: 42.99,
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=600',
    category: 'Truffles',
    rating: 4.8,
    reviews: 112,
    isNew: false,
    isBestseller: true,
  },
  {
    id: 7,
    name: 'Orange Peel Dark Chocolate',
    description: 'Candied orange peel dipped in 70% dark chocolate',
    price: 28.99,
    image: 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=600',
    category: 'Dark Chocolate',
    rating: 4.5,
    reviews: 45,
    isNew: false,
    isBestseller: false,
  },
  {
    id: 8,
    name: 'Champagne Truffles',
    description: 'Delicate truffles infused with Dom Pérignon champagne',
    price: 64.99,
    image: 'https://images.unsplash.com/photo-1526081347589-7fa3cb41de55?w=600',
    category: 'Truffles',
    rating: 4.9,
    reviews: 78,
    isNew: true,
    isBestseller: false,
  },
]

const Chocolates = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('featured')
  const [cart, setCart] = useState({})
  const [selectedProduct, setSelectedProduct] = useState(null)

  const filteredChocolates = chocolates
    .filter(choc => selectedCategory === 'All' || choc.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price
        case 'price-high': return b.price - a.price
        case 'rating': return b.rating - a.rating
        case 'newest': return b.isNew - a.isNew
        default: return b.isBestseller - a.isBestseller
      }
    })

  const addToCart = (id) => {
    setCart(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }))
  }

  const removeFromCart = (id) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[id] > 1) {
        newCart[id]--
      } else {
        delete newCart[id]
      }
      return newCart
    })
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
      <section className="bg-gradient-to-b from-chocolate-100 to-cream-50 py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30m-20 0a20 20 0 1 0 40 0a20 20 0 1 0 -40 0' fill='%233d2218' fill-opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl mb-6 block"
            >
              🍫
            </motion.span>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-chocolate-900 mb-6">
              Artisan <span className="gradient-text">Chocolates</span>
            </h1>
            <p className="text-lg text-chocolate-600 mb-8">
              Indulge in our handcrafted chocolates made with the finest Belgian cocoa 
              and natural ingredients. Each piece is a work of edible art.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12"
          >
            {/* Category Filters */}
            <div className="flex items-center gap-4 overflow-x-auto pb-2 w-full md:w-auto">
              <div className="flex items-center gap-2 text-chocolate-700 flex-shrink-0">
                <HiOutlineFilter className="w-5 h-5" />
                <span className="font-medium">Filter:</span>
              </div>
              <div className="flex gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-chocolate-700 text-white shadow-md'
                        : 'bg-cream-100 text-chocolate-700 hover:bg-cream-200'
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-cream-50 border border-cream-200 rounded-xl text-chocolate-700 focus:outline-none focus:border-chocolate-400"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </motion.div>

          {/* Products Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filteredChocolates.map((chocolate) => (
              <motion.div
                key={chocolate.id}
                variants={staggerItem}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-elegant hover:shadow-elegant-lg transition-all duration-500 border border-cream-100"
              >
                {/* Image Container */}
                <div 
                  className="relative aspect-square overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProduct(chocolate)}
                >
                  <img
                    src={chocolate.image}
                    alt={chocolate.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-chocolate-900/0 group-hover:bg-chocolate-900/20 transition-colors duration-300" />
                  
                  {/* Wishlist Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HiOutlineHeart className="w-5 h-5 text-primary-500" />
                  </motion.button>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {chocolate.isNew && (
                      <span className="px-2 py-1 bg-gold-500 text-chocolate-900 text-xs font-bold rounded-full">
                        NEW
                      </span>
                    )}
                    {chocolate.isBestseller && (
                      <span className="px-2 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">
                        BESTSELLER
                      </span>
                    )}
                    {chocolate.originalPrice && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        {Math.round((1 - chocolate.price / chocolate.originalPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <HiOutlineStar className="w-4 h-4 fill-gold-400 text-gold-400" />
                    <span className="text-sm font-medium text-chocolate-700">{chocolate.rating}</span>
                    <span className="text-xs text-chocolate-400">({chocolate.reviews})</span>
                  </div>

                  <h3 className="font-semibold text-chocolate-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {chocolate.name}
                  </h3>
                  <p className="text-sm text-chocolate-500 mb-3 line-clamp-2">
                    {chocolate.description}
                  </p>
                  
                  {/* Price & Add to Cart */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-chocolate-900">${chocolate.price}</span>
                      {chocolate.originalPrice && (
                        <span className="text-sm text-chocolate-400 line-through ml-2">
                          ${chocolate.originalPrice}
                        </span>
                      )}
                    </div>
                    
                    {cart[chocolate.id] ? (
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeFromCart(chocolate.id)}
                          className="w-8 h-8 bg-cream-100 rounded-full flex items-center justify-center text-chocolate-700 hover:bg-cream-200"
                        >
                          <HiOutlineMinus className="w-4 h-4" />
                        </motion.button>
                        <span className="font-semibold text-chocolate-900 w-6 text-center">
                          {cart[chocolate.id]}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => addToCart(chocolate.id)}
                          className="w-8 h-8 bg-chocolate-700 rounded-full flex items-center justify-center text-white hover:bg-chocolate-800"
                        >
                          <HiOutlinePlus className="w-4 h-4" />
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addToCart(chocolate.id)}
                        className="w-10 h-10 bg-chocolate-700 rounded-full flex items-center justify-center text-white hover:bg-chocolate-800 transition-colors"
                      >
                        <HiOutlineShoppingBag className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="grid md:grid-cols-2">
                {/* Image */}
                <div className="relative aspect-square">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg md:hidden"
                  >
                    <HiOutlineX className="w-5 h-5" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-8">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-cream-100 rounded-full items-center justify-center hidden md:flex hover:bg-cream-200 transition-colors"
                  >
                    <HiOutlineX className="w-5 h-5" />
                  </button>

                  <span className="inline-block px-3 py-1 bg-chocolate-100 text-chocolate-700 text-sm font-medium rounded-full mb-4">
                    {selectedProduct.category}
                  </span>

                  <h2 className="text-3xl font-heading font-bold text-chocolate-900 mb-2">
                    {selectedProduct.name}
                  </h2>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <HiOutlineStar
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(selectedProduct.rating)
                              ? 'fill-gold-400 text-gold-400'
                              : 'text-cream-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-chocolate-600">
                      {selectedProduct.rating} ({selectedProduct.reviews} reviews)
                    </span>
                  </div>

                  <p className="text-chocolate-600 mb-6">
                    {selectedProduct.description}
                  </p>

                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-3xl font-bold text-chocolate-900">
                      ${selectedProduct.price}
                    </span>
                    {selectedProduct.originalPrice && (
                      <span className="text-xl text-chocolate-400 line-through">
                        ${selectedProduct.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-cream-100 rounded-full p-1">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFromCart(selectedProduct.id)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-chocolate-700 shadow-sm"
                      >
                        <HiOutlineMinus className="w-5 h-5" />
                      </motion.button>
                      <span className="font-semibold text-chocolate-900 w-8 text-center">
                        {cart[selectedProduct.id] || 1}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addToCart(selectedProduct.id)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-chocolate-700 shadow-sm"
                      >
                        <HiOutlinePlus className="w-5 h-5" />
                      </motion.button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        addToCart(selectedProduct.id)
                        setSelectedProduct(null)
                      }}
                      className="flex-1 py-4 bg-chocolate-700 text-white font-semibold rounded-full hover:bg-chocolate-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <HiOutlineShoppingBag className="w-5 h-5" />
                      Add to Cart
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default Chocolates