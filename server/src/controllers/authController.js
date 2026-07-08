import { auth, db } from '../config/firebase-admin.js';
import { CONSTANTS } from '../config/constants.js';

// ── POST /api/auth/verify ─────────────────────────────────────────────────
// Called by the client after login/register to sync the Firestore profile.
export const verifyAndSyncUser = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      // First time: create Firestore profile from Firebase Auth data
      const firebaseUser = await auth.getUser(uid);
      const chosenRole = req.body?.role || CONSTANTS.ROLES.BUYER;
      const chosenUsername = req.body?.username || firebaseUser.displayName || firebaseUser.email.split('@')[0];

      const newProfile = {
        uid,
        email: firebaseUser.email,
        username: chosenUsername,
        avatarUrl: firebaseUser.photoURL || '',
        role: chosenRole,
        preferences: {
          theme: 'dark',
          sizes: [],
          priceRange: { min: 0, max: 10000 },
        },
        wishlist: [],
        cart: [],
        createdAt: new Date().toISOString(),
      };
      await db.collection('users').doc(uid).set(newProfile);
      return res.json({ success: true, user: newProfile });
    }

    return res.json({ success: true, user: userDoc.data() });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/auth/register ───────────────────────────────────────────────
// Kept for backwards compatibility but Firebase client SDK handles registration.
// This endpoint is no longer called during registration.
export const register = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'Use Firebase client SDK for registration.',
  });
};

export const passwordValidation = [];
