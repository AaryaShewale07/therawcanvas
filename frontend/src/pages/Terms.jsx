import { motion } from 'framer-motion'
import { HiOutlineDocumentText } from 'react-icons/hi'
import PageHeader from '../components/common/PageHeader'

const Terms = () => {
  return (
    <div className="min-h-screen bg-cream-50">
      <PageHeader
        title="Terms of Service"
        subtitle="The rules of using our platform"
        icon={HiOutlineDocumentText}
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
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-chocolate-700 leading-relaxed">
              By accessing or using TheRawCanvasStudio website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">2. Account Registration</h2>
            <p className="text-chocolate-700 leading-relaxed">
              You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your password and account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">3. Orders & Payment</h2>
            <ul className="space-y-2 text-chocolate-700">
              <li>• All prices are in INR and inclusive of applicable taxes</li>
              <li>• Payment is required at the time of placing the order</li>
              <li>• We reserve the right to refuse or cancel any order</li>
              <li>• Customized orders cannot be cancelled once production begins</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">4. Product Information</h2>
            <p className="text-chocolate-700 leading-relaxed">
              We strive to display accurate product images and descriptions. However, slight variations may occur due to the handcrafted nature of our products. Colors may vary based on screen settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">5. Intellectual Property</h2>
            <p className="text-chocolate-700 leading-relaxed">
              All content on this website (text, images, logos, designs) is owned by TheRawCanvasStudio and protected by copyright laws. Unauthorized use is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">6. User Conduct</h2>
            <p className="text-chocolate-700 leading-relaxed">You agree not to:</p>
            <ul className="space-y-2 text-chocolate-700 mt-2">
              <li>• Use our service for illegal purposes</li>
              <li>• Attempt to hack or disrupt the website</li>
              <li>• Submit false information</li>
              <li>• Resell our products without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">7. Limitation of Liability</h2>
            <p className="text-chocolate-700 leading-relaxed">
              TheRawCanvasStudio is not liable for any indirect, incidental, or consequential damages arising from the use of our products or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">8. Workshop Terms</h2>
            <ul className="space-y-2 text-chocolate-700">
              <li>• Workshop fees are non-refundable within 48 hours of the event</li>
              <li>• Participants must follow safety guidelines</li>
              <li>• We reserve the right to cancel workshops with full refund</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">9. Changes to Terms</h2>
            <p className="text-chocolate-700 leading-relaxed">
              We may update these terms at any time. Continued use of the website after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-chocolate-900 mb-3">10. Contact</h2>
            <p className="text-chocolate-700 leading-relaxed">
              For any questions about these Terms, contact us at{' '}
              <a href="mailto:therawcanvase@gmail.com" className="text-gold-600 font-semibold">therawcanvase@gmail.com</a>.
            </p>
          </section>
        </motion.div>
      </section>
    </div>
  )
}

export default Terms