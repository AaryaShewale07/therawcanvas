import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/User.js'
import connectDB from '../config/db.js'

dotenv.config()

const seedAdmin = async () => {
  try {
    await connectDB()

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@artchocolates.com' })

    if (adminExists) {
      console.log('═══════════════════════════════════════════')
      console.log('ℹ️  Admin user already exists!')
      console.log('═══════════════════════════════════════════')
      console.log(`📧 Email: ${adminExists.email}`)
      console.log(`👤 Name: ${adminExists.name}`)
      console.log(`🔑 Role: ${adminExists.role}`)
      console.log('═══════════════════════════════════════════')
      
      // If you want to reset password, uncomment these lines:
      // adminExists.password = 'Admin@123'
      // await adminExists.save()
      // console.log('✅ Password reset to: Admin@123')
      
      process.exit(0)
    }

    // Create admin user
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
    console.log('✅ Admin user created successfully!')
    console.log('═══════════════════════════════════════════')
    console.log(`📧 Email: ${admin.email}`)
    console.log(`🔑 Password: Admin@123`)
    console.log(`👤 Name: ${admin.name}`)
    console.log(`🎭 Role: ${admin.role}`)
    console.log('═══════════════════════════════════════════')
    console.log('⚠️  Please use these credentials to login!')
    console.log('═══════════════════════════════════════════')
    console.log('')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

seedAdmin()