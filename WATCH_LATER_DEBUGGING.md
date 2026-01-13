# Watch Later Debugging Guide

## Current Status
I've added extensive console logging to help debug the Watch Later functionality. Here's what to check:

## What to Look For in Browser Console

### 1. **On Page Load**
You should see:
```
Watch Later Videos: [...]
```
This shows all videos you've previously saved.

### 2. **For Each Video Card**
You should see logs like:
```
Video: Wholesale Foundations: Start Your First Deal {
  originalId: "sample-1",
  videoType: "sample",
  cleanVideoId: "sample-1",
  isSaved: false,
  watchLaterVideos: []
}
```

**What to check:**
- `originalId`: The full video ID
- `videoType`: Should be "course", "education", or "sample"
- `cleanVideoId`: The ID without prefix (for courses/education)
- `isSaved`: Whether this video is in your watch later list
- `watchLaterVideos`: Any matching saved videos

### 3. **When Clicking "Watch Later" Button**
You should see:
```
toggleWatchLater called: {
  videoId: "sample-1",
  videoType: "sample",
  userId: "..."
}

Video added to watch later: {
  videoId: "sample-1",
  videoType: "sample"
}
```

### 4. **When Clicking "Saved" Button (to remove)**
You should see:
```
toggleWatchLater called: { ... }
Video removed from watch later: { ... }
```

## Common Issues to Check

### Issue 1: Buttons Not Showing
**Check console for:**
- Are the video logs appearing for ALL videos?
- If not, there might be a rendering issue

**Possible causes:**
- Component not rendering
- CSS hiding the buttons
- React error preventing render

### Issue 2: Videos Not Appearing in Watch Later List
**Check console for:**
1. Initial load: `Watch Later Videos: [...]` - Is your video in this array?
2. After clicking: `Video added to watch later` - Did this message appear?
3. Video logs: Does `isSaved: true` appear for the saved video?

**Possible causes:**
- Database not saving (check for error messages)
- ID mismatch (check if `cleanVideoId` matches what's in database)
- Filter logic issue (check `viewFilter` state)

### Issue 3: Button Clicks Navigate Away
**Check:**
- Does clicking the button navigate to the video page?
- If yes, the `e.stopPropagation()` isn't working

## Manual Database Check

You can also check the database directly:

```sql
SELECT * FROM watch_later_videos WHERE user_id = 'your-user-id';
```

This will show you exactly what's stored.

## Expected Data Flow

1. **User clicks "Watch Later"**
   - Button calls `toggleWatchLater(videoId, videoType)`
   - Server action checks if already saved
   - If not saved: Inserts into database
   - Returns `{ success: true, saved: true }`
   - Button updates to show "Saved"

2. **Page loads with saved videos**
   - `getWatchLaterVideos()` fetches all saved videos
   - Returns array like: `[{ video_id: "sample-1", video_type: "sample" }]`
   - Each video card checks if it's in this array
   - If yes: Button shows "Saved" (filled bookmark)

3. **User clicks "Watch Later" in sidebar**
   - URL updates to `/app/courses?view=watch-later`
   - `viewFilter` state becomes "watch-later"
   - `filteredVideos` only includes videos where `isSaved === true`
   - Grid shows only saved videos

## Next Steps

1. Open browser console (F12)
2. Navigate to `/app/courses`
3. Look for the console logs listed above
4. Try clicking a "Watch Later" button
5. Check if logs appear
6. Try clicking "Watch Later" in sidebar
7. See if saved videos appear

Share the console output and I can help debug further!
