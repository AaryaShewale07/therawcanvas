import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import { asyncHandler } from '../middleware/errorMiddleware.js'
import crypto from 'crypto'

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, acceptTerms, acceptPrivacy } = req.body

  // Validate terms acceptance
  if (!acceptTerms || !acceptPrivacy) {
    res.status(400)
    throw new Error('You must accept Terms of Service and Privacy Policy to register')
  }

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error('User with this email already exists')
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'user',
    acceptedTerms: {
      termsOfService: acceptTerms,
      privacyPolicy: acceptPrivacy,
      acceptedAt: new Date(),
    },
  })

  if (user) {
    user.lastLogin = new Date()
    await user.save()

    const token = generateToken(user._id, false)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          address: user.address,
          preferences: user.preferences,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
        token,
      },
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc    Register admin user with secret key
// @route   POST /api/auth/register-admin
// @access  Public (with secret key)
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, adminSecret } = req.body

  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET_KEY) {
    res.status(403)
    throw new Error('Invalid admin secret key')
  }

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error('User with this email already exists')
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'admin',
    isEmailVerified: true,
    acceptedTerms: {
      termsOfService: true,
      privacyPolicy: true,
      acceptedAt: new Date(),
    },
  })

  if (user) {
    user.lastLogin = new Date()
    await user.save()

    const token = generateToken(user._id, false)

    res.status(201).json({
      success: true,
      message: 'Admin user registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          address: user.address,
          preferences: user.preferences,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
        token,
      },
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe, backupCode } = req.body

  const user = await User.findOne({ email }).select('+password +twoFactorAuth.backupCodes')

  if (!user) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  if (!user.isActive) {
    res.status(401)
    throw new Error('Account is deactivated. Please contact support.')
  }

  // Check if using backup code for login
  if (backupCode) {
    if (!user.twoFactorAuth.enabled) {
      res.status(400)
      throw new Error('Two-factor authentication is not enabled')
    }

    const codeIndex = user.twoFactorAuth.backupCodes.indexOf(backupCode.toUpperCase())
    
    if (codeIndex === -1) {
      res.status(401)
      throw new Error('Invalid backup code')
    }

    // Remove used backup code
    user.twoFactorAuth.backupCodes.splice(codeIndex, 1)
    await user.save()
  } else {
    // Verify password
    const isPasswordMatch = await user.comparePassword(password)

    if (!isPasswordMatch) {
      res.status(401)
      throw new Error('Invalid email or password')
    }
  }

  // Update last login
  user.lastLogin = new Date()
  
  // Generate token with remember me option
  const token = generateToken(user._id, rememberMe)

  // Store session
  const sessionInfo = {
    token: token.substring(0, 20), // Store partial token for identification
    device: req.headers['user-agent']?.includes('Mobile') ? 'Mobile' : 'Desktop',
    browser: getBrowserName(req.headers['user-agent']),
    ip: req.ip || req.connection.remoteAddress,
    location: 'Unknown',
    lastActive: new Date(),
    rememberMe: rememberMe || false,
  }

  user.activeSessions.push(sessionInfo)
  
  // Keep only last 5 sessions
  if (user.activeSessions.length > 5) {
    user.activeSessions = user.activeSessions.slice(-5)
  }

  await user.save()

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences,
        twoFactorEnabled: user.twoFactorAuth.enabled,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
      token,
      rememberMe: rememberMe || false,
    },
  })
})

// Helper function to get browser name
const getBrowserName = (userAgent) => {
  if (!userAgent) return 'Unknown'
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  if (userAgent.includes('Opera')) return 'Opera'
  return 'Unknown'
}

// @desc    Login with backup code (for forgot password + 2FA)
// @route   POST /api/auth/login-backup
// @access  Public
export const loginWithBackupCode = asyncHandler(async (req, res) => {
  const { email, backupCode } = req.body

  if (!email || !backupCode) {
    res.status(400)
    throw new Error('Email and backup code are required')
  }

  const user = await User.findOne({ email }).select('+twoFactorAuth.backupCodes')

  if (!user) {
    res.status(401)
    throw new Error('User not found')
  }

  if (!user.twoFactorAuth.enabled) {
    res.status(400)
    throw new Error('Two-factor authentication is not enabled for this account')
  }

  const codeIndex = user.twoFactorAuth.backupCodes.indexOf(backupCode.toUpperCase())

  if (codeIndex === -1) {
    res.status(401)
    throw new Error('Invalid backup code')
  }

  // Remove used backup code
  user.twoFactorAuth.backupCodes.splice(codeIndex, 1)
  user.lastLogin = new Date()
  await user.save()

  const token = generateToken(user._id, false)

  res.json({
    success: true,
    message: 'Login successful with backup code',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences,
        twoFactorEnabled: user.twoFactorAuth.enabled,
        remainingBackupCodes: user.twoFactorAuth.backupCodes.length,
      },
      token,
    },
  })
})

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    res.status(404)
    throw new Error('No account found with that email')
  }

  // Check if user has 2FA enabled - they can use backup codes
  if (user.twoFactorAuth.enabled) {
    res.json({
      success: true,
      message: 'You have Two-Factor Authentication enabled. You can use a backup code to login.',
      data: {
        twoFactorEnabled: true,
        email: user.email,
      },
    })
    return
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken()
  await user.save()

  // Create reset URL (in production, this would be sent via email)
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

  // In production, send email here
  // await sendEmail({ email: user.email, subject: 'Password Reset', resetUrl })

  // For development, we'll just return the token
  res.json({
    success: true,
    message: 'Password reset link has been sent to your email',
    data: {
      twoFactorEnabled: false,
      // Only include resetToken in development
      ...(process.env.NODE_ENV === 'development' && { resetToken, resetUrl }),
    },
  })
})

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body
  const { token } = req.params

  // Hash the token from URL
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    res.status(400)
    throw new Error('Invalid or expired reset token')
  }

  // Set new password
  user.password = password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  res.json({
    success: true,
    message: 'Password reset successful. You can now login with your new password.',
  })
})

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        preferences: user.preferences,
        twoFactorEnabled: user.twoFactorAuth?.enabled || false,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    },
  })
})

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  user.name = req.body.name || user.name
  user.phone = req.body.phone !== undefined ? req.body.phone : user.phone

  if (req.body.avatar) {
    user.avatar = req.body.avatar
  }

  if (req.body.address) {
    user.address = {
      street: req.body.address.street !== undefined ? req.body.address.street : user.address.street,
      city: req.body.address.city !== undefined ? req.body.address.city : user.address.city,
      state: req.body.address.state !== undefined ? req.body.address.state : user.address.state,
      zipCode: req.body.address.zipCode !== undefined ? req.body.address.zipCode : user.address.zipCode,
      country: req.body.address.country !== undefined ? req.body.address.country : user.address.country,
    }
  }

  const updatedUser = await user.save()

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
        address: updatedUser.address,
        preferences: updatedUser.preferences,
        isEmailVerified: updatedUser.isEmailVerified,
        lastLogin: updatedUser.lastLogin,
        createdAt: updatedUser.createdAt,
      },
    },
  })
})

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  const user = await User.findById(req.user._id).select('+password')

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const isPasswordMatch = await user.comparePassword(currentPassword)

  if (!isPasswordMatch) {
    res.status(401)
    throw new Error('Current password is incorrect')
  }

  user.password = newPassword
  await user.save()

  res.json({
    success: true,
    message: 'Password updated successfully',
  })
})

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  const totalUsers = await User.countDocuments()
  const users = await User.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  res.json({
    success: true,
    count: users.length,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limit),
    currentPage: page,
    data: {
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      })),
    },
  })
})

// @desc    Get single user by ID (Admin only)
// @route   GET /api/auth/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    },
  })
})

// @desc    Update user role (Admin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body

  if (!['user', 'admin'].includes(role)) {
    res.status(400)
    throw new Error('Invalid role. Must be "user" or "admin"')
  }

  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400)
    throw new Error('You cannot change your own role')
  }

  user.role = role
  await user.save()

  res.json({
    success: true,
    message: `User role updated to ${role}`,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  })
})

// @desc    Update user status (Admin only)
// @route   PUT /api/auth/users/:id/status
// @access  Private/Admin
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body

  if (typeof isActive !== 'boolean') {
    res.status(400)
    throw new Error('isActive must be a boolean')
  }

  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400)
    throw new Error('You cannot change your own status')
  }

  user.isActive = isActive
  await user.save()

  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    },
  })
})

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400)
    throw new Error('You cannot delete your own account')
  }

  await user.deleteOne()

  res.json({
    success: true,
    message: 'User deleted successfully',
  })
})

// @desc    Get admin dashboard stats
// @route   GET /api/auth/admin/stats
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments()
  const totalAdmins = await User.countDocuments({ role: 'admin' })
  const activeUsers = await User.countDocuments({ isActive: true })
  const inactiveUsers = await User.countDocuments({ isActive: false })

  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 7)
  const newUsersThisWeek = await User.countDocuments({
    createdAt: { $gte: lastWeek }
  })

  const lastMonth = new Date()
  lastMonth.setDate(lastMonth.getDate() - 30)
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: lastMonth }
  })

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalAdmins,
        totalRegularUsers: totalUsers - totalAdmins,
        activeUsers,
        inactiveUsers,
        newUsersThisWeek,
        newUsersThisMonth,
      },
    },
  })
})