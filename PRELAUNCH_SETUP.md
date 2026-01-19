# Pre-Launch Landing Page Setup Guide

## Overview

A pre-launch landing page has been created with:
- ✅ Feature carousel component with 6 feature slides
- ✅ Logo integration in the hero section
- ✅ Target audience sections (Investors, Wholesalers, Vendors, Transaction Services)
- ✅ Modern, responsive design with dark mode support

## Adding Assets

### 1. Logo Image

The logo should be placed in the `/public` directory as one of:
- `/public/logo.png`
- `/public/logo.svg`
- `/public/logo.jpg`

**To enable the logo:**
1. Place your logo image file in `/public/logo.png` (or adjust the extension)
2. Open `/src/app/page.tsx`
3. Find the logo section (around line 40-60)
4. Replace the placeholder div with the commented Image component:
   ```tsx
   <Image
     src="/logo.png"
     alt="Houston Real Estate Investment Group Logo"
     fill
     className="object-contain"
     priority
   />
   ```

### 2. Screenshot Images

The carousel requires 6 screenshot images. Place them in `/public/screenshots/`:

1. **deals.png** - Off Market MLS / Deals page screenshot
2. **vendors.png** - Vendor Marketplace / Contractors page screenshot
3. **submit-deal.png** - Deal Submission form screenshot
4. **courses.png** - Education Center / Courses page screenshot
5. **forum.png** - Community Forum page screenshot
6. **transactions.png** - Transaction Services screenshot

**Image Recommendations:**
- Format: PNG or JPG
- Size: 1920x1080px or larger (16:9 aspect ratio works best)
- Quality: High quality, clear screenshots
- Consider compressing for web performance

**To enable screenshots:**
1. Add your screenshot images to `/public/screenshots/`
2. The carousel will automatically use them (they're already configured in `FeatureCarousel.tsx`)
3. If you want to use Next.js Image optimization, update `/src/app/components/FeatureCarousel.tsx` to use the `Image` component instead of the placeholder divs

## Feature Carousel

The carousel includes 6 features:
1. **Off Market MLS** - For investors
2. **Vendor Marketplace** - For vendors
3. **Deal Submission** - For wholesalers
4. **Education Center** - For investors
5. **Community Forum** - For all users
6. **Transaction Services** - For transaction services

Each slide includes:
- Screenshot placeholder (ready for actual images)
- Feature title
- Brief description
- Category badge

### Carousel Features:
- Auto-play (changes every 5 seconds)
- Manual navigation with arrow buttons
- Dot indicators for quick navigation
- Responsive design (mobile-friendly)
- Dark mode support

## Customization

### Changing Feature Descriptions

Edit `/src/app/components/FeatureCarousel.tsx` and modify the `features` array starting around line 17.

### Adjusting Carousel Timing

In `FeatureCarousel.tsx`, change the interval timing (default: 5000ms = 5 seconds):
```tsx
const interval = setInterval(() => {
  setCurrentIndex((prev) => (prev + 1) % features.length);
}, 5000); // Change this value
```

### Updating Hero Section

Edit `/src/app/page.tsx` to modify:
- Hero title and description
- CTA button text
- Logo size and positioning

## Testing

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Test the carousel:
   - Auto-play functionality
   - Navigation arrows
   - Dot indicators
   - Responsive design on different screen sizes
4. Test dark mode toggle

## Notes

- The landing page is now the default homepage (`/`)
- Logo and screenshots use placeholders until actual images are added
- All styling uses Tailwind CSS and matches the existing design system
- The page is fully responsive and works on mobile, tablet, and desktop



