import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/User.js'
import connectDB from '../config/db.js'

dotenv.config()

const checkUsers = async () => {
  try {
    await connectDB()

    const users = await User.find({})
    
    console.log('')
    console.log('═══════════════════════════════════════════')
    console.log(`Total Users in Database: ${users.length}`)
    console.log('═══════════════════════════════════════════')
    console.log('')

    if (users.length === 0) {
      console.log('❌ No users found in database!')
      console.log('💡 Run "npm run seed:admin" to create an admin user')
    } else {
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`)
        console.log(`  ID: ${user._id}`)
        console.log(`  Name: ${user.name}`)
        console.log(`  Email: ${user.email}`)
        console.log(`  Role: ${user.role}`)
        console.log(`  Active: ${user.isActive}`)
        console.log(`  Created: ${user.createdAt}`)
        console.log('')
      })
    }

    console.log('═══════════════════════════════════════════')
    console.log('')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkUsers()