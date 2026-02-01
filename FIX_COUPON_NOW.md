# 🚨 URGENT: How to Fix Your Coupon Issue

## The Problem
Your coupon validation is returning: `{"valid":false,"message":"Invalid coupon code. Please check the code and try again."}`

This means **the code you're entering doesn't exist in your Stripe account** (or it's in the wrong mode).

## ✅ IMMEDIATE FIX - Follow These Steps:

### Step 1: Check What Mode You're In

Your `.env.local` shows you're using **LIVE** Stripe keys:
- `pk_live_...`
- `sk_live_...`

**Make sure you're looking at LIVE mode in Stripe Dashboard!**

1. Go to: https://dashboard.stripe.com
2. Look at the top-right corner
3. Make sure the toggle says **"Live mode"** (NOT "Test mode")

### Step 2: Check If You Have ANY Coupons

1. Go to: https://dashboard.stripe.com/coupons
2. Do you see any coupons listed?
   - **If NO**: You need to create one (see Step 3)
   - **If YES**: Continue to check promotion codes

### Step 3: Create a Promotion Code (REQUIRED!)

**Most Common Issue**: You created a Coupon but NOT a Promotion Code.

Here's how to fix it:

1. **Go to**: https://dashboard.stripe.com/coupons

2. **Create a Coupon** (if you don't have one):
   - Click "Create coupon"
   - Choose discount type:
     - Percentage: e.g., 20% off
     - Fixed amount: e.g., $10 off
   - Set duration:
     - Once: Applies once
     - Forever: Applies to all future invoices
     - Repeating: Applies for X months
   - Click "Create coupon"

3. **Create a Promotion Code** (THIS IS WHAT CUSTOMERS ENTER):
   - Click on your newly created coupon
   - Scroll down to "Promotion codes" section
   - Click "Create promotion code"
   - Enter a code (e.g., `WELCOME50`, `SUMMER2024`)
   - Make sure "Active" is toggled ON
   - Click "Create"

4. **Copy the exact code** you just created

5. **Test it** on your site

### Step 4: Verify Your Code

**IMPORTANT**: The code is case-sensitive!

If you created: `WELCOME50`
- ✅ Enter: `WELCOME50`
- ❌ Don't enter: `welcome50` or `Welcome50`

## 🔍 Quick Checklist

- [ ] I'm in LIVE mode in Stripe Dashboard
- [ ] I have created a Coupon
- [ ] I have created a Promotion Code for that coupon
- [ ] The Promotion Code is ACTIVE
- [ ] I'm entering the exact code (case-sensitive)
- [ ] I copied the code directly from Stripe

## 📸 What You Should See in Stripe

When you click on a coupon, you should see:

```
Coupon Details
├── ID: jkJIUzzi (auto-generated - DON'T use this)
├── Name: Summer Sale
├── Discount: 20% off
└── Promotion codes
    └── SUMMER20 ← USE THIS CODE!
        ├── Status: Active ✅
        └── Times redeemed: 0
```

## 🎯 Example: Creating a Working Coupon

Let's create a 20% off coupon called "WELCOME20":

1. **Dashboard** → **Coupons** → **Create coupon**
   - Percentage discount: `20`
   - Duration: `Once`
   - Name: `Welcome Discount`
   - Click **Create coupon**

2. **Click on the new coupon** → **Create promotion code**
   - Code: `WELCOME20`
   - Active: `ON`
   - Click **Create**

3. **Test on your site**:
   - Go to checkout
   - Enter: `WELCOME20`
   - Should work! ✅

## 🐛 Still Not Working?

If you've done all the above and it still doesn't work:

1. **Check the browser console** (F12):
   ```javascript
   fetch('/api/validate-coupon', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ couponCode: 'WELCOME20' })
   }).then(r => r.json()).then(console.log)
   ```

2. **Check Vercel logs**:
   - Go to: https://vercel.com/dashboard
   - Click your project
   - Go to "Logs" tab
   - Look for messages about coupon validation

3. **Double-check the mode**:
   - Your `.env.local` has LIVE keys
   - Make sure your Stripe Dashboard is in LIVE mode
   - Make sure the coupon exists in LIVE mode (not test mode)

## 💡 Pro Tip

**Promotion Codes** are what customers see and enter.
**Coupons** are the backend discount objects.

You MUST create a Promotion Code for customers to use a coupon!

---

**Once you've created a promotion code in LIVE mode, it will work immediately. No code changes needed!**
