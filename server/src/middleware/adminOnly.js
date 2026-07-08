import { db } from '../config/firebase-admin.js';

/**
 * Middleware to check if the authenticated user has admin role.
 * Must be used AFTER verifyToken middleware.
 */
export const adminOnly = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying admin privileges.',
    });
  }
};
