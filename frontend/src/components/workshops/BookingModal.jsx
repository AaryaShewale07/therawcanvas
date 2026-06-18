// components/workshops/BookingModal.jsx
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiX,
  HiOutlineTicket,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiMinus,
  HiPlus,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineLocationMarker,
} from 'react-icons/hi'
import api from '../../utils/api'

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  })

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const getFutureSlots = (event) => {
  const cutoff = new Date(Date.now() - 60 * 60 * 1000)
  if (event.slots?.length > 0) {
    return event.slots
      .filter((s) => s.isActive && new Date(s.date) > cutoff)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }
  if (event.eventDate && new Date(event.eventDate) > cutoff) {
    return [{
      _id: null,
      date: event.eventDate,
      maxAttendees: event.maxAttendees,
      bookingsCount: event.bookingsCount,
    }]
  }
  return []
}

const getAvailableTicketTypes = (event) => {
  if (!event.ticketTypes?.length) return null // signals: use legacy
  return event.ticketTypes
    .filter((t) => t.isActive && t.capacity - t.sold > 0)
    .map((t) => ({ ...t, remaining: t.capacity - t.sold }))
}

const getAllTicketTypes = (event) => {
  if (!event.ticketTypes?.length) return null
  return event.ticketTypes.map((t) => ({ ...t, remaining: t.capacity - t.sold }))
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
const StepDots = ({ current, total }) => (
  <div className="flex items-center gap-2 mt-1">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1.5 rounded-full transition-all duration-300 ${
          i < current ? 'bg-white w-8' : 'bg-white/30 w-4'
        }`}
      />
    ))}
  </div>
)

const TicketQtyControl = ({ ticket, qty, onChange }) => {
  const isLowStock = ticket.remaining <= 5
  const isCapped = qty >= ticket.remaining || qty >= 10

  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all ${
        qty > 0
          ? 'border-purple-400 bg-purple-50/60 shadow-sm'
          : 'border-cream-200 hover:border-purple-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-chocolate-900 text-sm">{ticket.name}</span>
            {isLowStock && (
              <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded-full">
                🔥 {ticket.remaining} left
              </span>
            )}
          </div>
          {ticket.description && (
            <p className="text-xs text-chocolate-500 mt-0.5 line-clamp-1">{ticket.description}</p>
          )}
          <div className="text-sm font-bold text-chocolate-900 mt-1">
            {ticket.price > 0 ? `₹${ticket.price.toLocaleString('en-IN')}` : 'Free'}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onChange(-1)}
            disabled={qty === 0}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              qty === 0
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            <HiMinus className="w-4 h-4" />
          </motion.button>
          <span className="w-6 text-center font-bold text-lg text-chocolate-900 tabular-nums">
            {qty}
          </span>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onChange(1)}
            disabled={isCapped}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isCapped
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            <HiPlus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {qty > 0 && ticket.price > 0 && (
        <div className="mt-2 pt-2 border-t border-purple-200/60 text-right text-xs text-chocolate-500">
          {qty} × ₹{ticket.price.toLocaleString('en-IN')} ={' '}
          <span className="font-bold text-chocolate-900">
            ₹{(qty * ticket.price).toLocaleString('en-IN')}
          </span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Modal
// ─────────────────────────────────────────────
const BookingModal = ({ event, onClose, onSuccess }) => {
  const [step, setStep] = useState(1)
  const [selectedSlot, setSelectedSlot] = useState(null)

  // Multi-ticket: { [ticketTypeId]: quantity }
  const [ticketSelections, setTicketSelections] = useState({})
  // Legacy: simple count
  const [legacyCount, setLegacyCount] = useState(1)

  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const futureSlots = useMemo(() => getFutureSlots(event), [event])
  const availableTicketTypes = useMemo(() => getAvailableTicketTypes(event), [event])
  const allTicketTypes = useMemo(() => getAllTicketTypes(event), [event])

  const hasMultipleSlots = futureSlots.length > 1
  const isMultiTicket = availableTicketTypes !== null // event has ticketTypes defined

  // Auto-select slot if only one
  useEffect(() => {
    if (futureSlots.length === 1) setSelectedSlot(futureSlots[0])
  }, [futureSlots])

  // ── Totals ──
  const { totalTickets, totalAmount } = useMemo(() => {
    if (isMultiTicket) {
      let qty = 0
      let amount = 0
      for (const [id, count] of Object.entries(ticketSelections)) {
        const t = availableTicketTypes?.find((tt) => tt._id?.toString() === id)
        if (t) {
          qty += count
          amount += t.price * count
        }
      }
      return { totalTickets: qty, totalAmount: amount }
    }
    return {
      totalTickets: legacyCount,
      totalAmount: (event.price || 0) * legacyCount,
    }
  }, [isMultiTicket, ticketSelections, legacyCount, availableTicketTypes, event.price])

  const updateTicketQty = (ticketId, delta) => {
    setTicketSelections((prev) => {
      const ticket = availableTicketTypes?.find((t) => t._id?.toString() === ticketId)
      if (!ticket) return prev
      const current = prev[ticketId] || 0
      const next = Math.max(0, Math.min(current + delta, ticket.remaining, 10))
      if (next === 0) {
        const { [ticketId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [ticketId]: next }
    })
  }

  const canProceedStep1 =
    totalTickets > 0 && (!hasMultipleSlots || selectedSlot !== null)

  const canProceedStep2 =
    formData.name.trim() && formData.email.trim() && formData.phone.trim()

  // ── Payment flow ──
  const handlePay = async () => {
    setLoading(true)
    setError('')

    try {
      const razorpayLoaded = await loadRazorpay()
      if (!razorpayLoaded) throw new Error('Payment gateway failed to load. Check your internet connection.')

      // Build payload
      const payload = {
        eventId: event._id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        slotId: selectedSlot?._id || null,
      }

      if (isMultiTicket) {
        payload.ticketSelections = ticketSelections
      } else {
        payload.peopleCount = legacyCount
      }

      // ⭐ Create Razorpay order (backend wraps response in { success, data: {...} })
      const response = await api.post('/bookings/create-order', payload)
      const orderData = response.data?.data

      if (!orderData || !orderData.orderId) {
        throw new Error('Invalid response from server. Please try again.')
      }

      // If free — go straight to verify
      if (orderData.amount === 0) {
        await api.post('/bookings/verify', {
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: 'free_' + Date.now(),
          razorpay_signature: 'free',
          bookingId: orderData.bookingId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        })
        setStep(4)
        onSuccess?.()
        setLoading(false)
        return
      }

      // ⭐ Validate key before opening Razorpay
      if (!orderData.razorpayKeyId) {
        throw new Error('Payment gateway not configured. Please contact support.')
      }

      // Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Workshop Booking',
        description: event.title,
        order_id: orderData.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#92400e' },
        handler: async (response) => {
          try {
            await api.post('/bookings/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: orderData.bookingId,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
            })
            setStep(4)
            onSuccess?.()
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed. Contact support.')
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            setError('Payment cancelled. Your booking was not confirmed.')
          },
        },
      })

      rzp.open()
    } catch (err) {
      console.error('Booking error:', err)
      setError(err.response?.data?.message || err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  // ── Ticket breakdown for review/success ──
  const ticketBreakdown = useMemo(() => {
    if (isMultiTicket) {
      return Object.entries(ticketSelections)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => {
          const t = availableTicketTypes?.find((tt) => tt._id?.toString() === id)
          return t
            ? { name: t.name, quantity: qty, pricePerTicket: t.price, subtotal: t.price * qty }
            : null
        })
        .filter(Boolean)
    }
    return [{
      name: 'General Admission',
      quantity: legacyCount,
      pricePerTicket: event.price || 0,
      subtotal: (event.price || 0) * legacyCount,
    }]
  }, [isMultiTicket, ticketSelections, legacyCount, availableTicketTypes, event.price])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-800 to-amber-900 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="min-w-0 flex-1 mr-3">
              <h2 className="text-white font-heading font-bold text-lg truncate">
                {event.title}
              </h2>
              <StepDots current={step} total={4} />
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 flex-shrink-0"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Slot + Tickets ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-6"
                >
                  {/* Slot picker */}
                  {hasMultipleSlots && (
                    <div>
                      <h3 className="font-semibold text-chocolate-900 mb-3 flex items-center gap-2 text-sm">
                        <HiOutlineCalendar className="w-5 h-5 text-purple-600" />
                        Choose a Date
                      </h3>
                      <div className="space-y-2">
                        {futureSlots.map((slot) => {
                          const remaining = slot.maxAttendees - (slot.bookingsCount || 0)
                          const isFull = remaining <= 0
                          const isSelected = selectedSlot?._id === slot._id ||
                            selectedSlot?.date === slot.date
                          return (
                            <button
                              key={slot._id || slot.date}
                              disabled={isFull}
                              onClick={() => setSelectedSlot(slot)}
                              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                                isFull
                                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                  : isSelected
                                  ? 'border-purple-500 bg-purple-50 shadow-md'
                                  : 'border-cream-200 hover:border-purple-300 hover:bg-purple-50/30'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-sm text-chocolate-900">
                                    {formatDate(slot.date)}
                                  </div>
                                  <div className="text-xs text-chocolate-500">
                                    {formatTime(slot.date)}
                                  </div>
                                </div>
                                <span className={`text-xs font-semibold ${
                                  isFull
                                    ? 'text-red-500'
                                    : remaining <= 5
                                    ? 'text-orange-600'
                                    : 'text-green-600'
                                }`}>
                                  {isFull ? 'Full' : `${remaining} left`}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Ticket types (multi) */}
                  {isMultiTicket && (
                    <div>
                      <h3 className="font-semibold text-chocolate-900 mb-3 flex items-center gap-2 text-sm">
                        <HiOutlineTicket className="w-5 h-5 text-purple-600" />
                        Select Tickets
                        <span className="text-xs text-chocolate-400 font-normal ml-1">
                          (max 10 per type)
                        </span>
                      </h3>

                      {availableTicketTypes?.length === 0 ? (
                        <div className="text-center py-6 text-chocolate-500">
                          All tickets are sold out for this event.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {availableTicketTypes?.map((ticket) => (
                            <TicketQtyControl
                              key={ticket._id}
                              ticket={ticket}
                              qty={ticketSelections[ticket._id] || 0}
                              onChange={(delta) =>
                                updateTicketQty(ticket._id?.toString(), delta)
                              }
                            />
                          ))}
                        </div>
                      )}

                      {/* Sold-out types (shown grayed) */}
                      {allTicketTypes?.some((t) => t.remaining <= 0) && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-chocolate-400 font-medium">Sold out</p>
                          {allTicketTypes
                            .filter((t) => t.remaining <= 0)
                            .map((ticket) => (
                              <div
                                key={ticket._id}
                                className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50 opacity-60"
                              >
                                <div>
                                  <span className="font-medium text-sm text-gray-500 line-through">
                                    {ticket.name}
                                  </span>
                                  <div className="text-xs text-gray-400">
                                    {ticket.price > 0 ? `₹${ticket.price}` : 'Free'}
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-red-400 bg-red-50 px-2 py-1 rounded-full">
                                  Sold Out
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Legacy: simple seat count */}
                  {!isMultiTicket && (
                    <div>
                      <h3 className="font-semibold text-chocolate-900 mb-3 flex items-center gap-2 text-sm">
                        <HiOutlineTicket className="w-5 h-5 text-purple-600" />
                        Number of Seats
                      </h3>
                      <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-cream-200 bg-white">
                        <div className="flex-1">
                          <div className="font-medium text-chocolate-900">General Admission</div>
                          <div className="text-sm font-bold text-chocolate-900 mt-0.5">
                            {event.price > 0
                              ? `₹${event.price.toLocaleString('en-IN')} / seat`
                              : 'Free'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => setLegacyCount((c) => Math.max(1, c - 1))}
                            disabled={legacyCount <= 1}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                              legacyCount <= 1
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            <HiMinus className="w-4 h-4" />
                          </motion.button>
                          <span className="w-8 text-center font-bold text-xl text-chocolate-900 tabular-nums">
                            {legacyCount}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => setLegacyCount((c) => Math.min(10, c + 1))}
                            disabled={legacyCount >= 10}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                              legacyCount >= 10
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            <HiPlus className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Running total */}
                  {totalTickets > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gradient-to-r from-purple-50 to-amber-50 rounded-xl border border-purple-100"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-chocolate-600">
                          {totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'} selected
                        </span>
                        <span className="text-xl font-bold text-chocolate-900">
                          {totalAmount > 0
                            ? `₹${totalAmount.toLocaleString('en-IN')}`
                            : 'Free'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ── STEP 2: Attendee Details ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="font-semibold text-chocolate-900 text-lg">Your Details</h3>
                    <p className="text-sm text-chocolate-500 mt-1">
                      Booking confirmation will be sent to your email.
                    </p>
                  </div>

                  {[
                    {
                      label: 'Full Name',
                      key: 'name',
                      type: 'text',
                      placeholder: 'Enter your full name',
                      Icon: HiOutlineUser,
                    },
                    {
                      label: 'Email',
                      key: 'email',
                      type: 'email',
                      placeholder: 'you@example.com',
                      Icon: HiOutlineMail,
                    },
                    {
                      label: 'Phone',
                      key: 'phone',
                      type: 'tel',
                      placeholder: '+91 98765 43210',
                      Icon: HiOutlinePhone,
                    },
                  ].map(({ label, key, type, placeholder, Icon }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-chocolate-700 mb-1">
                        {label}
                      </label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
                        <input
                          type={type}
                          value={formData[key]}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          placeholder={placeholder}
                          className="w-full pl-10 pr-4 py-3 border-2 border-cream-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* ── STEP 3: Review ── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-chocolate-900 text-lg">Review Your Booking</h3>

                  {/* Event info */}
                  <div className="bg-cream-50 rounded-xl p-4 space-y-2">
                    <div className="font-semibold text-chocolate-900">{event.title}</div>
                    {selectedSlot && (
                      <div className="flex items-center gap-2 text-sm text-chocolate-600">
                        <HiOutlineCalendar className="w-4 h-4 flex-shrink-0" />
                        {formatDate(selectedSlot.date)} at {formatTime(selectedSlot.date)}
                      </div>
                    )}
                    {event.venue && (
                      <div className="flex items-center gap-2 text-sm text-chocolate-600">
                        <HiOutlineLocationMarker className="w-4 h-4 flex-shrink-0" />
                        {event.venue}
                      </div>
                    )}
                  </div>

                  {/* Ticket breakdown */}
                  <div className="bg-purple-50/60 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-chocolate-800 mb-3">
                      <HiOutlineTicket className="w-4 h-4 text-purple-600" />
                      Tickets
                    </div>
                    <div className="space-y-2">
                      {ticketBreakdown.map((line, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-chocolate-700">
                            {line.name} × {line.quantity}
                          </span>
                          <span className="font-semibold text-chocolate-900">
                            {line.subtotal > 0
                              ? `₹${line.subtotal.toLocaleString('en-IN')}`
                              : 'Free'}
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 mt-2 border-t border-purple-200 flex justify-between items-center">
                        <span className="font-semibold text-chocolate-900">Total</span>
                        <span className="text-lg font-bold text-chocolate-900">
                          {totalAmount > 0
                            ? `₹${totalAmount.toLocaleString('en-IN')}`
                            : 'Free'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attendee */}
                  <div className="bg-cream-50 rounded-xl p-4 space-y-1 text-sm text-chocolate-700">
                    <div className="font-semibold text-chocolate-900 mb-2">Attendee</div>
                    <div>{formData.name}</div>
                    <div>{formData.email}</div>
                    <div>{formData.phone}</div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2"
                    >
                      <HiOutlineExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-red-700">{error}</span>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ── STEP 4: Success ── */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                  >
                    <HiOutlineCheckCircle className="w-24 h-24 text-green-500 mx-auto" />
                  </motion.div>
                  <h3 className="text-2xl font-heading font-bold text-chocolate-900 mt-4 mb-2">
                    Booking Confirmed! 🎉
                  </h3>
                  <p className="text-chocolate-600 mb-6 text-sm">
                    Confirmation sent to{' '}
                    <span className="font-semibold text-chocolate-900">{formData.email}</span>
                  </p>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left space-y-2 mb-6">
                    {ticketBreakdown.map((line, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-green-800">
                          {line.name} × {line.quantity}
                        </span>
                        <span className="font-semibold text-green-900">
                          {line.subtotal > 0
                            ? `₹${line.subtotal.toLocaleString('en-IN')}`
                            : 'Free'}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-green-200 pt-2 flex justify-between">
                      <span className="font-bold text-green-900">Total</span>
                      <span className="font-bold text-green-900 text-lg">
                        {totalAmount > 0
                          ? `₹${totalAmount.toLocaleString('en-IN')}`
                          : 'Free'}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-10 py-3 bg-amber-800 text-white rounded-full font-medium hover:bg-amber-900 transition-colors"
                  >
                    Done
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {step < 4 && (
            <div className="px-6 py-4 border-t border-cream-100 bg-cream-50/50 flex items-center justify-between flex-shrink-0">
              {step > 1 ? (
                <button
                  onClick={() => { setStep(step - 1); setError('') }}
                  className="px-4 py-2 text-chocolate-600 hover:text-chocolate-900 font-medium transition-colors text-sm"
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                  onClick={() => setStep((s) => s + 1)}
                  className="px-6 py-2.5 bg-amber-800 text-white rounded-full font-medium hover:bg-amber-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Continue →
                </motion.button>
              )}

              {step === 3 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={handlePay}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <HiOutlineCheckCircle className="w-5 h-5" />
                      {totalAmount > 0 ? `Pay ₹${totalAmount.toLocaleString('en-IN')}` : 'Confirm Free Booking'}
                    </>
                  )}
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default BookingModal