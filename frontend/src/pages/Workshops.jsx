import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { pageTransition, staggerContainer, staggerItem } from '../utils/animations'
import {
  HiOutlineAcademicCap,
  HiOutlineSearch,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineClock,
} from 'react-icons/hi'
import api from '../utils/api'
import BookingModal from '../components/workshops/BookingModal'

// Get all future slot dates from event
const getFutureSlots = (event) => {
  if (event.slots && event.slots.length > 0) {
    return event.slots
      .filter((s) => new Date(s.date) > new Date(Date.now() - 60 * 60 * 1000))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }
  if (event.eventDate && new Date(event.eventDate) > new Date(Date.now() - 60 * 60 * 1000)) {
    return [{ date: event.eventDate, maxAttendees: event.maxAttendees, bookingsCount: event.bookingsCount }]
  }
  return []
}

// Get total seats info from all slots
const getSeatsInfo = (event) => {
  const slots = getFutureSlots(event)
  if (slots.length === 0) {
    return { total: 0, booked: 0, available: 0 }
  }
  const total = slots.reduce((sum, s) => sum + s.maxAttendees, 0)
  const booked = slots.reduce((sum, s) => sum + (s.bookingsCount || 0), 0)
  return { total, booked, available: total - booked }
}

// Determine event status
const getEventStatus = (event) => {
  const slots = getFutureSlots(event)
  if (slots.length === 0) return { label: 'Ended', color: 'gray', canBook: false }

  const seatsInfo = getSeatsInfo(event)
  if (seatsInfo.available <= 0) return { label: 'Sold Out', color: 'red', canBook: false }

  return { label: 'Book Now', color: 'purple', canBook: true }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  })
}

const Workshops = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [, setTick] = useState(0)

  const fetchData = async () => {
    try {
      const res = await api.get('/posts', { params: { category: 'workshops' } })
      setItems(res.data.data || [])
    } catch (err) {
      console.error('Failed to load workshops:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const filtered = items
    .filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const aSlots = getFutureSlots(a)
      const bSlots = getFutureSlots(b)
      const aTime = aSlots[0] ? new Date(aSlots[0].date).getTime() : Infinity
      const bTime = bSlots[0] ? new Date(bSlots[0].date).getTime() : Infinity
      return aTime - bTime
    })

  const handleBookingSuccess = () => fetchData()

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible" exit="exit" className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-b from-purple-50 to-cream-50 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full mb-4 sm:mb-6">
              <HiOutlineAcademicCap className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-heading font-bold text-chocolate-900 mb-4 sm:mb-6">
              Creative <span className="gradient-text">Workshops</span>
            </h1>
            <p className="text-sm sm:text-lg text-chocolate-600 mb-6 sm:mb-8">
              Learn from master artisans. Join hands-on workshops and unleash your creative potential.
            </p>
            <div className="relative max-w-md mx-auto">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-chocolate-400" />
              <input
                type="text"
                placeholder="Search workshops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base bg-white rounded-full shadow-elegant border-2 border-transparent focus:border-purple-500 focus:outline-none"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Workshop Cards */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <p className="text-chocolate-500 text-xs sm:text-base mb-4 sm:mb-6">
            Showing {filtered.length} {filtered.length === 1 ? 'workshop' : 'workshops'}
          </p>

          {loading && (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
            </div>
          )}

          {!loading && (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              {filtered.map((event) => {
                const status = getEventStatus(event)
                const seatsInfo = getSeatsInfo(event)
                const futureSlots = getFutureSlots(event)
                const hasMultipleSlots = futureSlots.length > 1

                return (
                  <motion.div
                    key={event._id}
                    variants={staggerItem}
                    whileHover={{ y: -5 }}
                    className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-elegant hover:shadow-elegant-lg transition-all duration-500 border border-cream-100"
                  >
                    {/* Image */}
                    <div className="relative h-40 sm:h-56 overflow-hidden bg-cream-100">
                      {event.images?.[0] ? (
                        <img src={event.images[0].url} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-chocolate-300">
                          <HiOutlineAcademicCap className="w-16 h-16 sm:w-20 sm:h-20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900/80 via-chocolate-900/20 to-transparent" />

                      {/* Status Badge */}
                      <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-lg ${
                            status.color === 'purple' ? 'bg-purple-600 text-white' :
                            status.color === 'red' ? 'bg-red-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {/* Multiple slots badge */}
                      {hasMultipleSlots && (
                        <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                          <span className="bg-gold-500 text-chocolate-900 text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg">
                            📅 {futureSlots.length} dates
                          </span>
                        </div>
                      )}

                      {/* Title overlay */}
                      <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4">
                        <h3 className="font-heading font-bold text-base sm:text-2xl text-white line-clamp-1">{event.title}</h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-6">
                      {event.shortDescription && (
                        <p className="text-chocolate-600 text-xs sm:text-base mb-3 sm:mb-4 line-clamp-2">{event.shortDescription}</p>
                      )}

                      {/* Slots Preview */}
                      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm">
                        {hasMultipleSlots ? (
                          <div>
                            <div className="flex items-center gap-2 text-chocolate-700 mb-1.5 sm:mb-2">
                              <HiOutlineCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                              <span className="font-semibold text-xs sm:text-sm">Available Slots:</span>
                            </div>
                            <div className="grid grid-cols-1 gap-1 sm:gap-1.5 pl-5 sm:pl-7">
                              {futureSlots.slice(0, 3).map((slot, idx) => {
                                const slotSeatsLeft = slot.maxAttendees - (slot.bookingsCount || 0)
                                return (
                                  <div key={idx} className="flex items-center justify-between bg-cream-50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg">
                                    <span className="text-[10px] sm:text-xs text-chocolate-700">
                                      {formatDate(slot.date)} • {formatTime(slot.date)}
                                    </span>
                                    <span className={`text-[10px] sm:text-xs font-semibold ${slotSeatsLeft <= 0 ? 'text-red-600' : slotSeatsLeft <= 5 ? 'text-orange-600' : 'text-green-600'}`}>
                                      {slotSeatsLeft <= 0 ? 'Full' : `${slotSeatsLeft} left`}
                                    </span>
                                  </div>
                                )
                              })}
                              {futureSlots.length > 3 && (
                                <p className="text-[10px] sm:text-xs text-purple-600 font-semibold pl-2 sm:pl-3">
                                  + {futureSlots.length - 3} more slots
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 text-chocolate-600">
                            <HiOutlineCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-chocolate-900 flex-shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-sm">
                              {futureSlots[0] ? `${formatDate(futureSlots[0].date)} at ${formatTime(futureSlots[0].date)}` : 'TBA'}
                            </span>
                          </div>
                        )}

                        {event.venue && (
                          <div className="flex items-start gap-2 text-chocolate-600">
                            <HiOutlineLocationMarker className="w-4 h-4 sm:w-5 sm:h-5 text-chocolate-900 flex-shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-sm line-clamp-1">{event.venue}</span>
                          </div>
                        )}

                        <div className="flex items-start gap-2 text-chocolate-600">
                          <HiOutlineUserGroup className="w-4 h-4 sm:w-5 sm:h-5 text-chocolate-900 flex-shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm">
                            {seatsInfo.available <= 0 ? (
                              <span className="text-red-600 font-semibold">All slots sold out</span>
                            ) : (
                              <>
                                <span className="text-red-900 font-semibold">{seatsInfo.available}</span> of {seatsInfo.total} seats
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-cream-100 gap-2">
                        <div className="flex-shrink-0">
                          {event.price > 0 ? (
                            <>
                              <span className="text-lg sm:text-2xl font-bold text-black">₹{event.price}</span>
                              <span className="text-[10px] sm:text-sm text-chocolate-500 ml-1">/ticket</span>
                            </>
                          ) : (
                            <span className="text-gray-500 font-semibold text-sm sm:text-base">Free</span>
                          )}
                        </div>

                        {status.canBook ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedEvent(event)}
                            className="px-3 py-2 sm:px-5 sm:py-2.5 bg-amber-800 text-white text-xs sm:text-base rounded-full font-medium hover:bg-amber-900 transition-colors whitespace-nowrap"
                          >
                            {hasMultipleSlots ? 'Choose Date' : 'Book Now'}
                          </motion.button>
                        ) : (
                          <span className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm whitespace-nowrap ${
                            status.color === 'red' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {status.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {!loading && filtered.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
              <div className="w-24 h-24 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <HiOutlineAcademicCap className="w-12 h-12 text-chocolate-300" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-chocolate-900 mb-2">No workshops found</h3>
              <p className="text-chocolate-500 mb-6">
                {items.length === 0 ? 'No workshops scheduled yet. Check back soon!' : 'Try adjusting your search'}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {selectedEvent && (
        <BookingModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </motion.div>
  )
}

export default Workshops