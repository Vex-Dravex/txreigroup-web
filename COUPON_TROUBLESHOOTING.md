# 🎟️ Stripe Coupon Troubleshooting Guide

## The Issue
You're getting `{"valid":false,"message":"Invalid coupon code"}` when trying to apply a coupon.

## ✅ Solution Applied
I've updated the validation API to check **both**:
1. **Coupons** (direct coupon IDs)
2. **Promotion Codes** (customer-facing codes)

## 🔍 How to Check Your Stripe Setup

### Option 1: You Created a Promotion Code (Most Common)

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/coupons
   
2. **Check Your Coupons**
   - Look for your discount
   - Note the **Coupon ID** (this is usually auto-generated like `jkJIUzzi`)
   
3. **Check Promotion Codes**
   - Click on the coupon
   - Scroll to "Promotion codes" section
   - You should see your customer-facing code (e.g., `SUMMER2024`)
   
4. **What to Enter**
   - ✅ Enter the **Promotion Code** (e.g., `SUMMER2024`)
   - ❌ NOT the Coupon ID (e.g., `jkJIUzzi`)

### Option 2: You Created a Coupon Only

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/coupons
   
2. **Find Your Coupon**
   - Look at the **ID** column
   - This is what you need to enter (case-sensitive!)
   
3. **Create a Promotion Code (Recommended)**
   - Click on the coupon
   - Click "Create promotion code"
   - Enter a customer-friendly code (e.g., `WELCOME50`)
   - Save

## 🎯 Quick Test

### Test in Your Browser Console:
```javascript
// Open your site, then press F12 and paste this:
fetch('/api/validate-coupon', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ couponCode: 'YOUR_CODE_HERE' })
}).then(r => r.json()).then(console.log)
```

Replace `YOUR_CODE_HERE` with your actual code.

## 📋 Common Issues & Fixes

### Issue 1: Case Sensitivity
**Problem**: Stripe coupon IDs are case-sensitive  
**Fix**: Enter the code exactly as shown in Stripe Dashboard

### Issue 2: Test vs Live Mode
**Problem**: Coupon created in test mode, but using live keys  
**Fix**: 
- Check the toggle in Stripe Dashboard (top right)
- Make sure you're in the same mode as your keys
- Your current keys are: **LIVE** mode

### Issue 3: Promotion Code vs Coupon ID
**Problem**: Entering the wrong identifier  
**Fix**: Use the promotion code (customer-facing), not the coupon ID

### Issue 4: Inactive Promotion Code
**Problem**: Promotion code was deactivated  
**Fix**: 
- Go to the promotion code in Stripe
- Make sure "Active" is toggled ON

## 🛠️ How to Create a Working Coupon

### Step-by-Step:

1. **Create Coupon**
   ```
   Dashboard → Coupons → Create coupon
   - Name: "Summer Sale"
   - Discount: 20% off
   - Duration: Once / Forever / Repeating
   - Click "Create coupon"
   ```

2. **Create Promotion Code**
   ```
   Click on your new coupon
   → Create promotion code
   - Code: SUMMER20 (this is what customers enter)
   - Active: ON
   - Click "Create"
   ```

3. **Test It**
   ```
   Go to your checkout page
   Enter: SUMMER20
   Should work! ✅
   ```

## 🔧 Updated API Behavior

The validation API now:
1. First tries to find a coupon with that exact ID
2. If not found, searches for a promotion code with that code
3. Returns the discount if either is found and active

## 📞 Still Not Working?

Check the server logs:
1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Logs" tab
4. Look for messages like:
   - `Coupon ID "XXX" not found, trying as promotion code...`
   - `Neither coupon nor promotion code found for: "XXX"`

This will tell you exactly what Stripe is seeing.

## ✅ Checklist

- [ ] Confirmed I'm in the correct mode (Test vs Live)
- [ ] Created a promotion code (not just a coupon)
- [ ] Promotion code is active
- [ ] Entered the code exactly as shown (case-sensitive)
- [ ] Tested with the browser console command above
- [ ] Checked Vercel logs for error messages

---

**Once you've verified your Stripe setup, the coupon should work!**
