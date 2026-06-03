import { motion } from 'framer-motion'
import { HiOutlineNewspaper, HiOutlineClock } from 'react-icons/hi'
import PageHeader from '../components/common/PageHeader'

const Blog = () => {
  return (
    <div className="min-h-screen bg-cream-50">
      <PageHeader
        title="Our Blog"
        subtitle="Stories, tips, and behind-the-scenes from our studio"
        icon={HiOutlineNewspaper}
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-elegant p-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gold-100 rounded-full mb-6">
            <HiOutlineClock className="w-10 h-10 text-gold-600" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-chocolate-900 mb-4">
            Coming Soon! ✨
          </h2>
          <p className="text-lg text-chocolate-700 mb-6">
            We're brewing some delicious content for you. Stay tuned for stories about our
            artistic journey, chocolate-making tips, workshop highlights, and much more.
          </p>
          <p className="text-chocolate-600">
            Subscribe to our newsletter to be the first to know when we publish! 📬
          </p>
        </motion.div>
      </section>
    </div>
  )
}

export default Blog