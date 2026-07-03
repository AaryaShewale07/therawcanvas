import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineCreditCard,
  HiOutlineLocationMarker,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineCheckCircle,
  HiOutlineLockClosed,
  HiOutlineTruck,
  HiOutlineTicket,
  HiOutlineGift,
  HiOutlineSparkles,
  HiOutlineChevronDown,
} from 'react-icons/hi'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ordersAPI, couponsAPI } from '../utils/api'
import {
  calculateShipping,
  SHIPPING_CONFIG,
  amountForFreeShipping,
} from '../utils/shippingCalculator'

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isBuyNow = location.state?.buyNow === true
  const buyNowProduct = location.state?.product || null

  const checkoutItems = isBuyNow
    ? [
        {
          post: {
            _id: buyNowProduct._id,
            title: buyNowProduct.title,
            price: buyNowProduct.price,
            category: buyNowProduct.category,
            images: buyNowProduct.image ? [{ url: buyNowProduct.image }] : [],
          },
          quantity: buyNowProduct.quantity,
        },
      ]
    : cart.items || []

  const subtotal = isBuyNow ? buyNowProduct.price * buyNowProduct.quantity : cartTotal

  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.zipCode || '',
  })

  // Coupon states
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  // Available rewards
  const [myCoupons, setMyCoupons] = useState([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [isCouponsExpanded, setIsCouponsExpanded] = useState(false)

  // First-order referral discount
  const [referralDiscount, setReferralDiscount] = useState(null)

  // ⭐ Check if ALL items are workshops (no shipping needed)
  const isWorkshopOnly = useMemo(() => {
    const items = isBuyNow
      ? [{ category: buyNowProduct?.category }]
      : cart.items?.map((i) => ({ category: i.post?.category })) || []

    if (items.length === 0) return false

    return items.every((item) => {
      const cat = (item?.category || '').toString().toLowerCase().trim()
      return cat === 'workshops' || cat === 'workshop'
    })
  }, [isBuyNow, buyNowProduct, cart.items])

  // ⭐ Skip shipping for workshop-only orders
  const shippingInfo = useMemo(() => {
    if (isWorkshopOnly) {
      return {
        cost: 0,
        isValid: true,
        isFree: true,
        zone: 'workshop',
        zoneLabel: '🎓 Workshop',
      }
    }
    return calculateShipping(address.pincode, subtotal)
  }, [address.pincode, subtotal, isWorkshopOnly])

  const couponDiscountAmount = appliedCoupon?.discountAmount || 0
  const referralDiscountAmount =
    referralDiscount?.eligible && !appliedCoupon
      ? Math.round(subtotal * (referralDiscount.percentage / 100))
      : 0
  const totalDiscount = couponDiscountAmount + referralDiscountAmount
  const finalTotal = Math.max(0, subtotal - totalDiscount + shippingInfo.cost)
  const amountNeeded = amountForFreeShipping(subtotal)

  useEffect(() => {
    if (orderPlaced) return
    if (!isBuyNow && (!cart.items || cart.items.length === 0)) {
      navigate('/cart')
    }
  }, [cart, navigate, isBuyNow, orderPlaced])

  useEffect(() => {
    const checkDiscount = async () => {
      if (!user) return
      try {
        const { data } = await ordersAPI.checkReferralDiscount()
        if (data.eligible) setReferralDiscount(data)
      } catch (err) {
        console.error('Failed to check referral discount:', err)
      }
    }
    checkDiscount()
  }, [user])

  useEffect(() => {
    const fetchMyCoupons = async () => {
      if (!user) return
      setLoadingCoupons(true)
      try {
        const { data } = await couponsAPI.getMy()
        const now = new Date()

        const validCoupons = (data.data || []).filter((coupon) => {
          if (new Date(coupon.validUntil) <= now) return false
          if (!coupon.isActive) return false

          const userUsageCount = (coupon.usedBy || []).filter(
            (u) => u.user?.toString() === user._id?.toString()
          ).length
          if (userUsageCount >= (coupon.perUserLimit || 1)) return false

          if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return false

          return true
        })

        const sorted = validCoupons.sort((a, b) => {
          if (a.isReferralReward && !b.isReferralReward) return -1
          if (!a.isReferralReward && b.isReferralReward) return 1
          return new Date(a.validUntil) - new Date(b.validUntil)
        })

        setMyCoupons(sorted)
      } catch (err) {
        console.error('Failed to fetch coupons:', err)
      } finally {
        setLoadingCoupons(false)
      }
    }
    fetchMyCoupons()
  }, [user])

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value })
  }

  const applyCoupon = async (codeToApply) => {
    const code = codeToApply || couponCode
    if (!code.trim()) return toast.error('Enter a coupon code')
    setApplyingCoupon(true)
    try {
      const { data } = await couponsAPI.validate(code, subtotal)
      setAppliedCoupon(data.data)
      setCouponCode(code.toUpperCase())
      toast.success(`✅ Coupon applied — ₹${data.data.discountAmount} off!`)

      if (referralDiscount?.eligible) {
        toast('ℹ️ Referral discount removed (coupon takes priority)', {
          icon: '💡',
          duration: 4000,
        })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon')
      setAppliedCoupon(null)
    } finally {
      setApplyingCoupon(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    toast.success('Coupon removed')
    if (referralDiscount?.eligible) {
      setTimeout(() => {
        toast.success(`🎁 ${referralDiscount.percentage}% referral discount is back!`)
      }, 500)
    }
  }

  // ⭐ Validate — workshops don't need full address
  const validateAddress = () => {
    if (isWorkshopOnly) {
      if (!address.name || !address.phone) {
        toast.error('Please provide name and phone number')
        return false
      }
      if (address.phone.length < 10) {
        toast.error('Invalid phone number')
        return false
      }
      return true
    }

    if (
      !address.name ||
      !address.phone ||
      !address.street ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      toast.error('Please fill all address fields')
      return false
    }
    if (address.phone.length < 10) {
      toast.error('Invalid phone number')
      return false
    }
    if (address.pincode.length !== 6) {
      toast.error('Invalid pincode')
      return false
    }
    if (!shippingInfo.isValid) {
      toast.error('We cannot deliver to this pincode')
      return false
    }
    return true
  }

  const placeOrder = async (razorpayData = {}) => {
    const items = isBuyNow
      ? [{ postId: buyNowProduct._id, quantity: buyNowProduct.quantity }]
      : cart.items.map((i) => ({ postId: i.post._id, quantity: i.quantity }))

    const { data } = await ordersAPI.checkout({
      items,
      shippingAddress: address,
      paymentMethod: 'RAZORPAY',
      couponCode: appliedCoupon?.code,
      ...razorpayData,
    })

    if (data.success) {
      setOrderPlaced(true)
      toast.success('Order placed successfully! 🎉')
      navigate(`/order-success/${data.order._id}`, { replace: true })

      if (!isBuyNow) {
        setTimeout(() => {
          clearCart()
        }, 1000)
      }
    }
  }

  const handleRazorpayPayment = async () => {
    if (!validateAddress()) return
    setLoading(true)

    try {
      const { data } = await ordersAPI.createRazorpayOrder(finalTotal)
      if (!data.success) throw new Error('Failed to create payment')

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'TheRawCanvasStudio',
        description: `Order Payment${appliedCoupon ? ` (${appliedCoupon.code} applied)` : ''}`,
        order_id: data.orderId,
        prefill: {
          name: address.name,
          email: user.email,
          contact: address.phone,
        },
        theme: { color: '#7a4520' },
        handler: async (response) => {
          try {
            await placeOrder({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
          } catch (err) {
            console.error('Payment verification error:', err)
            toast.error('Payment verification failed')
          }
          setLoading(false)
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            toast.error('Payment cancelled')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Payment failed')
      setLoading(false)
    }
  }

  const isCouponApplicable = (coupon) => subtotal >= (coupon.minOrderAmount || 0)

  const formatExpiry = (date) => {
    const d = new Date(date)
    const now = new Date()
    const daysLeft = Math.ceil((d - now) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 7) return `⏰ Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
    return `Valid till ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }

  const calculateCouponDiscount = (coupon) => {
    let discount = 0
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
    } else {
      discount = coupon.discountValue
    }
    return Math.min(discount, subtotal)
  }

  if (!orderPlaced && !isBuyNow && (!cart.items || cart.items.length === 0)) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-cream-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <h1 className="text-4xl font-heading font-bold text-chocolate-900">
            Checkout
          </h1>
          {isBuyNow && (
            <span className="px-4 py-1.5 bg-primary-100 text-primary-700 text-sm font-bold rounded-full border border-primary-300">
              ⚡ Buy Now
            </span>
          )}
          {isWorkshopOnly && (
            <span className="px-4 py-1.5 bg-purple-100 text-purple-700 text-sm font-bold rounded-full border border-purple-300">
              🎓 Workshop Booking
            </span>
          )}
        </div>

        {/* First-order referral discount banner */}
        {referralDiscount?.eligible && !appliedCoupon && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-primary-500 via-primary-600 to-gold-500 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden"
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <HiOutlineGift className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-0.5">
                  🎁 Welcome Bonus Applied!
                </h3>
                <p className="text-sm text-white/90">
                  {referralDiscount.message ||
                    `You get ${referralDiscount.percentage}% off on your first order as a referred user!`}
                </p>
              </div>
              <div className="hidden sm:block bg-white/20 backdrop-blur rounded-xl px-4 py-2">
                <p className="text-xs text-white/70">You save</p>
                <p className="text-xl font-black">₹{referralDiscountAmount}</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT — Address + Payment + Rewards */}
          <div className="lg:col-span-2 space-y-6">
            {/* COLLAPSIBLE REWARD COUPONS */}
            {myCoupons.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-elegant overflow-hidden"
              >
                <button
                  onClick={() => setIsCouponsExpanded(!isCouponsExpanded)}
                  className="w-full p-6 flex items-center justify-between hover:bg-cream-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-gold-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <HiOutlineSparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-chocolate-900 flex items-center gap-2 flex-wrap">
                        Your Reward Coupons
                        <span className="px-2.5 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-bold">
                          {myCoupons.length}
                        </span>
                      </h2>
                      <p className="text-sm text-chocolate-500 mt-0.5 truncate">
                        {appliedCoupon
                          ? `✅ ${appliedCoupon.code} applied · Saving ₹${couponDiscountAmount}`
                          : `Click to view & apply your earned rewards`}
                      </p>
                    </div>
                  </div>

                  <motion.div
                    animate={{ rotate: isCouponsExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-10 h-10 bg-cream-100 rounded-full flex items-center justify-center flex-shrink-0 ml-3 group-hover:bg-cream-200 transition-colors"
                  >
                    <HiOutlineChevronDown className="w-5 h-5 text-chocolate-700" strokeWidth={3} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isCouponsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 border-t border-cream-100">
                        <p className="text-sm text-chocolate-500 my-4 flex items-center gap-2">
                          💡 Click any coupon below to apply it instantly!
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {myCoupons.map((coupon) => {
                            const isApplied = appliedCoupon?.code === coupon.code
                            const isApplicable = isCouponApplicable(coupon)
                            const previewDiscount = calculateCouponDiscount(coupon)

                            return (
                              <motion.div
                                key={coupon._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
                                  isApplied
                                    ? 'border-green-500 bg-green-50'
                                    : isApplicable
                                    ? 'border-primary-200 bg-gradient-to-br from-cream-50 to-white hover:border-primary-400 hover:shadow-md cursor-pointer'
                                    : 'border-cream-200 bg-cream-50 opacity-60'
                                }`}
                                onClick={() => {
                                  if (!isApplied && isApplicable) applyCoupon(coupon.code)
                                }}
                              >
                                {coupon.isReferralReward && (
                                  <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-gold-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                    🎁 REFERRAL
                                  </div>
                                )}

                                {isApplied && (
                                  <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                                    <HiOutlineCheckCircle className="w-4 h-4" />
                                  </div>
                                )}

                                <div className="p-4">
                                  <div className="flex items-start justify-between mb-2 mt-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-mono font-black text-lg text-chocolate-900 tracking-wider truncate">
                                        {coupon.code}
                                      </p>
                                      <p className="text-xs text-chocolate-500 mt-0.5 line-clamp-1">
                                        {coupon.description || 'Discount coupon'}
                                      </p>
                                    </div>
                                    <div className="ml-2 text-right flex-shrink-0">
                                      <p className="text-2xl font-black text-primary-600 leading-none">
                                        {coupon.discountType === 'flat'
                                          ? `₹${coupon.discountValue}`
                                          : `${coupon.discountValue}%`}
                                      </p>
                                      <p className="text-[10px] text-chocolate-400 font-semibold">
                                        OFF
                                      </p>
                                    </div>
                                  </div>

                                  <div className="pt-3 mt-3 border-t border-dashed border-cream-300 space-y-1">
                                    {coupon.minOrderAmount > 0 && (
                                      <p
                                        className={`text-xs ${
                                          isApplicable
                                            ? 'text-chocolate-600'
                                            : 'text-red-600 font-semibold'
                                        }`}
                                      >
                                        {isApplicable ? '✓' : '✗'} Min order ₹
                                        {coupon.minOrderAmount}
                                        {!isApplicable &&
                                          ` (add ₹${coupon.minOrderAmount - subtotal})`}
                                      </p>
                                    )}
                                    <p className="text-xs text-chocolate-500">
                                      {formatExpiry(coupon.validUntil)}
                                    </p>
                                    {isApplicable && !isApplied && (
                                      <p className="text-xs text-green-600 font-semibold mt-1">
                                        You'll save ₹{Math.round(previewDiscount)}!
                                      </p>
                                    )}
                                  </div>

                                  {isApplied ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        removeCoupon()
                                      }}
                                      className="w-full mt-3 py-2 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition"
                                    >
                                      Remove Coupon
                                    </button>
                                  ) : isApplicable ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        applyCoupon(coupon.code)
                                      }}
                                      disabled={applyingCoupon}
                                      className="w-full mt-3 py-2 bg-chocolate-800 text-white text-xs font-bold rounded-lg hover:bg-chocolate-700 transition disabled:opacity-50"
                                    >
                                      {applyingCoupon ? 'Applying...' : 'Apply Coupon'}
                                    </button>
                                  ) : (
                                    <button
                                      disabled
                                      className="w-full mt-3 py-2 bg-cream-200 text-chocolate-400 text-xs font-bold rounded-lg cursor-not-allowed"
                                    >
                                      Not Eligible Yet
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Address / Contact Details */}
            <div className="bg-white rounded-3xl shadow-elegant p-6">
              <h2 className="text-2xl font-bold text-chocolate-900 mb-4 flex items-center gap-2">
                <HiOutlineLocationMarker className="w-6 h-6" />
                {isWorkshopOnly ? 'Contact Details' : 'Shipping Address'}
              </h2>

              {isWorkshopOnly && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
                    <input
                      name="name"
                      value={address.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-cream-50 rounded-xl border-2 border-transparent focus:border-chocolate-500 focus:outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
                    <input
                      name="phone"
                      type="tel"
                      value={address.phone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-cream-50 rounded-xl border-2 border-transparent focus:border-chocolate-500 focus:outline-none"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                {/* ⭐ Address fields only shown for non-workshop orders */}
                {!isWorkshopOnly && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                        Street Address
                      </label>
                      <input
                        name="street"
                        value={address.street}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-cream-50 rounded-xl border-2 border-transparent focus:border-chocolate-500 focus:outline-none"
                        placeholder="123 Main Street, Apt 4B"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                        City
                      </label>
                      <input
                        name="city"
                        value={address.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-cream-50 rounded-xl border-2 border-transparent focus:border-chocolate-500 focus:outline-none"
                        placeholder="Mumbai"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                        State
                      </label>
                      <input
                        name="state"
                        value={address.state}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-cream-50 rounded-xl border-2 border-transparent focus:border-chocolate-500 focus:outline-none"
                        placeholder="Maharashtra"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-chocolate-700 mb-2">
                        Pincode
                        {shippingInfo.zoneLabel && (
                          <span className="ml-2 text-xs font-bold text-green-600">
                            ✓ {shippingInfo.zoneLabel}
                          </span>
                        )}
                      </label>
                      <input
                        name="pincode"
                        value={address.pincode}
                        onChange={handleChange}
                        maxLength={6}
                        className={`w-full px-4 py-3 bg-cream-50 rounded-xl border-2 focus:outline-none transition ${
                          address.pincode.length === 6 && shippingInfo.isValid
                            ? 'border-green-500'
                            : address.pincode.length === 6 && !shippingInfo.isValid
                            ? 'border-red-500'
                            : 'border-transparent focus:border-chocolate-500'
                        }`}
                        placeholder="400001"
                      />
                      {address.pincode.length === 6 && !shippingInfo.isValid && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ We don't deliver to this pincode yet
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl shadow-elegant p-6">
              <h2 className="text-2xl font-bold text-chocolate-900 mb-4 flex items-center gap-2">
                <HiOutlineCreditCard className="w-6 h-6" />
                Payment Method
              </h2>

              <div className="bg-gradient-to-br from-chocolate-700 to-chocolate-900 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                    <HiOutlineCreditCard className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">Secure Online Payment</h3>
                    <p className="text-sm text-cream-200">Powered by Razorpay</p>
                  </div>
                  <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    SECURE
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { icon: '💳', label: 'Cards' },
                    { icon: '📱', label: 'UPI' },
                    { icon: '🏦', label: 'Net Banking' },
                    { icon: '💰', label: 'Wallets' },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm"
                    >
                      <div className="text-2xl mb-1">{m.icon}</div>
                      <p className="text-xs font-semibold">{m.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-cream-200">
                  <HiOutlineLockClosed className="w-4 h-4" />
                  <span>256-bit SSL encrypted • Your data is safe</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-elegant p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-chocolate-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {checkoutItems.map((item) => (
                  <div key={item.post._id} className="flex gap-3 items-center">
                    {item.post.images?.[0]?.url ? (
                      <img
                        src={item.post.images[0].url}
                        alt={item.post.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-cream-100 flex items-center justify-center flex-shrink-0 text-2xl">
                        🎨
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-chocolate-900 text-sm line-clamp-1">
                        {item.post.title}
                      </p>
                      <p className="text-xs text-chocolate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-chocolate-900 text-sm flex-shrink-0">
                      ₹{item.post.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {isBuyNow && (
                <div className="mb-4 p-3 bg-primary-50 rounded-xl border border-primary-200">
                  <p className="text-xs text-primary-700 font-semibold flex items-center gap-1.5">
                    ⚡ Direct purchase — not added to your cart
                  </p>
                </div>
              )}

              <hr className="my-4" />

              <div className="mb-4">
                {appliedCoupon ? (
                  <div className="p-3 bg-green-50 border-2 border-green-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HiOutlineTicket className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-bold text-green-700">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-green-600">
                          Saved ₹{couponDiscountAmount}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-red-600 font-semibold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-semibold text-chocolate-700 mb-2 flex items-center gap-1">
                      <HiOutlineTicket className="w-4 h-4" />{' '}
                      {myCoupons.length > 0 ? 'Have another coupon?' : 'Have a coupon?'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-cream-200 text-sm outline-none focus:border-chocolate-500 uppercase"
                      />
                      <button
                        onClick={() => applyCoupon()}
                        disabled={applyingCoupon}
                        className="px-4 py-2 bg-chocolate-800 text-white text-sm font-semibold rounded-lg hover:bg-chocolate-700 disabled:opacity-60"
                      >
                        {applyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                    {myCoupons.length > 0 && (
                      <p className="text-xs text-primary-600 mt-2 flex items-center gap-1">
                        💡 You have {myCoupons.length} reward coupon
                        {myCoupons.length !== 1 ? 's' : ''} above ↑
                      </p>
                    )}
                    {referralDiscount?.eligible && (
                      <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                        💡 Note: Using a coupon replaces your 5% welcome bonus
                      </p>
                    )}
                  </div>
                )}
              </div>

              <hr className="my-4" />

              <div className="space-y-2 text-chocolate-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-700 font-semibold text-sm">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>-₹{couponDiscountAmount}</span>
                  </div>
                )}

                {referralDiscountAmount > 0 && (
                  <div className="flex justify-between text-primary-700 font-semibold text-sm">
                    <span className="flex items-center gap-1">
                      🎁 Welcome Bonus ({referralDiscount.percentage}%)
                    </span>
                    <span>-₹{referralDiscountAmount}</span>
                  </div>
                )}

                {/* ⭐ Shipping row — hidden for workshops */}
                {!isWorkshopOnly && (
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1">
                      <HiOutlineTruck className="w-4 h-4" />
                      <span>Shipping</span>
                      {shippingInfo.zoneLabel && (
                        <span className="text-xs text-chocolate-500">
                          ({shippingInfo.zoneLabel})
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-semibold ${
                        shippingInfo.isFree ? 'text-green-600' : ''
                      }`}
                    >
                      {!shippingInfo.isValid
                        ? 'Enter pincode'
                        : shippingInfo.isFree
                        ? '✓ FREE'
                        : `₹${shippingInfo.cost}`}
                    </span>
                  </div>
                )}
              </div>

              {/* ⭐ Shipping banners — hidden for workshops */}
              {!isWorkshopOnly && shippingInfo.isValid && !shippingInfo.isFree && amountNeeded > 0 && (
                <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs text-amber-800">
                    💡 Add <strong>₹{amountNeeded}</strong> more for FREE shipping!
                  </p>
                </div>
              )}

              {!isWorkshopOnly && shippingInfo.isFree && shippingInfo.isValid && (
                <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs text-green-800 font-semibold">
                    🎉 You saved ₹
                    {SHIPPING_CONFIG.zones[shippingInfo.zone]?.below500 || 100} on
                    shipping!
                  </p>
                </div>
              )}

              <hr className="my-4" />

              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-chocolate-900">Total</span>
                <div className="text-right">
                  {totalDiscount > 0 && (
                    <p className="text-xs text-chocolate-400 line-through">
                      ₹{subtotal + shippingInfo.cost}
                    </p>
                  )}
                  <span className="text-2xl font-bold text-chocolate-900">
                    ₹{finalTotal}
                  </span>
                </div>
              </div>

              {totalDiscount > 0 && (
                <p className="text-xs text-green-600 font-semibold text-right mb-4">
                  ✨ You save ₹{totalDiscount}
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRazorpayPayment}
                disabled={loading || (!isWorkshopOnly && !shippingInfo.isValid)}
                className="w-full bg-gradient-to-r from-chocolate-700 to-chocolate-900 text-white py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <HiOutlineLockClosed className="w-5 h-5" />
                    Pay ₹{finalTotal} Securely
                  </>
                )}
              </motion.button>

              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-chocolate-500">
                <HiOutlineCheckCircle className="w-4 h-4 text-green-500" />
                <span>100% Secure Payment</span>
              </div>

              <p className="text-xs text-chocolate-500 text-center mt-3">
                By placing an order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Checkout