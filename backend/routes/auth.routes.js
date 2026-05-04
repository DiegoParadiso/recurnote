import express from 'express';
import {
  register,
  login,
  getMe,
  updatePreferences,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  verifyCode,
  resendCode,
  refreshAccessToken,
  logout
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/zodValidation.middleware.js';
import { registerSchema, loginSchema, passwordResetSchema, newPasswordSchema } from '../schemas/auth.schema.js';
import { loginLimiter, registerLimiter, resetPasswordLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

// Rutas públicas
router.post('/register', registerLimiter, validateRequest(registerSchema), register);
router.post('/login', loginLimiter, validateRequest(loginSchema), login);
router.post('/verify-code', verifyCode);
router.post('/resend-code', resendCode);
router.post('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/request-password-reset', resetPasswordLimiter, validateRequest(passwordResetSchema), requestPasswordReset);
router.post('/reset-password', validateRequest(newPasswordSchema), resetPassword);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);

// Rutas protegidas
router.get('/me', authMiddleware, getMe);
router.put('/preferences', authMiddleware, updatePreferences);

export default router;
