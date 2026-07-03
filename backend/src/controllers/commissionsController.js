import asyncHandler from 'express-async-handler'
import Commission from '../models/Commission.js'
import sendEmail from '../utils/sendEmail.js'

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/commissions - Submit enquiry (Public)
// ═══════════════════════════════════════════════════════════════════════════════
export const createCommission = asyncHandler(async (req, res) => {
  console.log('🟢 [Commission] New enquiry:', req.body)

  const { name, email, message, type } = req.body

  if (!name || !email || !message) {
    res.status(400)
    throw new Error('Name, email, and message are required')
  }

  // Save to DB
  const commission = await Commission.create(req.body)
  console.log('💾 [Commission] Saved with ID:', commission._id)

  // ── Send confirmation email to USER ────────────────────────────────────────
  try {
    console.log('📤 [Commission] Sending confirmation to user:', email)
    await sendEmail({
      to: email,
      subject: '✨ We received your enquiry — TheRawCanvasStudio',
      html: userConfirmationEmail(commission),
    })
    console.log('✅ [Commission] User confirmation sent')
  } catch (err) {
    console.error('❌ [Commission] User email FAILED:', err.message)
  }

  // ── Send notification email to ADMIN ───────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || process.env.BREVO_SENDER_EMAIL
  if (adminEmail) {
    try {
      console.log('📤 [Commission] Sending admin notification to:', adminEmail)
      await sendEmail({
        to: adminEmail,
        subject: `🎨 New ${type === 'commission' ? 'Commission' : type === 'workshop' ? 'Workshop' : 'Enquiry'} Request from ${name}`,
        html: adminNotificationEmail(commission),
      })
      console.log('✅ [Commission] Admin notification sent')
    } catch (err) {
      console.error('❌ [Commission] Admin email FAILED:', err.message)
    }
  }

  res.status(201).json({
    success: true,
    message: 'Enquiry submitted successfully! Check your email for confirmation.',
    data: commission,
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/commissions - Get all (Admin)
// ═══════════════════════════════════════════════════════════════════════════════
export const getAllCommissions = asyncHandler(async (req, res) => {
  const enquiries = await Commission.find().sort({ createdAt: -1 })
  res.json({
    success: true,
    count: enquiries.length,
    data: enquiries,
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/commissions/:id - Get single (Admin)
// ═══════════════════════════════════════════════════════════════════════════════
export const getCommissionById = asyncHandler(async (req, res) => {
  const enquiry = await Commission.findById(req.params.id)
  if (!enquiry) {
    res.status(404)
    throw new Error('Enquiry not found')
  }
  res.json({ success: true, data: enquiry })
})

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/commissions/:id - Update status/notes (Admin)
// ═══════════════════════════════════════════════════════════════════════════════
export const updateCommission = asyncHandler(async (req, res) => {
  const enquiry = await Commission.findById(req.params.id)
  if (!enquiry) {
    res.status(404)
    throw new Error('Enquiry not found')
  }

  const oldStatus = enquiry.status
  const updated = await Commission.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  })

  // Send status update email if status changed (and not just "new")
  if (req.body.status && req.body.status !== oldStatus && req.body.status !== 'new') {
    try {
      await sendEmail({
        to: updated.email,
        subject: `📬 Your enquiry status: ${req.body.status.toUpperCase()}`,
        html: statusUpdateEmail(updated),
      })
      console.log('✅ [Commission] Status update email sent to:', updated.email)
    } catch (err) {
      console.error('❌ [Commission] Status email FAILED:', err.message)
    }
  }

  res.json({ success: true, data: updated })
})

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /api/commissions/:id (Admin)
// ═══════════════════════════════════════════════════════════════════════════════
export const deleteCommission = asyncHandler(async (req, res) => {
  const enquiry = await Commission.findById(req.params.id)
  if (!enquiry) {
    res.status(404)
    throw new Error('Enquiry not found')
  }
  await enquiry.deleteOne()
  res.json({ success: true, message: 'Enquiry deleted' })
})

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

const userConfirmationEmail = (commission) => {
  const typeLabel = {
    commission: '🎨 Custom Artwork',
    workshop: '📚 Workshop',
    other: '✨ Enquiry',
  }[commission.type] || '✨ Enquiry'

  return `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fefdfb;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #471701 0%, #7a4520 100%); padding: 35px 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 28px;">Thank You, ${commission.name}! 💝</h1>
        <p style="color: #d4be3e; margin: 10px 0 0; font-size: 14px;">Your ${typeLabel} enquiry has been received</p>
      </div>

      <!-- Body -->
      <div style="padding: 30px; background: white;">
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hi ${commission.name}, 👋
        </p>
        <p style="color: #555; line-height: 1.6;">
          Thank you for reaching out to <strong>TheRawCanvasStudio</strong>! We've received your enquiry and our team will review it carefully.
        </p>

        <div style="background: #fef9e7; border-left: 4px solid #d4be3e; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0 0 10px; color: #7a4520; font-weight: bold;">📋 Your Enquiry Summary:</p>
          <p style="margin: 5px 0; color: #555;"><strong>Type:</strong> ${typeLabel}</p>
          ${commission.subject ? `<p style="margin: 5px 0; color: #555;"><strong>Subject:</strong> ${commission.subject}</p>` : ''}
          ${commission.budget ? `<p style="margin: 5px 0; color: #555;"><strong>Budget:</strong> ${commission.budget}</p>` : ''}
          ${commission.deadline ? `<p style="margin: 5px 0; color: #555;"><strong>Deadline:</strong> ${new Date(commission.deadline).toLocaleDateString('en-IN')}</p>` : ''}
          <p style="margin: 10px 0 0; color: #555;"><strong>Message:</strong></p>
          <p style="margin: 5px 0; color: #555; font-style: italic;">"${commission.message}"</p>
        </div>

        <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 18px; border-radius: 10px; text-align: center; color: white; margin: 20px 0;">
          <p style="margin: 0; font-size: 16px;">⏱️ <strong>We'll respond within 24 hours</strong></p>
        </div>

        <p style="color: #555; line-height: 1.6;">
          In the meantime, feel free to explore our latest collection or follow us on Instagram for daily inspiration!
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #471701, #7a4520); color: white; text-decoration: none; border-radius: 30px; font-weight: bold;">
            Explore Our Work →
          </a>
        </div>

        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          With creativity,<br>
          <strong>The TheRawCanvasStudio Team</strong> 🎨
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #f5f1ea; padding: 25px; text-align: center; border-radius: 0 0 12px 12px; border-top: 3px solid #d4be3e;">
        <p style="color: #7a4520; font-size: 14px; margin: 5px 0;">
          📧 therawcanvase@gmail.com | 📱 +91 82912 71695
        </p>
        <p style="color: #999; font-size: 11px; margin-top: 10px;">
          Reference ID: ${commission._id}
        </p>
      </div>
    </div>
  `
}

const adminNotificationEmail = (commission) => {
  const typeLabel = {
    commission: '🎨 Custom Artwork',
    workshop: '📚 Workshop Enquiry',
    other: '✨ General Enquiry',
  }[commission.type] || '✨ Enquiry'

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #471701, #7a4520); padding: 25px; border-radius: 12px 12px 0 0; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 24px;">🔔 New ${typeLabel} Request!</h2>
      </div>

      <div style="background: white; padding: 25px; border: 1px solid #eee;">
        <div style="background: #fef9e7; padding: 20px; border-left: 4px solid #d4be3e; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px; color: #7a4520;">👤 Customer Details</h3>
          <p style="margin: 8px 0;"><strong>Name:</strong> ${commission.name}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${commission.email}">${commission.email}</a></p>
          ${commission.phone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${commission.phone}">${commission.phone}</a></p>` : ''}
        </div>

        <div style="background: #f0f9ff; padding: 20px; border-left: 4px solid #0ea5e9; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px; color: #0369a1;">📋 Enquiry Details</h3>
          <p style="margin: 8px 0;"><strong>Type:</strong> ${typeLabel}</p>
          ${commission.subject ? `<p style="margin: 8px 0;"><strong>Subject:</strong> ${commission.subject}</p>` : ''}
          ${commission.budget ? `<p style="margin: 8px 0;"><strong>Budget:</strong> ${commission.budget}</p>` : ''}
          ${commission.deadline ? `<p style="margin: 8px 0;"><strong>Deadline:</strong> ${new Date(commission.deadline).toLocaleDateString('en-IN')}</p>` : ''}
        </div>

        <div style="background: #fefce8; padding: 20px; border-left: 4px solid #eab308; border-radius: 8px;">
          <h3 style="margin: 0 0 10px; color: #854d0e;">💬 Message</h3>
          <p style="margin: 0; color: #555; line-height: 1.6;">${commission.message}</p>
        </div>

        <div style="text-align: center; margin-top: 25px;">
          <a href="mailto:${commission.email}" style="display: inline-block; padding: 12px 28px; background: #471701; color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
            Reply to Customer →
          </a>
        </div>

        <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
          Received: ${new Date(commission.createdAt).toLocaleString('en-IN')} | ID: ${commission._id}
        </p>
      </div>
    </div>
  `
}

const statusUpdateEmail = (commission) => {
  const statusMessages = {
    'in-progress': {
      emoji: '🔄',
      color: '#0ea5e9',
      title: 'We\'re Working On It!',
      message: 'Great news! We\'ve started working on your enquiry and will keep you updated.',
    },
    responded: {
      emoji: '✉️',
      color: '#16a34a',
      title: 'We\'ve Responded!',
      message: 'Please check your inbox for our detailed response. We hope it answers all your questions!',
    },
    closed: {
      emoji: '✅',
      color: '#6b7280',
      title: 'Enquiry Closed',
      message: 'Your enquiry has been marked as complete. Thank you for choosing us!',
    },
  }

  const info = statusMessages[commission.status] || statusMessages['in-progress']

  return `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fefdfb;">
      <div style="background: linear-gradient(135deg, ${info.color}, ${info.color}dd); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; color: white;">
        <h1 style="margin: 0; font-size: 32px;">${info.emoji}</h1>
        <h2 style="margin: 10px 0 5px; font-size: 24px;">${info.title}</h2>
      </div>

      <div style="padding: 30px; background: white;">
        <p style="font-size: 16px; color: #333;">Hi ${commission.name},</p>
        <p style="color: #555; line-height: 1.6;">${info.message}</p>

        <div style="background: #fef9e7; padding: 15px; border-left: 4px solid #d4be3e; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #7a4520;"><strong>Your Enquiry:</strong></p>
          <p style="margin: 5px 0 0; color: #555; font-style: italic;">"${commission.message.substring(0, 150)}${commission.message.length > 150 ? '...' : ''}"</p>
        </div>

        ${commission.adminNotes ? `
          <div style="background: #f0f9ff; padding: 15px; border-left: 4px solid #0ea5e9; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0369a1;"><strong>📝 Note from us:</strong></p>
            <p style="margin: 5px 0 0; color: #555;">${commission.adminNotes}</p>
          </div>
        ` : ''}

        <p style="color: #555; line-height: 1.6;">
          Have questions? Just reply to this email or contact us directly.
        </p>

        <p style="color: #555; font-size: 14px; line-height: 1.6;">
          Warm regards,<br>
          <strong>The TheRawCanvasStudio Team</strong> 🎨
        </p>
      </div>

      <div style="background: #f5f1ea; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
        <p style="color: #7a4520; font-size: 13px; margin: 0;">
          📧 therawcanvase@gmail.com | 📱 +91 82912 71695
        </p>
      </div>
    </div>
  `
}