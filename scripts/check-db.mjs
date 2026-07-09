import 'dotenv/config';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_BASE64 not set');
    process.exit(1);
  }
  const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function check() {
  console.log('\n=== Database Diagnostics ===\n');

  // Check dresses
  try {
    const dressesSnap = await db.collection('dresses').where('isActive', '==', true).get();
    console.log(`📦 Active dresses: ${dressesSnap.size}`);
    if (dressesSnap.size > 0) {
      dressesSnap.forEach(doc => {
        const d = doc.data();
        console.log(`   - ${doc.id}: "${d.title}" (${d.brand}) ₹${d.price}`);
      });
    } else {
      console.log('   ⚠️  No active dresses found! This is likely why the feed returns empty.');
    }
  } catch (e) {
    console.log(`❌ Error querying dresses: ${e.message}`);
  }

  // Check all dresses (including inactive)
  try {
    const allDressesSnap = await db.collection('dresses').get();
    console.log(`📦 Total dresses (including inactive): ${allDressesSnap.size}`);
  } catch (e) {
    console.log(`❌ Error querying all dresses: ${e.message}`);
  }

  // Check users
  try {
    const usersSnap = await db.collection('users').get();
    console.log(`👤 Users: ${usersSnap.size}`);
  } catch (e) {
    console.log(`❌ Error querying users: ${e.message}`);
  }

  // Check interactions
  try {
    const interactionsSnap = await db.collection('interactions').get();
    console.log(`🔄 Interactions: ${interactionsSnap.size}`);
  } catch (e) {
    console.log(`❌ Error querying interactions: ${e.message}`);
  }

  console.log('\n=== Diagnostic Complete ===\n');
}

check().catch(console.error);
