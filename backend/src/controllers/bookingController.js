import asyncHandler from 'express-async-handler'
import crypto from 'crypto'
import razorpay from '../config/razorpay.js'
import Booking from '../models/Booking.js'
import Post from '../models/Post.js'
import sendEmail from '../utils/sendEmail.js'

// ============ EMAIL TEMPLATES ============

const userConfirmationEmail = (booking, event) => {
  const slotDate = booking.slotDate ? new Date(booking.slotDate) : new Date(event.eventDate)
  const dateStr = slotDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const timeStr = slotDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })

  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fdf8f4; padding: 32px; border-radius: 16px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #3d1f0a; margin: 0;">🎉 Booking Confirmed!</h1>
      <p style="color: #7a4f35; font-size: 16px;">Thank you for booking with TheRawCanvasStudio</p>
    </div>

    <div style="background: white; padding: 24px; border-radius: 12px; margin-bottom: 16px;">
      <h2 style="color: #e8732a; margin-top: 0;">${event.title}</h2>
      <p style="color: #7a4f35; line-height: 1.6;">${event.shortDescription || event.description.slice(0, 200)}</p>

      <table style="width: 100%; margin-top: 16px; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #7a4f35;"><strong>📅 Date:</strong></td><td style="padding: 8px 0; color: #3d1f0a;">${dateStr}</td></tr>
        <tr><td style="padding: 8px 0; color: #7a4f35;"><strong>🕐 Time:</strong></td><td style="padding: 8px 0; color: #3d1f0a;">${timeStr}</td></tr>
        <tr><td style="padding: 8px 0; color: #7a4f35;"><strong>📍 Venue:</strong></td><td style="padding: 8px 0; color: #3d1f0a;">${event.venue || 'TBA'}</td></tr>
        <tr><td style="padding: 8px 0; color: #7a4f35;"><strong>👥 Tickets:</strong></td><td style="padding: 8px 0; color: #3d1f0a;">${booking.peopleCount}</td></tr>
        <tr><td style="padding: 8px 0; color: #7a4f35;"><strong>💰 Total Paid:</strong></td><td style="padding: 8px 0; color: #3d1f0a;"><strong>₹${booking.totalAmount}</strong></td></tr>
      </table>
    </div>

    <div style="background: #fff8f0; padding: 16px; border-radius: 12px; border-left: 4px solid #e8732a;">
      <p style="margin: 0; color: #3d1f0a;"><strong>Booking ID:</strong> ${booking._id}</p>
      <p style="margin: 8px 0 0; color: #7a4f35; font-size: 13px;">Please save this ID for reference. Show this email at the venue.</p>
    </div>

    <p style="text-align: center; color: #b07050; font-size: 13px; margin-top: 24px;">
      Questions? Reply to this email.<br>
      We can't wait to see you! 💛
    </p>
  </div>
  `
}

const adminNotificationEmail = (booking, event) => {
  const slotDate = booking.slotDate ? new Date(booking.slotDate) : new Date(event.eventDate)
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
    <h2 style="color: #3d1f0a;">🎉 New Workshop Booking!</h2>

    <div style="background: #f9f5f0; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <h3 style="margin-top: 0; color: #e8732a;">Event: ${event.title}</h3>
      <p><strong>Slot:</strong> ${slotDate.toLocaleString()}</p>
      <p><strong>Venue:</strong> ${event.venue || 'TBA'}</p>
    </div>

    <div style="background: #fff; border: 1px solid #e0d5c8; padding: 16px; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #3d1f0a;">Customer Details</h3>
      <p><strong>Name:</strong> ${booking.name}</p>
      <p><strong>Email:</strong> ${booking.email}</p>
      <p><strong>Phone:</strong> ${booking.phone}</p>
      <p><strong>Tickets:</strong> ${booking.peopleCount}</p>
      <p><strong>Amount Paid:</strong> ₹${booking.totalAmount}</p>
      <p><strong>Payment ID:</strong> ${booking.razorpayPaymentId}</p>
      <p><strong>Booking ID:</strong> ${booking._id}</p>
    </div>
  </div>
  `
}

// ============ CONTROLLERS ============

// @desc    Create Razorpay order for booking
// @route   POST /api/bookings/create-order
// @access  Public
export const createOrder = asyncHandler(async (req, res) => {
  const { eventId, slotId, name, email, phone, peopleCount } = req.body

  if (!eventId || !name || !email || !phone || !peopleCount) {
    res.status(400)
    throw new Error('All fields are required')
  }

  const count = parseInt(peopleCount)
  if (count < 1 || count > 10) {
    res.status(400)
    throw new Error('You can book between 1 and 10 tickets')
  }

  const event = await Post.findById(eventId)
  if (!event) {
    res.status(404)
    throw new Error('Event not found')
  }

  if (event.category !== 'workshops') {
    res.status(400)
    throw new Error('Only workshops can be booked')
  }

  // ⭐ NEW: Handle slot-based booking
  let slotDate = event.eventDate
  let selectedSlot = null

  if (event.slots && event.slots.length > 0) {
    // Workshop uses slots → slotId is REQUIRED
    if (!slotId) {
      res.status(400)
      throw new Error('Please select a date slot')
    }

    selectedSlot = event.slots.id(slotId)
    if (!selectedSlot) {
      res.status(404)
      throw new Error('Selected slot not found')
    }

    slotDate = selectedSlot.date

    // Check slot is in future (1 hour buffer)
    const cutoff = new Date(slotDate.getTime() - 60 * 60 * 1000)
    if (new Date() >= cutoff) {
      res.status(400)
      throw new Error('Bookings are closed for this slot')
    }

    // Check slot capacity
    const slotSeatsLeft = selectedSlot.maxAttendees - selectedSlot.bookingsCount
    if (count > slotSeatsLeft) {
      res.status(400)
      throw new Error(`Only ${slotSeatsLeft} seats left for this slot`)
    }
  } else {
    // Legacy: single eventDate
    if (!event.eventDate) {
      res.status(400)
      throw new Error('Event date not set')
    }

    const cutoff = new Date(new Date(event.eventDate).getTime() - 60 * 60 * 1000)
    if (new Date() >= cutoff) {
      res.status(400)
      throw new Error('Bookings are closed for this event')
    }

    const seatsLeft = event.maxAttendees - event.bookingsCount
    if (count > seatsLeft) {
      res.status(400)
      throw new Error(`Only ${seatsLeft} seats remaining`)
    }
  }

  const pricePerTicket = event.price
  const totalAmount = pricePerTicket * count

  const order = await razorpay.orders.create({
    amount: totalAmount * 100,
    currency: 'INR',
    receipt: `bk_${Date.now()}`,
    notes: {
      eventId: eventId.toString(),
      slotId: slotId || '',
      eventTitle: event.title,
      customerName: name,
      customerEmail: email,
      tickets: count.toString(),
    },
  })

  const booking = await Booking.create({
    event: eventId,
    slotId: slotId || null,
    slotDate: slotDate,
    name,
    email,
    phone,
    peopleCount: count,
    pricePerTicket,
    totalAmount,
    razorpayOrderId: order.id,
    status: 'pending',
    user: req.user?._id || null,
  })

  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking._id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      eventTitle: event.title,
    },
  })
})

// @desc    Verify payment and confirm booking
// @route   POST /api/bookings/verify
// @access  Public
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
    res.status(400)
    throw new Error('Missing payment details')
  }

  const booking = await Booking.findById(bookingId).populate('event')
  if (!booking) {
    res.status(404)
    throw new Error('Booking not found')
  }

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    booking.status = 'failed'
    await booking.save()
    res.status(400)
    throw new Error('Payment verification failed')
  }

  const event = await Post.findById(booking.event._id)

  // ⭐ Update slot bookingsCount OR event bookingsCount
  if (booking.slotId && event.slots && event.slots.length > 0) {
    const slot = event.slots.id(booking.slotId)
    if (!slot) {
      booking.status = 'failed'
      await booking.save()
      res.status(400)
      throw new Error('Slot no longer available')
    }

    const slotSeatsLeft = slot.maxAttendees - slot.bookingsCount
    if (booking.peopleCount > slotSeatsLeft) {
      booking.status = 'failed'
      await booking.save()
      res.status(400)
      throw new Error('Sorry, this slot sold out during checkout. You will be refunded.')
    }

    slot.bookingsCount += booking.peopleCount
  } else {
    // Legacy: update event bookingsCount
    const seatsLeft = event.maxAttendees - event.bookingsCount
    if (booking.peopleCount > seatsLeft) {
      booking.status = 'failed'
      await booking.save()
      res.status(400)
      throw new Error('Sorry, seats sold out during checkout. You will be refunded.')
    }
  }

  // Always update overall bookingsCount too (for analytics)
  event.bookingsCount += booking.peopleCount
  await event.save()

  booking.razorpayPaymentId = razorpay_payment_id
  booking.razorpaySignature = razorpay_signature
  booking.status = 'paid'
  await booking.save()

  // Send emails
  try {
    await sendEmail({
      to: booking.email,
      subject: `🎉 Booking Confirmed: ${event.title}`,
      html: userConfirmationEmail(booking, event),
    })
  } catch (err) {
    console.error('Failed to send user email:', err.message)
  }

  try {
    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `💰 New Booking: ${event.title} (${booking.peopleCount} tickets)`,
        html: adminNotificationEmail(booking, event),
      })
    }
  } catch (err) {
    console.error('Failed to send admin email:', err.message)
  }

  res.json({
    success: true,
    message: 'Booking confirmed!',
    data: {
      bookingId: booking._id,
      eventTitle: event.title,
      tickets: booking.peopleCount,
      amount: booking.totalAmount,
    },
  })
})

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('event')
  if (!booking) {
    res.status(404)
    throw new Error('Booking not found')
  }
  res.json({ success: true, data: booking })
})

export const getEventBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({
    event: req.params.eventId,
    status: 'paid',
  }).sort({ createdAt: -1 })
  res.json({ success: true, count: bookings.length, data: bookings })
})

export const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate('event', 'title eventDate venue')
    .sort({ createdAt: -1 })
  res.json({ success: true, count: bookings.length, data: bookings })
})