import User from '../models/User.js'
import { asyncHandler } from '../middleware/errorMiddleware.js'
import bcrypt from 'bcryptjs'

// ==================== NOTIFICATION SETTINGS ====================

// @desc    Get notification settings
// @route   GET /api/settings/notifications
// @access  Private
export const getNotificationSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  res.json({
    success: true,
    data: {
      notifications: user.notifications,
    },
  })
})

// @desc    Update notification settings
// @route   PUT /api/settings/notifications
// @access  Private
export const updateNotificationSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const { email, push } = req.body

  if (email) {
    user.notifications.email = {
      ...user.notifications.email,
      ...email,
    }
  }

  if (push) {
    user.notifications.push = {
      ...user.notifications.push,
      ...push,
    }
  }

  await user.save()

  res.json({
    success: true,
    message: 'Notification settings updated successfully',
    data: {
      notifications: user.notifications,
    },
  })
})


// ==================== USER PREFERENCES ====================

// @desc    Get user preferences
// @route   GET /api/settings/preferences
// @access  Private
export const getPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  res.json({
    success: true,
    data: {
      preferences: user.preferences,
    },
  })
})

// @desc    Update user preferences
// @route   PUT /api/settings/preferences
// @access  Private
export const updatePreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const validLanguages = ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa']

  if (language !== undefined) {
    if (!validLanguages.includes(language)) {
      res.status(400)
      throw new Error('Invalid language')
    }
    user.preferences.language = language
  }

  await user.save()

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: {
      preferences: user.preferences,
    },
  })
})

// ==================== TWO-FACTOR AUTHENTICATION ====================

// @desc    Enable 2FA
// @route   POST /api/settings/2fa/enable
// @access  Private
export const enableTwoFactorAuth = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  if (user.twoFactorAuth.enabled) {
    res.status(400)
    throw new Error('Two-factor authentication is already enabled')
  }

  // Generate secret
  const secret = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15)

  // Generate 10 backup codes (8 characters each, alphanumeric)
  const backupCodes = Array.from({ length: 10 }, () =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  )

  user.twoFactorAuth = {
    enabled: true,
    secret: secret,
    backupCodes: backupCodes,
  }

  await user.save()

  res.json({
    success: true,
    message: 'Two-factor authentication enabled successfully',
    data: {
      backupCodes: backupCodes, // Show only once
    },
  })
})

// @desc    Disable 2FA
// @route   POST /api/settings/2fa/disable
// @access  Private
export const disableTwoFactorAuth = asyncHandler(async (req, res) => {
  const { password } = req.body

  if (!password) {
    res.status(400)
    throw new Error('Password is required to disable 2FA')
  }

  const user = await User.findById(req.user._id).select('+password')

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const isPasswordMatch = await user.comparePassword(password)

  if (!isPasswordMatch) {
    res.status(401)
    throw new Error('Incorrect password')
  }

  user.twoFactorAuth = {
    enabled: false,
    secret: null,
    backupCodes: [],
  }

  await user.save()

  res.json({
    success: true,
    message: 'Two-factor authentication disabled successfully',
  })
})

// @desc    Get remaining backup codes count
// @route   GET /api/settings/2fa/backup-codes
// @access  Private
export const getBackupCodesCount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+twoFactorAuth.backupCodes')

  res.json({
    success: true,
    data: {
      enabled: user.twoFactorAuth.enabled,
      remainingCodes: user.twoFactorAuth.backupCodes?.length || 0,
    },
  })
})

// @desc    Regenerate backup codes
// @route   POST /api/settings/2fa/regenerate-codes
// @access  Private
export const regenerateBackupCodes = asyncHandler(async (req, res) => {
  const { password } = req.body

  if (!password) {
    res.status(400)
    throw new Error('Password is required')
  }

  const user = await User.findById(req.user._id).select('+password')

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  if (!user.twoFactorAuth.enabled) {
    res.status(400)
    throw new Error('Two-factor authentication is not enabled')
  }

  const isPasswordMatch = await user.comparePassword(password)

  if (!isPasswordMatch) {
    res.status(401)
    throw new Error('Incorrect password')
  }

  // Generate new backup codes
  const backupCodes = Array.from({ length: 10 }, () =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  )

  user.twoFactorAuth.backupCodes = backupCodes
  await user.save()

  res.json({
    success: true,
    message: 'Backup codes regenerated successfully',
    data: {
      backupCodes: backupCodes,
    },
  })
})

// ==================== ACTIVE SESSIONS ====================

// @desc    Get active sessions
// @route   GET /api/settings/sessions
// @access  Private
export const getActiveSessions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const activeSessions = user.activeSessions.filter(
    (session) => session.createdAt > thirtyDaysAgo
  )

  res.json({
    success: true,
    data: {
      sessions: activeSessions.map((session) => ({
        id: session._id,
        device: session.device,
        browser: session.browser,
        ip: session.ip,
        location: session.location,
        lastActive: session.lastActive,
        createdAt: session.createdAt,
        isCurrent: false, // Will be determined on frontend
      })),
    },
  })
})

// @desc    Revoke a session
// @route   DELETE /api/settings/sessions/:id
// @access  Private
export const revokeSession = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const sessionId = req.params.id

  const sessionIndex = user.activeSessions.findIndex(
    (session) => session._id.toString() === sessionId
  )

  if (sessionIndex === -1) {
    res.status(404)
    throw new Error('Session not found')
  }

  user.activeSessions.splice(sessionIndex, 1)
  await user.save()

  res.json({
    success: true,
    message: 'Session revoked successfully',
  })
})

// @desc    Revoke all other sessions
// @route   DELETE /api/settings/sessions
// @access  Private
export const revokeAllSessions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Clear all sessions
  user.activeSessions = []
  await user.save()

  res.json({
    success: true,
    message: 'All other sessions revoked successfully',
  })
})

// ==================== ACCOUNT DELETION ====================

// @desc    Request account deletion
// @route   POST /api/settings/delete-account
// @access  Private
export const requestAccountDeletion = asyncHandler(async (req, res) => {
  const { password, reason } = req.body

  if (!password) {
    res.status(400)
    throw new Error('Password is required to delete account')
  }

  const user = await User.findById(req.user._id).select('+password')

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const isPasswordMatch = await user.comparePassword(password)

  if (!isPasswordMatch) {
    res.status(401)
    throw new Error('Incorrect password')
  }

  const scheduledDate = new Date()
  scheduledDate.setDate(scheduledDate.getDate() + 30)

  user.accountDeletionRequest = {
    requested: true,
    requestedAt: new Date(),
    scheduledFor: scheduledDate,
  }

  user.isActive = false
  await user.save()

  res.json({
    success: true,
    message: 'Account deletion scheduled. You have 30 days to cancel.',
    data: {
      scheduledFor: scheduledDate,
    },
  })
})

// @desc    Cancel account deletion
// @route   POST /api/settings/cancel-deletion
// @access  Private
export const cancelAccountDeletion = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  if (!user.accountDeletionRequest.requested) {
    res.status(400)
    throw new Error('No deletion request found')
  }

  user.accountDeletionRequest = {
    requested: false,
    requestedAt: null,
    scheduledFor: null,
  }

  user.isActive = true
  await user.save()

  res.json({
    success: true,
    message: 'Account deletion cancelled successfully',
  })
})

// @desc    Permanently delete account
// @route   DELETE /api/settings/delete-account/confirm
// @access  Private
export const permanentlyDeleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body

  if (!password) {
    res.status(400)
    throw new Error('Password is required')
  }

  const user = await User.findById(req.user._id).select('+password')

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const isPasswordMatch = await user.comparePassword(password)

  if (!isPasswordMatch) {
    res.status(401)
    throw new Error('Incorrect password')
  }

  await user.deleteOne()

  res.json({
    success: true,
    message: 'Account deleted permanently',
  })
})

// ==================== GET ALL SETTINGS ====================

// @desc    Get all user settings
// @route   GET /api/settings
// @access  Private
export const getAllSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+twoFactorAuth.backupCodes')

  res.json({
    success: true,
    data: {
      preferences: user.preferences,
      twoFactorAuth: {
        enabled: user.twoFactorAuth.enabled,
        remainingBackupCodes: user.twoFactorAuth.backupCodes?.length || 0,
      },
      accountDeletionRequest: user.accountDeletionRequest,
    },
  })
})