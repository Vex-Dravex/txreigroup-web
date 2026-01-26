# 🚨 QUICK FIX CHECKLIST

## Immediate Actions Required

### 1️⃣ Email Authentication Not Working
**Root Cause**: Supabase default SMTP only sends to authorized team members

**QUICK FIX** (5 minutes):
1. Go to https://app.supabase.com
2. Navigate to your organization → Settings → Team
3. Click "Invite Member"
4. Add the email addresses you want to test with
5. They don't need to accept - emails will now be delivered!

**PRODUCTION FIX** (30 minutes):
Set up custom SMTP (recommended: Resend.com)
- Free tier: 3,000 emails/month
- Sign up: https://resend.com/signup
- Get API key
- Configure in Supabase: https://app.supabase.com/project/irlsochmdpqcrriygokh/settings/auth
  - Host: `smtp.resend.com`
  - Port: `587`
  - Username: `resend`
  - Password: Your API key
  - Sender: `noreply@yourdomain.com`

---

### 2️⃣ Google OAuth Not Working
**Most Common Cause**: Missing redirect URIs in Google Cloud Console

**QUICK FIX** (10 minutes):
1. Go to https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add **ALL** of these:
   ```
   https://irlsochmdpqcrriygokh.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   https://txreigroup-cl48ksie8-dravexs-projects.vercel.app/auth/callback
   ```
4. Click "Save"
5. Wait 5 minutes for changes to propagate
6. Test again

---

### 3️⃣ Vercel Production Issues

**QUICK FIX** (5 minutes):
Add missing environment variable to Vercel:

```bash
# Option A: Using Vercel CLI
vercel env add NEXT_PUBLIC_SITE_URL production
# Enter value: https://your-production-url.com

# Option B: Using Vercel Dashboard
# 1. Go to your project → Settings → Environment Variables
# 2. Add: NEXT_PUBLIC_SITE_URL = https://your-production-url.com
# 3. Environment: Production
# 4. Save
```

Then redeploy:
```bash
vercel --prod
```

---

## Local Development Works But Production Doesn't?

### Check These:
- [ ] All environment variables are set in Vercel
- [ ] Production URL is added to Google OAuth redirect URIs
- [ ] `NEXT_PUBLIC_SITE_URL` matches your actual production URL
- [ ] You redeployed after adding env vars

### Quick Test:
```bash
# List Vercel env vars
vercel env ls

# Should show:
# ✓ NEXT_PUBLIC_SUPABASE_URL (production)
# ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY (production)  
# ✓ NEXT_PUBLIC_SITE_URL (production)
```

---

## Test Your Fixes

### Email Sign-Up Test
```bash
# 1. Go to your app
# 2. Navigate to /login?mode=signup
# 3. Enter email (must be in team if using default SMTP)
# 4. Click Sign Up
# 5. Check email inbox
# 6. Click confirmation link
# ✓ Should redirect to /app and be logged in
```

### Google OAuth Test
```bash
# 1. Clear browser cache or use incognito
# 2. Go to /login
# 3. Click "Continue with Google"
# 4. Select Google account
# 5. Approve permissions
# ✓ Should redirect to /app and be logged in
```

---

## Still Not Working?

### Check Logs:
- **Supabase Auth Logs**: https://app.supabase.com/project/irlsochmdpqcrriygokh/logs/explorer
- **Vercel Logs**: `vercel logs` or check dashboard
- **Browser Console**: F12 → Console tab

### Common Errors:

| Error | Fix |
|-------|-----|
| "Email address not authorized" | Add email to team or setup custom SMTP |
| "redirect_uri_mismatch" | Add exact URI to Google Cloud Console |
| "Configuration Error" | Check environment variables |
| "Invalid token" | Confirmation link expired, resend email |

---

## Contact Information

**Your Supabase Project**: 
- URL: https://irlsochmdpqcrriygokh.supabase.co
- Dashboard: https://app.supabase.com/project/irlsochmdpqcrriygokh

**Your Vercel Deployment**:
- URL: https://txreigroup-cl48ksie8-dravexs-projects.vercel.app

---

## Priority Order

Do these in order for fastest results:

1. **Add test emails to Supabase team** (1 min) ✅ START HERE
2. **Add redirect URIs to Google Console** (5 min)
3. **Add NEXT_PUBLIC_SITE_URL to Vercel** (2 min)
4. **Redeploy on Vercel** (3 min)
5. **Test both auth methods** (5 min)
6. **Set up custom SMTP for production** (30 min - do later)

Total time to get working: ~15 minutes
