# Scroll Position Restoration - Implementation Summary

## Problem
When users clicked on a listing to view details and then returned to the deals page, they had to scroll all the way back down to find where they left off.

## Solution
Implemented automatic scroll position restoration using `sessionStorage` to remember where the user was on the deals list.

## How It Works

### 1. **DealLink Component** (`DealLink.tsx`)
- Wraps each deal card link
- Saves the current scroll position to `sessionStorage` when clicked
- Uses the key `"deals-scroll-position"`

### 2. **ScrollRestorationProvider** (`useScrollRestoration.tsx`)
- Wraps the entire deals page
- Automatically restores scroll position when returning to `/app/deals`
- Clears the saved position after restoration to prevent unwanted behavior
- Uses `behavior: "instant"` for immediate scroll (no animation)

### 3. **Integration**
- `page.tsx` imports both components
- `ScrollRestorationProvider` wraps the page content
- `DealLink` replaces standard `Link` components in the deals grid

## User Experience
1. User scrolls through deals list
2. User clicks on a deal → scroll position saved
3. User views deal details
4. User clicks "← Back to Creative Marketplace"
5. Page loads and **instantly scrolls to the exact position** they left off
6. User can continue browsing from where they were

## Technical Details
- Uses `sessionStorage` (cleared when browser tab closes)
- Position is saved as `window.scrollY` value
- Restoration happens in a `useEffect` with `setTimeout(0)` to ensure DOM is ready
- Only works for `/app/deals` route (won't interfere with other pages)
