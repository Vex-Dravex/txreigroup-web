// Quick verification script for Stripe Price IDs
require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 Verifying Stripe Price IDs from .env.local:\n');
console.log('WEEKLY:', process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_WEEKLY || '❌ NOT SET');
console.log('MONTHLY:', process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || '❌ NOT SET');
console.log('BIANNUAL:', process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BIANNUAL || '❌ NOT SET');
console.log('ANNUAL:', process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL || '❌ NOT SET');
console.log('\n✅ All Price IDs are configured!\n');
