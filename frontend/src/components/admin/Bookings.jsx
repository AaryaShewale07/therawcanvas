import { useEffect, useMemo, useState } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { HiOutlineSearch, HiOutlineDownload, HiOutlineCalendar, HiOutlineClock } from 'react-icons/hi'

const toCsv = (rows) => {
  const header = Object.keys(rows[0] || {})
  const escape = (v) => {
    const s = String(v ?? '')
    if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [
    header.join(','),
    ...rows.map((r) => header.map((h) => escape(r[h])).join(',')),
  ]
  return lines.join('\n')
}

const downloadCsv = (rows, filename) => {
  if (!rows?.length) return
  const csv = toCsv(rows)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [eventId, setEventId] = useState('all')
  const [status, setStatus] = useState('all')

  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/bookings')
      setBookings(res.data.data || [])
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to load bookings')
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const events = useMemo(() => {
    const map = new Map()
    bookings.forEach((b) => {
      const id = b?.event?._id
      if (!id) return
      map.set(id, b.event)
    })
    return Array.from(map.values())
  }, [bookings])

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    return bookings.filter((b) => {
      if (eventId !== 'all') {
        if (b?.event?._id?.toString() !== eventId.toString()) return false
      }
      if (status !== 'all') {
        if ((b.status || '').toLowerCase() !== status.toLowerCase()) return false
      }
      if (!s) return true

      const eventTitle = b?.event?.title || ''
      const name = b?.name || ''
      const email = b?.email || ''
      const phone = b?.phone || ''

      return (
        eventTitle.toLowerCase().includes(s) ||
        name.toLowerCase().includes(s) ||
        email.toLowerCase().includes(s) ||
        phone.toLowerCase().includes(s)
      )
    })
  }, [bookings, eventId, status, search])

  // ⭐ Get the actual booked date — prefers slotDate over eventDate
  const getEventDate = (booking) => {
    return booking.slotDate || booking.event?.eventDate
  }

  const formatDateOnly = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTimeOnly = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateTime = (d) => {
    if (!d) return '-'
    const dt = new Date(d)
    return dt.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const exportCsv = () => {
    const rows = filtered.map((b) => {
      const eventDate = getEventDate(b)
      return {
        bookingId: b._id,
        eventTitle: b.event?.title || '',
        eventDate: eventDate ? formatDateOnly(eventDate) : '',
        eventTime: eventDate ? formatTimeOnly(eventDate) : '',
        venue: b.event?.venue || '',
        attendeeName: b.name,
        attendeeEmail: b.email,
        attendeePhone: b.phone,
        tickets: b.peopleCount,
        pricePerTicket: b.pricePerTicket,
        totalAmount: b.totalAmount,
        paymentStatus: b.status,
        razorpayPaymentId: b.razorpayPaymentId || '',
        bookedAt: new Date(b.createdAt).toLocaleString('en-IN'),
      }
    })

    downloadCsv(rows, `workshop-bookings-${Date.now()}.csv`)
    toast.success(`Exported ${rows.length} bookings`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-heading font-bold text-chocolate-900">
            Workshop Bookings
          </h1>
          <p className="text-chocolate-500 mt-1">
            {filtered.length} booking{filtered.length === 1 ? '' : 's'} shown
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
          disabled={filtered.length === 0}
          title="Download CSV"
        >
          <HiOutlineDownload />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-elegant p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-cream-50 border border-cream-200 rounded-xl px-3 py-2">
            <HiOutlineSearch className="w-5 h-5 text-chocolate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event / name / email / phone"
              className="bg-transparent outline-none text-sm w-80 max-w-full"
            />
          </div>

          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="px-3 py-2 border border-cream-200 rounded-xl text-sm bg-white"
          >
            <option value="all">All events</option>
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-cream-200 rounded-xl text-sm bg-white"
          >
            <option value="all">All statuses</option>
            <option value="paid">paid</option>
            <option value="failed">failed</option>
            <option value="pending">pending</option>
          </select>

          <button
            onClick={fetchBookings}
            className="ml-auto px-4 py-2 bg-primary-600 text-white rounded-xl text-sm hover:bg-primary-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
            {error}
          </p>
        )}
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-elegant overflow-hidden border border-cream-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-cream-50 text-chocolate-500 text-sm">
                <tr>
                  <th className="p-4 text-left font-medium">Event</th>
                  <th className="p-4 text-left font-medium">📅 Event Date</th>
                  <th className="p-4 text-left font-medium">Attendee</th>
                  <th className="p-4 text-left font-medium">Contact</th>
                  <th className="p-4 text-left font-medium">Tickets</th>
                  <th className="p-4 text-left font-medium">Total</th>
                  <th className="p-4 text-left font-medium">Payment</th>
                  <th className="p-4 text-left font-medium">Booked At</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.map((b) => {
                  const eventDate = getEventDate(b)
                  const isSpecificSlot = Boolean(b.slotDate)

                  return (
                    <tr key={b._id} className="border-b border-cream-50 hover:bg-cream-50/30 transition-colors">
                      {/* Event */}
                      <td className="p-4">
                        <p className="font-semibold text-chocolate-900">
                          {b.event?.title || 'Event deleted'}
                        </p>
                        {b.event?.venue && (
                          <p className="text-xs text-chocolate-500 mt-1">
                            📍 {b.event.venue}
                          </p>
                        )}
                      </td>

                      {/* ⭐ EVENT DATE COLUMN */}
                      <td className="p-4">
                        {eventDate ? (
                          <div className={`inline-flex flex-col gap-1 px-3 py-2 rounded-xl border ${
                            isSpecificSlot
                              ? 'bg-purple-50 border-purple-300'
                              : 'bg-blue-50 border-blue-200'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              <HiOutlineCalendar className={`w-4 h-4 ${isSpecificSlot ? 'text-purple-600' : 'text-blue-600'}`} />
                              <span className={`text-sm font-bold ${isSpecificSlot ? 'text-purple-700' : 'text-blue-700'}`}>
                                {formatDateOnly(eventDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <HiOutlineClock className={`w-4 h-4 ${isSpecificSlot ? 'text-purple-600' : 'text-blue-600'}`} />
                              <span className={`text-sm font-bold ${isSpecificSlot ? 'text-purple-700' : 'text-blue-700'}`}>
                                {formatTimeOnly(eventDate)}
                              </span>
                            </div>
                            {isSpecificSlot && (
                              <span className="text-[10px] font-semibold text-purple-600 mt-0.5 bg-purple-100 px-2 py-0.5 rounded-full text-center">
                                🎯 Chose this slot
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-chocolate-400 text-xs">No date</span>
                        )}
                      </td>

                      {/* Attendee */}
                      <td className="p-4">
                        <div className="font-medium text-chocolate-900">{b.name}</div>
                        <div className="text-xs text-chocolate-500">{b.email}</div>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <a
                          href={`tel:${b.phone}`}
                          className="text-chocolate-600 hover:text-primary-600 transition-colors text-sm"
                        >
                          📞 {b.phone}
                        </a>
                        <div className="mt-1">
                          <a
                            href={`https://wa.me/91${b.phone.replace(/\D/g, '').slice(-10)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 hover:text-green-700 inline-flex items-center gap-1"
                          >
                            💬 WhatsApp
                          </a>
                        </div>
                      </td>

                      {/* Tickets */}
                      <td className="p-4">
                        <span className="px-3 py-1 bg-cream-100 rounded-full text-sm font-bold text-chocolate-700">
                          🎫 {b.peopleCount}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="p-4 font-bold text-primary-600 text-base">
                        ₹{b.totalAmount}
                      </td>

                      {/* Payment Status */}
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            (b.status || '').toLowerCase() === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : (b.status || '').toLowerCase() === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {(b.status || 'pending').toUpperCase()}
                        </span>
                        {b.razorpayPaymentId && (
                          <div className="text-[10px] text-chocolate-500 mt-1 font-mono">
                            {b.razorpayPaymentId.slice(0, 14)}...
                          </div>
                        )}
                      </td>

                      {/* Booked At */}
                      <td className="p-4 text-chocolate-500 text-xs">
                        {formatDateTime(b.createdAt)}
                      </td>
                    </tr>
                  )
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-10 text-center text-chocolate-500">
                      No bookings found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookings