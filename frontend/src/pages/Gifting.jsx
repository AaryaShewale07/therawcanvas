import { useState } from 'react'
import { motion } from 'framer-motion'
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations'
import { 
  HiOutlineGift, 
  HiOutlineHeart, 
  HiOutlineShoppingBag,
  HiOutlineSparkles,
  HiOutlineStar
} from 'react-icons/hi'

const occasions = ['All', 'Birthday', 'Anniversary', 'Wedding', 'Thank You', 'Corporate', 'Holiday']

const giftSets = [
  {
    id: 1,
    name: 'Romantic Indulgence Box',
    description: 'A perfect blend of art prints and luxury chocolates for your special someone',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600',
    occasion: 'Anniversary',
    includes: ['6 Art Prints', '12 Truffles', 'Gift Card'],
    rating: 4.9,
    reviews: 87,
    isPopular: true,
  },
  {
    id: 2,
    name: 'Birthday Celebration Set',
    description: 'Colorful art and delicious treats to make their day special',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600',
    occasion: 'Birthday',
    includes: ['4 Art Cards', '8 Chocolates', 'Balloon'],
    rating: 4.8,
    reviews: 124,
    isPopular: true,
  },
  {
    id: 3,
    name: 'Corporate Excellence',
    description: 'Impress clients with this sophisticated gift collection',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600',
    occasion: 'Corporate',
    includes: ['Canvas Print', '24 Chocolates', 'Branded Box'],
    rating: 5.0,
    reviews: 56,
    isPopular: false,
  },
  {
    id: 4,
    name: 'Wedding Bliss Hamper',
    description: 'Elegant gift set perfect for newlyweds',
    price: 249.99,
    originalPrice: 299.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    occasion: 'Wedding',
    includes: ['Framed Art', '30 Chocolates', 'Champagne'],
    rating: 4.9,
    reviews: 43,
    isPopular: true,
  },
  {
    id: 5,
    name: 'Thank You Bundle',
    description: 'Show your appreciation with this thoughtful gift',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600',
    occasion: 'Thank You',
    includes: ['3 Art Cards', '6 Chocolates', 'Note Card'],
    rating: 4.7,
    reviews: 198,
    isPopular: false,
  },
  {
    id: 6,
    name: 'Holiday Cheer Collection',
    description: 'Spread festive joy with art and seasonal chocolates',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=600',
    occasion: 'Holiday',
    includes: ['Holiday Art Set', '18 Chocolates', 'Ornament'],
    rating: 4.8,
    reviews: 167,
    isPopular: true,
  },
]

const Gifting = () => {
  const [selectedOccasion, setSelectedOccasion] = useState('All')
  const [hoveredCard, setHoveredCard] = useState(null)

  const filteredGifts = giftSets.filter(
    gift => selectedOccasion === 'All' || gift.occasion === selectedOccasion
  )

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="pt-24"
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gold-50 via-cream-50 to-white py-20 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              {['🎁', '✨', '🎀', '💝'][i % 4]}
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-gold-400 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold"
            >
              <HiOutlineGift className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-chocolate-900 mb-6">
              Curated <span className="gradient-text">Gift Sets</span>
            </h1>
            <p className="text-lg text-chocolate-600 mb-8">
              Thoughtfully crafted gift collections combining beautiful artwork and 
              delicious chocolates. Perfect for every occasion and celebration.
            </p>

            {/* Special Offer Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-gold-500 rounded-full text-white shadow-lg"
            >
              <HiOutlineSparkles className="w-5 h-5" />
              <span className="font-medium">Free gift wrapping on all orders!</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Occasion Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {occasions.map((occasion) => (
              <motion.button
                key={occasion}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedOccasion(occasion)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  selectedOccasion === occasion
                    ? 'bg-gradient-to-r from-gold-400 to-gold-600 text-chocolate-900 shadow-gold'
                    : 'bg-cream-100 text-chocolate-700 hover:bg-cream-200'
                }`}
              >
                {occasion}
              </motion.button>
            ))}
          </motion.div>

          {/* Gift Sets Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredGifts.map((gift) => (
              <motion.div
                key={gift.id}
                variants={staggerItem}
                whileHover={{ y: -10 }}
                onHoverStart={() => setHoveredCard(gift.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="group bg-white rounded-3xl overflow-hidden shadow-elegant hover:shadow-elegant-lg transition-all duration-500 border border-cream-100"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={gift.image}
                    alt={gift.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900/80 via-chocolate-900/20 to-transparent" />
                  
                  {/* Popular Badge */}
                  {gift.isPopular && (
                    <motion.span
                      initial={{ x: -100 }}
                      animate={{ x: 0 }}
                      className="absolute top-4 left-4 px-4 py-1.5 bg-gradient-to-r from-gold-400 to-gold-600 text-chocolate-900 text-sm font-bold rounded-full shadow-lg"
                    >
                      ⭐ Popular
                    </motion.span>
                  )}

                  {/* Occasion Tag */}
                  <span className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-chocolate-700">
                    {gift.occasion}
                  </span>

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: hoveredCard === gift.id ? 1 : 0,
                      y: hoveredCard === gift.id ? 0 : 20
                    }}
                    className="absolute bottom-4 left-4 right-4 flex justify-center gap-3"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <HiOutlineHeart className="w-5 h-5 text-primary-500" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="px-6 h-12 bg-primary-500 rounded-full flex items-center justify-center gap-2 shadow-lg text-white font-medium"
                    >
                      <HiOutlineShoppingBag className="w-5 h-5" />
                      Add to Cart
                    </motion.button>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <HiOutlineStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(gift.rating)
                              ? 'fill-gold-400 text-gold-400'
                              : 'text-cream-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-chocolate-500">
                      ({gift.reviews} reviews)
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-xl text-chocolate-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {gift.name}
                  </h3>
                  <p className="text-chocolate-500 text-sm mb-4 line-clamp-2">
                    {gift.description}
                  </p>

                  {/* Includes */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {gift.includes.map((item, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-cream-100 text-chocolate-600 text-xs rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-4 border-t border-cream-100">
                    <div>
                      <span className="text-2xl font-bold text-chocolate-900">
                        ${gift.price}
                      </span>
                      {gift.originalPrice && (
                        <span className="text-sm text-chocolate-400 line-through ml-2">
                          ${gift.originalPrice}
                        </span>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-primary-600 font-semibold text-sm hover:text-primary-700"
                    >
                      View Details →
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Custom Gift CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 bg-gradient-to-r from-chocolate-800 to-chocolate-900 rounded-3xl overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="p-8 md:p-12">
                <h3 className="text-3xl font-heading font-bold text-white mb-4">
                  Create Your Own Gift Set
                </h3>
                <p className="text-cream-300 mb-6">
                  Can't find the perfect combination? Design your own custom gift set 
                  by selecting your favorite artworks and chocolates.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-gold-400 to-gold-600 text-chocolate-900 font-semibold rounded-full shadow-gold hover:shadow-lg transition-all"
                >
                  Start Customizing
                </motion.button>
              </div>
              <div className="relative h-64 md:h-full">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"
                  alt="Custom Gift"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-chocolate-900 via-chocolate-900/50 to-transparent md:from-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}

export default Gifting