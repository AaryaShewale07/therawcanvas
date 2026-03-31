import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import cloudinary from '../config/cloudinary.js'

// ================= UTIL =================

const generateToken = (id, rememberMe) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : '7d',
  })
}

const getBrowserName = (ua) => {
  if (!ua) return 'Unknown'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  return 'Unknown'
}

const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user }
  delete userObj.password
  delete userObj.twoFactorAuth?.secret
  delete userObj.twoFactorAuth?.backupCodes
  return userObj
}

const getDefaultAvatar = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=D4A574&color=fff&size=200`
}

// Helper to upload to Cloudinary from buffer
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'avatars',
      width: 300,
      height: 300,
      crop: 'fill',
      gravity: 'face',
      format: 'jpg',
      quality: 'auto',
      ...options,
    }

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
      .end(buffer)
  })
}

// ================= AUTH =================

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const exists = await User.findOne({ email })
  if (exists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar: getDefaultAvatar(name),
  })

  res.status(201).json({
    success: true,
    data: { user: sanitizeUser(user), token: generateToken(user._id) },
  })
})

export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const user = await User.create({
    name,
    email,
    password,
    role: 'admin',
    avatar: getDefaultAvatar(name),
  })

  res.status(201).json({
    success: true,
    data: { user: sanitizeUser(user), token: generateToken(user._id) },
  })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe, backupCode } = req.body

  const user = await User.findOne({ email }).select(
    '+password +twoFactorAuth.backupCodes'
  )

  if (!user) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  if (!user.isActive) {
    res.status(401)
    throw new Error('Account is deactivated')
  }

  if (backupCode) {
    if (!user.twoFactorAuth?.enabled) {
      res.status(400)
      throw new Error('2FA not enabled')
    }

    const cleanCode = backupCode.trim().toUpperCase().replace(/[-\s]/g, '')
    const codeIndex = user.twoFactorAuth.backupCodes.findIndex(
      (code) => code.replace(/[-\s]/g, '') === cleanCode
    )

    if (codeIndex === -1) {
      res.status(401)
      throw new Error('Invalid backup code')
    }

    user.twoFactorAuth.backupCodes.splice(codeIndex, 1)
  } else {
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      res.status(401)
      throw new Error('Invalid email or password')
    }
  }

  user.lastLogin = new Date()
  const token = generateToken(user._id, rememberMe)

  user.activeSessions.push({
    token: token.substring(0, 20),
    device: req.headers['user-agent']?.includes('Mobile') ? 'Mobile' : 'Desktop',
    browser: getBrowserName(req.headers['user-agent']),
    ip: req.ip,
    location: 'Unknown',
    lastActive: new Date(),
    rememberMe: rememberMe || false,
  })

  if (user.activeSessions.length > 5) {
    user.activeSessions = user.activeSessions.slice(-5)
  }

  await user.save()

  res.json({
    success: true,
    data: {
      token,
      user: sanitizeUser(user),
    },
  })
})

export const loginWithBackupCode = asyncHandler(async (req, res) => {
  const { email, backupCode } = req.body

  const user = await User.findOne({ email }).select(
    '+twoFactorAuth.backupCodes +twoFactorAuth.enabled'
  )

  if (!user) {
    res.status(401)
    throw new Error('Invalid email')
  }

  if (!user.isActive) {
    res.status(401)
    throw new Error('Account is deactivated')
  }

  if (!user.twoFactorAuth?.enabled) {
    res.status(400)
    throw new Error('2FA not enabled for this account')
  }

  const cleanCode = backupCode.trim().toUpperCase().replace(/[-\s]/g, '')
  const codeIndex = user.twoFactorAuth.backupCodes.findIndex(
    (code) => code.replace(/[-\s]/g, '') === cleanCode
  )

  if (codeIndex === -1) {
    res.status(401)
    throw new Error('Invalid or already used backup code')
  }

  user.twoFactorAuth.backupCodes.splice(codeIndex, 1)
  user.lastLogin = new Date()

  const token = generateToken(user._id)

  user.activeSessions.push({
    token: token.substring(0, 20),
    device: req.headers['user-agent']?.includes('Mobile') ? 'Mobile' : 'Desktop',
    browser: getBrowserName(req.headers['user-agent']),
    ip: req.ip,
    location: 'Unknown',
    lastActive: new Date(),
    rememberMe: false,
  })

  if (user.activeSessions.length > 5) {
    user.activeSessions = user.activeSessions.slice(-5)
  }

  await user.save()

  const remainingCodes = user.twoFactorAuth.backupCodes.length

  res.json({
    success: true,
    data: {
      token,
      user: sanitizeUser(user),
      remainingBackupCodes: remainingCodes,
    },
    message:
      remainingCodes < 3
        ? `Warning: Only ${remainingCodes} backup codes remaining.`
        : 'Logged in successfully with backup code',
  })
})

export const logout = asyncHandler(async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (token && req.user) {
      const user = await User.findById(req.user._id)
      if (user) {
        user.activeSessions = user.activeSessions.filter(
          (session) => session.token !== token.substring(0, 20)
        )
        await user.save()
      }
    }

    res.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    res.json({ success: true, message: 'Logged out' })
  }
})

// ================= USER =================

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  res.json({
    success: true,
    data: { user },
  })
})

// ================= PROFILE =================

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body

  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  if (name) user.name = name
  if (phone !== undefined) user.phone = phone
  if (address) {
    user.address = { ...user.address, ...address }
  }

  await user.save()

  res.json({
    success: true,
    data: { user: sanitizeUser(user) },
  })
})

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  const user = await User.findById(req.user._id).select('+password')

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const isMatch = await user.comparePassword(currentPassword)
  if (!isMatch) {
    res.status(400)
    throw new Error('Current password is incorrect')
  }

  user.password = newPassword
  await user.save()

  res.json({
    success: true,
    message: 'Password updated successfully',
  })
})

// ================= AVATAR - CLOUDINARY =================

// ✅ Upload Avatar to Cloudinary
export const uploadAvatar = asyncHandler(async (req, res) => {
  console.log('📸 Upload avatar called')

  if (!req.file) {
    res.status(400)
    throw new Error('Please upload an image')
  }

  console.log('File received:', req.file.originalname, req.file.size)

  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  try {
    // Delete old avatar from Cloudinary if exists
    if (user.avatarPublicId) {
      console.log('Deleting old avatar:', user.avatarPublicId)
      await cloudinary.uploader.destroy(user.avatarPublicId)
    }

    // Upload new avatar to Cloudinary
    console.log('Uploading to Cloudinary...')
    const result = await uploadToCloudinary(req.file.buffer, {
      public_id: `avatar_${user._id}_${Date.now()}`,
    })

    console.log('Cloudinary result:', result.secure_url)

    // Update user with new avatar
    user.avatar = result.secure_url
    user.avatarPublicId = result.public_id

    await user.save()

    res.json({
      success: true,
      data: {
        avatar: user.avatar,
        user: sanitizeUser(user),
      },
      message: 'Avatar uploaded successfully',
    })
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    res.status(500)
    throw new Error('Failed to upload image to cloud storage')
  }
})

// ✅ Remove Avatar from Cloudinary
export const removeAvatar = asyncHandler(async (req, res) => {
  console.log('🗑️ Remove avatar called')

  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  try {
    // Delete from Cloudinary if exists
    if (user.avatarPublicId) {
      console.log('Deleting from Cloudinary:', user.avatarPublicId)
      const deleteResult = await cloudinary.uploader.destroy(user.avatarPublicId)
      console.log('Delete result:', deleteResult)
    }

    // Set default avatar
    user.avatar = getDefaultAvatar(user.name)
    user.avatarPublicId = null

    await user.save()

    console.log('Avatar reset to default:', user.avatar)

    res.json({
      success: true,
      data: {
        avatar: user.avatar,
        user: sanitizeUser(user),
      },
      message: 'Avatar removed successfully',
    })
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    res.status(500)
    throw new Error('Failed to remove image from cloud storage')
  }
})

// ================= PASSWORD RESET =================

export const forgotPassword = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'If an account exists, a reset link has been sent',
  })
})

export const resetPassword = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Password reset successful',
  })
})

// ================= ADMIN =================

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password')
  res.json({ success: true, data: users })
})

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  res.json({ success: true, data: user })
})

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  user.role = role
  await user.save()
  res.json({ success: true, data: { user: sanitizeUser(user) } })
})

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  user.isActive = isActive
  await user.save()
  res.json({ success: true, data: { user: sanitizeUser(user) } })
})

export const getAdminStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments()
  const activeUsers = await User.countDocuments({ isActive: true })
  const adminUsers = await User.countDocuments({ role: 'admin' })
  res.json({ success: true, data: { totalUsers, activeUsers, adminUsers } })
})

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400)
    throw new Error('Cannot delete your own account')
  }

  // Delete avatar from Cloudinary if exists
  if (user.avatarPublicId) {
    try {
      await cloudinary.uploader.destroy(user.avatarPublicId)
    } catch (error) {
      console.error('Error deleting avatar from Cloudinary:', error)
    }
  }

  await user.deleteOne()
  res.json({ success: true, message: 'User deleted successfully' })
})