import User from '../models/User.js'
import { asyncHandler } from '../middleware/errorMiddleware.js'

// ==================== PREFERENCES ====================

export const getPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  res.json({
    success: true,
    data: { preferences: user.preferences },
  })
})

export const updatePreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const { language } = req.body

  if (language) {
    user.preferences.language = language
  }

  await user.save()

  res.json({
    success: true,
    message: 'Preferences updated',
  })
})

// ==================== 2FA ====================

export const enable2FA = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  const secret = Math.random().toString(36).substring(2, 15)

  const backupCodes = Array.from({ length: 10 }, () =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  )

  user.twoFactorAuth = {
    enabled: false,
    secret,
    backupCodes,
  }

  await user.save()

  res.json({
    success: true,
    data: { secret, backupCodes },
  })
})

export const verify2FA = asyncHandler(async (req, res) => {
  const { token } = req.body
  const user = await User.findById(req.user._id)

  if (!user || !user.twoFactorAuth?.secret) {
    res.status(400)
    throw new Error('2FA not initialized')
  }

  if (token !== user.twoFactorAuth.secret.slice(0, 6)) {
    res.status(400)
    throw new Error('Invalid OTP')
  }

  user.twoFactorAuth.enabled = true
  await user.save()

  res.json({ success: true })
})

export const disableTwoFactorAuth = asyncHandler(async (req, res) => {
  const { password } = req.body

  const user = await User.findById(req.user._id).select('+password')

  const isMatch = await user.comparePassword(password)

  if (!isMatch) {
    res.status(401)
    throw new Error('Wrong password')
  }

  user.twoFactorAuth = {
    enabled: false,
    secret: null,
    backupCodes: [],
  }

  await user.save()

  res.json({ success: true })
})

export const getBackupCodesCount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  res.json({
    success: true,
    data: {
      remainingCodes: user.twoFactorAuth?.backupCodes?.length || 0,
    },
  })
})

export const regenerateBackupCodes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  const backupCodes = Array.from({ length: 10 }, () =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  )

  user.twoFactorAuth.backupCodes = backupCodes
  await user.save()

  res.json({
    success: true,
    data: { backupCodes },
  })
})

// ==================== SESSIONS ====================

export const getActiveSessions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  res.json({
    success: true,
    data: { sessions: user.activeSessions || [] },
  })
})

export const revokeSession = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  user.activeSessions = user.activeSessions.filter(
    (s) => s._id.toString() !== req.params.id
  )

  await user.save()

  res.json({ success: true })
})

export const revokeAllSessions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  user.activeSessions = []
  await user.save()

  res.json({ success: true })
})

// ==================== ACCOUNT DELETION ====================

export const requestAccountDeletion = asyncHandler(async (req, res) => {
  const { password } = req.body

  const user = await User.findById(req.user._id).select('+password')

  const isMatch = await user.comparePassword(password)

  if (!isMatch) {
    res.status(401)
    throw new Error('Wrong password')
  }

  user.accountDeletionRequest = {
    requested: true,
    requestedAt: new Date(),
    scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  }

  user.isActive = false
  await user.save()

  res.json({
    success: true,
    message: 'Account deletion scheduled',
  })
})

export const cancelAccountDeletion = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  user.accountDeletionRequest = {
    requested: false,
    requestedAt: null,
    scheduledFor: null,
  }

  user.isActive = true
  await user.save()

  res.json({ success: true })
})

export const permanentlyDeleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body

  const user = await User.findById(req.user._id).select('+password')

  const isMatch = await user.comparePassword(password)

  if (!isMatch) {
    res.status(401)
    throw new Error('Wrong password')
  }

  await user.deleteOne()

  res.json({ success: true })
})

// ==================== ALL SETTINGS ====================

export const getAllSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  res.json({
    success: true,
    data: {
      preferences: user.preferences,
      twoFactorAuth: user.twoFactorAuth,
      accountDeletionRequest: user.accountDeletionRequest,
    },
  })
})