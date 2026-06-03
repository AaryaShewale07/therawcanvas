import { motion } from 'framer-motion'
import { HiOutlineBriefcase, HiOutlineMail } from 'react-icons/hi'
import PageHeader from '../components/common/PageHeader'

const Careers = () => {
  return (
    <div className="min-h-screen bg-cream-50">
      <PageHeader
        title="Careers"
        subtitle="Join our artistic family"
        icon={HiOutlineBriefcase}
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-elegant p-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gold-100 rounded-full mb-6">
            <HiOutlineBriefcase className="w-10 h-10 text-gold-600" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-chocolate-900 mb-4">
            Want to Work With Us? 💝
          </h2>
          <p className="text-lg text-chocolate-700 mb-6">
            We're always looking for passionate artists, chocolatiers, and creative minds to
            join our growing family. If you love art and have a sweet tooth — we'd love to hear from you!
          </p>
          <p className="text-chocolate-600 mb-8">
            Send your resume and portfolio to:
          </p>
          <a
            href="mailto:therawcanvase@gmail.com?subject=Job Application"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-chocolate-700 to-chocolate-900 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition"
          >
            <HiOutlineMail className="w-5 h-5" />
            therawcanvase@gmail.com
          </a>
        </motion.div>
      </section>
    </div>
  )
}

export default Careers