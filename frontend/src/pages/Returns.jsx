import { motion } from 'framer-motion'
import { HiOutlineRefresh, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineMail, HiOutlineVideoCamera } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import PageHeader from '../components/common/PageHeader'

const Returns = () => {
  return (
    <div className="min-h-screen bg-cream-50">
      <PageHeader
        title="Returns & Refunds"
        subtitle="Our commitment to your satisfaction"
        icon={HiOutlineRefresh}
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 shadow-elegant mb-6"
        >
          <h2 className="text-2xl font-bold text-chocolate-900 mb-4">Our Return Policy</h2>
          <p className="text-chocolate-700 leading-relaxed mb-4">
            At TheRawCanvasStudio, every piece is handcrafted with love. Due to the nature of our products
            (especially chocolates and customized items), we have a specific return policy to ensure quality and freshness.
          </p>
        </motion.div>

        {/* ⭐ MANDATORY VIDEO PROOF BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-6 mb-6 text-white shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 bg-white rounded-full flex items-center justify-center">
              <HiOutlineVideoCamera className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">📹 MANDATORY: Unboxing Video Required</h3>
              <p className="text-white/95 leading-relaxed">
                For any refund request, you <strong>MUST</strong> provide a <strong>clear, uncut video</strong> of you opening the package.
                The video should start <strong>BEFORE</strong> opening the box and show the entire unboxing process in one continuous shot.
              </p>
              <p className="text-white/90 text-sm mt-2">
                ⚠️ Without an unboxing video, refund requests <strong>cannot be processed</strong>.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Eligible */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-6 shadow-elegant border-l-4 border-green-500"
          >
            <div className="flex items-center gap-3 mb-4">
              <HiOutlineCheckCircle className="w-8 h-8 text-green-500" />
              <h3 className="text-xl font-bold text-chocolate-900">Eligible for Refund</h3>
            </div>
            <p className="text-xs text-chocolate-500 mb-3 italic">
              📹 Requires unboxing video proof
            </p>
            <ul className="space-y-2 text-chocolate-700">
              <li className="flex gap-2"><span className="text-green-500">✓</span> Damaged or broken items (shown in unboxing video)</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span> Wrong items delivered (shown in unboxing video)</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span> Missing items from order (shown in unboxing video)</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span> Order not delivered within promised time</li>
              <li className="flex gap-2"><span className="text-green-500">✓</span> Quality issues visible at unboxing</li>
            </ul>
          </motion.div>

          {/* Not Eligible */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-6 shadow-elegant border-l-4 border-red-500"
          >
            <div className="flex items-center gap-3 mb-4">
              <HiOutlineXCircle className="w-8 h-8 text-red-500" />
              <h3 className="text-xl font-bold text-chocolate-900">Not Eligible</h3>
            </div>
            <ul className="space-y-2 text-chocolate-700">
              <li className="flex gap-2"><span className="text-red-500">✗</span> Requests without unboxing video</li>
              <li className="flex gap-2"><span className="text-red-500">✗</span> Customized & personalized items</li>
              <li className="flex gap-2"><span className="text-red-500">✗</span> Minor variations in color, design, or finish due to the handmade process</li>
              <li className="flex gap-2"><span className="text-red-500">✗</span> Consumed chocolates</li>
              <li className="flex gap-2"><span className="text-red-500">✗</span> Items reported after 48 hours of delivery</li>
              <li className="flex gap-2"><span className="text-red-500">✗</span> Change of mind</li>
              <li className="flex gap-2"><span className="text-red-500">✗</span> Workshop bookings (cancellation 48hr prior only)</li>
            </ul>
          </motion.div>
        </div>

        {/* How to Record Video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-blue-50 border-l-4 border-blue-500 rounded-3xl p-6 mb-6"
        >
          <h3 className="text-xl font-bold text-chocolate-900 mb-3 flex items-center gap-2">
            <HiOutlineVideoCamera className="w-6 h-6 text-blue-600" />
            How to Record a Valid Unboxing Video
          </h3>
          <ul className="space-y-2 text-chocolate-700">
            <li className="flex gap-2"><span className="text-blue-500">📹</span> Start recording <strong>BEFORE</strong> opening the package</li>
            <li className="flex gap-2"><span className="text-blue-500">📦</span> Show the sealed package clearly from all sides</li>
            <li className="flex gap-2"><span className="text-blue-500">✂️</span> Record in <strong>ONE continuous shot</strong> — no cuts or edits</li>
            <li className="flex gap-2"><span className="text-blue-500">💡</span> Ensure good lighting so issues are clearly visible</li>
            <li className="flex gap-2"><span className="text-blue-500">🔍</span> Show every item as you unbox it</li>
            <li className="flex gap-2"><span className="text-blue-500">⏱️</span> Keep the entire unboxing in the same video</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 shadow-elegant mb-6"
        >
          <h2 className="text-2xl font-bold text-chocolate-900 mb-4">📋 How to Request a Refund</h2>
          <ol className="space-y-3 text-chocolate-700">
            <li className="flex gap-3">
              <span className="font-bold text-gold-600">1.</span>
              Contact us within 48 hours of delivery with your Order ID
            </li>

            <li className="flex gap-3">
              <span className="font-bold text-gold-600">2.</span>
              Send your <strong>unboxing video</strong> and photographs clearly showing the issue
            </li>

            <li className="flex gap-3">
              <span className="font-bold text-gold-600">3.</span>
              Our team will review your request within 24–48 hours
            </li>

            <li className="flex gap-3">
              <span className="font-bold text-gold-600">4.</span>
              Depending on the issue, we may offer a repair, replacement, store credit, or refund
            </li>

            <li className="flex gap-3">
              <span className="font-bold text-gold-600">5.</span>
              Approved refunds are processed immediately and generally reflect within 5–7 business days depending on your bank
            </li>
          </ol>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 shadow-elegant mb-6"
        >
          <h2 className="text-2xl font-bold text-chocolate-900 mb-4">
            Shipping & Logistics Issues
          </h2>

          <div className="space-y-4 text-chocolate-700">
            <p>
              <strong>Delayed Deliveries:</strong> Since many of our products are
              handcrafted and made to order, delays may occasionally occur due to
              production schedules, weather conditions, artist availability, or courier
              issues. We will keep you informed and assist in tracking your shipment.
            </p>

            <p>
              <strong>Lost Shipments:</strong> If a shipment is confirmed lost in
              transit, we will coordinate with the courier partner and provide a
              replacement, store credit, or refund as appropriate.
            </p>

            <p>
              <strong>Incorrect Address:</strong> Customers are responsible for
              providing accurate shipping information. We cannot guarantee refunds or
              replacements for orders delayed or undelivered due to incorrect or
              incomplete addresses.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-amber-50 border border-amber-200 rounded-3xl p-6 mb-6"
        >
          <h3 className="font-bold text-chocolate-900 mb-2">
            Policy Discretion
          </h3>

          <p className="text-chocolate-700">
            All return, replacement, and refund requests are subject to review by
            TheRawCanvasStudio. We are committed to handling every case fairly,
            transparently, and with the best possible customer experience in mind.
          </p>
        </motion.div>

        {/* Contact for Returns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-chocolate-700 to-chocolate-900 rounded-3xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-3">Need to Return Something?</h3>
          <p className="text-cream-200 mb-2">Our team is here to help. Reach out to us:</p>
          <p className="text-cream-300 text-sm mb-6">
            💡 Tip: WhatsApp is the fastest way — send your unboxing video directly!
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://wa.me/918291271695?text=I%20need%20to%20return%20an%20order.%20My%20Order%20ID%20is%3A%20"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-bold hover:bg-green-600 transition shadow-lg"
            >
              <FaWhatsapp className="w-5 h-5" />
              WhatsApp Us
            </a>
            <a
              href="mailto:therawcanvase@gmail.com?subject=Return Request"
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

export default Returns