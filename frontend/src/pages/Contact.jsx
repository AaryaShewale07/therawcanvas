import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineMail, HiOutlinePaperAirplane, HiOutlineChat, HiOutlineCheckCircle } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import toast from 'react-hot-toast'
import PageHeader from '../components/common/PageHeader'
import api from '../utils/api'

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await api.post('/contact', form)
      
      if (data.success) {
        toast.success('✅ Message sent successfully!')
        setSent(true)
        setForm({ name: '', email: '', message: '' })
        
        // Reset success state after 5 seconds
        setTimeout(() => setSent(false), 5000)
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to send. Try WhatsApp instead!')
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/918291271695?text=${encodeURIComponent('Hi! I have a query about TheRawCanvasStudio.')}`,
      '_blank'
    )
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <PageHeader
        title="Get in Touch"
        subtitle="We'd love to hear from you"
        icon={HiOutlineChat}
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <motion.a
              href="mailto:therawcanvase@gmail.com"
              whileHover={{ y: -5 }}
              className="block bg-white rounded-2xl p-6 shadow-elegant hover:shadow-elegant-lg transition"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <HiOutlineMail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-chocolate-900 mb-1">Email Us</h3>
              <p className="text-chocolate-600 text-sm break-all">therawcanvase@gmail.com</p>
            </motion.a>

            <motion.button
              onClick={handleWhatsApp}
              whileHover={{ y: -5 }}
              className="w-full text-left bg-white rounded-2xl p-6 shadow-elegant hover:shadow-elegant-lg transition"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <FaWhatsapp className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-bold text-chocolate-900 mb-1">WhatsApp Us</h3>
              <p className="text-chocolate-600 text-sm">Chat instantly</p>
            </motion.button>

            {/* Response time info */}
            <div className="bg-gradient-to-br from-chocolate-700 to-chocolate-900 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-2">⏱️ Quick Response</h3>
              <p className="text-cream-200 text-sm">
                We typically respond within <strong>24 hours</strong>. For urgent queries, WhatsApp is the fastest way to reach us!
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-white rounded-3xl shadow-elegant p-8"
          >
            <h2 className="text-3xl font-heading font-bold text-chocolate-900 mb-2">
              Send us a message
            </h2>
            <p className="text-chocolate-600 mb-6">
              Fill out the form and we'll get back to you as soon as possible.
            </p>

            {/* Success Banner */}
            {sent && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl mb-6 flex items-center gap-3"
              >
                <HiOutlineCheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-800">Message sent! 🎉</p>
                  <p className="text-sm text-green-700">Check your inbox for a confirmation email.</p>
                </div>
              </motion.div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                  Your Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-cream-50 rounded-xl border-2 border-transparent focus:border-chocolate-500 focus:outline-none disabled:opacity-50"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-cream-50 rounded-xl border-2 border-transparent focus:border-chocolate-500 focus:outline-none disabled:opacity-50"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-cream-50 rounded-xl border-2 border-transparent focus:border-chocolate-500 focus:outline-none resize-none disabled:opacity-50"
                  placeholder="How can we help you?"
                />
                <p className="text-xs text-chocolate-500 mt-1">
                  {form.message.length} characters
                </p>
              </div>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-chocolate-700 to-chocolate-900 text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
                    Send Message
                  </>
                )}
              </motion.button>

              <p className="text-xs text-chocolate-500 text-center">
                🔒 Your information is secure and will only be used to respond to your inquiry.
              </p>
            </div>
          </motion.form>
        </div>
      </section>
    </div>
  )
}

export default Contact