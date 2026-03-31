import express from 'express'
import {
  register,
  registerAdmin,
  login,
  loginWithBackupCode,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  updatePassword,
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAdminStats,
} from '../controllers/authController.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
  handleValidationErrors,
} from '../utils/validators.js'

const router = express.Router()

// ==================== PUBLIC ROUTES ====================

router.post('/register', registerValidation, handleValidationErrors, register)
router.post('/register-admin', registerValidation, handleValidationErrors, registerAdmin)
router.post('/login', loginValidation, handleValidationErrors, login)
router.post('/login-backup', loginWithBackupCode)
router.post('/forgot-password', forgotPassword)
router.put('/reset-password/:token', resetPassword)

// ==================== PROTECTED ROUTES ====================

router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.put('/password', protect, updatePasswordValidation, handleValidationErrors, updatePassword)

// ==================== ADMIN ONLY ROUTES ====================

router.get('/admin/stats', protect, admin, getAdminStats)
router.get('/users', protect, admin, getAllUsers)
router.get('/users/:id', protect, admin, getUserById)
router.put('/users/:id/role', protect, admin, updateUserRole)
router.put('/users/:id/status', protect, admin, updateUserStatus)
router.delete('/users/:id', protect, admin, deleteUser)

export default router