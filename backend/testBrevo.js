import sendEmail from './src/utils/sendEmail.js'

console.log('🧪 Testing Brevo...')
console.log('API Key present:', !!process.env.BREVO_API_KEY)
console.log('Sender:', process.env.BREVO_SENDER_EMAIL)

const test = async () => {
  try {
    const result = await sendEmail({
      to: 'shewaleaarya@gmail.com', // 👈 your test email
      subject: '🧪 Brevo Test Email',
      html: '<h1>If you see this, Brevo works! ✅</h1>',
    })
    console.log('✅ SUCCESS:', result)
  } catch (err) {
    console.error('❌ FAILED:', err.message)
    console.error('Full error:', err)
  }
  process.exit(0)
}

test()