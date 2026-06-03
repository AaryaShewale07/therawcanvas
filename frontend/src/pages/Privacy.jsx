import { motion } from 'framer-motion'
import { HiOutlineShieldCheck } from 'react-icons/hi'
import PageHeader from '../components/common/PageHeader'

const Privacy = () => {
  return (
    <div className="min-h-screen bg-cream-50">
      <PageHeader
        title="Privacy Policy"
        subtitle="Your privacy matters to us"
        icon={HiOutlineShieldCheck}
      />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 shadow-elegant space-y-6"
        >
          <p className="text-chocolate-600 text-sm">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">1. Information We Collect</h2>
            <p className="text-chocolate-700 leading-relaxed">
              We collect information you provide directly: name, email, phone number, shipping address, and payment details. We also collect order history and preferences to improve your experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">2. How We Use Your Information</h2>
            <ul className="space-y-2 text-chocolate-700">
              <li>• Process and deliver your orders</li>
              <li>• Send order confirmations and updates</li>
              <li>• Improve our products and services</li>
              <li>• Send promotional emails (you can unsubscribe anytime)</li>
              <li>• Respond to customer service requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">3. Payment Security</h2>
            <p className="text-chocolate-700 leading-relaxed">
              All payments are processed securely through Razorpay using 256-bit SSL encryption. We never store your credit card or banking information on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">4. Data Sharing</h2>
            <p className="text-chocolate-700 leading-relaxed">
              We never sell your data. We only share information with:
            </p>
            <ul className="space-y-2 text-chocolate-700 mt-2">
              <li>• Shipping partners (for order delivery)</li>
              <li>• Payment processors (Razorpay)</li>
              <li>• Legal authorities (if required by law)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">5. Cookies</h2>
            <p className="text-chocolate-700 leading-relaxed">
              We use cookies to remember your preferences, keep you logged in, and analyze website traffic. You can disable cookies in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">6. Your Rights</h2>
            <ul className="space-y-2 text-chocolate-700">
              <li>• Access your personal data</li>
              <li>• Update or correct your information</li>
              <li>• Delete your account</li>
              <li>• Opt-out of marketing emails</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">7. Contact Us</h2>
            <p className="text-chocolate-700 leading-relaxed">
              For privacy concerns, contact us at{' '}
              <a href="mailto:therawcanvase@gmail.com" className="text-gold-600 font-semibold">therawcanvase@gmail.com</a> or call{' '}
              <a href="tel:+918291271695" className="text-gold-600 font-semibold">+91 8291271695</a>.
            </p>
          </section>
        </motion.div>
      </section>
    </div>
  )
}

export default Privacy