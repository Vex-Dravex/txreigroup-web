# Video Upload Size Issue - Local Supabase Limitation

## Problem
Even though we updated the database bucket configuration to 2GB, you're still getting the error:
```
Failed to upload video: The object exceeded the maximum allowed size
```

## Root Cause
**Local Supabase Storage API has hardcoded limits** that are separate from the database bucket configuration. The storage service itself (running via `npx supabase`) may have a default limit that's lower than 2GB.

## Solutions

### Solution 1: Use Supabase Cloud (Recommended for Production)
Deploy to Supabase Cloud where you have full control over storage limits:

1. Create a project on [supabase.com](https://supabase.com)
2. Go to Storage → Buckets → `education-videos`
3. Set file size limit to 2GB
4. Update your environment variables to use the cloud project

**Pros:**
- ✅ Full control over limits
- ✅ Better performance
- ✅ Production-ready

**Cons:**
- ❌ Requires cloud account
- ❌ May have costs for storage

### Solution 2: Compress Your Videos
For local development, compress videos to stay under the default limit:

**Using HandBrake (Free, Easy):**
1. Download HandBrake
2. Open your video
3. Choose preset: "Fast 1080p30" or "Fast 720p30"
4. Adjust quality slider to 22-24 (lower = better quality, larger file)
5. Save

**Using FFmpeg (Command Line):**
```bash
# Compress to ~500MB (adjust -fs value as needed)
ffmpeg -i input.mp4 -fs 500M -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4

# Or compress to specific bitrate
ffmpeg -i input.mp4 -c:v libx264 -b:v 2M -c:a aac -b:a 128k output.mp4
```

### Solution 3: Restart Supabase with Custom Config
Try restarting Supabase to pick up the new bucket configuration:

```bash
# Stop Supabase
npx supabase stop

# Start Supabase
npx supabase start

# Check status
npx supabase status
```

### Solution 4: Use External Storage for Development
For very large files during development:
1. Upload to YouTube (unlisted)
2. Use the YouTube embed URL in your app
3. Or use a service like Cloudinary, Vimeo, etc.

### Solution 5: Modify Upload to Use Resumable Uploads
For files > 6MB, Supabase recommends using resumable uploads:

```typescript
// Instead of standard upload
const { error } = await supabase.storage
  .from('education-videos')
  .upload(path, file);

// Use createSignedUploadUrl for large files
const { data: { signedUrl }, error: urlError } = await supabase.storage
  .from('education-videos')
  .createSignedUploadUrl(path);

if (signedUrl) {
  // Upload using fetch with the signed URL
  const response = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });
}
```

## Quick Fix for Now

**What's the size of your video file?**

Run this to check:
```bash
ls -lh /path/to/your/video.mp4
```

If it's:
- **< 100MB**: Should work with current setup (something else is wrong)
- **100MB - 500MB**: Try Solution 3 (restart Supabase)
- **500MB - 2GB**: Use Solution 2 (compress) or Solution 1 (cloud)
- **> 2GB**: Must compress or use external storage

## Recommended Approach

For **development**:
1. Compress videos to ~200-500MB
2. Use local Supabase for testing
3. Focus on functionality, not file size

For **production**:
1. Deploy to Supabase Cloud
2. Set proper bucket limits (2GB or 5GB)
3. Implement resumable uploads for reliability
4. Consider CDN for video delivery

## Next Steps

1. **Tell me the size of your video file**
2. I can help you either:
   - Compress it for local development
   - Set up Supabase Cloud
   - Implement resumable uploads
   - Use an alternative storage solution

The database configuration is correct (2GB limit is set), but the local Supabase Storage API needs additional configuration or we need to work around its limitations.
