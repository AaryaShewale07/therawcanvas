import express from 'express'
import {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  verifyBackupCode,
  forgotPassword,
  resetPassword,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  googleAuth,
} from '../controllers/authController.js'

import { protect, admin } from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

// PUBLIC
router.post('/register', register)
router.post('/login', login)
router.post('/google', googleAuth)
router.post('/verify-backup', verifyBackupCode)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

// PROTECTED
router.get('/me', protect, getMe)
router.post('/logout', protect, logout)
router.put('/password', protect, updatePassword)
router.put('/profile', protect, updateProfile)

// AVATAR
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar)
router.delete('/avatar', protect, deleteAvatar)

router.get('/users', protect, admin, getAllUsers)
router.put('/users/:id/role', protect, admin, updateUserRole)
router.put('/users/:id/status', protect, admin, toggleUserStatus)

export default router