import { motion } from 'framer-motion'
import {
  HiOutlineTruck,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineCurrencyRupee,
  HiOutlineGlobe,
  HiOutlineMail,
} from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import PageHeader from '../components/common/PageHeader'

const Shipping = () => {
  const policies = [
    {
      icon: HiOutlineClock,
      title: 'Processing Time',
      text: 'Orders are processed within 2-3 business days. Customized & personalized orders may take 5-7 days.',
    },
    {
      icon: HiOutlineTruck,
      title: 'Delivery Within India',
      text: 'Standard delivery takes approximately 7 days (1 week) across most parts of India, depending on your location.',
    },
    {
      icon: HiOutlineGlobe,
      title: 'Remote / Far Locations',
      text: 'For remote areas like J&K, North East, and Andaman, delivery may take up to 2 weeks (14 days).',
    },
    {
      icon: HiOutlineLocationMarker,
      title: 'Delivery Areas',
      text: 'We currently ship across all of India. International shipping coming soon!',
    },
  ]

  const shippingRates = [
    { zone: '📍 Mumbai (Local)', rate: '₹150', time: '3-5 days', color: 'bg-green-50 border-green-500' },
    { zone: '📍 Maharashtra', rate: '₹200', time: '5-7 days', color: 'bg-blue-50 border-blue-500' },
    { zone: '📍 Rest of India', rate: '₹250', time: '7-10 days', color: 'bg-purple-50 border-purple-500' },
    { zone: '📍 Remote Areas', rate: '₹350', time: '10-14 days', color: 'bg-orange-50 border-orange-500' },
  ]

  return (
    <div className="min-h-screen bg-cream-50">
      <PageHeader
        title="Shipping Policy"
        subtitle="Everything you need to know about our shipping"
        icon={HiOutlineTruck}
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* FREE Shipping Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-6 mb-8 text-white text-center shadow-lg"
        >
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">FREE Shipping on Orders Above ₹2000!</h2>
          <p className="text-green-50">Add a little more to your cart and save on delivery</p>
        </motion.div>

        {/* Policy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {policies.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-elegant"
            >
              <div className="w-14 h-14 bg-gold-100 rounded-2xl flex items-center justify-center mb-4">
                <p.icon className="w-7 h-7 text-gold-600" />
              </div>
              <h3 className="text-xl font-bold text-chocolate-900 mb-2">{p.title}</h3>
              <p className="text-chocolate-600">{p.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Shipping Rates Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 shadow-elegant mb-8"
        >
          <h2 className="text-2xl font-bold text-chocolate-900 mb-2 flex items-center gap-2">
            <HiOutlineCurrencyRupee className="w-7 h-7 text-gold-600" />
            Shipping Rates & Delivery Time
          </h2>
          <p className="text-chocolate-600 mb-6">
            Shipping cost depends on your delivery location:
          </p>

          <div className="space-y-3">
            {shippingRates.map((rate, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border-l-4 ${rate.color}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-chocolate-900 text-lg">{rate.zone}</p>
                  <p className="text-sm text-chocolate-600">⏱️ Delivery: {rate.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-chocolate-900">{rate.rate}</p>
                  <p className="text-xs text-green-600 font-semibold">FREE above ₹2000</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gold-50 border-l-4 border-gold-500 rounded-r-xl">
            <p className="text-sm text-chocolate-700">
              <strong>💡 Pro Tip:</strong> Orders above ₹2000 get FREE shipping to ALL locations across India — including remote areas!
            </p>
          </div>
        </motion.div>

        {/* Delivery Timeline Visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 shadow-elegant mb-8"
        >
          <h2 className="text-2xl font-bold text-chocolate-900 mb-6">📅 What to Expect</h2>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <p className="font-bold text-chocolate-900">Order Placed</p>
                <p className="text-sm text-chocolate-600">You'll receive an order confirmation email immediately.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <p className="font-bold text-chocolate-900">Processing (2-3 days)</p>
                <p className="text-sm text-chocolate-600">We carefully prepare and pack your order with love.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <p className="font-bold text-chocolate-900">Shipped 🚚</p>
                <p className="text-sm text-chocolate-600">You'll receive a tracking link via email once dispatched.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              <div>
                <p className="font-bold text-chocolate-900">Delivered 🎉</p>
                <p className="text-sm text-chocolate-600">
                  <strong>India:</strong> ~7 days (1 week) | <strong>Remote areas:</strong> ~14 days (2 weeks)
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Important Information */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 shadow-elegant mb-8"
        >
          <h2 className="text-2xl font-bold text-chocolate-900 mb-4">📦 Important Information</h2>
          <ul className="space-y-3 text-chocolate-700">
            <li className="flex gap-3">
              <span className="text-gold-600 font-bold">•</span>
              <span>All chocolates are shipped in <strong>insulated, temperature-controlled packaging</strong> to ensure freshness during transit.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold-600 font-bold">•</span>
              <span>During <strong>hot weather (April-June)</strong>, we recommend ordering early or choosing cooler delivery windows for chocolate orders.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold-600 font-bold">•</span>
              <span>You will receive a <strong>tracking link via email</strong> once your order is shipped.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold-600 font-bold">•</span>
              <span>Someone must be <strong>available at the delivery address</strong> to receive the package.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold-600 font-bold">•</span>
              <span>Delivery times are <strong>approximate</strong> and may vary due to courier delays, weather, or public holidays.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold-600 font-bold">•</span>
              <span>If undeliverable, the package will be returned. <strong>Re-shipping charges may apply.</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="text-gold-600 font-bold">•</span>
              <span>Customized orders (gifting, personalized frames) require <strong>extra processing time</strong> (5-7 days) before shipping.</span>
            </li>
          </ul>
        </motion.div>

        {/* Contact Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-chocolate-700 to-chocolate-900 rounded-3xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-3">Questions about your shipment? 📬</h3>
          <p className="text-cream-200 mb-6">We're here to help you track your order and answer any queries.</p>

          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://wa.me/918291271695?text=Hi%2C%20I%20have%20a%20shipping%20query"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-bold hover:bg-green-600 transition shadow-lg"
            >
              <FaWhatsapp className="w-5 h-5" />
              WhatsApp Us
            </a>
            <a
              href="mailto:therawcanvase@gmail.com?subject=Shipping Query"
              className="flex items-center gap-2 bg-white text-chocolate-900 px-6 py-3 rounded-full font-bold hover:bg-cream-100 transition"
            >
              <HiOutlineMail className="w-5 h-5" />
              therawcanvase@gmail.com
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

export default Shipping