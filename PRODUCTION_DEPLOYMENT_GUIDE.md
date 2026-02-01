# 🚀 Production Deployment Guide - Stripe Embedded Checkout

## 📋 Pre-Deployment Checklist

### ⚠️ IMPORTANT: You're Currently Using LIVE Stripe Keys
Your `.env.local` shows you're already using **production (live) Stripe keys**:
- `pk_live_...` (Publishable Key)
- `sk_live_...` (Secret Key)

**This means any test transactions will create REAL charges!**

---

## 🎯 Step 1: Configure Production Environment Variables

### Option A: Vercel Deployment (Recommended)

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project: `txreigroup-web`
   - Go to: **Settings** → **Environment Variables**

2. **Add Production Variables**
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://irlsochmdpqcrriygokh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # Site URL (UPDATE THIS!)
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   
   # Stripe (PRODUCTION KEYS - Copy from your .env.local)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
   STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
   STRIPE_WEBHOOK_SECRET=whsec_PRODUCTION_WEBHOOK_SECRET_HERE
   
   # Stripe Price IDs (Copy from your .env.local)
   NEXT_PUBLIC_STRIPE_PRICE_ID_WEEKLY=price_YOUR_WEEKLY_PRICE_ID
   NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_YOUR_MONTHLY_PRICE_ID
   NEXT_PUBLIC_STRIPE_PRICE_ID_BIANNUAL=price_YOUR_BIANNUAL_PRICE_ID
   NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL=price_YOUR_ANNUAL_PRICE_ID
   
   # Podio (Copy from your .env.local)
   PODIO_CLIENT_ID=YOUR_PODIO_CLIENT_ID
   PODIO_CLIENT_SECRET=YOUR_PODIO_CLIENT_SECRET
   ```

3. **Set Environment Scope**
   - Select: **Production**, **Preview**, and **Development**
   - Click: **Save**

### Option B: Other Hosting Platforms
- Add the same variables to your hosting platform's environment configuration
- Ensure `NEXT_PUBLIC_SITE_URL` matches your production domain

---

## 🔗 Step 2: Configure Stripe Webhooks for Production

### 2.1 Get Your Production Webhook URL
Your webhook endpoint will be:
```
https://yourdomain.com/api/webhooks/stripe
```
(Replace `yourdomain.com` with your actual domain)

### 2.2 Create Webhook in Stripe Dashboard

1. **Navigate to Webhooks**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click: **Add endpoint**

2. **Configure Endpoint**
   - **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
   - **Description**: `TX REI Group Production Webhooks`
   - **Version**: `Latest API version`

3. **Select Events to Listen To**
   Select these critical events:
   ```
   ✅ checkout.session.completed
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
   ✅ customer.subscription.trial_will_end
   ```

4. **Save and Get Signing Secret**
   - Click: **Add endpoint**
   - Copy the **Signing secret** (starts with `whsec_`)
   - This is your `STRIPE_WEBHOOK_SECRET` for production

5. **Update Vercel Environment Variables**
   - Go back to Vercel Dashboard
   - Update `STRIPE_WEBHOOK_SECRET` with the new production secret
   - Redeploy your application

---

## 🧪 Step 3: Test Webhook Locally (Optional but Recommended)

Before deploying, test webhooks locally using Stripe CLI:

```bash
# Install Stripe CLI (if not already installed)
# macOS: brew install stripe/stripe-cli/stripe
# Linux: Download from https://github.com/stripe/stripe-cli/releases

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger a test event
stripe trigger checkout.session.completed
```

**Expected Output:**
- ✅ Webhook received successfully
- ✅ Database updated in Supabase
- ✅ No errors in console

---

## 🚀 Step 4: Deploy to Production

### 4.1 Commit and Push Changes

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add embedded Stripe checkout with trial information block and production webhook configuration"

# Push to main branch
git push origin main
```

### 4.2 Verify Vercel Deployment

1. **Check Deployment Status**
   - Go to: https://vercel.com/dashboard
   - Monitor the deployment progress
   - Wait for "Ready" status

2. **Check Build Logs**
   - Click on the deployment
   - Review logs for any errors
   - Ensure all environment variables are loaded

---

## ✅ Step 5: Post-Deployment Verification

### 5.1 Test Checkout Flow in Production

1. **Navigate to Production Site**
   ```
   https://yourdomain.com/onboarding/subscription
   ```

2. **Test with Stripe Test Card** (if in test mode)
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`

3. **Verify Subscription Created**
   - Check Stripe Dashboard: https://dashboard.stripe.com/subscriptions
   - Should see new subscription with status "trialing"

### 5.2 Verify Webhook Integration

1. **Check Webhook Logs in Stripe**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click on your production endpoint
   - View recent webhook attempts
   - All should show "200 OK" status

2. **Verify Database Updates**
   - Check Supabase `memberships` table
   - Should have new row with:
     - `stripe_subscription_id`
     - `status: 'trialing'`
     - `current_period_end` (14 days from now)

### 5.3 Test All Membership Tiers

Test each plan to ensure all Price IDs work:
- ✅ Weekly Access ($29/week)
- ✅ Monthly Access ($99/month)
- ✅ Bi-Annual Access ($495/6 months)
- ✅ Annual Access ($990/year)

---

## 🔒 Step 6: Security Best Practices

### 6.1 Verify Webhook Signature Validation
Your webhook handler already validates signatures (line 17-21 in `route.ts`):
```typescript
event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
);
```
✅ This is correct - do not modify!

### 6.2 Enable Stripe Radar (Fraud Prevention)
1. Go to: https://dashboard.stripe.com/radar
2. Enable **Radar for Fraud Teams**
3. Configure rules for your business

### 6.3 Set Up Monitoring
1. **Stripe Dashboard Alerts**
   - Go to: https://dashboard.stripe.com/settings/notifications
   - Enable email alerts for:
     - Failed payments
     - Disputed charges
     - Webhook failures

2. **Vercel Monitoring**
   - Enable error tracking in Vercel
   - Set up alerts for 500 errors

---

## 🎯 Step 7: Customer Portal Configuration

Allow customers to manage their subscriptions:

1. **Go to Customer Portal Settings**
   - Navigate to: https://dashboard.stripe.com/settings/billing/portal
   - Click: **Activate test link** (or production)

2. **Configure Features**
   Enable:
   - ✅ Cancel subscriptions
   - ✅ Update payment methods
   - ✅ View invoices
   - ✅ Update billing information

3. **Customize Branding**
   - Upload your logo
   - Set brand colors
   - Add custom messaging

4. **Save Configuration**

---

## 📊 Step 8: Analytics & Monitoring

### Track Key Metrics

1. **Conversion Rate**
   - Monitor: Visitors → Trial Signups
   - Target: >3% (embedded checkout typically converts better)

2. **Trial-to-Paid Conversion**
   - Monitor: Trial Starts → Paid Subscriptions
   - Target: >40%

3. **Churn Rate**
   - Monitor: Cancellations per month
   - Target: <5% monthly churn

### Set Up Analytics Tracking

Add to your checkout success handler:
```typescript
// Track successful subscription
analytics.track('Subscription Created', {
    plan: planName,
    price: planPrice,
    trial_days: 14
});
```

---

## 🐛 Troubleshooting Guide

### Issue: Webhook Returns 401/403
**Solution**: Verify `STRIPE_WEBHOOK_SECRET` is correct in production environment

### Issue: Subscription Created but Database Not Updated
**Solution**: 
1. Check webhook logs in Stripe Dashboard
2. Verify Supabase connection in production
3. Check server logs in Vercel

### Issue: "No such price" Error in Production
**Solution**:
1. Verify Price IDs are for production (not test mode)
2. Ensure environment variables are set in Vercel
3. Redeploy application

---

## 📞 Support Resources

- **Stripe Dashboard**: https://dashboard.stripe.com
- **Stripe Docs**: https://stripe.com/docs/billing/subscriptions/trials
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## ✅ Deployment Checklist

- [ ] Environment variables configured in Vercel
- [ ] Production webhook endpoint created in Stripe
- [ ] Webhook signing secret added to Vercel
- [ ] Code committed and pushed to main branch
- [ ] Vercel deployment successful
- [ ] Checkout flow tested in production
- [ ] All 4 membership tiers tested
- [ ] Webhook integration verified
- [ ] Database updates confirmed
- [ ] Customer Portal configured
- [ ] Monitoring and alerts set up
- [ ] Analytics tracking implemented

---

**🎉 Once all items are checked, your production deployment is complete!**

**Next Step**: Monitor your first real subscriptions and gather user feedback to optimize the checkout experience.
