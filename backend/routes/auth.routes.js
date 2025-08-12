import express from 'express';
import { register, login, getMe, updatePreferences } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/preferences', authMiddleware, updatePreferences);

export default router;
