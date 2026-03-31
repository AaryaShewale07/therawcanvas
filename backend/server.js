import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'

import connectDB from './src/config/db.js'
import authRoutes from './src/routes/authRoutes.js'
import settingsRoutes from './src/routes/settingsRoutes.js'  // ← ADD THIS
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js'
import User from './src/models/User.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Request logger (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`)
    next()
  })
}

// Create first admin if none exists
const createFirstAdmin = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const adminCount = await User.countDocuments({ role: 'admin' })

    if (adminCount === 0) {
      console.log('🔄 No admin found. Creating first admin...')
      
      const firstAdmin = await User.create({
        name: process.env.FIRST_ADMIN_NAME || 'Super Admin',
        email: process.env.FIRST_ADMIN_EMAIL || 'admin@artchocolates.com',
        password: process.env.FIRST_ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
      })

      console.log('')
      console.log('═══════════════════════════════════════════')
      console.log('✅ First admin user created successfully!')
      console.log('═══════════════════════════════════════════')
      console.log(`📧 Email: ${firstAdmin.email}`)
      console.log(`🔑 Password: ${process.env.FIRST_ADMIN_PASSWORD || 'Admin@123'}`)
      console.log(`👤 Name: ${firstAdmin.name}`)
      console.log('═══════════════════════════════════════════')
      console.log('⚠️  Use these credentials to login!')
      console.log('═══════════════════════════════════════════')
      console.log('')
    } else {
      console.log(`✓ Found ${adminCount} admin user(s) in database`)
    }
  } catch (error) {
    if (error.code === 11000) {
      console.log('✓ Admin user already exists in database')
    } else {
      console.error('❌ Error creating first admin:', error.message)
    }
  }
}

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🍫 Art & Chocolates API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      settings: '/api/settings',    // ← ADD THIS
      health: '/api/health',
    },
    documentation: {
      register: 'POST /api/auth/register',
      registerAdmin: 'POST /api/auth/register-admin',
      login: 'POST /api/auth/login',
      profile: 'GET /api/auth/me',
      users: 'GET /api/auth/users (Admin)',
      settings: 'GET /api/settings (Protected)',
    },
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/settings', settingsRoutes)  // ← ADD THIS

// Error Handling Middleware
app.use(notFound)
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 5000

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB()
    await createFirstAdmin()

    app.listen(PORT, () => {
      console.log('')
      console.log('═══════════════════════════════════════════')
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`)
      console.log(`📍 API URL: http://localhost:${PORT}`)
      console.log(`📍 Client URL: ${process.env.CLIENT_URL}`)
      console.log('═══════════════════════════════════════════')
      console.log('')
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()