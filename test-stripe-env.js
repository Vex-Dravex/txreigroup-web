#!/usr/bin/env node

/**
 * Quick test to verify Stripe environment variables are loaded correctly
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking Stripe Environment Variables...\n');

const requiredVars = [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_WEEKLY',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_BIANNUAL',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL',
];

let allPresent = true;

requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        // Mask the value for security
        const masked = value.substring(0, 12) + '...' + value.substring(value.length - 4);
        console.log(`✅ ${varName}: ${masked}`);
    } else {
        console.log(`❌ ${varName}: MISSING`);
        allPresent = false;
    }
});

console.log('\n' + '='.repeat(60));

if (allPresent) {
    console.log('✅ All Stripe environment variables are present!');
    console.log('\n📝 Next steps:');
    console.log('1. Restart your dev server: npm run dev');
    console.log('2. Test checkout flow at: http://localhost:3000/onboarding/subscription');
    console.log('3. Configure webhooks in Stripe Dashboard');
} else {
    console.log('❌ Some environment variables are missing!');
    console.log('\n📝 Fix:');
    console.log('1. Check your .env.local file');
    console.log('2. Make sure all STRIPE variables are set');
    console.log('3. Restart your dev server after adding them');
}

console.log('='.repeat(60) + '\n');
