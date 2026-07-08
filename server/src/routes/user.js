import { Router } from 'express';
import {
  getProfile, updateProfile,
  getWishlist, removeFromWishlist,
  getCart, removeFromCart,
  checkout, getOrders, updateOrderStatus,
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/wishlist', getWishlist);
router.delete('/wishlist/:dressId', removeFromWishlist);
router.get('/cart', getCart);
router.delete('/cart/:dressId', removeFromCart);

router.post('/checkout', checkout);
router.get('/orders', getOrders);
router.put('/orders/:orderId', updateOrderStatus);

export default router;
