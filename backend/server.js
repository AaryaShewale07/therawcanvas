import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import hpp from 'hpp'

import connectDB from "./src/config/db.js"
import authRoutes from './src/routes/authRoutes.js'
import './src/config/cloudinary.js'
import settingsRoutes from './src/routes/settingsRoutes.js'
import postRoutes from './src/routes/postRoutes.js'
import dashboardRoutes from './src/routes/dashboardRoutes.js'
import bookingRoutes from './src/routes/bookingRoutes.js'
import cartRoutes from './src/routes/cartRoutes.js'
import orderRoutes from './src/routes/orderRoutes.js'
import wishlistRoutes from './src/routes/wishlistRoutes.js'
import contactRoutes from './src/routes/contactRoutes.js'
import newsletterRoutes from './src/routes/newsletterRoutes.js'
import reviewRoutes from './src/routes/reviewRoutes.js'

const app = express()

connectDB()

// ============ SECURITY MIDDLEWARE ============

// 1. Helmet — Sets secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for now if it breaks images
  crossOriginEmbedderPolicy: false,
}))

// 2. CORS — Only allow your frontend
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com', 'https://www.yourdomain.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}))

// 3. Body Parser — with size limits (prevent large payloads)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 4. NoSQL Injection Protection
app.use(mongoSanitize())

// 5. XSS Protection
app.use(xss())

// 6. HTTP Parameter Pollution Protection
app.use(hpp({
  whitelist: ['category', 'tags'], // Allow these to have multiple values
}))

// 7. Rate Limiting — Prevent brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per 15 min
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Stricter limit for auth routes (prevent brute force login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 login attempts per 15 min
  message: {
    success: false,
    message: 'Too many login attempts, please try again in 15 minutes',
  },
  skipSuccessfulRequests: true,
})

// Apply rate limiting
app.use('/api/', limiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/auth/forgot-password', authLimiter)

// ============ ROUTES ============

app.use('/api/auth', authRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/reviews', reviewRoutes)

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date().toISOString() })
})

// ============ ERROR HANDLER ============

app.use((err, req, res, next) => {
  // Don't leak error details in production
  const isProduction = process.env.NODE_ENV === 'production'

  console.error('Error:', err.message)

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB',
      })
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({
      success: false,
      message: errors.join(', '),
    })
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    })
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: isProduction
      ? 'Something went wrong'
      : err.message || 'Server Error',
    ...(isProduction ? {} : { stack: err.stack }),
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)
})