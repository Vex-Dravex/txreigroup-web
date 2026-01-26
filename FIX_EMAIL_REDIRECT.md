# 🔗 Fix Email Confirmation Redirect

## The Problem
Email confirmation links work, but don't redirect back to your site after clicking.

## The Solution
Configure redirect URLs in Supabase Auth settings.

---

## Step-by-Step Fix

### Step 1: Go to Supabase URL Configuration

**Direct Link:**
https://app.supabase.com/project/irlsochmdpqcrriygokh/auth/url-configuration

**Or Navigate:**
1. Go to Supabase Dashboard
2. Select your project
3. Go to **Authentication** → **URL Configuration**

---

### Step 2: Configure Site URL

**Find the "Site URL" field** (at the top)

**For Development:**
```
http://localhost:3000
```

**For Production:**
```
https://txreigroup-cl48ksie8-dravexs-projects.vercel.app
```
OR your custom domain:
```
https://houstonreigroup.com
```

**Set it to your production URL if deploying, or localhost for now.**

---

### Step 3: Add Redirect URLs

**Find the "Redirect URLs" section**

**Add ALL of these URLs** (one per line):

```
http://localhost:3000/**
https://txreigroup-cl48ksie8-dravexs-projects.vercel.app/**
https://houstonreigroup.com/**
http://localhost:3000/auth/callback
https://txreigroup-cl48ksie8-dravexs-projects.vercel.app/auth/callback
https://houstonreigroup.com/auth/callback
```

The `/**` wildcard allows all paths under that domain.

---

### Step 4: Save Changes

Click **"Save"** at the bottom of the page.

---

## Test Again

After saving:

1. **Sign up with a NEW email** (or use an unconfirmed one)
2. **Check email inbox**
3. **Click confirmation link**
4. **Should now redirect to your app!** ✅

Expected behavior:
- Clicking link → redirects to `http://localhost:3000/auth/callback`
- Callback exchanges code for session
- Redirects to `/app`
- You're logged in! 🎉

---

## Alternative: Quick Test Without Changing Supabase

If you want to test immediately, you can manually confirm the user in Supabase:

1. Go to **Authentication** → **Users**
2. Find the user who just signed up
3. Click on the user
4. Look for "Email Confirmed" status
5. You can manually toggle it to "Confirmed"

Then the user can log in without clicking the link!

---

## For Production

Once you deploy to Vercel, make sure:
1. **Site URL** is set to your production domain
2. **Redirect URLs** include your production domain
3. **Environment variables** are set in Vercel:
   - `NEXT_PUBLIC_SITE_URL` = your production URL

---

## What Each URL Does

**Site URL:** Default redirect when no specific redirect is provided

**Redirect URLs:** Allowed destinations for email links and OAuth callbacks

**The `/**` wildcard:** Allows any path under that domain (recommended for flexibility)

---

## Quick Copy-Paste for Redirect URLs

```
http://localhost:3000/**
http://localhost:3000/auth/callback
https://txreigroup-cl48ksie8-dravexs-projects.vercel.app/**
https://txreigroup-cl48ksie8-dravexs-projects.vercel.app/auth/callback
https://houstonreigroup.com/**
https://houstonreigroup.com/auth/callback
```

Paste all 6 lines into the Redirect URLs field (Supabase handles multiple URLs on separate lines).
