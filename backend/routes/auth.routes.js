import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  updatePreferences, 
  verifyEmail, 
  resendVerificationEmail, 
  requestPasswordReset, 
  resetPassword 
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { 
  validateRegister, 
  validateLogin, 
  validatePasswordReset, 
  validateNewPassword, 
  handleValidationErrors 
} from '../middleware/validation.middleware.js';

const router = express.Router();

// Rutas públicas
router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/request-password-reset', validatePasswordReset, handleValidationErrors, requestPasswordReset);
router.post('/reset-password', validateNewPassword, handleValidationErrors, resetPassword);

// Rutas protegidas
router.get('/me', authMiddleware, getMe);
router.put('/preferences', authMiddleware, updatePreferences);

export default router;
