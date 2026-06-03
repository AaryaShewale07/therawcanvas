import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineX, HiOutlineUser, HiOutlineMail, HiOutlinePhone,
  HiOutlineUserGroup, HiOutlineCheckCircle, HiOutlineCalendar,
  HiOutlineLocationMarker, HiOutlineClock,
} from 'react-icons/hi'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const BookingModal = ({ event, onClose, onSuccess }) => {
  // ⭐ Determine if event uses slots or legacy single date
  const hasSlots = event.slots && event.slots.length > 0

  // Filter only future slots
  const availableSlots = hasSlots
    ? event.slots
        .filter((s) => new Date(s.date) > new Date(Date.now() - 60 * 60 * 1000))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    : []

  const [selectedSlot, setSelectedSlot] = useState(availableSlots[0] || null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    peopleCount: 1,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(null)

  // Calculate seats based on selected slot or event
  const seatsLeft = useMemo(() => {
    if (hasSlots && selectedSlot) {
      return selectedSlot.maxAttendees - (selectedSlot.bookingsCount || 0)
    }
    return event.maxAttendees - (event.bookingsCount || 0)
  }, [hasSlots, selectedSlot, event])

  const maxPerBooking = Math.min(10, seatsLeft)

  const totalAmount = useMemo(
    () => event.price * formData.peopleCount,
    [event.price, formData.peopleCount]
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'peopleCount' ? parseInt(value) : value,
    }))
  }

  const validateForm = () => {
    if (hasSlots && !selectedSlot) {
      toast.error('Please select a date slot')
      return false
    }
    if (!formData.name.trim()) {
      toast.error('Name is required')
      return false
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Valid email is required')
      return false
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('Valid phone number is required')
      return false
    }
    if (formData.peopleCount < 1 || formData.peopleCount > maxPerBooking) {
      toast.error(`Please select between 1 and ${maxPerBooking} tickets`)
      return false
    }
    return true
  }

  const handlePayment = async () => {
    if (!validateForm()) return
    if (!window.Razorpay) {
      toast.error('Payment system loading. Please try again.')
      return
    }

    setIsProcessing(true)

    try {
      const orderRes = await api.post('/bookings/create-order', {
        eventId: event._id,
        slotId: selectedSlot?._id || null, // ⭐ Send slot ID
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        peopleCount: formData.peopleCount,
      })

      const { orderId, amount, currency, bookingId, razorpayKeyId } = orderRes.data.data

      const options = {
        key: razorpayKeyId,
        amount,
        currency,
        name: 'TheRawCanvasStudio',
        description: event.title,
        order_id: orderId,
        image: event.images?.[0]?.url || undefined,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#e8732a' },
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/bookings/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            })
            setBookingSuccess(verifyRes.data.data)
            toast.success('Booking confirmed! Check your email.')
            onSuccess?.()
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed')
          } finally {
            setIsProcessing(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            toast('Payment cancelled', { icon: 'ℹ️' })
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        toast.error(response.error?.description || 'Payment failed')
        setIsProcessing(false)
      })
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order')
      setIsProcessing(false)
    }
  }

  const formatSlot = (slotDate) => {
    const d = new Date(slotDate)
    return {
      date: d.toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short',
      }),
      time: d.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit',
      }),
      fullDate: d.toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      }),
    }
  }

  // Display selected slot or event date
  const displayDate = selectedSlot
    ? formatSlot(selectedSlot.date)
    : event.eventDate
    ? formatSlot(event.eventDate)
    : { date: 'TBA', time: '', fullDate: 'TBA' }

  // ============ SUCCESS VIEW ============
  if (bookingSuccess) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-900/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <HiOutlineCheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>
            <h2 className="text-2xl font-heading font-bold text-chocolate-900 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-chocolate-600 mb-4">
              {bookingSuccess.tickets} ticket{bookingSuccess.tickets > 1 ? 's' : ''} for{' '}
              <strong>{bookingSuccess.eventTitle}</strong>
            </p>
            {selectedSlot && (
              <p className="text-sm text-chocolate-500 mb-4">
                📅 {displayDate.fullDate} at {displayDate.time}
              </p>
            )}
            <div className="bg-cream-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-chocolate-500">Total Paid</p>
              <p className="text-3xl font-bold text-primary-600">₹{bookingSuccess.amount}</p>
            </div>
            <p className="text-sm text-chocolate-500 mb-6">
              📧 Confirmation sent to <strong>{formData.email}</strong>
            </p>
            <p className="text-xs text-chocolate-400 mb-6">
              Booking ID: {bookingSuccess.bookingId}
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // ============ BOOKING FORM ============
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-900/60 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl my-8 overflow-hidden flex flex-col md:flex-row"
        >
          {/* LEFT SIDE — Event Info */}
          <div className="md:w-2/5 bg-gradient-to-br from-chocolate-700 via-chocolate-800 to-chocolate-900 text-cream-50 p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-6">
                <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold">
                  Book Your Spot
                </p>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors md:hidden"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>

              {event.images?.[0] && (
                <div className="rounded-2xl overflow-hidden mb-6 h-40 shadow-xl ring-2 ring-gold-500/20">
                  <img src={event.images[0].url} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}

              <h2 className="text-2xl font-heading font-bold mb-4 leading-tight text-white">
                {event.title}
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-gold-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiOutlineCalendar className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <p className="text-xs text-cream-300">Selected Date</p>
                    <p className="font-semibold text-cream-50">{displayDate.date}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-gold-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiOutlineClock className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <p className="text-xs text-cream-300">Time</p>
                    <p className="font-semibold text-cream-50">{displayDate.time || 'TBA'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-gold-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiOutlineLocationMarker className="w-5 h-5 text-gold-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-cream-300">Venue</p>
                    <p className="font-semibold text-cream-50">{event.venue || 'TBA'}</p>
                    {event.venue && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 mt-1 transition-colors"
                      >
                        📍 View on Google Maps →
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-gold-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiOutlineUserGroup className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <p className="text-xs text-cream-300">Seats Available</p>
                    <p className="font-semibold text-cream-50">
                      {seatsLeft} seats left
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1" />

              <div className="bg-gradient-to-br from-gold-500/20 to-primary-500/20 backdrop-blur-sm rounded-2xl p-4 mt-auto border border-gold-500/30">
                <p className="text-xs text-cream-300 mb-1 uppercase tracking-wider font-semibold">
                  Total Amount
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-gold-300">₹{totalAmount}</p>
                  <p className="text-sm text-cream-300">
                    ({formData.peopleCount} × ₹{event.price})
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — Form */}
          <div className="md:w-3/5 flex flex-col bg-cream-50/30">
            <div className="px-8 py-5 border-b border-cream-200 flex items-center justify-between bg-white">
              <h3 className="text-xl font-heading font-bold text-chocolate-900">
                Your Details
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-cream-100 rounded-full transition-colors hidden md:block"
              >
                <HiOutlineX className="w-5 h-5 text-chocolate-500" />
              </button>
            </div>

            <div className="p-8 space-y-5 flex-1 overflow-y-auto bg-white">
              {/* ⭐ SLOT PICKER (only if event has slots) */}
              {hasSlots && availableSlots.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-chocolate-700 mb-2">
                    <HiOutlineCalendar className="inline w-4 h-4 mr-1.5 text-primary-500" />
                    Select Date Slot *
                  </label>
                  <div className="space-y-2">
                    {availableSlots.map((slot) => {
                      const slotInfo = formatSlot(slot.date)
                      const slotSeatsLeft = slot.maxAttendees - (slot.bookingsCount || 0)
                      const isSelected = selectedSlot?._id === slot._id
                      const isSoldOut = slotSeatsLeft <= 0
                      const isAlmostFull = slotSeatsLeft > 0 && slotSeatsLeft <= 5

                      return (
                        <button
                          key={slot._id}
                          type="button"
                          onClick={() => {
                            if (!isSoldOut) {
                              setSelectedSlot(slot)
                              // Reset people count if exceeds new slot capacity
                              if (formData.peopleCount > slotSeatsLeft) {
                                setFormData(prev => ({ ...prev, peopleCount: 1 }))
                              }
                            }
                          }}
                          disabled={isSoldOut}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            isSoldOut
                              ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                              : isSelected
                              ? 'bg-primary-50 border-primary-500 shadow-md'
                              : 'bg-white border-cream-200 hover:border-primary-300 hover:bg-cream-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className={`font-bold ${isSelected ? 'text-primary-700' : 'text-chocolate-900'}`}>
                                {slotInfo.date} at {slotInfo.time}
                              </p>
                              <p className={`text-xs mt-1 ${
                                isSoldOut
                                  ? 'text-red-600'
                                  : isAlmostFull
                                  ? 'text-orange-600 font-semibold'
                                  : 'text-chocolate-500'
                              }`}>
                                {isSoldOut
                                  ? '❌ SOLD OUT'
                                  : isAlmostFull
                                  ? `⚠️ Only ${slotSeatsLeft} seats left!`
                                  : `✓ ${slotSeatsLeft} of ${slot.maxAttendees} seats available`
                                }
                              </p>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <HiOutlineCheckCircle className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-1.5">
                  <HiOutlineUser className="inline w-4 h-4 mr-1.5 text-primary-500" />
                  Full Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all bg-cream-50/30"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-1.5">
                  <HiOutlineMail className="inline w-4 h-4 mr-1.5 text-primary-500" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all bg-cream-50/30"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-1.5">
                  <HiOutlinePhone className="inline w-4 h-4 mr-1.5 text-primary-500" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-3 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all bg-cream-50/30"
                />
              </div>

              {/* People Count */}
              <div>
                <label className="block text-sm font-medium text-chocolate-700 mb-1.5">
                  <HiOutlineUserGroup className="inline w-4 h-4 mr-1.5 text-primary-500" />
                  Number of Tickets *
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        peopleCount: Math.max(1, prev.peopleCount - 1),
                      }))
                    }
                    className="w-12 h-12 bg-cream-100 hover:bg-cream-200 rounded-xl font-bold text-xl text-chocolate-700 transition-colors flex items-center justify-center border border-cream-200"
                  >
                    −
                  </button>
                  <div className="flex-1 text-center bg-gradient-to-br from-primary-50 to-gold-50 py-3 rounded-xl font-bold text-2xl text-primary-700 border border-primary-200">
                    {formData.peopleCount}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        peopleCount: Math.min(maxPerBooking, prev.peopleCount + 1),
                      }))
                    }
                    className="w-12 h-12 bg-cream-100 hover:bg-cream-200 rounded-xl font-bold text-xl text-chocolate-700 transition-colors flex items-center justify-center border border-cream-200"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-chocolate-400 mt-1.5">
                  Max {maxPerBooking} tickets {hasSlots ? 'per slot' : 'per booking'}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-cream-200 bg-cream-50">
              <button
                onClick={handlePayment}
                disabled={isProcessing || (hasSlots && !selectedSlot) || seatsLeft <= 0}
                className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay ₹{totalAmount} & Confirm Booking</>
                )}
              </button>
              <p className="text-xs text-center text-chocolate-400 mt-3">
                🔒 Secure payment by Razorpay
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default BookingModal