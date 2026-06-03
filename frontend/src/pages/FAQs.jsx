import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineChevronDown, HiOutlineQuestionMarkCircle } from 'react-icons/hi'
import PageHeader from '../components/common/PageHeader'

const FAQs = () => {
  const [openIdx, setOpenIdx] = useState(0)

  const faqs = [
    { q: 'How long does delivery take?', a: 'Standard delivery takes 3-5 business days within India. Custom orders may take 7-10 days depending on complexity.' },
    { q: 'Do you ship internationally?', a: 'Currently, we ship only within India. We\'re working on expanding our shipping zones soon!' },
    { q: 'How do I customize my order?', a: 'For gifting and customized items, after placing your order, you\'ll receive a WhatsApp link to send us your photos and customization details along with your Order ID.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major payment methods through Razorpay — Credit/Debit Cards, UPI, Net Banking, and Wallets.' },
    { q: 'Can I cancel my order?', a: 'Yes! You can cancel your order before it\'s shipped. Go to "My Orders" and click "Cancel Order". Refunds are processed within 5-7 business days.' },
    { q: 'Do you offer workshops?', a: 'Yes! We offer art and chocolate-making workshops. Check our Workshops page for upcoming sessions.' },
    { q: 'How are chocolates packaged?', a: 'All chocolates are packed in food-grade boxes with thermal protection and shipped via insulated packaging for hot weather.' },
    { q: 'Can I gift this to someone else?', a: 'Absolutely! Add the recipient\'s address as the shipping address. You can also add a personalized note.' },
    { q: 'What\'s your return policy?', a: 'Due to the perishable nature of chocolates, we don\'t accept returns. For damaged or incorrect items, contact us within 24 hours of delivery.' },
    { q: 'How can I contact you for bulk orders?', a: 'For bulk or corporate orders, WhatsApp us at +91 8291271695 or email therawcanvase@gmail.com. We offer special pricing!' },
  ]

  return (
    <div className="min-h-screen bg-cream-50">
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Got questions? We've got answers!"
        icon={HiOutlineQuestionMarkCircle}
      />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl shadow-elegant overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-cream-50 transition"
              >
                <span className="font-bold text-chocolate-900 pr-4">{faq.q}</span>
                <motion.div animate={{ rotate: openIdx === idx ? 180 : 0 }}>
                  <HiOutlineChevronDown className="w-5 h-5 text-chocolate-600 flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="p-5 pt-0 text-chocolate-600 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center bg-gradient-to-r from-chocolate-700 to-chocolate-900 rounded-3xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
          <p className="text-cream-200 mb-4">We're here to help!</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:therawcanvase@gmail.com" className="bg-white text-chocolate-900 px-6 py-3 rounded-full font-bold hover:bg-cream-100 transition">
              📧 Email Us
            </a>
            <a href="https://wa.me/918291271695" target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white px-6 py-3 rounded-full font-bold hover:bg-green-600 transition">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FAQs