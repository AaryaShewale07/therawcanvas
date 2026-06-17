import { motion } from 'framer-motion'
import { HiOutlineBookOpen } from 'react-icons/hi'
import PageHeader from '../components/common/PageHeader'

const OurStory = () => {
  const milestones = [
    {
      year: '2019',
      title: 'Where It All Began',
      description: 'Launched an Instagram page to showcase my passion for art, sharing handcrafted creations with a growing community of art lovers.',
    },
    {
      year: '2021',
      title: 'Customization Era',
      description: 'Started accepting customization orders, with our signature embroidery frames quickly becoming the studio\'s most-loved USP.',
    },
    {
      year: '2025',
      title: 'A Sweet Addition',
      description: 'Expanded into seasonal artisan chocolates, crafting special collections for Ganpati and Diwali — blending art with indulgence.',
    },
    {
      year: '2026',
      title: 'Bringing People Together',
      description: 'Introduced hands-on workshops to unite creative souls under one roof, where everyone can experience the joy of making something with their own hands. In the same year, TheRawCanvasStudio was officially registered under the Udyam Registration scheme, marking an important milestone in our journey as a recognized creative business.',
  },
  ]

return (
  <div className="min-h-screen bg-cream-50">
    <PageHeader
      title="Our Story"
      subtitle="A journey of passion, art, and chocolate"
      icon={HiOutlineBookOpen}
    />

    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <p className="text-lg text-chocolate-700 leading-relaxed mb-6">
          TheRawCanvasStudio was born from a simple belief: <strong>every gift, every artwork, every chocolate
            tells a story</strong>. What started as a passionate hobby quickly grew into a celebration of
          handcrafted elegance.
        </p>
        <p className="text-lg text-chocolate-700 leading-relaxed mb-12">
          We pour our hearts into each creation, blending traditional craftsmanship with modern aesthetics.
          Every piece carries a piece of us — and soon, a piece of you too.
        </p>
      </motion.div>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-gold-400 to-chocolate-700 rounded-full" />

        {milestones.map((m, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15 }}
            className="relative pl-20 pb-10"
          >
            <div className="absolute left-4 w-9 h-9 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-chocolate-900 font-bold text-sm shadow-lg">
              {idx + 1}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-elegant">
              <span className="text-gold-600 font-bold text-sm">{m.year}</span>
              <h3 className="text-xl font-bold text-chocolate-900 mb-2">{m.title}</h3>
              <p className="text-chocolate-600">{m.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  </div>
)
}

export default OurStory