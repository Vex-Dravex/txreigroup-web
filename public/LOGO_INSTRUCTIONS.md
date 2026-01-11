# Logo Setup Instructions

To add your logo to the site:

1. Place your logo image file in this directory (`/public/`) with the filename `logo.png`
2. Supported formats: PNG, JPG, SVG, or WebP
3. Recommended size: 
   - For homepage hero: 800x800px or larger (square format works best)
   - The logo will be automatically resized for different sections

**Current logo path:** `/public/logo.png`

If your logo is in a different format (e.g., `logo.jpg` or `logo.svg`), you'll need to update the image paths in:
- `src/app/page.tsx` (homepage)
- `src/app/app/components/AppHeader.tsx` (navigation header)
- `src/app/login/page.tsx` (login page)


