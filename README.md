# TXREIGROUP Web Platform

A production-grade full-stack web platform for the Texas real estate investor community, built with Next.js, Supabase, and Tailwind CSS.

## Environment Variables

This project requires Supabase environment variables to function. Create a `.env.local` file in the root directory with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### For Local Development

1. Copy `.env.local.example` to `.env.local` (if it exists) or create a new `.env.local` file
2. Add your Supabase credentials from your [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api)

### For Production Deployment (Vercel)

**Step 1: Get your Supabase credentials**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** (for `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

**Step 2: Configure Supabase Auth Redirect URLs**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add your site URLs to **Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)
5. Click **Save**

**Step 3: Add environment variables to Vercel**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
     **Value:** Your Supabase project URL (from Step 1)
     **Environment:** Select all (Production, Preview, Development)
   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     **Value:** Your Supabase anon key (from Step 1)
     **Environment:** Select all (Production, Preview, Development)
   - **Name:** `NEXT_PUBLIC_SITE_URL`
     **Value:** Your production site URL (e.g., `https://your-app.vercel.app`)
     **Environment:** Production only
5. Click **Save** for each variable

**Step 3: Redeploy**
1. After adding all variables, go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Select **Redeploy** (or push a new commit to trigger a new deployment)
4. Wait for the deployment to complete

**Important:** 
- Environment variables must be set **before** building your application
- `NEXT_PUBLIC_*` variables are embedded at build time, so you must redeploy after adding them
- If you see "Missing Supabase environment variables" error, the variables are not set or the app needs to be redeployed

## Getting Started

First, install dependencies and set up your environment variables:

```bash
npm install
# Create .env.local with your Supabase credentials (see above)
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Insurance Estimate (Off-Market MLS)

The deal submission flow stores an **estimate only** insurance premium using a deterministic underwriting-style formula. The estimator lives in `src/lib/insurance/estimateInsurance.ts` and uses submitted inputs (sqft, year built, occupancy, roof age, construction, deductible, risk flags, and optional replacement cost override) to compute monthly and annual estimates. This is not a quote.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
