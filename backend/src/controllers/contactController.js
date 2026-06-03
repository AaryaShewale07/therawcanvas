import asyncHandler from 'express-async-handler'
import sendEmail from '../utils/sendEmail.js'

// POST /api/contact
export const sendContactMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body

  if (!name || !email || !message) {
    res.status(400)
    throw new Error('Please fill all fields')
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    res.status(400)
    throw new Error('Invalid email address')
  }

  // HTML email template
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #fefdfb;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #471701 0%, #7a4520 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #d4be3e, #b8a430); border-radius: 50%; line-height: 60px; color: #471701; font-weight: bold; font-size: 24px; margin-bottom: 15px;">A&C</div>
        <h1 style="color: #fff; margin: 10px 0 5px; font-size: 26px;">📬 New Contact Message</h1>
        <p style="color: #d4be3e; margin: 0; font-size: 14px;">Someone wants to reach you!</p>
      </div>

      <!-- Body -->
      <div style="padding: 30px; background: white;">
        <!-- Sender Info -->
        <div style="background: #f5f1ea; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px; color: #471701;"><strong>From:</strong></p>
          <p style="margin: 0 0 5px; color: #333; font-size: 18px;"><strong>${name}</strong></p>
          <p style="margin: 0; color: #7a4520;">
            📧 <a href="mailto:${email}" style="color: #7a4520; text-decoration: none;">${email}</a>
          </p>
        </div>

        <!-- Message -->
        <div style="background: #fef9e7; border-left: 4px solid #d4be3e; padding: 20px; border-radius: 8px;">
          <p style="margin: 0 0 10px; color: #471701; font-weight: bold;">💬 Message:</p>
          <p style="margin: 0; color: #333; line-height: 1.6; white-space: pre-line;">${message}</p>
        </div>

        <!-- Quick Actions -->
        <div style="text-align: center; margin-top: 25px;">
          <a href="mailto:${email}?subject=Re:%20Your%20message%20to%20TheRawCanvasStudio" 
             style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #471701, #7a4520); color: white; text-decoration: none; border-radius: 30px; font-weight: bold; margin: 5px;">
            Reply via Email
          </a>
        </div>

        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          📅 Received on ${new Date().toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #f5f1ea; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 3px solid #d4be3e;">
        <p style="color: #7a4520; font-size: 13px; margin: 5px 0;">
          This is an automated message from your TheRawCanvasStudio contact form.
        </p>
      </div>
    </div>
  `

  // Auto-reply HTML for the sender
  const autoReplyHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #fefdfb;">
      <div style="background: linear-gradient(135deg, #471701 0%, #7a4520 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #d4be3e, #b8a430); border-radius: 50%; line-height: 60px; color: #471701; font-weight: bold; font-size: 24px; margin-bottom: 15px;">A&C</div>
        <h1 style="color: #fff; margin: 10px 0 5px; font-size: 26px;">Thanks for Reaching Out! 💝</h1>
      </div>

      <div style="padding: 30px; background: white;">
        <p style="font-size: 18px; color: #333;">Hi <strong>${name}</strong>,</p>
        <p style="color: #555; line-height: 1.6;">
          Thank you for contacting <strong>TheRawCanvasStudio</strong>! We've received your message and we'll get back to you within <strong>24 hours</strong>.
        </p>

        <div style="background: #fef9e7; border-left: 4px solid #d4be3e; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 8px; color: #471701; font-weight: bold;">📝 Your message:</p>
          <p style="margin: 0; color: #555; font-style: italic; white-space: pre-line;">"${message}"</p>
        </div>

        <p style="color: #555; line-height: 1.6;">
          For urgent queries, feel free to WhatsApp us at <strong>+91 82912 71695</strong>.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://wa.me/918291271695" style="display: inline-block; padding: 14px 32px; background: #25D366; color: white; text-decoration: none; border-radius: 30px; font-weight: bold;">
            💬 WhatsApp Us
          </a>
        </div>

        <p style="color: #555; line-height: 1.6;">
          Warm regards,<br>
          <strong>The TheRawCanvasStudio Team</strong> 🎨🍫
        </p>
      </div>

      <div style="background: #f5f1ea; padding: 25px; text-align: center; border-radius: 0 0 12px 12px; border-top: 3px solid #d4be3e;">
        <p style="color: #7a4520; font-size: 14px; margin: 5px 0;">
          📧 therawcanvase@gmail.com | 📱 +91 82912 71695
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 10px;">
          © ${new Date().getFullYear()} TheRawCanvasStudio. All rights reserved.
        </p>
      </div>
    </div>
  `

  try {
    // Send to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'therawcanvase@gmail.com',
      subject: `📬 New Contact: ${name} - ${message.slice(0, 40)}...`,
      html,
    })

    // Auto-reply to user
    try {
      await sendEmail({
        to: email,
        subject: '✅ We received your message - TheRawCanvasStudio',
        html: autoReplyHtml,
      })
    } catch (autoReplyErr) {
      console.error('Auto-reply failed:', autoReplyErr.message)
    }

    res.json({
      success: true,
      message: 'Message sent successfully! We\'ll get back to you soon.',
    })
  } catch (err) {
    console.error('Contact email error:', err)
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again or WhatsApp us.',
    })
  }
})