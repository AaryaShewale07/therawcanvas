import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiOutlineArrowRight, HiOutlineHeart, HiOutlineEye } from 'react-icons/hi'
import { staggerContainer, staggerItem } from '../../utils/animations'

const categories = [
  {
    id: 1,
    title: 'Artisan Chocolates',
    description: 'Handcrafted with premium Belgian cocoa and natural ingredients',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600',
    link: '/chocolates',
    color: 'from-chocolate-600 to-chocolate-800',
  },
  {
    id: 2,
    title: 'Original Artwork',
    description: 'Unique paintings and illustrations that tell a story',
    image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600',
    link: '/art',
    color: 'from-primary-500 to-primary-700',
  },
  {
    id: 3,
    title: 'Gift Collections',
    description: 'Curated boxes perfect for every special occasion',
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600',
    link: '/gifting',
    color: 'from-gold-500 to-gold-700',
  },
  {
    id: 4,
    title: 'Creative Workshops',
    description: 'Learn the art of chocolate making and painting',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600',
    link: '/workshops',
    color: 'from-purple-500 to-purple-700',
  },
]

const featuredProducts = [
  {
    id: 1,
    name: 'Dark Chocolate Truffle Set',
    price: '$49.99',
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400',
    category: 'Chocolates',
    likes: 234,
  },
  {
    id: 2,
    name: 'Abstract Sunset Canvas',
    price: '$199.99',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
    category: 'Art',
    likes: 156,
  },
  {
    id: 3,
    name: 'Luxury Gift Hamper',
    price: '$89.99',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
    category: 'Gifting',
    likes: 189,
  },
  {
    id: 4,
    name: 'Salted Caramel Collection',
    price: '$39.99',
    image: 'https://images.unsplash.com/photo-1548907040-4bea42c3d2fc?w=400',
    category: 'Chocolates',
    likes: 312,
  },
]

const FeaturedSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-6">Explore Our Collections</h2>
          <p className="text-lg text-chocolate-600 max-w-2xl mx-auto mt-8">
            Discover handcrafted chocolates, stunning artwork, and unique gifts that make every moment special
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              variants={staggerItem}
              whileHover={{ y: -10 }}
              className="group relative h-80 rounded-3xl overflow-hidden shadow-elegant cursor-pointer"
            >
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-70 group-hover:opacity-80 transition-opacity duration-300`} />
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <h3 className="text-2xl font-heading font-bold mb-2 group-hover:-translate-y-2 transition-transform duration-300">
                  {category.title}
                </h3>
                <p className="text-white/90 text-sm mb-4 opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  {category.description}
                </p>
                <Link
                  to={category.link}
                  className="inline-flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                >
                  Explore
                  <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl font-heading font-bold text-chocolate-900 mb-4">
            Featured Products
          </h3>
          <p className="text-chocolate-600">
            Our most loved creations, handpicked for you
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              variants={staggerItem}
              whileHover={{ y: -8 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-elegant hover:shadow-elegant-lg transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-chocolate-900/0 group-hover:bg-chocolate-900/30 transition-colors duration-300 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <HiOutlineHeart className="w-6 h-6 text-primary-500" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <HiOutlineEye className="w-6 h-6 text-chocolate-700" />
                  </motion.button>
                </div>
                <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-chocolate-700">
                  {product.category}
                </span>
              </div>
              <div className="p-5">
                <h4 className="font-semibold text-chocolate-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    {product.price}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-chocolate-400">
                    <HiOutlineHeart className="w-4 h-4" />
                    {product.likes}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturedSection