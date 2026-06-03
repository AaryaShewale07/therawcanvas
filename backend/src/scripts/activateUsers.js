import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()

const activateAll = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    const result = await User.updateMany(
      {},
      { $set: { isActive: true } }
    )
    console.log(`✅ Activated ${result.modifiedCount} users`)
    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err)
    process.exit(1)
  }
}

activateAll()