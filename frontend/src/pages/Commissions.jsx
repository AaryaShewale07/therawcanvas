import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HiOutlinePaintBrush,
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineUser,
} from 'react-icons/hi2'
import {
  HiOutlinePencilAlt,
  HiOutlineChat,
} from 'react-icons/hi'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { pageTransition } from '../utils/animations'

// 👇 Import your hero image (change filename if needed)
import heroImage from '../assets/images/commissions-hero.png'

const enquiryTypes = [
  {
    id: 'commission',
    title: 'Custom Artwork',
    description: 'Get a one-of-a-kind painting or art piece tailored just for you',
    icon: HiOutlinePaintBrush,
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'workshop',
    title: 'Workshop Details',
    description: 'Learn about our upcoming workshops, schedules & private sessions',
    icon: HiOutlineAcademicCap,
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'other',
    title: 'Other Enquiry',
    description: 'Collaborations, bulk orders, gifting, or anything else',
    icon: HiOutlineSparkles,
    color: 'from-amber-500 to-orange-500',
  },
]

const Commissions = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'commission',
    subject: '',
    message: '',
    budget: '',
    deadline: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.message) {
      return toast.error('Please fill in all required fields')
    }

    setSubmitting(true)
    try {
      await api.post('/commissions', formData)
      toast.success('🎉 Enquiry sent successfully! We will get back to you soon.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        type: 'commission',
        subject: '',
        message: '',
        budget: '',
        deadline: '',
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-gradient-to-b from-cream-50 via-white to-cream-100"
    >
      {/* Hero Banner with PNG Background */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-chocolate-900/80 via-chocolate-800/70 to-chocolate-900/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block text-gold-400 font-semibold uppercase tracking-widest text-sm mb-3">
              ✨ Let's Create Together
            </span>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">
              Commissions &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500">
                Enquiries
              </span>
            </h1>
            <p className="text-cream-200 text-lg max-w-2xl mx-auto">
              Have a custom artwork idea? Want workshop details? Drop us a
              message and we'll bring your vision to life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Enquiry Type Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {enquiryTypes.map((type, idx) => (
            <motion.button
              key={type.id}
              type="button"
              onClick={() => setFormData({ ...formData, type: type.id })}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className={`text-left bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 ${
                formData.type === type.id
                  ? 'border-primary-500 ring-2 ring-primary-200'
                  : 'border-transparent'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 shadow-md`}
              >
                <type.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-heading font-bold text-xl text-chocolate-900 mb-2">
                {type.title}
              </h3>
              <p className="text-chocolate-600 text-sm">{type.description}</p>
              {formData.type === type.id && (
                <span className="inline-block mt-3 text-primary-600 text-xs font-bold">
                  ✓ Selected
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Form Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-chocolate-900 mb-2">
              Send Your Enquiry
            </h2>
            <p className="text-chocolate-600">
              Fill in the details below and we'll get back to you within 24 hours
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-chocolate-800 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 border border-chocolate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-chocolate-800 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full pl-12 pr-4 py-3 border border-chocolate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Phone + Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-chocolate-800 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-12 pr-4 py-3 border border-chocolate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-chocolate-800 mb-2">
                  Subject
                </label>
                <div className="relative">
                  <HiOutlinePencilAlt className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief subject of your enquiry"
                    className="w-full pl-12 pr-4 py-3 border border-chocolate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Budget + Deadline (only for commissions) */}
            {formData.type === 'commission' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-chocolate-800 mb-2">
                    Budget Range (₹)
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-chocolate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Select a range</option>
                    <option value="under-2000">Under ₹2,000</option>
                    <option value="2000-5000">₹2,000 - ₹5,000</option>
                    <option value="5000-10000">₹5,000 - ₹10,000</option>
                    <option value="10000-25000">₹10,000 - ₹25,000</option>
                    <option value="above-25000">Above ₹25,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-chocolate-800 mb-2">
                    Preferred Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-chocolate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </motion.div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-chocolate-800 mb-2">
                Your Message <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <HiOutlineChat className="absolute left-4 top-4 w-5 h-5 text-chocolate-400" />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder={
                    formData.type === 'commission'
                      ? 'Describe your custom artwork idea — size, style, theme, colors, inspiration...'
                      : formData.type === 'workshop'
                      ? 'Which workshop are you interested in? Any specific dates or questions?'
                      : 'Tell us about your enquiry...'
                  }
                  className="w-full pl-12 pr-4 py-3 border border-chocolate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending...' : 'Send Enquiry 🚀'}
            </motion.button>

            <p className="text-center text-xs text-chocolate-500">
              We respect your privacy. Your information will only be used to
              respond to your enquiry.
            </p>
          </form>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <a
            href="mailto:therawcanvase@gmail.com"
            className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <HiOutlineEnvelope className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-chocolate-500 font-medium">Email Us</p>
              <p className="text-chocolate-900 font-semibold">
                therawcanvase@gmail.com
              </p>
            </div>
          </a>

          <a
            href="tel:+918291271695"
            className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition"
          >
            <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
              <HiOutlinePhone className="w-6 h-6 text-gold-600" />
            </div>
            <div>
              <p className="text-xs text-chocolate-500 font-medium">Call Us</p>
              <p className="text-chocolate-900 font-semibold">
                +91 8291271695
              </p>
            </div>
          </a>
        </motion.div>
      </section>
    </motion.div>
  )
}

export default Commissions