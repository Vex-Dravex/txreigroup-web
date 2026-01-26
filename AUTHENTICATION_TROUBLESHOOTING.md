# Authentication Troubleshooting Guide

## Issues Identified

### 1. Email Confirmation Not Being Received ❌

**Root Cause**: Supabase's default SMTP server only sends emails to authorized team members (those in your organization's team settings).

**Evidence**:
- User signed up but `email_confirmed_at` is `null`
- Confirmation email was queued but never delivered to non-team emails

**Solutions**:

#### Option A: Quick Fix for Testing (Development)
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your organization → Settings → Team
3. Add test email addresses as team members
4. These emails will now receive authentication emails

#### Option B: Production Solution - Custom SMTP Setup

**Recommended Email Providers**:
- **SendGrid** (Free tier: 100 emails/day)
- **Mailgun** (Free tier: 5,000 emails/month for 3 months)
- **Amazon SES** (Very cheap, $0.10 per 1,000 emails)
- **Resend** (Free tier: 100 emails/day, great developer experience)

**Steps to Configure Custom SMTP**:

1. **Get SMTP Credentials** from your chosen provider

2. **Configure in Supabase Dashboard**:
   - Go to https://app.supabase.com/project/irlsochmdpqcrriygokh/settings/auth
   - Scroll to "SMTP Settings"
   - Enable "Enable Custom SMTP"
   - Fill in:
     - Host: (e.g., `smtp.sendgrid.net` or `smtp.resend.com`)
     - Port: `587` (TLS) or `465` (SSL)
     - Username: Your SMTP username
     - Password: Your SMTP password
     - Sender email: (e.g., `noreply@yourdomain.com`)
     - Sender name: "HTXREIGROUP"

3. **Test the Configuration**:
   - Use the "Send test email" button in Supabase
   - Verify emails are being delivered

---

### 2. Google OAuth Configuration ✅ (Mostly Working)

**Good News**: OAuth is working! I see successful Google logins in the logs.

**Potential Issues to Check**:

#### A. Redirect URLs in Google Cloud Console

Your app is deployed at: `https://txreigroup-cl48ksie8-dravexs-projects.vercel.app/`

**Required Redirect URLs** (must be exact):
```
https://irlsochmdpqcrriygokh.supabase.co/auth/v1/callback
https://txreigroup-cl48ksie8-dravexs-projects.vercel.app/auth/callback
https://yourdomain.com/auth/callback (if using custom domain)
http://localhost:3000/auth/callback (for local development)
```

**Steps to Fix**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", add all the URLs above
6. Click "Save"

#### B. Missing NEXT_PUBLIC_SITE_URL Environment Variable

**Issue**: Your `.env.local` doesn't have `NEXT_PUBLIC_SITE_URL`

Add this to your `.env.local`:
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**For Vercel Production**:
1. Go to your Vercel project settings
2. Go to "Settings" → "Environment Variables"
3. Add:
   - Key: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://your-production-domain.com` (or your Vercel URL)
   - Environment: Production
4. Redeploy your application

#### C. Enable Google Provider in Supabase

1. Go to https://app.supabase.com/project/irlsochmdpqcrriygokh/auth/providers
2. Find "Google" in the list
3. Make sure it's enabled
4. Add your Google Client ID and Client Secret
5. Click "Save"

---

## Quick Checklist

### Local Development
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `.env.local` has `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- [ ] Google OAuth redirect includes `http://localhost:3000/auth/callback`

### Vercel Production
- [ ] Environment variable `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] Environment variable `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] Environment variable `NEXT_PUBLIC_SITE_URL` is set to production URL
- [ ] Google OAuth redirect includes production URL + `/auth/callback`
- [ ] Supabase redirect URL includes `https://irlsochmdpqcrriygokh.supabase.co/auth/v1/callback`

### Supabase Dashboard
- [ ] Custom SMTP configured (or test emails added to team)
- [ ] Google provider enabled with correct credentials
- [ ] Email templates are configured
- [ ] Confirm email option is enabled (Settings → Auth → Email Auth)

---

## Testing Steps

### Test Email Sign Up
1. Clear browser cache/use incognito
2. Go to `/login?mode=signup`
3. Sign up with an authorized email (team member email if using default SMTP)
4. Check email inbox for confirmation
5. Click confirmation link
6. Should redirect to `/app`

### Test Google OAuth
1. Clear browser cache/use incognito
2. Go to `/login`
3. Click "Continue with Google"
4. Should redirect to Google consent screen
5. After approval, should redirect back to `/auth/callback`
6. Should then redirect to `/app`

---

## Common Error Messages

### "Email address not authorized"
- **Cause**: Using default SMTP without adding email to team
- **Fix**: Add email to organization team OR configure custom SMTP

### "OAuth callback error"
- **Cause**: Redirect URL mismatch
- **Fix**: Ensure all redirect URLs are correctly configured in Google Console

### "Invalid token" or "Token expired"
- **Cause**: Email confirmation link clicked after expiration (24 hours)
- **Fix**: Request a new confirmation email

### "Configuration Error: Missing environment variables"
- **Cause**: Environment variables not set correctly
- **Fix**: Verify all env vars in `.env.local` and Vercel settings

---

## Next Steps

1. **Immediate**: Add your test email to Supabase team members for testing
2. **Short-term**: Set up custom SMTP (I recommend Resend or SendGrid)
3. **Verify**: Test both email and OAuth flows in production
4. **Optional**: Set up email templates customization in Supabase Dashboard

## Useful Links
- [Supabase SMTP Docs](https://supabase.com/docs/guides/auth/auth-smtp)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase Auth Dashboard](https://app.supabase.com/project/irlsochmdpqcrriygokh/auth/users)
