import { useState } from 'react'
import { motion } from 'framer-motion'
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations'
import { 
  HiOutlineCalendar, 
  HiOutlineClock, 
  HiOutlineUserGroup,
  HiOutlineLocationMarker,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle
} from 'react-icons/hi'

const workshopCategories = ['All', 'Chocolate Making', 'Art Classes', 'Kids', 'Corporate']

const workshops = [
  {
    id: 1,
    title: 'Chocolate Truffle Masterclass',
    description: 'Learn the art of creating perfect chocolate truffles from scratch with our master chocolatier.',
    instructor: 'Chef Marie Laurent',
    date: '2024-02-15',
    time: '2:00 PM - 5:00 PM',
    duration: '3 hours',
    location: 'Main Studio',
    capacity: 12,
    enrolled: 8,
    price: 89,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600',
    category: 'Chocolate Making',
    level: 'Beginner',
    highlights: ['Take home 24 truffles', 'Recipe booklet', 'Certificate'],
  },
  {
    id: 2,
    title: 'Watercolor Painting for Beginners',
    description: 'Discover the beautiful world of watercolor painting with easy-to-follow techniques.',
    instructor: 'Sarah Mitchell',
    date: '2024-02-18',
    time: '10:00 AM - 1:00 PM',
    duration: '3 hours',
    location: 'Art Studio',
    capacity: 10,
    enrolled: 6,
    price: 75,
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600',
    category: 'Art Classes',
    level: 'Beginner',
    highlights: ['All materials included', '2 finished paintings', 'Technique guide'],
  },
  {
    id: 3,
    title: 'Kids Chocolate Adventure',
    description: 'A fun-filled workshop where kids create their own chocolate treats and decorations.',
    instructor: 'Chef Tom Baker',
    date: '2024-02-20',
    time: '10:00 AM - 12:00 PM',
    duration: '2 hours',
    location: 'Kids Workshop Room',
    capacity: 15,
    enrolled: 12,
    price: 45,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    category: 'Kids',
    level: 'All Ages',
    highlights: ['Age 6-12', 'Take home treats', 'Fun activities'],
  },
  {
    id: 4,
    title: 'Corporate Team Building - Chocolate Edition',
    description: 'Bond with your team while creating delicious chocolate masterpieces together.',
    instructor: 'Chef Marie Laurent',
    date: '2024-02-22',
    time: '2:00 PM - 6:00 PM',
    duration: '4 hours',
    location: 'Private Suite',
    capacity: 20,
    enrolled: 15,
    price: 150,
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600',
    category: 'Corporate',
    level: 'All Levels',
    highlights: ['Team competition', 'Catering included', 'Customizable'],
  },
  {
    id: 5,
    title: 'Advanced Chocolate Tempering',
    description: 'Master the technical art of tempering chocolate for professional results.',
    instructor: 'Chef Pierre Dubois',
    date: '2024-02-25',
    time: '3:00 PM - 7:00 PM',
    duration: '4 hours',
    location: 'Main Studio',
    capacity: 8,
    enrolled: 5,
    price: 120,
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600',
    category: 'Chocolate Making',
    level: 'Advanced',
    highlights: ['Professional techniques', 'Premium chocolate', 'Certification'],
  },
  {
    id: 6,
    title: 'Abstract Art Expression',
    description: 'Express yourself through abstract art using various mediums and techniques.',
    instructor: 'Alex Turner',
    date: '2024-02-28',
    time: '6:00 PM - 9:00 PM',
    duration: '3 hours',
    location: 'Art Studio',
    capacity: 12,
    enrolled: 9,
    price: 85,
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600',
    category: 'Art Classes',
    level: 'Intermediate',
    highlights: ['Large canvas', 'Wine & cheese', 'Take home artwork'],
  },
]

const Workshops = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedWorkshop, setSelectedWorkshop] = useState(null)

  const filteredWorkshops = workshops.filter(
    workshop => selectedCategory === 'All' || workshop.category === selectedCategory
  )

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
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
      <section className="bg-gradient-to-b from-purple-50 via-cream-50 to-white py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-20 -right-20 w-80 h-80 border border-purple-200 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-10 -left-10 w-60 h-60 border border-primary-200 rounded-full"
          />
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
              className="w-20 h-20 bg-gradient-to-br from-purple-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <HiOutlineAcademicCap className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-chocolate-900 mb-6">
              Creative <span className="gradient-text">Workshops</span>
            </h1>
            <p className="text-lg text-chocolate-600 mb-8">
              Immerse yourself in hands-on experiences led by expert instructors. 
              Learn the art of chocolate making and creative expression.
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-8 md:gap-16">
              {[
                { value: '50+', label: 'Workshops' },
                { value: '1000+', label: 'Students' },
                { value: '4.9', label: 'Rating' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
                  <p className="text-sm text-chocolate-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {workshopCategories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-500 to-primary-500 text-white shadow-lg'
                    : 'bg-cream-100 text-chocolate-700 hover:bg-cream-200'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          {/* Workshops Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredWorkshops.map((workshop) => (
              <motion.div
                key={workshop.id}
                variants={staggerItem}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-elegant hover:shadow-elegant-lg transition-all duration-500 border border-cream-100"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={workshop.image}
                    alt={workshop.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900/60 to-transparent" />
                  
                  {/* Level Badge */}
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${
                    workshop.level === 'Beginner' ? 'bg-green-500 text-white' :
                    workshop.level === 'Intermediate' ? 'bg-yellow-500 text-chocolate-900' :
                    workshop.level === 'Advanced' ? 'bg-red-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {workshop.level}
                  </span>

                  {/* Category */}
                  <span className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-chocolate-700">
                    {workshop.category}
                  </span>

                  {/* Date Overlay */}
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm opacity-90">{formatDate(workshop.date)}</p>
                    <p className="text-xs opacity-75">{workshop.time}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-heading font-bold text-xl text-chocolate-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {workshop.title}
                  </h3>
                  <p className="text-chocolate-500 text-sm mb-4 line-clamp-2">
                    {workshop.description}
                  </p>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-chocolate-600">
                      <HiOutlineClock className="w-4 h-4 text-primary-500" />
                      {workshop.duration}
                    </div>
                    <div className="flex items-center gap-2 text-chocolate-600">
                      <HiOutlineLocationMarker className="w-4 h-4 text-primary-500" />
                      {workshop.location}
                    </div>
                    <div className="flex items-center gap-2 text-chocolate-600">
                      <HiOutlineUserGroup className="w-4 h-4 text-primary-500" />
                      {workshop.enrolled}/{workshop.capacity} enrolled
                    </div>
                    <div className="flex items-center gap-2 text-chocolate-600">
                      <HiOutlineAcademicCap className="w-4 h-4 text-primary-500" />
                      {workshop.instructor}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {workshop.highlights.map((highlight, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                      >
                        <HiOutlineCheckCircle className="w-3 h-3" />
                        {highlight}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-cream-100">
                    <div>
                      <span className="text-2xl font-bold text-chocolate-900">
                        ${workshop.price}
                      </span>
                      <span className="text-sm text-chocolate-400">/person</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={workshop.enrolled >= workshop.capacity}
                      className={`px-6 py-3 rounded-full font-medium text-sm transition-all ${
                        workshop.enrolled >= workshop.capacity
                          ? 'bg-cream-200 text-chocolate-400 cursor-not-allowed'
                          : 'bg-primary-500 text-white hover:bg-primary-600'
                      }`}
                    >
                      {workshop.enrolled >= workshop.capacity ? 'Sold Out' : 'Book Now'}
                    </motion.button>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-4">
                    <div className="h-2 bg-cream-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(workshop.enrolled / workshop.capacity) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full rounded-full ${
                          workshop.enrolled >= workshop.capacity
                            ? 'bg-red-500'
                            : workshop.enrolled >= workshop.capacity * 0.8
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-chocolate-400 mt-1">
                      {workshop.capacity - workshop.enrolled} spots remaining
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Private Workshops CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 text-center"
          >
            <div className="bg-gradient-to-r from-purple-100 via-cream-100 to-primary-100 rounded-3xl p-12">
              <h3 className="text-3xl font-heading font-bold text-chocolate-900 mb-4">
                Looking for a Private Workshop?
              </h3>
              <p className="text-chocolate-600 mb-8 max-w-2xl mx-auto">
                We offer customized private workshops for groups, birthdays, 
                bachelorette parties, and corporate events. Create memorable 
                experiences for your team or loved ones.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-chocolate-800 text-white font-semibold rounded-full hover:bg-chocolate-900 transition-colors"
              >
                Inquire About Private Events
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}

export default Workshops