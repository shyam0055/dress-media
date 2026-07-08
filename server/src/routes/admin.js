import { Router } from 'express';
import {
  createDress, updateDress, deleteDress, getAllDresses, getStats,
} from '../controllers/adminController.js';
import { verifyToken } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// All admin routes: must be authenticated AND have admin role
router.use(verifyToken, adminOnly);

router.get('/dresses', getAllDresses);
router.post('/dress', uploadRateLimiter, createDress);
router.put('/dress/:id', updateDress);
router.delete('/dress/:id', deleteDress);
router.get('/stats', getStats);

export default router;
