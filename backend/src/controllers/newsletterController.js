import asyncHandler from 'express-async-handler'
import Newsletter from '../models/Newsletter.js'
import sendEmail from '../utils/sendEmail.js'

// POST /api/newsletter/subscribe
export const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    res.status(400)
    throw new Error('Email is required')
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    res.status(400)
    throw new Error('Invalid email address')
  }

  // Check if already subscribed
  const existing = await Newsletter.findOne({ email: email.toLowerCase() })
  if (existing) {
    if (existing.isActive) {
      return res.status(400).json({
        success: false,
        message: 'You\'re already subscribed! 💝',
      })
    } else {
      // Reactivate
      existing.isActive = true
      existing.subscribedAt = new Date()
      await existing.save()
      
      try {
        await sendWelcomeEmail(email)
      } catch (e) {
        console.error('Newsletter welcome email failed:', e.message)
      }

      return res.json({
        success: true,
        message: 'Welcome back! Subscription reactivated 🎉',
      })
    }
  }

  // Create new subscription
  await Newsletter.create({ email: email.toLowerCase() })

  // Send welcome email + admin notification
  try {
    await sendWelcomeEmail(email)
    
    if (process.env.ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `🔔 New Newsletter Subscriber: ${email}`,
        html: adminNotificationEmail(email),
      })
    }
  } catch (emailErr) {
    console.error('Newsletter email failed:', emailErr.message)
  }

  res.status(201).json({
    success: true,
    message: 'Subscribed successfully! Check your inbox 📬',
  })
})

// POST /api/newsletter/unsubscribe
export const unsubscribe = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    res.status(400)
    throw new Error('Email is required')
  }

  const subscriber = await Newsletter.findOne({ email: email.toLowerCase() })
  if (!subscriber) {
    res.status(404)
    throw new Error('Email not found in our subscribers list')
  }

  subscriber.isActive = false
  await subscriber.save()

  res.json({
    success: true,
    message: 'You have been unsubscribed. We\'ll miss you! 💔',
  })
})

// GET /api/newsletter/all (admin only)
export const getAllSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Newsletter.find({}).sort('-createdAt')
  res.json({
    success: true,
    count: subscribers.length,
    activeCount: subscribers.filter((s) => s.isActive).length,
    data: subscribers,
  })
})

// ========== EMAIL TEMPLATES ==========

const sendWelcomeEmail = async (email) => {
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fefdfb;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #471701 0%, #7a4520 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #d4be3e, #b8a430); border-radius: 50%; line-height: 60px; color: #471701; font-weight: bold; font-size: 24px; margin-bottom: 15px;">A&C</div>
        <h1 style="color: #fff; margin: 10px 0 5px; font-size: 28px;">Welcome to Our Sweet Family! 🎉</h1>
        <p style="color: #d4be3e; margin: 0; font-style: italic; font-size: 14px;">You're now part of TheRawCanvasStudio</p>
      </div>

      <!-- Body -->
      <div style="padding: 30px; background: white;">
        <p style="font-size: 18px; color: #333;">Hello there! 👋</p>
        
        <p style="color: #555; line-height: 1.6;">
          Thank you for subscribing to <strong>TheRawCanvasStudio</strong> newsletter! 🎨🍫
        </p>

        <p style="color: #555; line-height: 1.6;">
          You're now part of an exclusive community that gets first access to:
        </p>

        <div style="background: #fef9e7; border-left: 4px solid #d4be3e; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <ul style="margin: 0; padding-left: 20px; color: #7a4520;">
            <li style="margin: 8px 0;">🎨 <strong>New artwork drops</strong> before everyone else</li>
            <li style="margin: 8px 0;">🍫 <strong>Seasonal chocolate collections</strong> (Ganpati, Diwali specials)</li>
            <li style="margin: 8px 0;">🎁 <strong>Exclusive discounts</strong> & subscriber-only offers</li>
            <li style="margin: 8px 0;">📚 <strong>Workshop announcements</strong> with early bird pricing</li>
            <li style="margin: 8px 0;">✨ <strong>Behind-the-scenes</strong> stories & artisan secrets</li>
          </ul>
        </div>

        <!-- Welcome Gift -->
        <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center; color: white;">
          <p style="margin: 0 0 8px; font-size: 24px;">🎁</p>
          <h3 style="margin: 0 0 5px; font-size: 20px;">Welcome Gift!</h3>
          <p style="margin: 0; opacity: 0.95;">Enjoy FREE shipping on your first order above ₹500</p>
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

      <!-- Footer -->
      <div style="background: #f5f1ea; padding: 25px; text-align: center; border-radius: 0 0 12px 12px; border-top: 3px solid #d4be3e;">
        <p style="color: #7a4520; font-size: 14px; margin: 5px 0;">
          📧 therawcanvase@gmail.com | 📱 +91 82912 71695
        </p>
        <div style="margin-top: 15px;">
          <a href="https://www.instagram.com/the_.rawcanvas._/" style="color: #7a4520; margin: 0 8px; text-decoration: none;">📷 Instagram</a>
          <a href="https://whatsapp.com/channel/0029VaEhWdw5Ui2f1o5aLH2Z" style="color: #7a4520; margin: 0 8px; text-decoration: none;">💬 WhatsApp Community</a>
        </div>
        <p style="color: #999; font-size: 11px; margin-top: 15px;">
          Don't want these emails? <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `

  await sendEmail({
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