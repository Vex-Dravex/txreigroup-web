# 📧 Resend SMTP Setup Guide - Step by Step

## Current Step: Creating Resend Account

### Step 1: Sign Up for Resend ✅ (You're doing this now!)

**URL**: https://resend.com/signup

**Options**:
- Login with Google (recommended - fastest)
- Login with GitHub
- Email & Password

**Action**: Choose your preferred method and complete signup

---

## Next Steps (After You Sign Up):

### Step 2: Get Your API Key

Once logged into Resend dashboard:

1. You'll see the main Resend dashboard
2. Look for "API Keys" in the left sidebar (or top navigation)
3. Click "API Keys"
4. Click "Create API Key" button
5. **Name**: "Supabase Auth" (or whatever you prefer)
6. **Permission**: Leave as default (Full Access)
7. Click "Create"
8. **IMPORTANT**: Copy the API key immediately!
   - It starts with `re_...`
   - You'll only see it once
   - Example: `re_abc123xyz789...`

---

### Step 3: Configure SMTP in Supabase

**URL**: https://app.supabase.com/project/irlsochmdpqcrriygokh/settings/auth

**Settings to Configure**:

1. Scroll down to "SMTP Settings" section
2. Toggle "Enable Custom SMTP" to **ON**
3. Fill in these values:

```
Host: smtp.resend.com
Port: 587
Username: resend
Password: [Paste your Resend API key here - starts with re_...]
Sender email: noreply@txreigroup.com (or onboarding@resend.dev if no custom domain)
Sender name: HTXREIGROUP
```

4. Click "Save"

---

### Step 4: Test Email Delivery

**In Supabase Auth Settings**:

1. Look for "Send test email" button (usually near SMTP settings)
2. Click it
3. Enter your email address
4. Click "Send"
5. Check your inbox (and spam folder)
6. You should receive a test email within 30 seconds ✅

**If email arrives**: Success! SMTP is working! 🎉

**If email doesn't arrive**:
- Check spam/junk folder
- Verify API key is correct (no extra spaces)
- Check Resend dashboard for delivery logs
- Verify sender email format is correct

---

### Step 5: Test Full Sign-Up Flow

**After SMTP is working**:

1. Go to your app: http://localhost:3000/login?mode=signup
2. Enter a NEW email address (not one that already signed up)
3. Enter a password (meets all requirements)
4. Click "Create Account"
5. Check email inbox
6. Click confirmation link
7. Should redirect to /app and be logged in! ✅

---

## 🎯 What to Do Now

**Current Action**: Complete your Resend signup

**Once Done**: Let me know and I'll:
1. Help you navigate to get your API key
2. Guide you through the Supabase SMTP configuration
3. Test email delivery together

---

## 📋 Checklist

Progress tracker:
- [ ] Sign up for Resend account
- [ ] Get API key from Resend dashboard
- [ ] Configure SMTP in Supabase
- [ ] Send test email
- [ ] Test full sign-up flow
- [ ] Verify email confirmation works

---

## 🔑 Important Info to Remember

**Your Resend API Key**:
- Starts with `re_...`
- Keep it secret (don't commit to git)
- Only shown once when created
- Free tier: 3,000 emails/month, 100/day

**SMTP Details** (you'll need these):
```
Host: smtp.resend.com
Port: 587
Username: resend
Password: [Your API key]
```

**Sender Email Options**:
- Use your domain: `noreply@yourdomain.com` (requires DNS setup)
- Use Resend's domain: `onboarding@resend.dev` (works immediately)

---

## ⏱️ Time Remaining

- ✅ Step 1: Sign up (3 min) ← You're here
- Step 2: Get API key (2 min)
- Step 3: Configure Supabase (5 min)
- Step 4: Test email (2 min)
- Step 5: Test sign-up (3 min)
**Total: ~15 minutes remaining**

---

## 💡 Pro Tips

1. **Use Google login** for fastest signup
2. **Copy the API key immediately** - you can't see it again
3. **Start with `onboarding@resend.dev`** as sender - works immediately
4. **Check spam folder** when testing emails
5. **Use Resend dashboard** to see delivery logs if issues occur

---

## 🆘 If You Get Stuck

Common issues:
- **Can't find API Keys section**: Look in left sidebar or settings
- **API key not working**: Check for extra spaces when pasting
- **Emails not arriving**: Check Resend logs at https://resend.com/emails
- **"Invalid sender"**: Use `onboarding@resend.dev` instead of custom domain

---

**Ready to continue?** Let me know when you've completed the signup! 🚀
