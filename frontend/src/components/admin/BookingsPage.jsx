import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  HiOutlineTicket,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlineEye,
  HiOutlineX,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCurrencyRupee,
} from 'react-icons/hi'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const StatusBadge = ({ status }) => {
  const styles = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const BookingDetailModal = ({ booking, onClose }) => {
  if (!booking) return null
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-900/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-cream-100 flex items-center justify-between">
          <h3 className="font-heading font-bold text-chocolate-900">Booking Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-cream-100 rounded-full">
            <HiOutlineX className="w-5 h-5 text-chocolate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Event */}
          <div className="bg-purple-50 rounded-xl p-4">
            <p className="text-xs text-purple-500 font-semibold uppercase mb-1">Event</p>
            <p className="font-bold text-chocolate-900">{booking.event?.title || 'N/A'}</p>
            {booking.event?.eventDate && (
              <p className="text-sm text-chocolate-500 mt-1">
                📅 {new Date(booking.event.eventDate).toLocaleString('en-IN')}
              </p>
            )}
            {booking.event?.venue && (
              <p className="text-sm text-chocolate-500">📍 {booking.event.venue}</p>
            )}
          </div>

          {/* Customer */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cream-100 rounded-lg flex items-center justify-center">
                <HiOutlineUser className="w-4 h-4 text-chocolate-600" />
              </div>
              <div>
                <p className="text-xs text-chocolate-400">Name</p>
                <p className="font-medium text-chocolate-900">{booking.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cream-100 rounded-lg flex items-center justify-center">
                <HiOutlineMail className="w-4 h-4 text-chocolate-600" />
              </div>
              <div>
                <p className="text-xs text-chocolate-400">Email</p>
                <p className="font-medium text-chocolate-900">{booking.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-cream-100 rounded-lg flex items-center justify-center">
                <HiOutlinePhone className="w-4 h-4 text-chocolate-600" />
              </div>
              <div>
                <p className="text-xs text-chocolate-400">Phone</p>
                <p className="font-medium text-chocolate-900">{booking.phone}</p>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-cream-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-chocolate-500">Tickets</span>
              <span className="font-medium">{booking.peopleCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-chocolate-500">Price per ticket</span>
              <span className="font-medium">₹{booking.pricePerTicket}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-cream-200 pt-2">
              <span className="text-chocolate-900">Total Paid</span>
              <span className="text-green-600">₹{booking.totalAmount}</span>
            </div>
          </div>

          {/* IDs */}
          <div className="space-y-1 text-xs text-chocolate-400">
            <p><strong>Booking ID:</strong> {booking._id}</p>
            <p><strong>Razorpay Order:</strong> {booking.razorpayOrderId}</p>
            {booking.razorpayPaymentId && (
              <p><strong>Payment ID:</strong> {booking.razorpayPaymentId}</p>
            )}
            <p><strong>Status:</strong> <StatusBadge status={booking.status} /></p>
            <p><strong>Booked on:</strong> {new Date(booking.createdAt).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const BookingsPage = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/bookings')
      setBookings(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.event?.title?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalRevenue = bookings
    .filter((b) => b.status === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0)

  const totalTickets = bookings
    .filter((b) => b.status === 'paid')
    .reduce((sum, b) => sum + b.peopleCount, 0)

  const exportCSV = () => {
    const rows = [
      ['Booking ID', 'Event', 'Name', 'Email', 'Phone', 'Tickets', 'Amount', 'Status', 'Date'],
      ...filtered.map((b) => [
        b._id,
        b.event?.title || 'N/A',
        b.name,
        b.email,
        b.phone,
        b.peopleCount,
        b.totalAmount,
        b.status,
        new Date(b.createdAt).toLocaleString('en-IN'),
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookings-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV downloaded!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-chocolate-900">Bookings</h1>
          <p className="text-chocolate-500 mt-1">{bookings.length} total bookings</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
        >
          <HiOutlineDownload className="w-5 h-5" />
          Export CSV
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Total Bookings',
            value: bookings.filter((b) => b.status === 'paid').length,
            icon: HiOutlineTicket,
            color: 'bg-purple-500',
          },
          {
            label: 'Total Tickets Sold',
            value: totalTickets,
            icon: HiOutlineUser,
            color: 'bg-blue-500',
          },
          {
            label: 'Total Revenue',
            value: `₹${totalRevenue.toLocaleString()}`,
            icon: HiOutlineCurrencyRupee,
            color: 'bg-green-500',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow-elegant p-6"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-chocolate-900">{stat.value}</p>
            <p className="text-sm text-chocolate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-elegant p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-chocolate-400" />
            <input
              type="text"
              placeholder="Search by name, email or event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineFilter className="w-5 h-5 text-chocolate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-cream-200 rounded-xl focus:border-primary-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-elegant p-12 text-center">
          <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineTicket className="w-8 h-8 text-chocolate-400" />
          </div>
          <h3 className="text-xl font-heading font-bold text-chocolate-900 mb-2">No bookings found</h3>
          <p className="text-chocolate-500">
            {bookings.length === 0
              ? 'No bookings yet. Once users book workshops, they appear here.'
              : 'No bookings match your search.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-elegant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 border-b border-cream-100">
                <tr className="text-left text-sm text-chocolate-500">
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Event</th>
                  <th className="px-6 py-4 font-medium">Tickets</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking._id} className="border-b border-cream-50 hover:bg-cream-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-chocolate-900">{booking.name}</p>
                      <p className="text-xs text-chocolate-400">{booking.email}</p>
                      <p className="text-xs text-chocolate-400">{booking.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-chocolate-900 text-sm">
                        {booking.event?.title || 'N/A'}
                      </p>
                      {booking.event?.eventDate && (
                        <p className="text-xs text-chocolate-400">
                          {new Date(booking.event.eventDate).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-purple-600">{booking.peopleCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600">₹{booking.totalAmount}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-chocolate-500">
                      {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-cream-100 text-chocolate-700 rounded-lg hover:bg-cream-200 transition-colors text-sm"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  )
}

export default BookingsPage