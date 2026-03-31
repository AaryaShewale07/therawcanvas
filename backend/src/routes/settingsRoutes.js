import express from 'express'
import {
  getAllSettings,
  getPreferences,
  updatePreferences,
  enableTwoFactorAuth,
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
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

// General
router.get('/', getAllSettings)

// Preferences
router.get('/preferences', getPreferences)
router.put('/preferences', updatePreferences)

// Two-Factor Auth
router.post('/2fa/enable', enableTwoFactorAuth)
router.post('/2fa/disable', disableTwoFactorAuth)
router.get('/2fa/backup-codes', getBackupCodesCount)
router.post('/2fa/regenerate-codes', regenerateBackupCodes)

// Sessions
router.get('/sessions', getActiveSessions)
router.delete('/sessions/:id', revokeSession)
router.delete('/sessions', revokeAllSessions)

// Account Deletion
router.post('/delete-account', requestAccountDeletion)
router.post('/cancel-deletion', cancelAccountDeletion)
router.delete('/delete-account/confirm', permanentlyDeleteAccount)

export default router