import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import 'dotenv/config';

// Flag to track if Firebase is properly initialized
let firebaseReady = false;

// Only initialize once — prevents duplicate app error on hot reload
if (!getApps().length) {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!b64) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_BASE64 not set in server/.env');
    console.warn('   Create server/.env from server/.env.example and add your key.');
    console.warn('   ⚠️  Server will start but Firebase-dependent routes will return 503.');
  } else {
    try {
      const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
      initializeApp({ credential: cert(serviceAccount) });
      firebaseReady = true;
      console.log('✅ Firebase Admin SDK initialized');
    } catch (err) {
      console.error('❌ Firebase Admin init failed:', err.message);
      console.warn('   ⚠️  Server will start but Firebase-dependent routes will return 503.');
    }
  }
}

// Export after guaranteed init — but throw helpful errors if Firebase isn't ready
const getReadyDb = () => {
  if (!firebaseReady) {
    const err = new Error('Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT_BASE64 in server/.env');
    err.statusCode = 503;
    err.expose = true;
    throw err;
  }
  return getFirestore();
};

const getReadyAuth = () => {
  if (!firebaseReady) {
    const err = new Error('Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT_BASE64 in server/.env');
    err.statusCode = 503;
    err.expose = true;
    throw err;
  }
  return getAuth();
};

// Lazy getters — throw 503 if Firebase isn't ready, instead of crashing
let dbCache, authCache;
export const db = new Proxy({}, {
  get(_, prop) {
    if (!dbCache) dbCache = firebaseReady ? getFirestore() : null;
    if (!dbCache) {
      const err = new Error('Firebase not configured.');
      err.statusCode = 503;
      err.expose = true;
      throw err;
    }
    return dbCache[prop].bind(dbCache);
  }
});

export const auth = new Proxy({}, {
  get(_, prop) {
    if (!authCache) authCache = firebaseReady ? getAuth() : null;
    if (!authCache) {
      const err = new Error('Firebase not configured.');
      err.statusCode = 503;
      err.expose = true;
      throw err;
    }
    return authCache[prop].bind(authCache);
  }
});
