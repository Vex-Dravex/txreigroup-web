#!/usr/bin/env node

// Quick script to test Stripe coupon validation
require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testCoupon(couponCode) {
    console.log(`\n🔍 Testing coupon: "${couponCode}"\n`);

    try {
        const coupon = await stripe.coupons.retrieve(couponCode);
        console.log('✅ Coupon found!');
        console.log('Details:', {
            id: coupon.id,
            name: coupon.name,
            valid: coupon.valid,
            percent_off: coupon.percent_off,
            amount_off: coupon.amount_off,
            duration: coupon.duration,
            times_redeemed: coupon.times_redeemed,
            max_redemptions: coupon.max_redemptions,
        });
    } catch (error) {
        if (error.code === 'resource_missing') {
            console.log('❌ Coupon not found');
            console.log('\n💡 Possible reasons:');
            console.log('   1. Coupon ID is case-sensitive - try exact match');
            console.log('   2. You created a Promotion Code, not a Coupon');
            console.log('   3. Coupon is in test mode but using live keys (or vice versa)');
            console.log('\n📝 To fix:');
            console.log('   - Go to: https://dashboard.stripe.com/coupons');
            console.log('   - Check the exact Coupon ID (not the code)');
            console.log('   - Or create a new coupon with the ID you want');
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

async function listCoupons() {
    console.log('\n📋 Listing your coupons:\n');
    try {
        const coupons = await stripe.coupons.list({ limit: 10 });
        if (coupons.data.length === 0) {
            console.log('No coupons found in your account.');
        } else {
            coupons.data.forEach((coupon, i) => {
                console.log(`${i + 1}. ID: "${coupon.id}" | Name: "${coupon.name || 'N/A'}" | ${coupon.percent_off ? coupon.percent_off + '% off' : '$' + (coupon.amount_off / 100) + ' off'}`);
            });
        }
    } catch (error) {
        console.log('❌ Error listing coupons:', error.message);
    }
}

async function listPromotionCodes() {
    console.log('\n🎟️  Listing your promotion codes:\n');
    try {
        const promoCodes = await stripe.promotionCodes.list({ limit: 10 });
        if (promoCodes.data.length === 0) {
            console.log('No promotion codes found in your account.');
        } else {
            promoCodes.data.forEach((promo, i) => {
                console.log(`${i + 1}. Code: "${promo.code}" | Coupon ID: "${promo.coupon.id}" | Active: ${promo.active}`);
            });
        }
    } catch (error) {
        console.log('❌ Error listing promotion codes:', error.message);
    }
}

async function main() {
    const couponToTest = process.argv[2];

    console.log('🔑 Using Stripe Secret Key:', process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...');
    console.log('🌍 Mode:', process.env.STRIPE_SECRET_KEY?.includes('_test_') ? 'TEST' : 'LIVE');

    await listCoupons();
    await listPromotionCodes();

    if (couponToTest) {
        await testCoupon(couponToTest);
    } else {
        console.log('\n💡 Usage: node test-coupon.js YOUR_COUPON_CODE');
    }
}

main().catch(console.error);
