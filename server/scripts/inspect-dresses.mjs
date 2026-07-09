import 'dotenv/config';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function inspect() {
  console.log('\n=== Dress Data Inspection ===\n');
  
  const snap = await db.collection('dresses').get();
  console.log(`Total dresses: ${snap.size}\n`);
  
  for (const doc of snap.docs) {
    const d = doc.data();
    console.log(`ID: ${doc.id}`);
    console.log(`  title:        ${d.title}`);
    console.log(`  brand:        ${d.brand}`);
    console.log(`  description:  ${d.description || '(empty)'}`);
    console.log(`  price:        ₹${d.price}`);
    console.log(`  category:     ${d.category}`);
    console.log(`  videoUrl:     ${d.videoUrl ? (d.videoUrl.substring(0, 80) + '...') : '⚠️ MISSING!'}`);
    console.log(`  thumbnailUrl: ${d.thumbnailUrl || '(none)'}`);
    console.log(`  sizes:        ${JSON.stringify(d.sizes)}`);
    console.log(`  isActive:     ${d.isActive}`);
    console.log(`  createdAt:    ${d.createdAt}`);
    console.log(`  uploadedBy:   ${d.uploadedBy || '(none)'}`);
    console.log(`  likeCount:    ${d.likeCount}`);
    console.log(`  viewCount:    ${d.viewCount}`);
    console.log('---');
  }
  
  console.log('\n=== Inspection Complete ===\n');
}

inspect().catch(console.error);
