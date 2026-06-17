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
          <p className="text-chocolate-600 text-sm">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">
              1. Information We Collect
            </h2>
            <p className="text-chocolate-700 leading-relaxed">
              We collect information you provide directly, including your name,
              email address, phone number, shipping address, billing address,
              payment confirmation details, order history, and preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">
              2. Additional Information Collection
            </h2>
            <p className="text-chocolate-700 leading-relaxed">
              We may collect account information, shopping preferences,
              wishlist items, customer support communications, browser
              information, device details, IP addresses, and website usage
              data to improve our services and customer experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">
              3. How We Use Your Information
            </h2>
            <ul className="space-y-2 text-chocolate-700">
              <li>• Process and deliver your orders</li>
              <li>• Send order confirmations and updates</li>
              <li>• Improve our products and services</li>
              <li>• Respond to customer support requests</li>
              <li>• Send promotional emails (you can unsubscribe anytime)</li>
              <li>• Maintain website security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">
              4. Payment Security
            </h2>
            <p className="text-chocolate-700 leading-relaxed">
              All payments are processed securely through Razorpay using
              industry-standard encryption. We never store your credit card
              or banking information on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">
              5. Security & Fraud Prevention
            </h2>
            <p className="text-chocolate-700 leading-relaxed">
              We use your information to detect, investigate, and prevent
              fraudulent, illegal, or malicious activities. We also use it to
              maintain the security and integrity of our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">
              6. Data Sharing
            </h2>
            <p className="text-chocolate-700 leading-relaxed mb-2">
              We never sell your personal information. We may share information
              only with:
            </p>
            <ul className="space-y-2 text-chocolate-700">
              <li>• Shipping partners for order delivery</li>
              <li>• Payment processors such as Razorpay</li>
              <li>• Service providers and IT partners</li>
              <li>• Analytics providers to improve our services</li>
              <li>• Marketing partners for promotional communications</li>
              <li>• Government or regulatory authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">
              7. Cookies
            </h2>
            <p className="text-chocolate-700 leading-relaxed">
              We use cookies to remember your preferences, keep you logged in,
              analyze website traffic, and improve your browsing experience.
              You may disable cookies through your browser settings, though
              certain website features may not function correctly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">
              8. Third-Party Links
            </h2>
            <p className="text-chocolate-700 leading-relaxed">
              Our website may contain links to third-party websites. We are not
              responsible for the privacy practices, content, or security of
              external websites. We encourage users to review the privacy
              policies of any website they visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">
              9. Children's Privacy
            </h2>
            <p className="text-chocolate-700 leading-relaxed">
              Our services are not intended for children under the age of 16
              without parental or guardian consent. We do not knowingly collect
              personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">
              10. Your Rights
            </h2>
            <ul className="space-y-2 text-chocolate-700">
              <li>• Access your personal information</li>
              <li>• Correct inaccurate information</li>
              <li>• Request deletion of your information</li>
              <li>• Opt out of promotional communications</li>
              <li>• Request information regarding data usage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-chocolate-700 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect
              operational, legal, or regulatory changes. Any updates will be
              posted on this page along with the revised Last Updated date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">
              12. Governing Law
            </h2>
            <p className="text-chocolate-700 leading-relaxed">
              This Privacy Policy shall be governed by and interpreted in
              accordance with the laws of India. Any disputes arising from the
              use of this website shall be subject to the jurisdiction of the
              courts of Mumbai, Maharashtra.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">
              13. Contact Us
            </h2>
            <p className="text-chocolate-700 leading-relaxed">
              For privacy concerns, contact us at{' '}
              <a
                href="mailto:therawcanvase@gmail.com"
                className="text-gold-600 font-semibold"
              >
                therawcanvase@gmail.com
              </a>{' '}
              or call{' '}
              <a
                href="tel:+918291271695"
                className="text-gold-600 font-semibold"
              >
                +91 8291271695
              </a>
              .
            </p>
          </section>
        </motion.div>
      </section>
    </div>
  )
}

export default Privacy
