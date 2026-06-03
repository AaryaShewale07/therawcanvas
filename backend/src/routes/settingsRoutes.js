import express from 'express'
import {
  getAllSettings,
  getPreferences,
  updatePreferences,
  enable2FA,
  verify2FA,
  disableTwoFactorAuth,
  getBackupCodesCount,
  regenerateBackupCodes,
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
  requestAccountDeletion,
  cancelAccountDeletion,
  permanentlyDeleteAccount,
} from '../controllers/settingsController.js'

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router()

// Protect all routes
router.use(protect)

// ==================== GENERAL ====================
router.get('/', getAllSettings)

// ==================== PREFERENCES ====================
router.get('/preferences', getPreferences)
router.put('/preferences', updatePreferences)

// ==================== TWO-FACTOR AUTH ====================
router.post('/2fa/enable', enable2FA)
router.post('/2fa/verify', verify2FA)
router.post('/2fa/disable', disableTwoFactorAuth)
router.get('/2fa/backup-codes', getBackupCodesCount)
router.post('/2fa/regenerate-codes', regenerateBackupCodes)

// ==================== SESSIONS ====================
router.get('/sessions', getActiveSessions)
router.delete('/sessions/:id', revokeSession)
router.delete('/sessions', revokeAllSessions)

// ==================== ACCOUNT DELETION ====================
router.post('/delete-account', requestAccountDeletion)
router.post('/cancel-deletion', cancelAccountDeletion)
router.delete('/delete-account/confirm', permanentlyDeleteAccount)

export default router