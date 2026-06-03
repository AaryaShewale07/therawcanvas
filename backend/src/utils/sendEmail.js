import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error('EMAIL_USER and EMAIL_PASS must be set in .env')
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"TheRawCanvasStudio" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  }
  await transporter.sendMail(mailOptions)
}

export default sendEmail