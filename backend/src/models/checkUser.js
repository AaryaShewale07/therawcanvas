import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Newsletter from './src/models/Newsletter.js'
dotenv.config()

const check = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  
  const email = 'theartexpress07@gmail.com' // 👈 the email you're testing
  const record = await Newsletter.findOne({ email: email.toLowerCase() })
  
  console.log('📋 Record found:')
  console.log(JSON.stringify(record, null, 2))
  
  await mongoose.disconnect()
  process.exit(0)
}

check()