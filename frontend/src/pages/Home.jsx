import { motion } from 'framer-motion'
import Hero from '../components/home/Hero'
import FeaturedSection from '../components/home/FeaturedSection'
import Testimonials from '../components/home/Testimonials'
import { pageTransition } from '../utils/animations'
import { HiOutlineGift, HiOutlineSparkles, HiOutlineTruck, HiOutlineHeart } from 'react-icons/hi'

const features = [
  {
    icon: HiOutlineSparkles,
    title: 'Handcrafted',
    description: 'Each piece is carefully crafted by artisans with years of experience',
  },
  {
    icon: HiOutlineGift,
    title: 'Perfect Gifts',
    description: 'Beautifully packaged and ready to delight your loved ones',
  },
  {
    icon: HiOutlineTruck,
    title: 'Free Delivery',
    description: 'Complimentary shipping on all orders over $50',
  },
  {
    icon: HiOutlineHeart,
    title: 'Made with Love',
    description: 'Using only the finest natural ingredients',
  },
]

const Home = () => {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Hero />
      
      {/* Features Strip */}
      <section className="bg-gradient-to-r from-chocolate-800 to-chocolate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 text-center md:text-left"
              >
                <div className="w-12 h-12 bg-gold-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-cream-300 hidden md:block">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedSection />
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-500 to-gold-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">
              Ready to Indulge in Sweetness?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join our exclusive community and be the first to know about new collections, 
              special offers, and artisan secrets.
            </p>
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur border border-white/30 text-white placeholder-white/70 focus:outline-none focus:border-white transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Subscribe Now
              </motion.button>
            </motion.form>
            <p className="text-sm text-white/70 mt-4">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}

export default Home