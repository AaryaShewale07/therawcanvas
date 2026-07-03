import asyncHandler from 'express-async-handler'
import Newsletter from '../models/Newsletter.js'
import sendEmail, {
  addContactToBrevo,
  removeContactFromBrevo,
  sendCampaign,
} from '../utils/sendEmail.js'

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/newsletter/subscribe
// ═══════════════════════════════════════════════════════════════════════════════
export const subscribe = asyncHandler(async (req, res) => {
  console.log('🟢 [Newsletter] Subscribe hit:', req.body)

  const { email } = req.body

  if (!email) {
    res.status(400)
    throw new Error('Email is required')
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    res.status(400)
    throw new Error('Invalid email address')
  }

  const normalizedEmail = email.toLowerCase()

  // ── Check if already subscribed ──────────────────────────────────────────────
  const existing = await Newsletter.findOne({ email: normalizedEmail })

  if (existing) {
    if (existing.isActive) {
      return res.status(400).json({
        success: false,
        message: "You're already subscribed! 💝",
      })
    }

    // Reactivate
    existing.isActive = true
    existing.subscribedAt = new Date()
    await existing.save()

    // Re-sync to Brevo + send welcome
    await addContactToBrevo(normalizedEmail)

    try {
      console.log('📤 [Newsletter] Sending reactivation email to:', normalizedEmail)
      await sendWelcomeEmail(normalizedEmail)
      console.log('✅ [Newsletter] Reactivation email sent')
    } catch (e) {
      console.error('❌ [Newsletter] Reactivation email FAILED:', e.message)
    }

    return res.json({
      success: true,
      message: 'Welcome back! Subscription reactivated 🎉',
    })
  }

  // ── Create new subscription ──────────────────────────────────────────────────
  await Newsletter.create({ email: normalizedEmail })
  console.log('💾 [Newsletter] DB record created for:', normalizedEmail)

  // ── Sync to Brevo contact list (for campaigns) ───────────────────────────────
  await addContactToBrevo(normalizedEmail)

  // ── Send welcome email to subscriber ─────────────────────────────────────────
  try {
    console.log('📤 [Newsletter] Sending welcome email to:', normalizedEmail)
    await sendWelcomeEmail(normalizedEmail)
    console.log('✅ [Newsletter] Welcome email sent')
  } catch (emailErr) {
    console.error('❌ [Newsletter] Welcome email FAILED:', emailErr.message)
  }

  // ── Send admin notification ──────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || process.env.BREVO_SENDER_EMAIL
  if (adminEmail) {
    try {
      console.log('📤 [Newsletter] Sending admin notification to:', adminEmail)
      await sendEmail({
        to: adminEmail,
        subject: `🔔 New Newsletter Subscriber: ${normalizedEmail}`,
        html: adminNotificationEmail(normalizedEmail),
      })
      console.log('✅ [Newsletter] Admin notification sent')
    } catch (e) {
      console.error('❌ [Newsletter] Admin email FAILED:', e.message)
    }
  }

  res.status(201).json({
    success: true,
    message: 'Subscribed successfully! Check your inbox 📬',
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/newsletter/unsubscribe
// ═══════════════════════════════════════════════════════════════════════════════
export const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    res.status(400)
    throw new Error('Email is required')
  }

  const normalizedEmail = email.toLowerCase()
  const subscriber = await Newsletter.findOne({ email: normalizedEmail })

  if (!subscriber) {
    res.status(404)
    throw new Error('Email not found in our subscribers list')
  }

  subscriber.isActive = false
  await subscriber.save()

  // Remove from Brevo contact list
  await removeContactFromBrevo(normalizedEmail)

  res.json({
    success: true,
    message: "You have been unsubscribed. We'll miss you! 💔",
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/newsletter/all (admin only)
// ═══════════════════════════════════════════════════════════════════════════════
export const getAllSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Newsletter.find({}).sort('-createdAt')

  res.json({
    success: true,
    count: subscribers.length,
    activeCount: subscribers.filter((s) => s.isActive).length,
    inactiveCount: subscribers.filter((s) => !s.isActive).length,
    data: subscribers,
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /api/newsletter/:id (admin only — permanently delete)
// ═══════════════════════════════════════════════════════════════════════════════
export const deleteSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await Newsletter.findById(req.params.id)

  if (!subscriber) {
    res.status(404)
    throw new Error('Subscriber not found')
  }

  // Remove from Brevo too
  await removeContactFromBrevo(subscriber.email)

  await subscriber.deleteOne()

  res.json({
    success: true,
    message: 'Subscriber permanently deleted',
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/newsletter/campaign (admin only — send broadcast to all subscribers)
// ═══════════════════════════════════════════════════════════════════════════════
export const sendNewsletterCampaign = asyncHandler(async (req, res) => {
  const { subject, htmlContent, name, sendNow = true } = req.body

  if (!subject || !htmlContent) {
    res.status(400)
    throw new Error('Subject and htmlContent are required')
  }

  console.log('📣 [Newsletter] Creating campaign:', subject)

  const result = await sendCampaign({
    name: name || `Newsletter - ${new Date().toLocaleDateString('en-IN')}`,
    subject,
    htmlContent,
    sendNow,
  })

  res.json({
    success: true,
    message: sendNow
      ? 'Campaign sent to all subscribers! 🚀'
      : 'Campaign created as draft',
    data: result,
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

const sendWelcomeEmail = async (email) => {
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fefdfb;">
      <div style="background: linear-gradient(135deg, #471701 0%, #7a4520 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fff; margin: 10px 0 5px; font-size: 28px;">Welcome to Our Sweet Family! 🎉</h1>
        <p style="color: #d4be3e; margin: 0; font-style: italic; font-size: 14px;">You're now part of TheRawCanvasStudio</p>
      </div>
      <div style="padding: 30px; background: white;">
        <p style="font-size: 18px; color: #333;">Hello there! 👋</p>
        <p style="color: #555; line-height: 1.6;">
          Thank you for subscribing to <strong>TheRawCanvasStudio</strong> newsletter! 🎨🍫
        </p>
        <div style="background: #fef9e7; border-left: 4px solid #d4be3e; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <ul style="margin: 0; padding-left: 20px; color: #7a4520;">
            <li style="margin: 8px 0;">🎨 <strong>New artwork drops</strong> before everyone else</li>
            <li style="margin: 8px 0;">🍫 <strong>Seasonal collections</strong></li>
            <li style="margin: 8px 0;">🎁 <strong>Exclusive discounts</strong></li>
            <li style="margin: 8px 0;">📚 <strong>Workshop announcements</strong></li>
            <li style="margin: 8px 0;">✨ <strong>Behind-the-scenes</strong> stories</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #471701, #7a4520); color: white; text-decoration: none; border-radius: 30px; font-weight: bold;">
            Explore Collection →
          </a>
        </div>
        <p style="color: #555; font-size: 14px; line-height: 1.6; margin-top: 25px;">
          Stay creative,<br>
          <strong>The TheRawCanvasStudio Team</strong> 💝
        </p>
      </div>
      <div style="background: #f5f1ea; padding: 25px; text-align: center; border-radius: 0 0 12px 12px; border-top: 3px solid #d4be3e;">
        <p style="color: #7a4520; font-size: 14px; margin: 5px 0;">
          📧 therawcanvase@gmail.com | 📱 +91 82912 71695
        </p>
        <p style="color: #999; font-size: 11px; margin-top: 15px;">
          Don't want these? <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `

  return await sendEmail({
    to: email,
    subject: '🎉 Welcome to TheRawCanvasStudio Newsletter!',
    html,
  })
}

const adminNotificationEmail = (email) => `
  <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #471701, #7a4520); padding: 20px; border-radius: 12px; text-align: center; color: white;">
      <h2 style="margin: 0;">🔔 New Newsletter Subscriber!</h2>
    </div>
    <div style="background: white; padding: 20px; margin-top: 10px; border-radius: 12px; border: 1px solid #eee;">
      <p style="font-size: 16px;">A new person just subscribed to your newsletter:</p>
      <div style="background: #fef9e7; padding: 15px; border-radius: 8px; border-left: 4px solid #d4be3e;">
        <p style="margin: 0; font-size: 18px;"><strong>📧 ${email}</strong></p>
        <p style="margin: 5px 0 0; color: #999; font-size: 13px;">${new Date().toLocaleString('en-IN')}</p>
      </div>
    </div>
  </div>
`