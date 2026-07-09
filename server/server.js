import app from './src/app.js';

const PORT = process.env.PORT || 5000;

// ── Environment Validation ────────────────────────────────────────────────
const REQUIRED_ENV_VARS = ['FIREBASE_SERVICE_ACCOUNT_BASE64'];
const MISSING = REQUIRED_ENV_VARS.filter(v => !process.env[v]);

if (MISSING.length > 0) {
  console.warn('⚠️  Missing required environment variables:');
  MISSING.forEach(v => console.warn(`   - ${v}`));
  console.warn('   The server will start but Firebase-dependent routes will return 503.');
}

app.listen(PORT, () => {
  console.log(`\n🚀 DressSwipe API running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
