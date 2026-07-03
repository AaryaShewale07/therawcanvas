import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import hpp from 'hpp'
import path from 'path'
import { fileURLToPath } from 'url'

import connectDB from './src/config/db.js'
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
import galleryRoutes from './src/routes/galleryRoutes.js'
import bannerRoutes from './src/routes/bannerRoutes.js'
import heroVideoRoutes from './src/routes/heroVideosRoutes.js'
import commissionRoutes from './src/routes/commissionsRoutes.js'
import couponRoutes from './src/routes/couponRoutes.js'
import referralRoutes from './src/routes/referralRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.set('trust proxy', 1)

connectDB()

// ============ SECURITY MIDDLEWARE ============

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
)

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
)

// ✅ INCREASED body parser limit to 100mb for video uploads
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb' }))

app.use(mongoSanitize())
app.use(xss())
app.use(
  hpp({
    whitelist: ['category', 'tags'],
  })
)

// ⭐ FIXED — Development-friendly rate limits with skip for cart/wishlist
const isDev = process.env.NODE_ENV === 'development'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,          // 15 minutes
  max: isDev ? 10000 : 500,          // Much higher in dev, 500 in prod
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // ⭐ Skip rate limiting for common user actions
  skip: (req) => {
    return (
      req.path.startsWith('/api/cart') ||
      req.path.startsWith('/api/wishlist') ||
      req.path.startsWith('/api/coupons/validate') ||
      req.path.startsWith('/api/orders/check-referral-discount')
    )
  },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 10,             // 100 in dev, 10 in prod
  message: {
    success: false,
    message: 'Too many login attempts, please try again in 15 minutes',
  },
  skipSuccessfulRequests: true,
})

app.use('/api/', limiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/auth/forgot-password', authLimiter)

// ============ STATIC FILES ============
app.use(
  '/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
  },
  express.static(path.join(__dirname, 'public', 'uploads'))
)

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
app.use('/api/gallery', galleryRoutes)
app.use('/api/banners', bannerRoutes)
app.use('/api/hero-videos', heroVideoRoutes)
app.use('/api/commissions', commissionRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/referrals', referralRoutes)

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date().toISOString() })
})

// ============ ERROR HANDLER ============
app.use((err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production'

  console.error('Error:', err.message)

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 100MB per file',
      })
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 20 files per event',
      })
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({
      success: false,
      message: errors.join(', '),
    })
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    })
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: isProduction ? 'Something went wrong' : err.message || 'Server Error',
    ...(isProduction ? {} : { stack: err.stack }),
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`
  )
})