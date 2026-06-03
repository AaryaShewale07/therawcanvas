import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiHeart,
  HiOutlineHeart,
  HiOutlineShoppingBag,
  HiOutlineArrowLeft,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineShare,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineRefresh,
  HiPlus,
  HiMinus,
} from 'react-icons/hi'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import toast from 'react-hot-toast'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`/posts/${id}`)
        setProduct(data.data || data.post || data)
        window.scrollTo(0, 0)
      } catch (err) {
        console.error(err)
        toast.error('Product not found')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="w-16 h-16 border-4 border-chocolate-200 border-t-chocolate-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-24">
        <h2 className="text-3xl font-bold text-chocolate-900 mb-4">Product not found</h2>
        <Link to="/" className="bg-chocolate-700 text-white px-6 py-3 rounded-full">
          Go Home
        </Link>
      </div>
    )
  }

  const inWish = isInWishlist?.(product._id)
  const images = product.images || []
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleAddToCart = async () => {
    setAdding(true)
    const ok = await addToCart(product._id, quantity)
    setAdding(false)
  }

  const handleBuyNow = async () => {
    const ok = await addToCart(product._id, quantity)
    if (ok) navigate('/checkout')
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.shortDescription || product.description,
          url,
        })
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    }
  }

  const nextImage = () => setSelectedImage((p) => (p + 1) % images.length)
  const prevImage = () => setSelectedImage((p) => (p - 1 + images.length) % images.length)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-cream-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-chocolate-700 hover:text-chocolate-900 mb-6 group"
        >
          <HiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>

        {/* Main Grid: Image Gallery + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* LEFT — Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-cream-100 rounded-3xl overflow-hidden shadow-elegant group">
              {images.length > 0 ? (
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={images[selectedImage]?.url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-chocolate-300">
                  No image
                </div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition hover:scale-110"
                  >
                    <HiOutlineChevronLeft className="w-6 h-6 text-chocolate-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition hover:scale-110"
                  >
                    <HiOutlineChevronRight className="w-6 h-6 text-chocolate-700" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="px-4 py-1.5 bg-gold-500 text-chocolate-900 text-xs font-bold rounded-full shadow-md">
                    NEW
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-4 py-1.5 bg-primary-500 text-white text-xs font-bold rounded-full shadow-md">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="absolute top-4 right-4 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
              >
                <HiOutlineShare className="w-5 h-5 text-chocolate-700" />
              </button>

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                  {selectedImage + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Horizontal Thumbnail Scroller */}
            {images.length > 1 && (
              <div className="relative">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-4 transition snap-start ${
                        selectedImage === idx
                          ? 'border-chocolate-700 shadow-lg scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={`${product.title} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Product Info */}
          <div className="space-y-6">
            {/* Category Tag */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-chocolate-500 uppercase tracking-wider">
                {product.category}
              </span>
              {product.subCategory && (
                <>
                  <span className="text-chocolate-300">/</span>
                  <span className="text-sm text-chocolate-500">{product.subCategory}</span>
                </>
              )}
            </div>

            {/* Title + Wishlist */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-chocolate-900 leading-tight">
                {product.title}
              </h1>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleWishlist(product._id)}
                className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition ${
                  inWish
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-red-500 hover:bg-red-50'
                }`}
              >
                {inWish ? (
                  <HiHeart className="w-7 h-7" />
                ) : (
                  <HiOutlineHeart className="w-7 h-7" />
                )}
              </motion.button>
            </div>

            {/* Artist */}
            {product.artist && (
              <p className="text-lg text-chocolate-600">
                by <span className="font-semibold text-chocolate-800">{product.artist}</span>
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 py-2">
              <span className="text-4xl font-bold text-chocolate-900">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-2xl text-chocolate-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                  <span className="text-lg font-semibold text-green-600">
                    Save ₹{product.originalPrice - product.price}
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${product.inStock !== false ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`font-medium ${product.inStock !== false ? 'text-green-700' : 'text-red-600'}`}>
                {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
              </span>
              {product.stock > 0 && product.stock < 10 && (
                <span className="text-sm text-orange-600">
                  • Only {product.stock} left!
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-lg text-chocolate-600 leading-relaxed border-l-4 border-gold-400 pl-4 italic">
                {product.shortDescription}
              </p>
            )}

            {/* Full Description */}
            <div>
              <h3 className="text-lg font-bold text-chocolate-900 mb-2">Description</h3>
              <p className="text-chocolate-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-cream-100 text-chocolate-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-2">
              <span className="font-semibold text-chocolate-900">Quantity:</span>
              <div className="flex items-center gap-1 bg-cream-100 rounded-full p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-white hover:bg-chocolate-100 flex items-center justify-center transition shadow-sm"
                >
                  <HiMinus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-lg text-chocolate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-white hover:bg-chocolate-100 flex items-center justify-center transition shadow-sm"
                >
                  <HiPlus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-chocolate-500 text-sm">
                Total: <span className="font-bold text-chocolate-900">₹{product.price * quantity}</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={adding || product.inStock === false}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-chocolate-700 text-chocolate-700 font-bold rounded-full hover:bg-chocolate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiOutlineShoppingBag className="w-5 h-5" />
                {adding ? 'Adding...' : 'Add to Cart'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={product.inStock === false}
                className="px-6 py-4 bg-gradient-to-r from-chocolate-700 to-chocolate-900 text-white font-bold rounded-full hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </motion.button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-cream-200">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-cream-100 rounded-full flex items-center justify-center">
                  <HiOutlineTruck className="w-6 h-6 text-chocolate-700" />
                </div>
                <span className="text-xs text-chocolate-600 font-medium">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-cream-100 rounded-full flex items-center justify-center">
                  <HiOutlineShieldCheck className="w-6 h-6 text-chocolate-700" />
                </div>
                <span className="text-xs text-chocolate-600 font-medium">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-cream-100 rounded-full flex items-center justify-center">
                  <HiOutlineRefresh className="w-6 h-6 text-chocolate-700" />
                </div>
                <span className="text-xs text-chocolate-600 font-medium">Easy Returns</span>
              </div>
            </div>

            {/* Customization Note */}
            {product.requiresCustomization && (
              <div className="bg-gold-50 border-l-4 border-gold-500 p-4 rounded-r-xl">
                <p className="text-sm text-chocolate-700">
                  <span className="font-bold">📸 Customization Required:</span>{' '}
                  {product.customizationInstructions}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductDetail