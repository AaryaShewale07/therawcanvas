import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineStar, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi'
import { FaQuoteLeft } from 'react-icons/fa'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    role: 'Art Enthusiast',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    rating: 5,
    text: 'The chocolate truffles are absolutely divine! Each piece is a work of art. The attention to detail and quality of ingredients is unmatched.',
  },
  {
    id: 2,
    name: 'James Rodriguez',
    role: 'Interior Designer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    rating: 5,
    text: 'I purchased a painting for my clients living room, and they were thrilled! The colors and technique are exceptional. Will definitely be back for more.',
  },
  {
    id: 3,
    name: 'Emily Chen',
    role: 'Food Blogger',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    rating: 5,
    text: 'Attended the chocolate making workshop and it was incredible! The instructors are so knowledgeable and passionate. Highly recommend!',
  },
  {
    id: 4,
    name: 'Michael Brown',
    role: 'Gift Shop Owner',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    rating: 5,
    text: 'The gift hampers are perfect for my store. My customers love the unique combination of art and chocolates. Outstanding quality!',
  },
]

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-cream-50 to-cream-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title mb-6">What Our Customers Say</h2>
          <p className="text-lg text-chocolate-600 max-w-2xl mx-auto mt-8">
            Don't just take our word for it – hear from our happy customers
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-white rounded-3xl shadow-elegant-lg p-8 md:p-12 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-8 left-8 text-primary-200">
                <FaQuoteLeft className="w-12 h-12" />
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="flex-shrink-0"
                >
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary-100 shadow-lg">
                    <img
                      src={testimonials[currentIndex].avatar}
                      alt={testimonials[currentIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  {/* Rating */}
                  <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * i }}
                      >
                        <HiOutlineStar className="w-5 h-5 fill-gold-400 text-gold-400" />
                      </motion.span>
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-lg md:text-xl text-chocolate-700 mb-6 leading-relaxed">
                    "{testimonials[currentIndex].text}"
                  </p>

                  {/* Author */}
                  <div>
                    <h4 className="font-heading font-bold text-xl text-chocolate-900">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="text-primary-600 font-medium">
                      {testimonials[currentIndex].role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prev}
              className="w-12 h-12 bg-white rounded-full shadow-elegant flex items-center justify-center text-chocolate-700 hover:text-primary-600 hover:shadow-elegant-lg transition-all"
            >
              <HiOutlineChevronLeft className="w-6 h-6" />
            </motion.button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-primary-500'
                      : 'bg-cream-300 hover:bg-cream-400'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={next}
              className="w-12 h-12 bg-white rounded-full shadow-elegant flex items-center justify-center text-chocolate-700 hover:text-primary-600 hover:shadow-elegant-lg transition-all"
            >
              <HiOutlineChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials