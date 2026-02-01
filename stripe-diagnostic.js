#!/usr/bin/env node

/**
 * Stripe Coupon Diagnostic Tool
 * This script lists all coupons and promotion codes in your Stripe account
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

let stripeSecretKey = '';
for (const line of envLines) {
    if (line.startsWith('STRIPE_SECRET_KEY=')) {
        stripeSecretKey = line.split('=')[1].trim();
        break;
    }
}

if (!stripeSecretKey) {
    console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
    process.exit(1);
}

const mode = stripeSecretKey.includes('_test_') ? 'TEST' : 'LIVE';
console.log(`\n🔑 Stripe Mode: ${mode}`);
console.log('━'.repeat(60));

function makeStripeRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.stripe.com',
            path: endpoint,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function listCoupons() {
    console.log('\n📋 COUPONS IN YOUR ACCOUNT:');
    console.log('━'.repeat(60));

    try {
        const response = await makeStripeRequest('/v1/coupons?limit=100');

        if (response.data.length === 0) {
            console.log('   No coupons found.');
        } else {
            response.data.forEach((coupon, i) => {
                const discount = coupon.percent_off
                    ? `${coupon.percent_off}% off`
                    : `$${(coupon.amount_off / 100).toFixed(2)} off`;

                const status = coupon.valid ? '✅' : '❌';
                console.log(`\n${i + 1}. ${status} Coupon ID: "${coupon.id}"`);
                console.log(`   Name: ${coupon.name || 'N/A'}`);
                console.log(`   Discount: ${discount}`);
                console.log(`   Duration: ${coupon.duration}`);
                console.log(`   Valid: ${coupon.valid}`);
                console.log(`   Times Redeemed: ${coupon.times_redeemed || 0}`);
            });
        }
    } catch (error) {
        console.error('   ❌ Error:', error.message);
    }
}

async function listPromotionCodes() {
    console.log('\n\n🎟️  PROMOTION CODES IN YOUR ACCOUNT:');
    console.log('━'.repeat(60));

    try {
        const response = await makeStripeRequest('/v1/promotion_codes?limit=100');

        if (response.data.length === 0) {
            console.log('   No promotion codes found.');
            console.log('\n   💡 TIP: Promotion codes are what customers enter at checkout!');
            console.log('   Create one at: https://dashboard.stripe.com/coupons');
        } else {
            response.data.forEach((promo, i) => {
                const status = promo.active ? '✅ ACTIVE' : '❌ INACTIVE';
                console.log(`\n${i + 1}. ${status}`);
                console.log(`   Code: "${promo.code}" ← Enter this at checkout`);
                console.log(`   Coupon ID: ${promo.coupon}`);
                console.log(`   Times Redeemed: ${promo.times_redeemed || 0}`);
                if (promo.max_redemptions) {
                    console.log(`   Max Redemptions: ${promo.max_redemptions}`);
                }
                if (promo.expires_at) {
                    const expiryDate = new Date(promo.expires_at * 1000);
                    console.log(`   Expires: ${expiryDate.toLocaleDateString()}`);
                }
            });
        }
    } catch (error) {
        console.error('   ❌ Error:', error.message);
    }
}

async function testCouponCode(code) {
    console.log(`\n\n🔍 TESTING CODE: "${code}"`);
    console.log('━'.repeat(60));

    // Try as coupon ID
    try {
        const coupon = await makeStripeRequest(`/v1/coupons/${encodeURIComponent(code)}`);
        console.log('✅ Found as COUPON ID');
        console.log(`   Name: ${coupon.name || 'N/A'}`);
        console.log(`   Valid: ${coupon.valid}`);
        return;
    } catch (error) {
        console.log('❌ Not found as coupon ID');
    }

    // Try as promotion code
    try {
        const response = await makeStripeRequest(`/v1/promotion_codes?code=${encodeURIComponent(code)}`);
        if (response.data.length > 0) {
            const promo = response.data[0];
            console.log('✅ Found as PROMOTION CODE');
            console.log(`   Code: ${promo.code}`);
            console.log(`   Active: ${promo.active}`);
            console.log(`   Coupon ID: ${promo.coupon}`);
        } else {
            console.log('❌ Not found as promotion code');
        }
    } catch (error) {
        console.log('❌ Error checking promotion code:', error.message);
    }
}

async function main() {
    await listCoupons();
    await listPromotionCodes();

    const testCode = process.argv[2];
    if (testCode) {
        await testCouponCode(testCode);
    }

    console.log('\n' + '━'.repeat(60));
    console.log('💡 USAGE: node stripe-diagnostic.js YOUR_CODE_HERE');
    console.log('━'.repeat(60) + '\n');
}

main().catch(console.error);
