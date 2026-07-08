import { Router } from 'express';
import { getFeed, getDressById, interactWithDress } from '../controllers/dressController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// All dress routes require authentication
router.use(verifyToken);

router.get('/feed', getFeed);
router.get('/:id', getDressById);
router.post('/:id/interact', interactWithDress);

export default router;
