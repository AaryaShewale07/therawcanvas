import { motion } from 'framer-motion'
import { HiOutlineSparkles, HiOutlineHeart, HiOutlineLightBulb, HiOutlineGift } from 'react-icons/hi'
import PageHeader from '../components/common/PageHeader'

const About = () => {
  const values = [
    { icon: HiOutlineHeart, title: 'Passion', description: 'Every piece is made with love and dedication' },
    { icon: HiOutlineSparkles, title: 'Quality', description: 'Only the finest ingredients and materials' },
    { icon: HiOutlineLightBulb, title: 'Creativity', description: 'Unique designs that tell your story' },
    { icon: HiOutlineGift, title: 'Joy', description: 'Creating moments that bring smiles' },
  ]

  return (
    <div className="min-h-screen bg-cream-50">
      <PageHeader
        title="About Us"
        subtitle="Crafting moments of joy through art and chocolate"
        icon={HiOutlineSparkles}
      />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-heading font-bold text-chocolate-900 mb-6 text-center">
            Welcome to <span className="gradient-text">TheRawCanvasStudio</span>
          </h2>
          <p className="text-lg text-chocolate-700 leading-relaxed mb-6">
            TheRawCanvasStudio is a Mumbai-based artisan studio where art meets sweetness. We specialize in
            handcrafted chocolates, customized frames, unique artworks, and curated gift hampers — each
            piece designed to make your special moments unforgettable.
          </p>
          <p className="text-lg text-chocolate-700 leading-relaxed mb-6">
            Founded with a passion for creativity and craftsmanship, our studio brings together the joy of
            artistic expression and the indulgence of premium chocolates. Whether it's a personalized gift,
            a wedding favor, or a treat for yourself — we make it special.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {values.map((value, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-elegant text-center hover:shadow-elegant-lg transition"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full mb-4">
                <value.icon className="w-8 h-8 text-chocolate-900" />
              </div>
              <h3 className="text-xl font-bold text-chocolate-900 mb-2">{value.title}</h3>
              <p className="text-chocolate-600 text-sm">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default About