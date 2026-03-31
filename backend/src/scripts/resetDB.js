import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/User.js'
import connectDB from '../config/db.js'

dotenv.config()

const resetDB = async () => {
  try {
    await connectDB()

    console.log('⚠️  Deleting all users...')
    await User.deleteMany({})
    console.log('✅ All users deleted')

    console.log('🔄 Creating new admin...')
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@artchocolates.com',
      password: 'Admin@123',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
    })

    console.log('')
    console.log('═══════════════════════════════════════════')
    console.log('✅ Database reset complete!')
    console.log('═══════════════════════════════════════════')
    console.log(`📧 Email: ${admin.email}`)
    console.log(`🔑 Password: Admin@123`)
    console.log('═══════════════════════════════════════════')
    console.log('')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

resetDB()