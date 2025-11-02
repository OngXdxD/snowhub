# R2 Integration - Implementation Summary

## What Was Done

The SnowHub application has been updated to use Cloudflare R2 for image and video storage instead of uploading files directly to the backend server.

### Files Created/Modified

#### ✅ New Files Created:
1. **`src/utils/r2Upload.js`** - Reusable R2 upload utilities
2. **`R2_SETUP_GUIDE.md`** - Complete setup and usage guide
3. **`BACKEND_API_INSTRUCTIONS.md`** - Detailed instructions for backend API changes
4. **`ENV_SETUP.md`** - Environment variables configuration guide
5. **`CLOUDFLARE_WORKER_EXAMPLE.js`** - Complete Cloudflare Worker code
6. **`R2_INTEGRATION_SUMMARY.md`** - This file

#### ✅ Modified Files:
1. **`src/components/CreatePost.jsx`** - Updated to upload to R2 before creating post
2. **`src/components/PostCard.jsx`** - Updated to fetch images from R2
3. **`src/components/PostDetail.jsx`** - Updated to display images from R2
4. **`src/services/api.js`** - Added comments about new JSON format

---

## How It Works

### Upload Flow:
```
1. User selects image/video in CreatePost
2. Frontend validates file (type, size)
3. Frontend uploads directly to R2 via Cloudflare Worker
4. R2 returns success and stores file
5. Frontend receives filename (e.g., "user_123_20241102_143025_abc.jpg")
6. Frontend sends POST request to backend with filename
7. Backend stores filename (string) in database
8. Post created successfully
```

### Display Flow:
```
1. Frontend fetches posts from backend
2. Backend returns post data with filename
3. Frontend uses getR2FileUrl() to construct full URL
4. Image displays from R2 bucket
```

---

## Key Changes

### Frontend Changes:

#### CreatePost Component:
- ✅ Imports `uploadFileToR2` and `validateFileType` from utils
- ✅ Uploads file to R2 first before creating post
- ✅ Sends only filename to backend API
- ✅ Supports both images and videos (up to 10MB)
- ✅ Shows upload progress with toast notifications

#### PostCard & PostDetail Components:
- ✅ Import `getR2FileUrl` from utils
- ✅ Construct full image URLs from filenames
- ✅ Display images from R2 bucket

#### API Service:
- ✅ Updated comments to clarify JSON format
- ✅ No longer sends FormData for posts
- ✅ Sends JSON with image filename

### Backend Changes Required:

#### API Endpoints:
- ❌ **REMOVE** file upload middleware (multer, etc.)
- ✅ **ACCEPT** JSON body instead of FormData
- ✅ **EXPECT** `image` field as string (filename)
- ✅ **STORE** only filename in database
- ✅ **RETURN** only filename in responses

#### Database Schema:
```javascript
// Posts collection/table
{
  id: String,
  title: String,
  content: String,
  tag: String,
  location: String,
  image: String, // ✅ Just filename: "user_123_20241102_143025_abc.jpg"
  author: ObjectId/String,
  likes: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Setup Checklist

### 1. Frontend Setup:
- [ ] Install dependencies (no new packages needed)
- [ ] Copy `.env.example` to `.env`
- [ ] Set `VITE_R2_UPLOAD_URL` in `.env`
- [ ] Set `VITE_R2_PUBLIC_URL` in `.env`

### 2. Cloudflare Setup:
- [ ] Create R2 bucket in Cloudflare Dashboard
- [ ] Enable public access on bucket (if needed)
- [ ] Create Cloudflare Worker using `CLOUDFLARE_WORKER_EXAMPLE.js`
- [ ] Add R2 bucket binding to Worker (name: `R2_BUCKET`)
- [ ] Deploy Worker
- [ ] Copy Worker URL to `.env`

### 3. Backend Setup:
- [ ] Read `BACKEND_API_INSTRUCTIONS.md`
- [ ] Remove file upload middleware
- [ ] Update POST /api/posts to accept JSON
- [ ] Update database schema to store filename only
- [ ] Test endpoints with JSON payloads
- [ ] Ensure responses return filename only

### 4. Testing:
- [ ] Test file upload in CreatePost
- [ ] Verify file appears in R2 bucket
- [ ] Check database stores only filename
- [ ] Confirm images display in feed
- [ ] Test with both images and videos
- [ ] Verify error handling works

---

## Environment Variables

Add to your `.env` file:

```env
# Cloudflare R2 Configuration
VITE_R2_UPLOAD_URL=https://your-worker.workers.dev/
VITE_R2_PUBLIC_URL=https://your-bucket.r2.dev
```

**Important:** 
- `VITE_R2_UPLOAD_URL` must end with `/`
- `VITE_R2_PUBLIC_URL` should NOT end with `/`

---

## API Changes Summary

### Before (OLD):
```javascript
// Frontend
const formData = new FormData();
formData.append('image', file); // ❌ File object
formData.append('title', title);
await postsAPI.create(formData);

// Backend
router.post('/api/posts', upload.single('image'), async (req, res) => {
  const file = req.file; // ❌ Handle file upload
  // Save file to disk...
});
```

### After (NEW):
```javascript
// Frontend
const filename = await uploadFileToR2(file, 'user_123'); // ✅ Upload to R2
const postData = {
  image: filename, // ✅ Just filename string
  title: title
};
await postsAPI.create(postData);

// Backend
router.post('/api/posts', async (req, res) => {
  const { image, title } = req.body; // ✅ image is a string
  // Store filename in database
});
```

---

## Utilities Available

### `uploadFileToR2(file, prefix)`
Uploads a file to R2 and returns the filename.

**Parameters:**
- `file` (File): The file to upload
- `prefix` (string): Prefix for filename (e.g., user ID)

**Returns:** `Promise<string>` - The filename

**Example:**
```javascript
const filename = await uploadFileToR2(imageFile, 'user_123');
// Returns: "user_123_20241102_143025_abc123.jpg"
```

### `getR2FileUrl(filename)`
Constructs the full URL for a file stored in R2.

**Parameters:**
- `filename` (string): The filename stored in database

**Returns:** `string` - Full URL to the file

**Example:**
```javascript
const url = getR2FileUrl('user_123_20241102_143025_abc123.jpg');
// Returns: "https://your-bucket.r2.dev/uploads/user_123_20241102_143025_abc123.jpg"
```

### `validateFileType(file, allowedTypes)`
Validates if a file matches allowed types.

**Parameters:**
- `file` (File): The file to validate
- `allowedTypes` (string[]): Array of allowed MIME types

**Returns:** `boolean`

**Example:**
```javascript
const isValid = validateFileType(file, ['image/*', 'video/*']);
```

### `uploadMultipleFilesToR2(files, prefix)`
Uploads multiple files to R2.

**Parameters:**
- `files` (File[]): Array of files
- `prefix` (string): Prefix for filenames

**Returns:** `Promise<string[]>` - Array of filenames

**Example:**
```javascript
const filenames = await uploadMultipleFilesToR2([file1, file2], 'user_123');
```

### `deleteFileFromR2(filename)`
Deletes a file from R2 (requires Worker DELETE endpoint).

**Parameters:**
- `filename` (string): The filename to delete

**Returns:** `Promise<void>`

**Example:**
```javascript
await deleteFileFromR2('user_123_20241102_143025_abc123.jpg');
```

---

## File Naming Convention

All uploaded files follow this pattern:
```
{prefix}_{timestamp}_{random}.{extension}

Example: user_123_20241102_143025_abc123def.jpg
```

**Parts:**
- `prefix`: User ID or category
- `timestamp`: YYYYMMDD_HHmmss format
- `random`: 8-character random string
- `extension`: Original file extension

**Benefits:**
- ✅ Unique filenames prevent collisions
- ✅ Sortable by date
- ✅ Traceable to user
- ✅ Retains original file type

---

## File Constraints

| Constraint | Value | Configurable |
|------------|-------|--------------|
| Max file size | 10MB | Yes (in utility & Worker) |
| Allowed types | Images, Videos | Yes (in utility) |
| Storage location | `uploads/` folder | Yes (hardcoded) |
| Filename format | `prefix_timestamp_random.ext` | No |

---

## Security Considerations

### ✅ Implemented:
- File type validation (frontend)
- File size validation (frontend & Worker)
- Path traversal prevention (Worker)
- CORS headers (Worker)

### ⚠️ Recommended (To Add):
1. **Authentication on Worker** - Verify JWT tokens
2. **Rate limiting** - Prevent upload spam
3. **Content scanning** - Check for malicious content
4. **Signed URLs** - For private content
5. **CDN integration** - For better performance
6. **Image optimization** - Resize/compress on upload

---

## Troubleshooting

### Issue: Files not uploading
**Solutions:**
- Check `VITE_R2_UPLOAD_URL` is correct
- Verify Cloudflare Worker is deployed
- Check Worker has R2 binding configured
- Look for CORS errors in console

### Issue: Images not displaying
**Solutions:**
- Verify `VITE_R2_PUBLIC_URL` is correct
- Check R2 bucket has public access
- Inspect network tab for 404 errors
- Confirm files exist in R2 bucket

### Issue: "R2 upload URL not configured"
**Solution:**
- Add `VITE_R2_UPLOAD_URL` to `.env` file
- Restart development server

### Issue: Backend returns 400 error
**Solutions:**
- Ensure backend accepts JSON (not FormData)
- Check Content-Type is `application/json`
- Verify `image` field is a string

---

## Migration from Old System

If you have existing posts with old file paths:

### Option 1: Keep old URLs
Modify `getR2FileUrl()` to detect and handle old URLs:
```javascript
export const getR2FileUrl = (filename) => {
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename; // Old URL, return as-is
  }
  // New filename, construct R2 URL
  return `${R2_PUBLIC_URL}/uploads/${filename}`;
};
```

### Option 2: Migrate old files
Run a migration script to:
1. Download old files
2. Upload to R2
3. Update database with new filenames

---

## Next Steps

### For Frontend Developers:
1. ✅ Files are ready to use
2. ✅ Add environment variables
3. ✅ Setup Cloudflare R2 & Worker
4. ✅ Test the upload flow

### For Backend Developers:
1. 📖 Read `BACKEND_API_INSTRUCTIONS.md`
2. 🔧 Remove file upload middleware
3. 🔧 Update POST /api/posts endpoint
4. 🔧 Update database schema
5. ✅ Test with new JSON format

### For DevOps:
1. 🔧 Setup R2 bucket
2. 🔧 Deploy Cloudflare Worker
3. 🔧 Configure environment variables
4. 🔧 Setup custom domain (optional)
5. 🔧 Configure CDN (optional)

---

## Documentation Files

| File | Purpose |
|------|---------|
| `R2_SETUP_GUIDE.md` | Complete setup instructions |
| `BACKEND_API_INSTRUCTIONS.md` | Backend API changes |
| `ENV_SETUP.md` | Environment variables |
| `CLOUDFLARE_WORKER_EXAMPLE.js` | Worker implementation |
| `R2_INTEGRATION_SUMMARY.md` | This summary |

---

## Benefits of R2 Integration

✅ **Scalability** - Cloudflare's global network
✅ **Performance** - Fast CDN delivery
✅ **Cost-effective** - No egress fees
✅ **Reliability** - Redundant storage
✅ **Simplicity** - No file handling on backend
✅ **Flexibility** - Easy to switch storage providers

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the setup guides
3. Verify environment variables
4. Check browser console for errors
5. Inspect network requests

---

**Implementation completed:** ✅ Ready to use
**Documentation provided:** ✅ Complete
**Backend instructions:** ✅ Provided
**Testing checklist:** ✅ Included

The R2 integration is now complete and ready for deployment! 🎿

