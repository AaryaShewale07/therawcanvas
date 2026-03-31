import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaInstagram, 
  FaFacebookF, 
  FaPinterestP, 
  FaTwitter,
  FaHeart 
} from 'react-icons/fa'
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    shop: [
      { name: 'Art Collection', path: '/art' },
      { name: 'Chocolates', path: '/chocolates' },
      { name: 'Gift Sets', path: '/gifting' },
      { name: 'Workshops', path: '/workshops' },
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Our Story', path: '/story' },
      { name: 'Blog', path: '/blog' },
      { name: 'Careers', path: '/careers' },
    ],
    support: [
      { name: 'Contact Us', path: '/contact' },
      { name: 'FAQs', path: '/faqs' },
      { name: 'Shipping', path: '/shipping' },
      { name: 'Returns', path: '/returns' },
    ],
  }

  const socialLinks = [
    { icon: FaInstagram, href: '#', color: 'hover:text-pink-500' },
    { icon: FaFacebookF, href: '#', color: 'hover:text-blue-600' },
    { icon: FaPinterestP, href: '#', color: 'hover:text-red-600' },
    { icon: FaTwitter, href: '#', color: 'hover:text-blue-400' },
  ]

  return (
    <footer className="bg-gradient-to-b from-chocolate-800 to-chocolate-900 text-cream-100">
      {/* Newsletter Section */}
      <div className="border-b border-chocolate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-heading font-bold text-white mb-2">
                Join Our Sweet Journey
              </h3>
              <p className="text-cream-300">
                Subscribe for exclusive offers, new arrivals & artisan secrets
              </p>
            </div>
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex gap-3 w-full md:w-auto"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 md:w-72 px-5 py-3 bg-chocolate-700 border border-chocolate-600 rounded-full text-cream-100 placeholder-cream-400 focus:outline-none focus:border-gold-500 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-chocolate-900 font-semibold rounded-full hover:shadow-gold transition-all"
              >
                Subscribe
              </motion.button>
            </motion.form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 via-gold-500 to-chocolate-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-script text-2xl">A&C</span>
                </div>
                <div>
                  <h2 className="font-heading font-bold text-2xl text-white">
                    TheRawCanvasStudio
                  </h2>
                  <p className="text-sm text-cream-400 font-script">
                    Handcrafted Elegance
                  </p>
                </div>
              </div>
            </Link>
            <p className="text-cream-300 mb-6 max-w-md">
              Where artistry meets indulgence. We create handcrafted chocolates and 
              unique artwork that celebrate life's sweetest moments.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:hello@artchocolates.com" className="flex items-center gap-3 text-cream-300 hover:text-gold-400 transition-colors">
                <HiOutlineMail className="w-5 h-5" />
                hello@artchocolates.com
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-3 text-cream-300 hover:text-gold-400 transition-colors">
                <HiOutlinePhone className="w-5 h-5" />
                +1 (234) 567-890
              </a>
              <p className="flex items-center gap-3 text-cream-300">
                <HiOutlineLocationMarker className="w-5 h-5" />
                123 Artisan Lane, Creative City
              </p>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-heading font-semibold text-lg text-white mb-6">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-cream-300 hover:text-gold-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-lg text-white mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-cream-300 hover:text-gold-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-lg text-white mb-6">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-cream-300 hover:text-gold-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-chocolate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-cream-400 text-sm">
              © {currentYear} TheRawCanvasStudio. Crafted with{' '}
              <FaHeart className="inline-block w-4 h-4 text-primary-500 mx-1" />
              All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 bg-chocolate-700 rounded-full flex items-center justify-center text-cream-300 ${social.color} transition-colors`}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link to="/privacy" className="text-cream-400 hover:text-gold-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-cream-400 hover:text-gold-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer