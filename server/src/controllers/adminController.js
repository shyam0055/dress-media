import { db } from '../config/firebase-admin.js';
import { CONSTANTS } from '../config/constants.js';

// ── POST /api/admin/dress ─────────────────────────────────────────────────
export const createDress = async (req, res, next) => {
  try {
    const {
      title, brand, description, price, currency = 'INR',
      videoUrl, thumbnailUrl, category, sizes, colors, tags,
    } = req.body;

    if (!title || !videoUrl || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'title, videoUrl, price, and category are required.',
      });
    }

    if (!CONSTANTS.CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${CONSTANTS.CATEGORIES.join(', ')}`,
      });
    }

    const dressData = {
      title: title.trim(),
      brand: brand?.trim() || 'Unknown',
      description: description?.trim() || '',
      price: parseFloat(price),
      currency,
      videoUrl,
      thumbnailUrl: thumbnailUrl || '',
      category,
      sizes: sizes || [],
      colors: colors || [],
      tags: tags || [],
      isActive: true,
      uploadedBy: req.user.uid,
      viewCount: 0,
      likeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('dresses').add(dressData);

    return res.status(201).json({
      success: true,
      message: 'Dress reel added successfully!',
      dress: { id: docRef.id, ...dressData },
    });
  } catch (error) {
    next(error);
  }
};

// ── PUT /api/admin/dress/:id ──────────────────────────────────────────────
export const updateDress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('dresses').doc(id).get();
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Dress not found.' });

    const allowed = ['title', 'brand', 'description', 'price', 'category',
      'sizes', 'colors', 'tags', 'thumbnailUrl', 'isActive'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
    updates.updatedAt = new Date().toISOString();

    await db.collection('dresses').doc(id).update(updates);
    return res.json({ success: true, message: 'Dress updated.' });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/admin/dress/:id ───────────────────────────────────────────
export const deleteDress = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Soft delete — set isActive to false
    await db.collection('dresses').doc(id).update({
      isActive: false,
      deletedAt: new Date().toISOString(),
    });
    return res.json({ success: true, message: 'Dress removed from feed.' });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/admin/dresses ────────────────────────────────────────────────
export const getAllDresses = async (req, res, next) => {
  try {
    const snap = await db.collection('dresses').orderBy('createdAt', 'desc').get();
    const dresses = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ success: true, dresses });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/admin/stats ──────────────────────────────────────────────────
export const getStats = async (req, res, next) => {
  try {
    const [usersSnap, dressesSnap, interactionsSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('dresses').where('isActive', '==', true).get(),
      db.collection('interactions').get(),
    ]);

    const interactions = interactionsSnap.docs.map(d => d.data());
    const wishlists = interactions.filter(i => i.action === 'wishlist').length;
    const buys = interactions.filter(i => i.action === 'buy').length;
    const skips = interactions.filter(i => i.action === 'skip').length;

    return res.json({
      success: true,
      stats: {
        totalUsers: usersSnap.size,
        totalDresses: dressesSnap.size,
        totalInteractions: interactions.length,
        wishlists,
        buys,
        skips,
      },
    });
  } catch (error) {
    next(error);
  }
};
