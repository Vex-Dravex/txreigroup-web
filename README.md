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

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the following variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
   - `NEXT_PUBLIC_SITE_URL` - Your production site URL (e.g., `https://your-domain.vercel.app`)

**Important:** Environment variables must be set in your deployment platform (Vercel) for the application to work in production.

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
