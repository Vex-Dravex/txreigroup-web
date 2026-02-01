# 🚀 Quick Fix: Add Environment Variables to Vercel

## The Problem
Your live Vercel site is showing placeholder values because Vercel doesn't have access to your `.env.local` file. You need to manually add these variables to Vercel.

## ⚡ Quick Solution (5 minutes)

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Click on your project: **txreigroup-web**
3. Go to: **Settings** → **Environment Variables**

### Step 2: Add These Variables (Copy & Paste)

**IMPORTANT**: Replace `YOUR_PRODUCTION_DOMAIN` with your actual domain (e.g., `txreigroup.com`)

```bash
# Supabase (Copy from your .env.local)
NEXT_PUBLIC_SUPABASE_URL=https://irlsochmdpqcrriygokh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE

# Site URL (CHANGE THIS!)
NEXT_PUBLIC_SITE_URL=https://YOUR_PRODUCTION_DOMAIN

# Stripe API Keys (Copy from your .env.local)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Stripe Price IDs (Copy from your .env.local)
NEXT_PUBLIC_STRIPE_PRICE_ID_WEEKLY=price_YOUR_WEEKLY_PRICE_ID
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_YOUR_MONTHLY_PRICE_ID
NEXT_PUBLIC_STRIPE_PRICE_ID_BIANNUAL=price_YOUR_BIANNUAL_PRICE_ID
NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL=price_YOUR_ANNUAL_PRICE_ID

# Podio (Copy from your .env.local)
PODIO_CLIENT_ID=YOUR_PODIO_CLIENT_ID
PODIO_CLIENT_SECRET=YOUR_PODIO_CLIENT_SECRET
```

### Step 3: Set Environment Scope
For each variable, select:
- ✅ **Production** (required)
- ✅ **Preview** (recommended)
- ✅ **Development** (optional)

### Step 4: Redeploy
After adding all variables:
1. Go to: **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click: **Redeploy**
4. Wait for deployment to complete (~2 minutes)

## ✅ Verify It Worked

1. **Check Diagnostic Page**
   Visit: `https://YOUR_DOMAIN/diagnostic/stripe-prices`
   - Should show ✅ green checkmarks
   - No placeholder warnings

2. **Test Checkout**
   Visit: `https://YOUR_DOMAIN/onboarding/subscription`
   - Click "SELECT" on any plan
   - Modal should open without errors

## 🎯 Alternative: Use Vercel CLI (Faster)

If you have Vercel CLI installed:

```bash
# Install Vercel CLI (if needed)
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add environment variables from .env.local
vercel env pull .env.vercel.local

# Or add them one by one
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# (paste value when prompted)
```

## 📝 Important Notes

1. **NEXT_PUBLIC_* variables** are exposed to the browser
2. **Non-NEXT_PUBLIC_* variables** are server-side only
3. **Always redeploy** after changing environment variables
4. **Never commit** `.env.local` to Git

## 🐛 Troubleshooting

**Still seeing placeholders after redeploy?**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Check Vercel deployment logs for errors

**Variables not showing in Vercel?**
- Make sure you clicked "Save" after adding each variable
- Verify the variable names match exactly (case-sensitive)
- Check that you selected "Production" environment

---

**Once you've added the variables and redeployed, your live site will work exactly like localhost!**
