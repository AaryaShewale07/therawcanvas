import asyncHandler from 'express-async-handler'
import crypto from 'crypto'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import sendEmail from '../utils/sendEmail.js'
import { welcomeEmail } from '../utils/emailTemplates.js'
import cloudinary from '../config/cloudinary.js'

// ================= UTIL =================

const generateToken = (id, rememberMe) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : '7d',
  })
}

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : user
  delete obj.password
  delete obj.passwordResetToken
  delete obj.passwordResetExpires
  return obj
}

// ================= AUTH =================

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const exists = await User.findOne({ email })
  if (exists) throw new Error('User already exists')

  const user = await User.create({ name, email, password })

  // ⭐ Send welcome email (don't block registration if it fails)
  try {
    await sendEmail({
      to: user.email,
      subject: '🎉 Welcome to TheRawCanvasStudio!',
      html: welcomeEmail(user.name),
    })
    console.log('✅ Welcome email sent to:', user.email)
  } catch (emailErr) {
    console.error('❌ Welcome email failed:', emailErr.message)
  }

  res.status(201).json({
    success: true,
    data: { user: sanitizeUser(user), token: generateToken(user._id) },
  })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body

  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    res.status(401)
    throw new Error('Invalid credentials')
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    res.status(401)
    throw new Error('Invalid credentials')
  }

  const token = generateToken(user._id, rememberMe)

  await user.save()

  res.json({
    success: true,
    data: { token, user: sanitizeUser(user) },
  })
})

export const verifyBackupCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body

  const user = await User.findOne({ email }).select('+twoFactorAuth.backupCodes')

  if (!user) throw new Error('User not found')

  const clean = code.trim().toUpperCase().replace(/[-\s]/g, '')

  const valid = user.twoFactorAuth?.backupCodes?.some(
    (c) => c.replace(/[-\s]/g, '') === clean
  )

  if (!valid) throw new Error('Invalid backup code')

  const token = generateToken(user._id, false)

  res.json({
    success: true,
    message: 'Backup code verified',
    data: { token, user: sanitizeUser(user) },
  })
})

export const logout = asyncHandler(async (req, res) => {
  res.json({ success: true })
})

// ================= FORGOT / RESET PASSWORD =================

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    return res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    })
  }

  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

  user.passwordResetToken = hashedToken
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000)
  await user.save()

  const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fdf8f4; border-radius: 16px;">
      <h2 style="color: #3d1f0a; margin-bottom: 8px;">Reset Your Password</h2>
      <p style="color: #7a4f35; margin-bottom: 24px;">
        You requested a password reset for your TheRawCanvasStudio account. Click the button below to set a new password.
        This link is valid for <strong>10 minutes</strong>.
      </p>
      <a href="${resetURL}"
        style="display: inline-block; padding: 14px 28px; background: linear-gradient(to right, #e8732a, #d4a574);
        color: white; font-weight: bold; border-radius: 10px; text-decoration: none; font-size: 16px;">
        Reset Password
      </a>
      <p style="color: #b07050; font-size: 13px; margin-top: 24px;">
        If you didn't request this, you can safely ignore this email. The link will expire automatically.
      </p>
      <p style="color: #c0a090; font-size: 12px; margin-top: 8px;">
        Or copy this link: <a href="${resetURL}" style="color: #e8732a;">${resetURL}</a>
      </p>
    </div>
  `

  await sendEmail({
    to: user.email,
    subject: 'Password Reset Link — TheRawCanvasStudio (valid 10 min)',
    html,
  })

  res.json({
    success: true,
    message: 'If that email exists, a reset link has been sent.',
  })
})

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, email, newPassword } = req.body

  if (!token || !email || !newPassword) {
    throw new Error('Token, email and new password are required')
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await User.findOne({
    email: email.toLowerCase(),
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  })

  if (!user) throw new Error('Reset link is invalid or has expired')

  user.password = newPassword
  user.passwordResetToken = null
  user.passwordResetExpires = null
  await user.save()

  res.json({ success: true, message: 'Password reset successful' })
})

// ================= USER =================

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) throw new Error('User not found')

  res.json({ success: true, data: { user: sanitizeUser(user) } })
})

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  const user = await User.findById(req.user._id).select('+password')

  const isMatch = await user.comparePassword(currentPassword)
  if (!isMatch) throw new Error('Wrong password')

  user.password = newPassword
  await user.save()

  res.json({ success: true })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const { name, phone, address } = req.body

  user.name = name || user.name
  user.phone = phone || user.phone

  if (address) {
    user.address = {
      ...user.address,
      ...address,
    }
  }

  const updatedUser = await user.save()

  res.json({
    success: true,
    data: { user: sanitizeUser(updatedUser) },
  })
})

// ================= AVATAR =================

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400)
    throw new Error('Please upload an image file')
  }

  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  if (user.avatarPublicId) {
    try {
      await cloudinary.uploader.destroy(user.avatarPublicId)
    } catch (err) {
      console.error('Failed to delete old avatar:', err.message)
    }
  }

  const b64 = Buffer.from(req.file.buffer).toString('base64')
  const dataURI = `data:${req.file.mimetype};base64,${b64}`

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'therawcanvasstudio/avatars',
    public_id: `user_${user._id}`,
    overwrite: true,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  })

  user.avatar = result.secure_url
  user.avatarPublicId = result.public_id
  await user.save()

  res.json({
    success: true,
    data: { user: sanitizeUser(user) },
  })
})

export const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  if (user.avatarPublicId) {
    try {
      await cloudinary.uploader.destroy(user.avatarPublicId)
    } catch (err) {
      console.error('Failed to delete avatar from Cloudinary:', err.message)
    }
  }

  user.avatar = null
  user.avatarPublicId = null
  await user.save()

  res.json({
    success: true,
    data: { user: sanitizeUser(user) },
  })
})

// ================= ADMIN USER MANAGEMENT =================

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 }).select('-password')
  res.json({ success: true, count: users.length, data: users })
})

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) { res.status(404); throw new Error('User not found') }
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400); throw new Error('Cannot change your own role')
  }
  user.role = user.role === 'admin' ? 'user' : 'admin'
  await user.save()
  res.json({ success: true, data: sanitizeUser(user) })
})

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) { res.status(404); throw new Error('User not found') }
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400); throw new Error('Cannot deactivate your own account')
  }
  user.isActive = !user.isActive
  await user.save()
  res.json({ success: true, data: sanitizeUser(user) })
})