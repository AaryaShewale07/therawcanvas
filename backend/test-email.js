import dotenv from 'dotenv'
dotenv.config()
import sendEmail from './src/utils/sendEmail.js'

console.log('EMAIL_USER:', process.env.EMAIL_USER)
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length)

sendEmail({
  to: process.env.EMAIL_USER,
  subject: '✅ SMTP Test',
  html: '<h1>It works!</h1>',
})
  .then(() => console.log('✅ Email sent!'))
  .catch((err) => console.error('❌ Failed:', err.message))