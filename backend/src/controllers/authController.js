import asyncHandler from 'express-async-handler'
import crypto from 'crypto'
import User from '../models/User.js'
import Referral from '../models/Referral.js'
import jwt from 'jsonwebtoken'
import sendEmail from '../utils/sendEmail.js'
import { welcomeEmail } from '../utils/emailTemplates.js'
import cloudinary from '../config/cloudinary.js'
import { OAuth2Client } from 'google-auth-library'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

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

// ⭐ Helper: Apply referral code during signup
const applyReferralOnSignup = async (newUser, referralCode) => {
  if (!referralCode) return
  try {
    const referrer = await User.findOne({
      referralCode: referralCode.toUpperCase(),
    })

    if (!referrer || referrer._id.toString() === newUser._id.toString()) return

    newUser.referredBy = referrer._id
    await newUser.save({ validateBeforeSave: false })

    await Referral.create({
      referrer: referrer._id,
      referee: newUser._id,
      referralCodeUsed: referralCode.toUpperCase(),
      status: 'pending',
    })

    referrer.referralStats.totalReferred += 1
    await referrer.save({ validateBeforeSave: false })

    console.log(`✅ Referral: ${referrer.email} referred ${newUser.email}`)
  } catch (err) {
    console.error('Referral apply failed:', err.message)
  }
}

// ================= AUTH =================

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, referralCode } = req.body

  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
  })

  await applyReferralOnSignup(user, referralCode)

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

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

  if (!user) {
    res.status(401)
    throw new Error('Invalid credentials')
  }

  // ⭐ NEW: Handle Google-only users trying to login with password
  if (user.authProvider === 'google' && !user.password) {
    res.status(401)
    throw new Error('This account uses Google Sign-In. Please continue with Google.')
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    res.status(401)
    throw new Error('Invalid credentials')
  }

  const token = generateToken(user._id, rememberMe)

  user.lastLogin = new Date()
  await user.save({ validateBeforeSave: false })

  res.json({
    success: true,
    data: { token, user: sanitizeUser(user) },
  })
})

export const verifyBackupCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+twoFactorAuth.backupCodes'
  )

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const clean = code.trim().toUpperCase().replace(/[-\s]/g, '')

  const valid = user.twoFactorAuth?.backupCodes?.some(
    (c) => c.replace(/[-\s]/g, '') === clean
  )

  if (!valid) {
    res.status(401)
    throw new Error('Invalid backup code')
  }

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

// ================= FORGOT / RESET =================

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  // ⭐ NEW: Input validation
  if (!email) {
    res.status(400)
    throw new Error('Email is required')
  }

  // ⭐ NEW: Check FRONTEND_URL is configured
  if (!process.env.FRONTEND_URL) {
    console.error('❌ FRONTEND_URL is not set in .env')
    res.status(500)
    throw new Error('Server configuration error. Please contact support.')
  }

  const user = await User.findOne({ email: email.toLowerCase() })

  // Security: Don't reveal if email exists
  if (!user) {
    return res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    })
  }

  // ⭐ NEW: Handle Google-only users (no password to reset)
  if (user.authProvider === 'google' && !user.password) {
    return res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    })
  }

  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

  user.passwordResetToken = hashedToken
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000)
  await user.save({ validateBeforeSave: false })

  const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`

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

  // ⭐ NEW: Try-catch prevents 500 crashes if email fails
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Link — TheRawCanvasStudio (valid 10 min)',
      html,
    })
    console.log('✅ Password reset email sent to:', user.email)
  } catch (emailErr) {
    console.error('❌ Password reset email failed:', emailErr.message)

    // Clear the token so user can try again
    user.passwordResetToken = null
    user.passwordResetExpires = null
    await user.save({ validateBeforeSave: false })

    res.status(500)
    throw new Error(
      'Failed to send reset email. Please try again later or contact support.'
    )
  }

  res.json({
    success: true,
    message: 'If that email exists, a reset link has been sent.',
  })
})

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, email, newPassword } = req.body

  if (!token || !email || !newPassword) {
    res.status(400)
    throw new Error('Token, email and new password are required')
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await User.findOne({
    email: email.toLowerCase(),
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  })

  if (!user) {
    res.status(400)
    throw new Error('Reset link is invalid or has expired')
  }

  user.password = newPassword
  user.passwordResetToken = null
  user.passwordResetExpires = null
  await user.save()

  res.json({ success: true, message: 'Password reset successful' })
})

// ================= USER =================

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  res.json({ success: true, data: { user: sanitizeUser(user) } })
})

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  const user = await User.findById(req.user._id).select('+password')

  // ⭐ NEW: Handle Google users setting a password for the first time
  if (user.authProvider === 'google' && !user.password) {
    user.password = newPassword
    await user.save()
    return res.json({
      success: true,
      message: 'Password set successfully. You can now log in with email/password too.',
    })
  }

  const isMatch = await user.comparePassword(currentPassword)
  if (!isMatch) {
    res.status(401)
    throw new Error('Wrong password')
  }

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

  const updatedUser = await user.save({ validateBeforeSave: false })

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
  await user.save({ validateBeforeSave: false })

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
  await user.save({ validateBeforeSave: false })

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
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400)
    throw new Error('Cannot change your own role')
  }
  user.role = user.role === 'admin' ? 'user' : 'admin'
  await user.save({ validateBeforeSave: false })
  res.json({ success: true, data: sanitizeUser(user) })
})

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400)
    throw new Error('Cannot deactivate your own account')
  }
  user.isActive = !user.isActive
  await user.save({ validateBeforeSave: false })
  res.json({ success: true, data: sanitizeUser(user) })
})

// ================= GOOGLE AUTH =================

export const googleAuth = asyncHandler(async (req, res) => {
  const { credential, referralCode } = req.body

  if (!credential) {
    res.status(400)
    throw new Error('No Google credential provided')
  }

  // ⭐ NEW: Check GOOGLE_CLIENT_ID is configured
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('❌ GOOGLE_CLIENT_ID is not set in .env')
    res.status(500)
    throw new Error('Server configuration error')
  }

  let payload
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    payload = ticket.getPayload()
  } catch (err) {
    console.error('❌ Google token verification failed:', err.message)
    res.status(401)
    throw new Error('Invalid Google token')
  }

  const { email, name, picture, sub: googleId, email_verified } = payload

  if (!email_verified) {
    res.status(401)
    throw new Error('Google email is not verified')
  }

  let user = await User.findOne({ email: email.toLowerCase() })
  let isNewUser = false

  if (!user) {
    user = await User.create({
      name,
      email: email.toLowerCase(),
      googleId,
      avatar: picture,
      authProvider: 'google',
    })
    isNewUser = true

    await applyReferralOnSignup(user, referralCode)

    try {
      await sendEmail({
        to: user.email,
        subject: '🎉 Welcome to TheRawCanvasStudio!',
        html: welcomeEmail(user.name),
      })
    } catch (emailErr) {
      console.error('❌ Welcome email failed:', emailErr.message)
    }
  } else if (!user.googleId) {
    // Link Google account to existing email account
    user.googleId = googleId
    if (!user.avatar) user.avatar = picture
    await user.save({ validateBeforeSave: false })
  }

  user.lastLogin = new Date()
  await user.save({ validateBeforeSave: false })

  const token = generateToken(user._id, false)

  res.json({
    success: true,
    isNewUser,
    data: { token, user: sanitizeUser(user) },
  })
})