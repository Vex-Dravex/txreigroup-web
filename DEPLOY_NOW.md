# 🚀 Quick Production Deployment Checklist

## ⚠️ CRITICAL: You're Using LIVE Stripe Keys!

Your current `.env.local` has **production Stripe keys** (`pk_live_...` and `sk_live_...`).
This means you're already processing real transactions.

---

## 🎯 Immediate Next Steps (15 minutes)

### Step 1: Configure Stripe Production Webhook (5 min)

1. **Go to Stripe Webhooks**
   - Visit: https://dashboard.stripe.com/webhooks
   - Click: **Add endpoint**

2. **Add Your Production URL**
   ```
   Endpoint URL: https://YOUR_DOMAIN.com/api/webhooks/stripe
   ```
   (Replace `YOUR_DOMAIN.com` with your actual production domain)

3. **Select These Events**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. **Copy Webhook Secret**
   - After creating, copy the signing secret (starts with `whsec_`)
   - You'll need this for Vercel

---

### Step 2: Configure Vercel Environment Variables (5 min)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Add/Update These Variables**

   **Required for Production:**
   ```bash
   NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN.com
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_SECRET_HERE
   ```

   **Copy from .env.local (if not already set):**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://irlsochmdpqcrriygokh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
   STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY
   NEXT_PUBLIC_STRIPE_PRICE_ID_WEEKLY=price_YOUR_WEEKLY_ID
   NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_YOUR_MONTHLY_ID
   NEXT_PUBLIC_STRIPE_PRICE_ID_BIANNUAL=price_YOUR_BIANNUAL_ID
   NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL=price_YOUR_ANNUAL_ID
   PODIO_CLIENT_ID=YOUR_PODIO_CLIENT_ID
   PODIO_CLIENT_SECRET=YOUR_PODIO_CLIENT_SECRET
   ```

3. **Set Environment Scope**
   - Select: **Production** (required)
   - Optionally: **Preview** and **Development**

---

### Step 3: Deploy to Production (5 min)

```bash
# Commit your changes
git add .
git commit -m "feat: Add embedded checkout with trial information and production config"

# Push to trigger Vercel deployment
git push origin main
```

**Monitor Deployment:**
- Go to: https://vercel.com/dashboard
- Watch for "Ready" status
- Check build logs for errors

---

## ✅ Post-Deployment Verification (10 minutes)

### Test 1: Verify Price IDs Load
1. Visit: `https://YOUR_DOMAIN.com/diagnostic/stripe-prices`
2. Confirm all 4 plans show ✅ green checkmarks
3. No "placeholder" warnings should appear

### Test 2: Test Checkout Flow
1. Visit: `https://YOUR_DOMAIN.com/onboarding/subscription`
2. Click "SELECT" on Monthly Access
3. Modal should open without errors
4. Enter test card: `4242 4242 4242 4242`
5. Complete checkout

### Test 3: Verify Webhook
1. Go to: https://dashboard.stripe.com/webhooks
2. Click on your production endpoint
3. Check recent attempts - should show "200 OK"

### Test 4: Verify Database
1. Go to: https://supabase.com/dashboard
2. Check `memberships` table
3. Should have new subscription record

---

## 🔥 What You Get After Deployment

✅ **Embedded Checkout Modal** - Users never leave your site
✅ **14-Day Free Trial** - Automatic trial for all plans
✅ **Trial Information Block** - Clear explanation of billing
✅ **Multiple Payment Methods** - Card, Apple Pay, Google Pay, Cash App
✅ **Automatic Webhooks** - Database updates in real-time
✅ **Production Ready** - Live Stripe keys configured

---

## 🐛 Quick Troubleshooting

**Issue**: "No such price" error in production
- **Fix**: Verify Price IDs in Vercel environment variables
- **Fix**: Ensure you're using production Price IDs (not test mode)

**Issue**: Webhook returns 401/403
- **Fix**: Check `STRIPE_WEBHOOK_SECRET` in Vercel matches Stripe Dashboard

**Issue**: Database not updating
- **Fix**: Check webhook logs in Stripe Dashboard
- **Fix**: Verify Supabase connection in production

---

## 📚 Full Documentation

For detailed information, see:
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `STRIPE_PRICE_ID_RESOLUTION.md` - Price ID configuration details
- `EMBEDDED_CHECKOUT_CHECKLIST.md` - Full implementation checklist

---

## 🎯 Ready to Deploy?

**Your current status:**
- ✅ Stripe Price IDs configured
- ✅ Embedded checkout working locally
- ✅ Trial information block implemented
- ⏳ **NEXT**: Configure production webhook
- ⏳ **NEXT**: Set Vercel environment variables
- ⏳ **NEXT**: Deploy to production

**Estimated time to production: 15 minutes**

---

**Questions?** Review the full `PRODUCTION_DEPLOYMENT_GUIDE.md` for detailed instructions.
