import { db } from '../config/firebase-admin.js';
import { FieldValue } from 'firebase-admin/firestore';
import { CONSTANTS } from '../config/constants.js';

// ── GET /api/dresses/feed ─────────────────────────────────────────────────
export const getFeed = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const limit = parseInt(req.query.limit) || 10;
    const cursor = parseInt(req.query.cursor) || 0;

    // Get IDs already interacted with
    const interactionsSnap = await db.collection('interactions')
      .where('userId', '==', uid)
      .get();
    const seenIds = new Set(interactionsSnap.docs.map(d => d.data().dressId));

    // Simple query — no composite index needed
    const dressesSnap = await db.collection('dresses')
      .where('isActive', '==', true)
      .get();

    // Filter + sort in memory
    const all = dressesSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(d => !seenIds.has(d.id))
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

    // Manual pagination
    const page = all.slice(cursor, cursor + limit);
    const hasMore = cursor + limit < all.length;

    return res.json({
      success: true,
      dresses: page,
      pagination: { hasMore, nextCursor: hasMore ? cursor + limit : null },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/dresses/:id ──────────────────────────────────────────────────
export const getDressById = async (req, res, next) => {
  try {
    const doc = await db.collection('dresses').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Dress not found.' });
    }

    await doc.ref.update({ viewCount: (doc.data().viewCount || 0) + 1 });

    return res.json({ success: true, dress: { id: doc.id, ...doc.data() } });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/dresses/:id/interact ────────────────────────────────────────
export const interactWithDress = async (req, res, next) => {
  try {
    const { uid } = req.user;
    const { id: dressId } = req.params;
    const { action } = req.body;

    const validActions = Object.values(CONSTANTS.INTERACTIONS);
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: `Invalid action. Must be one of: ${validActions.join(', ')}`,
      });
    }

    // Record interaction
    await db.collection('interactions').add({
      userId: uid,
      dressId,
      action,
      createdAt: new Date().toISOString(),
    });

    // Update user's wishlist or cart
    const userRef = db.collection('users').doc(uid);
    if (action === CONSTANTS.INTERACTIONS.WISHLIST) {
      await userRef.update({ wishlist: FieldValue.arrayUnion(dressId) });
    } else if (action === CONSTANTS.INTERACTIONS.BUY) {
      await userRef.update({ cart: FieldValue.arrayUnion(dressId) });
    }

    // Update dress like count
    if (action !== CONSTANTS.INTERACTIONS.SKIP) {
      const dressDoc = await db.collection('dresses').doc(dressId).get();
      await db.collection('dresses').doc(dressId).update({
        likeCount: (dressDoc.data()?.likeCount || 0) + 1,
      });
    }

    return res.json({
      success: true,
      message: action === 'wishlist'
        ? 'Added to wishlist! ❤️'
        : action === 'buy' ? 'Added to cart! 🛒' : 'Skipped',
    });
  } catch (error) {
    next(error);
  }
};
