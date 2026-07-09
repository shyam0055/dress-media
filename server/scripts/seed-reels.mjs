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

// Sample reel data — real-looking fashion dresses
const SAMPLE_REELS = [
  {
    title: 'Elegant Red Evening Gown',
    brand: 'Gucci',
    description: 'Stunning floor-length red gown with a slit. Perfect for galas and formal events.',
    price: 45999,
    currency: 'INR',
    category: 'formal',
    sizes: ['S', 'M', 'L'],
    colors: ['Red', 'Burgundy'],
    tags: ['evening', 'gown', 'formal', 'luxury'],
  },
  {
    title: 'Casual Linen Summer Dress',
    brand: 'H&M',
    description: 'Lightweight breathable linen dress, perfect for hot summer days.',
    price: 2499,
    currency: 'INR',
    category: 'casual',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Beige', 'Sky Blue'],
    tags: ['summer', 'linen', 'casual', 'beach'],
  },
  {
    title: 'Floral Print Midi Dress',
    brand: 'Zara',
    description: 'Beautiful floral print midi dress with ruffled sleeves. Flowy and feminine.',
    price: 3999,
    currency: 'INR',
    category: 'casual',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Multicolor', 'Blue'],
    tags: ['floral', 'midi', 'summer', 'feminine'],
  },
  {
    title: 'Black Bodycon Party Dress',
    brand: 'Forever 21',
    description: 'Sleek bodycon dress with a plunging neckline. Head-turner for parties.',
    price: 2999,
    currency: 'INR',
    category: 'party',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black'],
    tags: ['bodycon', 'party', 'night-out', 'sleek'],
  },
  {
    title: 'Traditional Silk Lehenga',
    brand: 'Sabyasachi',
    description: 'Handcrafted silk lehenga with intricate embroidery. Wedding-ready elegance.',
    price: 85000,
    currency: 'INR',
    category: 'ethnic',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gold', 'Red', 'Maroon'],
    tags: ['traditional', 'wedding', 'lehenga', 'bridal'],
  },
  {
    title: 'Classic Little Black Dress',
    brand: 'Chanel',
    description: 'Timeless LBD with a modern twist. Essential for every wardrobe.',
    price: 125000,
    currency: 'INR',
    category: 'formal',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black'],
    tags: ['classic', 'LBD', 'formal', 'timeless'],
  },
  {
    title: 'Bohemian Maxi Dress',
    brand: 'Free People',
    description: 'Flowy boho maxi dress with embroidered details. Perfect for festivals.',
    price: 5499,
    currency: 'INR',
    category: 'western',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Ivory', 'Terracotta', 'Olive'],
    tags: ['boho', 'maxi', 'festival', 'flowy'],
  },
  {
    title: 'Sporty Athleisure Dress',
    brand: 'Nike',
    description: 'Performance sport dress with built-in shorts. From gym to street.',
    price: 3999,
    currency: 'INR',
    category: 'sports',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Pink'],
    tags: ['sporty', 'athleisure', 'casual', 'comfort'],
  },
  {
    title: 'Embroidered Western Dress',
    brand: 'MAC',
    description: 'Fusion wear with traditional embroidery on a modern silhouette.',
    price: 7999,
    currency: 'INR',
    category: 'western',
    sizes: ['S', 'M', 'L'],
    colors: ['Navy', 'Emerald', 'Burgundy'],
    tags: ['fusion', 'embroidery', 'western', 'trendy'],
  },
  {
    title: 'Designer Cocktail Dress',
    brand: 'Dolce & Gabbana',
    description: 'Exquisite cocktail dress with lace detailing. Make an entrance.',
    price: 95000,
    currency: 'INR',
    category: 'party',
    sizes: ['XS', 'S', 'M'],
    colors: ['Black', 'Nude', 'Red'],
    tags: ['cocktail', 'designer', 'lace', 'luxury'],
  },
  {
    title: 'Printed Shift Dress',
    brand: 'Mango',
    description: 'Comfortable shift dress with a bold geometric print. Office-friendly.',
    price: 3499,
    currency: 'INR',
    category: 'casual',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Multicolor'],
    tags: ['shift', 'printed', 'office', 'comfortable'],
  },
  {
    title: 'Velvet Wrap Dress',
    brand: 'Reformation',
    description: 'Luxurious velvet wrap dress that flatters every body type.',
    price: 8999,
    currency: 'INR',
    category: 'formal',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Forest Green', 'Burgundy', 'Navy'],
    tags: ['velvet', 'wrap', 'formal', 'flattering'],
  },
];

async function seed() {
  console.log('\n=== Seeding Sample Dress Reels ===\n');

  // First, get existing dresses to reuse their Cloudinary video URLs
  const existingSnap = await db.collection('dresses')
    .where('isActive', '==', true)
    .get();

  const videoUrls = [];
  existingSnap.forEach(doc => {
    const d = doc.data();
    videoUrls.push({
      videoUrl: d.videoUrl,
      thumbnailUrl: d.thumbnailUrl,
    });
  });

  console.log(`📦 Found ${videoUrls.length} existing videos to reuse`);

  // Clean up garbage test data (dresses with meaningless names)
  const garbageIds = [];
  existingSnap.forEach(doc => {
    const d = doc.data();
    const title = d.title?.toLowerCase() || '';
    // Identify garbage entries with random keyboard-mashing titles
    if (/^[a-z]{3,8}$/.test(title) && !SAMPLE_REELS.some(s => s.title.toLowerCase().includes(title))) {
      const isGarbage = !title.includes(' '); // Single word random names are test data
      if (isGarbage && title.length < 10 && title !== 'velvet' && title !== 'floral' && title !== 'classic') {
        garbageIds.push(doc.id);
        console.log(`   🗑️  Marking garbage dress: "${d.title}" (${doc.id})`);
      }
    }
  });

  // Delete garbage entries
  if (garbageIds.length > 0) {
    console.log(`\n🧹 Deleting ${garbageIds.length} garbage dress entries...`);
    const deletePromises = garbageIds.map(id => db.collection('dresses').doc(id).delete());
    await Promise.all(deletePromises);
    console.log('   ✅ Deleted!');
  }

  // Create sample reels - rotate through available video URLs
  let added = 0;
  for (let i = 0; i < SAMPLE_REELS.length; i++) {
    const reel = SAMPLE_REELS[i];
    const video = videoUrls[i % videoUrls.length] || videoUrls[0];

    if (!video) {
      console.log(`   ⚠️  No video URL available for "${reel.title}", skipping`);
      continue;
    }

    const dressData = {
      ...reel,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || '',
      isActive: true,
      uploadedBy: 'seed-script',
      viewCount: Math.floor(Math.random() * 100),
      likeCount: Math.floor(Math.random() * 20),
      createdAt: new Date(Date.now() - (SAMPLE_REELS.length - i) * 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('dresses').add(dressData);
    added++;
    console.log(`   ✅ Added: "${reel.title}" (${reel.brand}) ₹${reel.price}`);
  }

  console.log(`\n🎉 Done! Added ${added} sample dress reels, deleted ${garbageIds.length} garbage entries.`);

  // Final count
  const finalSnap = await db.collection('dresses').where('isActive', '==', true).get();
  console.log(`📊 Total active dresses now: ${finalSnap.size}\n`);
}

seed().catch(console.error);
