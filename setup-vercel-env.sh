#!/bin/bash

# Vercel Environment Variables Setup Script for Authentication
# Run this script to configure environment variables for production

echo "🚀 Setting up Vercel Environment Variables for Authentication"
echo ""
echo "This script will help you configure the required environment variables."
echo "You'll need the Vercel CLI installed (npm i -g vercel)"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo "Install it with: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found!"
echo ""

# Get the production URL
echo "📝 What is your production URL?"
echo "Options:"
echo "  1. Use Vercel auto-generated URL (e.g., txreigroup-cl48ksie8-dravexs-projects.vercel.app)"
echo "  2. Use custom domain (e.g., txreigroup.com)"
echo ""
read -p "Enter your production URL (without https://): " PRODUCTION_URL

if [ -z "$PRODUCTION_URL" ]; then
    echo "❌ Production URL is required!"
    exit 1
fi

echo ""
echo "🔧 Setting environment variables..."
echo ""

# Set NEXT_PUBLIC_SITE_URL
vercel env add NEXT_PUBLIC_SITE_URL production <<< "https://$PRODUCTION_URL"

# Set NEXT_PUBLIC_SUPABASE_URL (already should be set, but adding for completeness)
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://irlsochmdpqcrriygokh.supabase.co"

# Set NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlybHNvY2htZHBxY3JyaXlnb2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNjc2MDYsImV4cCI6MjA4Mjk0MzYwNn0.mTw6uIhDw3oUTE7MQsoAv4ZJaipGtGSFdeB39F16yCA"

echo ""
echo "✅ Environment variables set!"
echo ""
echo "📋 Next steps:"
echo "1. Redeploy your application: vercel --prod"
echo "2. Add the following redirect URLs to Google Cloud Console:"
echo "   - https://irlsochmdpqcrriygokh.supabase.co/auth/v1/callback"
echo "   - https://$PRODUCTION_URL/auth/callback"
echo ""
echo "3. Configure custom SMTP in Supabase Dashboard (recommended for production)"
echo "   - Go to: https://app.supabase.com/project/irlsochmdpqcrriygokh/settings/auth"
echo "   - Scroll to SMTP Settings"
echo "   - Enable Custom SMTP"
echo ""
echo "4. Test authentication on production!"
echo ""
