import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
// Import cloudinary to test connection on startup
import './config/cloudinary.js'

dotenv.config()

const app = express()

// Connect to database
connectDB()

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', cloudinary: 'configured' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message)

  // Multer error handling
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

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})