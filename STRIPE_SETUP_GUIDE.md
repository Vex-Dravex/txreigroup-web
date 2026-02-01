# 🎯 Complete Stripe Setup Guide for TX REI Group

## Current Status
✅ Your `.env.local` has the correct Price IDs  
✅ Your checkout API is properly configured  
✅ You're using LIVE mode keys  

## Issue
The error "No such price: 'price_weekly_placeholder'" means the environment variables aren't being loaded. This happens when:
1. The dev server wasn't restarted after adding env vars
2. The browser cache is using old data

---

## 🔧 Step-by-Step Fix

### 1. Verify Your Stripe Products (Already Done ✅)

Your current Price IDs from `.env.local`:
- **Weekly**: `price_1SvDidFFZDZ2nlnZKbRIugCh`
- **Monthly**: `price_1SvDj0FFZDZ2nlnZAkYVfofJ`
- **Bi-Annual**: `price_1SvDkLFFZDZ2nlnZTwxvQxeQ`
- **Annual**: `price_1SvDlqFFZDZ2nlnZqCS6Dvr1`

### 2. Verify Prices in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/products
2. For EACH product, verify:
   - ✅ Product is **Active** (not archived)
   - ✅ Price is **Active** (not archived)
   - ✅ Price ID matches your `.env.local`
   - ✅ Billing period matches (weekly/monthly/6 months/yearly)
   - ✅ Amount matches your pricing

### 3. Set Up Stripe Webhooks (CRITICAL!)

Your checkout creates subscriptions, so you NEED webhooks to update your database.

#### A. Create Webhook Endpoint

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter your endpoint URL:
   - **Local Testing**: `http://localhost:3000/api/webhooks/stripe`
   - **Production**: `https://yourdomain.com/api/webhooks/stripe`

4. Select these events (MINIMUM required):
   ```
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ checkout.session.completed
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
   ```

5. Click **"Add endpoint"**
6. Copy the **Signing Secret** (starts with `whsec_`)
7. Update `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
   ```

#### B. For Local Testing (Use Stripe CLI)

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a webhook secret starting with `whsec_` - use this for local development.

### 4. Configure Stripe Customer Portal (For Managing Subscriptions)

1. Go to: https://dashboard.stripe.com/settings/billing/portal
2. Enable these features:
   - ✅ **Cancel subscriptions** - Allow customers to cancel
   - ✅ **Update payment methods** - Allow card updates
   - ✅ **View invoices** - Let customers see billing history
   - ✅ **Update subscriptions** - Allow plan changes (optional)

3. Set your branding:
   - Add your logo
   - Set brand colors
   - Add support email

4. Click **"Save changes"**

### 5. Test the Complete Flow

#### A. Test Checkout

1. Navigate to: `http://localhost:3000/onboarding/subscription`
2. Click on any plan (e.g., "Monthly Access")
3. You should be redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code

#### B. Verify Subscription Created

1. Check Stripe Dashboard: https://dashboard.stripe.com/subscriptions
2. You should see a new subscription with:
   - ✅ Status: Active (or Trialing if 14-day trial)
   - ✅ Customer email
   - ✅ Correct plan

#### C. Verify Database Updated

Check your Supabase `memberships` table:
```sql
SELECT * FROM memberships ORDER BY created_at DESC LIMIT 1;
```

Should show:
- ✅ `stripe_subscription_id`
- ✅ `status` = 'active' or 'trialing'
- ✅ `tier` = 'weekly', 'monthly', etc.
- ✅ `current_period_end` = future date

---

## 🚀 How the Flow Works

### User Clicks "Subscribe" Button

1. **Frontend** (`/onboarding/subscription` or `/app/account/membership`):
   ```typescript
   const response = await fetch('/api/checkout', {
     method: 'POST',
     body: JSON.stringify({
       priceId: 'price_1SvDj0FFZDZ2nlnZAkYVfofJ', // Monthly
       successUrl: `${window.location.origin}/onboarding/subscription?success=true`,
       cancelUrl: `${window.location.origin}/onboarding/subscription?canceled=true`
     })
   });
   const { url } = await response.json();
   window.location.href = url; // Redirect to Stripe
   ```

2. **Backend** (`/api/checkout/route.ts`):
   - Gets current user from Supabase
   - Creates/retrieves Stripe customer
   - Creates Stripe Checkout Session
   - Returns checkout URL

3. **Stripe Checkout**:
   - User enters payment info
   - Stripe processes payment
   - Creates subscription
   - Redirects to `successUrl`

4. **Webhook** (`/api/webhooks/stripe`):
   - Stripe sends `checkout.session.completed` event
   - Your webhook handler updates Supabase `memberships` table
   - User now has active subscription

---

## 🐛 Troubleshooting

### Error: "No such price: 'price_weekly_placeholder'"

**Cause**: Environment variables not loaded

**Fix**:
```bash
# 1. Stop dev server
pkill -f "next dev"

# 2. Verify .env.local exists and has correct values
cat .env.local | grep STRIPE_PRICE_ID

# 3. Restart dev server
npm run dev

# 4. Clear browser cache or use incognito mode
```

### Error: "No such customer"

**Cause**: `stripe_customer_id` in profiles table doesn't exist in Stripe

**Fix**: Delete the invalid `stripe_customer_id` from the profile, and the checkout will create a new one.

### Webhook Not Firing

**Cause**: Webhook endpoint not configured or signing secret wrong

**Fix**:
1. Check webhook exists: https://dashboard.stripe.com/webhooks
2. Verify endpoint URL is correct
3. Update `STRIPE_WEBHOOK_SECRET` in `.env.local`
4. Restart server

### Subscription Created but Database Not Updated

**Cause**: Webhook handler has an error

**Fix**:
1. Check webhook logs: https://dashboard.stripe.com/webhooks
2. Check your server logs for errors
3. Verify webhook handler exists at `/api/webhooks/stripe`

---

## 📝 Quick Reference

### Environment Variables Needed

```bash
# Stripe API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_ID_WEEKLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_BIANNUAL=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL=price_...
```

### Stripe Dashboard Links

- **Products**: https://dashboard.stripe.com/products
- **Subscriptions**: https://dashboard.stripe.com/subscriptions
- **Customers**: https://dashboard.stripe.com/customers
- **Webhooks**: https://dashboard.stripe.com/webhooks
- **Customer Portal**: https://dashboard.stripe.com/settings/billing/portal
- **API Keys**: https://dashboard.stripe.com/apikeys

### Test Cards

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

---

## ✅ Final Checklist

Before going live:

- [ ] All products are active in Stripe
- [ ] All prices are active and correct
- [ ] Webhook endpoint configured
- [ ] Webhook secret in `.env.local`
- [ ] Customer Portal configured
- [ ] Test subscription flow works
- [ ] Database updates on subscription
- [ ] Email receipts configured
- [ ] Cancellation flow tested
- [ ] Using LIVE keys (not test keys)

---

## 🎉 You're Ready!

Once you've completed the checklist above, your Stripe integration is complete!

Users can now:
1. ✅ Subscribe to any plan
2. ✅ Get redirected to Stripe Checkout
3. ✅ Complete payment securely
4. ✅ Get redirected back to your site
5. ✅ Access members-only features
6. ✅ Manage their subscription via Customer Portal
