import express from 'express'
import {
  register,
  registerAdmin,
  login,
  loginWithBackupCode,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  uploadAvatar,
  removeAvatar,
  forgotPassword,
  resetPassword,
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  getAdminStats,
  deleteUser,
} from '../controllers/authController.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

// ============ PUBLIC ROUTES ============
router.post('/register', register)
router.post('/login', login)
router.post('/login-backup', loginWithBackupCode)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

// ============ PROTECTED ROUTES ============
router.get('/me', protect, getMe)
router.post('/logout', protect, logout)
router.put('/profile', protect, updateProfile)
router.put('/password', protect, updatePassword)

// ============ AVATAR ROUTES (CLOUDINARY) ============
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar)
router.delete('/avatar', protect, removeAvatar)

// ============ ADMIN ROUTES ============
router.post('/register-admin', protect, admin, registerAdmin)
router.get('/users', protect, admin, getAllUsers)
router.get('/users/:id', protect, admin, getUserById)
router.put('/users/:id/role', protect, admin, updateUserRole)
router.put('/users/:id/status', protect, admin, updateUserStatus)
router.get('/admin/stats', protect, admin, getAdminStats)
router.delete('/users/:id', protect, admin, deleteUser)

export default router