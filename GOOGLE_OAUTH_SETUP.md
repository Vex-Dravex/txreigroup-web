# Google OAuth Configuration Guide

## Step-by-Step Setup for Google OAuth

### Prerequisites
- Google Cloud Console access
- Your production URL from Vercel
- Supabase project URL: `https://irlsochmdpqcrriygokh.supabase.co`

---

## Part 1: Google Cloud Console Setup

### 1. Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)

### 2. Enable Google+ API (if not already enabled)
1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click "Enable"

### 3. Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. If not configured yet:
   - **User Type**: Select "External" (unless you have Google Workspace)
   - Click "Create"
3. Fill in the Application Information:
   - **App name**: "HTXREIGROUP" (or your preferred name)
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Scopes (Add these):
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
5. Test users (optional for development):
   - Add email addresses that will test the OAuth flow
6. Click "Save and Continue" through all steps

### 4. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
3. If prompted, configure the OAuth consent screen first (see step 3)
4. **Application type**: Select "Web application"
5. **Name**: "HTXREIGROUP Web Client" (or your preferred name)
6. **Authorized JavaScript origins**: Add these URLs
   ```
   http://localhost:3000
   https://your-production-domain.com
   https://txreigroup-cl48ksie8-dravexs-projects.vercel.app
   ```
7. **Authorized redirect URIs**: Add ALL of these URLs (CRITICAL!)
   ```
   http://localhost:3000/auth/callback
   https://irlsochmdpqcrriygokh.supabase.co/auth/v1/callback
   https://your-production-domain.com/auth/callback
   https://txreigroup-cl48ksie8-dravexs-projects.vercel.app/auth/callback
   ```
8. Click "Create"
9. **IMPORTANT**: Copy your Client ID and Client Secret - you'll need these!

### 5. Note Your Credentials
After creation, you'll see:
- **Client ID**: (starts with something like `123456789-abc...googleusercontent.com`)
- **Client Secret**: (starts with `GOCSPX-...`)

**Save these securely!**

---

## Part 2: Supabase Dashboard Configuration

### 1. Navigate to Auth Providers
1. Go to [Supabase Auth Providers](https://app.supabase.com/project/irlsochmdpqcrriygokh/auth/providers)
2. Find "Google" in the providers list

### 2. Enable and Configure Google Provider
1. Toggle "Enable Sign in with Google" to **ON**
2. Fill in the credentials from Google Cloud Console:
   - **Client ID (for OAuth)**: Paste your Google Client ID
   - **Client Secret (for OAuth)**: Paste your Google Client Secret
3. **Authorized Client IDs**: Leave blank (unless using native apps)
4. Click "Save"

### 3. Verify Callback URL
The callback URL should be:
```
https://irlsochmdpqcrriygokh.supabase.co/auth/v1/callback
```

This is automatically configured by Supabase.

---

## Part 3: Testing

### Test Locally (Development)
1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/login`
3. Click "Continue with Google"
4. You should be redirected to Google's consent screen
5. After approving, you should be redirected back to your app
6. Check if you're logged in

### Test on Production (Vercel)
1. Deploy your app to Vercel
2. Go to your production URL + `/login`
3. Click "Continue with Google"
4. Verify the OAuth flow works
5. Check that you're redirected correctly

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Cause**: The redirect URI in your app doesn't match what's configured in Google Cloud Console

**Solution**:
1. Check the error message - it will show the mismatched URI
2. Add the exact URI (case-sensitive!) to "Authorized redirect URIs" in Google Cloud Console
3. Common URIs to check:
   - `https://irlsochmdpqcrriygokh.supabase.co/auth/v1/callback`
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback`

### Error: "Access blocked: This app's request is invalid"
**Cause**: OAuth consent screen not properly configured

**Solution**:
1. Go to OAuth consent screen in Google Cloud Console
2. Make sure all required fields are filled
3. Add your email to "Test users" if app is in testing mode
4. Verify scopes include email and profile

### Error: "idpiframe_initialization_failed"
**Cause**: Cookies blocked or third-party cookies disabled

**Solution**:
1. Enable third-party cookies in browser settings
2. Try in incognito/private mode
3. Check browser console for specific errors

### OAuth Works Locally But Not in Production
**Causes**:
1. Missing environment variables in Vercel
2. Redirect URI not added for production domain
3. Wrong NEXT_PUBLIC_SITE_URL

**Solution**:
1. Verify all env vars are set in Vercel: `vercel env ls`
2. Add production redirect URIs to Google Cloud Console
3. Set `NEXT_PUBLIC_SITE_URL` to your production URL
4. Redeploy: `vercel --prod`

---

## Quick Reference

### Required Redirect URIs (Add ALL of these to Google Cloud Console)
```
# Supabase callback (REQUIRED)
https://irlsochmdpqcrriygokh.supabase.co/auth/v1/callback

# Local development
http://localhost:3000/auth/callback

# Production (replace with your domain)
https://your-domain.com/auth/callback
https://txreigroup-cl48ksie8-dravexs-projects.vercel.app/auth/callback
```

### Required Environment Variables
```bash
# Local (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://irlsochmdpqcrriygokh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Production (Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://irlsochmdpqcrriygokh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

---

## Helpful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Auth Providers](https://app.supabase.com/project/irlsochmdpqcrriygokh/auth/providers)
- [Supabase Google OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Your Vercel Dashboard](https://vercel.com/dashboard)

---

## Need More Help?

If you're still experiencing issues:
1. Check the browser console for errors
2. Check Supabase Auth logs: https://app.supabase.com/project/irlsochmdpqcrriygokh/logs/explorer
3. Verify all redirect URIs are exactly correct (case-sensitive)
4. Try in incognito mode to rule out cookie/cache issues
