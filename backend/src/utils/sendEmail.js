import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error('EMAIL_USER and EMAIL_PASS must be set in .env')
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS (port 587). Render blocks port 465.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  tls: {
    rejectUnauthorized: false,
  },
})

// Verify SMTP connection on startup
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ SMTP connection failed:', err.message)
  } else {
    console.log('✅ SMTP ready to send emails')
  }
})

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"TheRawCanvasStudio" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  }
  const info = await transporter.sendMail(mailOptions)
  console.log('📧 Email sent:', info.messageId, '→', to)
  return info
}

export default sendEmail