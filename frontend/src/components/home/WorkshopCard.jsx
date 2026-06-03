import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineUserGroup,
  HiOutlineClock,
} from 'react-icons/hi'

const WorkshopCard = ({ workshop }) => {
  const navigate = useNavigate()

  const eventDate = workshop.eventDate ? new Date(workshop.eventDate) : null
  const isPast = eventDate && eventDate < new Date()

  const formatDate = (date) => {
    if (!date) return 'TBA'
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
  }

  const formatTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const seatsLeft = (workshop.maxAttendees || 20) - (workshop.bookingsCount || 0)
  const isAlmostFull = seatsLeft <= 5 && seatsLeft > 0
  const isFull = seatsLeft <= 0

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-3xl overflow-hidden shadow-elegant hover:shadow-elegant-lg transition-all duration-500 cursor-pointer group"
      onClick={() => navigate(`/product/${workshop._id}`)}
    >
      {/* Image with date badge */}
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
        {workshop.images?.[0] ? (
          <img
            src={workshop.images[0].url}
            alt={workshop.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-chocolate-300 text-6xl">
            🎨
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900/80 via-transparent to-transparent" />

        {/* Date Badge — Top Left */}
        {eventDate && (
          <div className="absolute top-4 left-4 bg-white rounded-2xl p-3 shadow-lg text-center min-w-[60px]">
            <p className="text-xs font-bold text-primary-600 uppercase">
              {eventDate.toLocaleDateString('en-IN', { month: 'short' })}
            </p>
            <p className="text-2xl font-bold text-chocolate-900 leading-none">
              {eventDate.getDate()}
            </p>
          </div>
        )}

        {/* Status Badge — Top Right */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {isFull ? (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              FULL
            </span>
          ) : isAlmostFull ? (
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
              {seatsLeft} LEFT
            </span>
          ) : (
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              AVAILABLE
            </span>
          )}
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-heading font-bold text-xl leading-tight line-clamp-2">
            {workshop.title}
          </h3>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-3">
        {/* Time */}
        {eventDate && (
          <div className="flex items-center gap-2 text-sm text-chocolate-600">
            <HiOutlineClock className="w-4 h-4 text-primary-500" />
            <span>{formatTime(eventDate)}</span>
          </div>
        )}

        {/* Venue */}
        {workshop.venue && (
          <div className="flex items-center gap-2 text-sm text-chocolate-600">
            <HiOutlineLocationMarker className="w-4 h-4 text-primary-500" />
            <span className="line-clamp-1">{workshop.venue}</span>
          </div>
        )}

        {/* Capacity */}
        <div className="flex items-center gap-2 text-sm text-chocolate-600">
          <HiOutlineUserGroup className="w-4 h-4 text-primary-500" />
          <span>
            {workshop.bookingsCount || 0} / {workshop.maxAttendees || 20} seats booked
          </span>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-cream-200">
          <div>
            {workshop.price > 0 ? (
              <>
                <p className="text-xs text-chocolate-500">Per person</p>
                <p className="text-2xl font-bold text-chocolate-900">₹{workshop.price}</p>
              </>
            ) : (
              <p className="text-lg font-bold text-green-600">FREE</p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isFull}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition ${
              isFull
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {isFull ? 'Sold Out' : 'Book Now'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default WorkshopCard