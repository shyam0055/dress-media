import { db } from '../config/firebase-admin.js';
import { FieldValue } from 'firebase-admin/firestore';
import { createError } from '../middleware/errorHandler.js';

// ── GET /api/user/profile ─────────────────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    const doc = await db.collection('users').doc(req.user.uid).get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, user: doc.data() });
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/user/profile ─────────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { username, avatarUrl, preferences } = req.body;
    const updates = {};

    // Validate and sanitize username
    if (username !== undefined) {
      if (typeof username !== 'string' || username.trim().length === 0) {
        return next(createError('Username must be a non-empty string.', 400));
      }
      if (username.trim().length > 50) {
        return next(createError('Username must be 50 characters or less.', 400));
      }
      if (!/^[a-zA-Z0-9_.\- ]+$/.test(username.trim())) {
        return next(createError('Username can only contain letters, numbers, spaces, and . - _', 400));
      }
      updates.username = username.trim();
    }

    // Validate avatar URL
    if (avatarUrl !== undefined) {
      if (typeof avatarUrl !== 'string') {
        return next(createError('Avatar URL must be a string.', 400));
      }
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        return next(createError('Avatar URL must start with http:// or https://', 400));
      }
      updates.avatarUrl = avatarUrl;
    }

    // Validate preferences
    if (preferences !== undefined) {
      if (typeof preferences !== 'object' || preferences === null || Array.isArray(preferences)) {
        return next(createError('Preferences must be a valid object.', 400));
      }
      updates.preferences = preferences;
    }

    if (Object.keys(updates).length === 0) {
      return next(createError('No valid fields to update.', 400));
    }

    updates.updatedAt = new Date().toISOString();
    await db.collection('users').doc(req.user.uid).update(updates);
    return res.json({ success: true, message: 'Profile updated.' });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/user/wishlist ────────────────────────────────────────────────
export const getWishlist = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const wishlistIds = userDoc.data()?.wishlist || [];

    if (wishlistIds.length === 0) return res.json({ success: true, dresses: [] });

    const chunks = [];
    for (let i = 0; i < wishlistIds.length; i += 30) {
      chunks.push(wishlistIds.slice(i, i + 30));
    }

    const snaps = await Promise.all(
      chunks.map(chunk =>
        db.collection('dresses').where('__name__', 'in', chunk).get()
      )
    );

    const dresses = [];
    snaps.forEach(snap =>
      snap.docs.forEach(doc => dresses.push({ id: doc.id, ...doc.data() }))
    );

    return res.json({ success: true, dresses });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/user/cart ────────────────────────────────────────────────────
export const getCart = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const cartIds = userDoc.data()?.cart || [];

    if (cartIds.length === 0) return res.json({ success: true, dresses: [] });

    const chunks = [];
    for (let i = 0; i < cartIds.length; i += 30) {
      chunks.push(cartIds.slice(i, i + 30));
    }

    const snaps = await Promise.all(
      chunks.map(chunk =>
        db.collection('dresses').where('__name__', 'in', chunk).get()
      )
    );

    const dresses = [];
    snaps.forEach(snap =>
      snap.docs.forEach(doc => dresses.push({ id: doc.id, ...doc.data() }))
    );

    return res.json({ success: true, dresses });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/user/wishlist/:dressId ───────────────────────────────────
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { dressId } = req.params;
    await db.collection('users').doc(req.user.uid).update({
      wishlist: FieldValue.arrayRemove(dressId),
    });
    return res.json({ success: true, message: 'Removed from wishlist.' });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/user/cart/:dressId ───────────────────────────────────────
export const removeFromCart = async (req, res, next) => {
  try {
    const { dressId } = req.params;
    await db.collection('users').doc(req.user.uid).update({
      cart: FieldValue.arrayRemove(dressId),
    });
    return res.json({ success: true, message: 'Removed from cart.' });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/user/checkout ────────────────────────────────────────────────
export const checkout = async (req, res, next) => {
  try {
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(404).json({ success: false, message: 'User not found.' });

    const cartIds = userDoc.data()?.cart || [];
    if (cartIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    // Fetch details of all dresses in the cart
    const snap = await db.collection('dresses').where('__name__', 'in', cartIds).get();
    const dresses = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const batch = db.batch();
    const orderIds = [];

    // Create an order for each dress in the cart
    for (const dress of dresses) {
      const orderRef = db.collection('orders').doc();
      const newOrder = {
        id: orderRef.id,
        buyerId: req.user.uid,
        buyerUsername: userDoc.data()?.username || userDoc.data()?.email || 'Buyer',
        sellerId: dress.userId || 'admin', // default to admin if not owned by a seller
        dressId: dress.id,
        dressTitle: dress.title,
        dressPrice: dress.price || 0,
        dressThumbnail: dress.thumbnailUrl || '',
        size: dress.sizes?.[0] || 'M', // mock size selection
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      batch.set(orderRef, newOrder);
      orderIds.push(orderRef.id);
    }

    // Clear user cart
    batch.update(userRef, { cart: [] });

    await batch.commit();

    return res.json({ success: true, message: 'Checkout successful.', orderIds });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/user/orders ───────────────────────────────────────────────────
export const getOrders = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) return res.status(404).json({ success: false, message: 'User not found.' });

    const role = userDoc.data()?.role || 'buyer';

    let query;
    if (role === 'seller') {
      // Sellers see orders placed for their items
      query = db.collection('orders').where('sellerId', '==', req.user.uid);
    } else {
      // Buyers see orders they placed
      query = db.collection('orders').where('buyerId', '==', req.user.uid);
    }

    const snap = await query.get();
    const orders = snap.docs.map(doc => doc.data());
    // Sort in-memory to avoid needing index
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/user/orders/:orderId ──────────────────────────────────────────
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; // 'pending' | 'shipped' | 'delivered'

    if (!['pending', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check authorization: only the seller of this item can update the order status
    if (orderDoc.data().sellerId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. You are not the seller of this item.' });
    }

    await orderRef.update({ status, updatedAt: new Date().toISOString() });

    return res.json({ success: true, message: `Order status updated to ${status}.` });
  } catch (error) {
    next(error);
  }
};
