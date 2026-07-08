import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import 'dotenv/config';

// Only initialize once — prevents duplicate app error on hot reload
if (!getApps().length) {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!b64) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_BASE64 not set in server/.env');
    console.warn('   Create server/.env from server/.env.example and add your key.');
    process.exit(1); // Stop server clearly instead of crashing with confusing error
  }

  try {
    const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    initializeApp({ credential: cert(serviceAccount) });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (err) {
    console.error('❌ Firebase Admin init failed:', err.message);
    process.exit(1);
  }
}

// Export after guaranteed init
export const db = getFirestore();
export const auth = getAuth();
