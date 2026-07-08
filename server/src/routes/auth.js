import { Router } from 'express';
import { register, verifyAndSyncUser, passwordValidation } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// POST /api/auth/register — rate limited, validates password strength server-side
router.post('/register', authRateLimiter, passwordValidation, register);

// POST /api/auth/verify — called after client Firebase login to sync Firestore profile
router.post('/verify', verifyToken, verifyAndSyncUser);

export default router;
