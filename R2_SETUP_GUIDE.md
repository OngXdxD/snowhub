# Cloudflare R2 Upload Integration Guide

This guide explains how to integrate Cloudflare R2 for file uploads in the SnowHub application.

## Environment Variables

Add these variables to your `.env` file:

```env
# Cloudflare R2 Configuration
VITE_R2_UPLOAD_URL=https://your-r2-worker.workers.dev/
VITE_R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### Variable Descriptions:

- **VITE_R2_UPLOAD_URL**: Your Cloudflare Worker endpoint that handles file uploads to R2
- **VITE_R2_PUBLIC_URL**: Public URL to fetch files from your R2 bucket (can be custom domain)

## Usage

The R2 upload utilities are located in `src/utils/r2Upload.js` and provide the following functions:

### 1. Upload a File

```javascript
import { uploadFileToR2 } from '../utils/r2Upload';

// Upload a file
const filename = await uploadFileToR2(file, 'user_123');
// Returns: "user_123_20241102_143025_abc123.jpg"
```

### 2. Get File URL

```javascript
import { getR2FileUrl } from '../utils/r2Upload';

// Get full URL for a file
const url = getR2FileUrl('user_123_20241102_143025_abc123.jpg');
// Returns: "https://your-bucket.r2.dev/uploads/user_123_20241102_143025_abc123.jpg"
```

### 3. Validate File Type

```javascript
import { validateFileType } from '../utils/r2Upload';

// Validate file type
const isValid = validateFileType(file, ['image/*', 'video/*']);
// Returns: true/false
```

### 4. Upload Multiple Files

```javascript
import { uploadMultipleFilesToR2 } from '../utils/r2Upload';

// Upload multiple files
const filenames = await uploadMultipleFilesToR2([file1, file2], 'user_123');
// Returns: ["user_123_..._abc.jpg", "user_123_..._def.jpg"]
```

## Backend API Changes Required

### Current Flow (OLD - Using FormData):
```
Frontend → Upload file in FormData → Backend → Save file to disk → Save path to DB
```

### New Flow (Using R2):
```
Frontend → Upload file to R2 → Get filename → Send filename to Backend → Save filename to DB
```

### Backend API Endpoint Update Instructions

**For the AI constructing the backend:**

Update the **POST /api/posts** endpoint to accept the image/video as a **filename string** instead of a file upload:

#### OLD Schema (Remove file upload):
```javascript
// Remove multer or file upload middleware
app.post('/api/posts', upload.single('image'), async (req, res) => {
  // Old code that handles file upload
});
```

#### NEW Schema (Accept filename):
```javascript
// POST /api/posts - Create new post
// Body: JSON (not FormData)
{
  "title": "string (required)",
  "content": "string (required)", 
  "tag": "string (optional)",
  "location": "string (optional)",
  "image": "string (required) - filename from R2 (e.g., 'user_123_20241102_143025_abc123.jpg')"
}

// Response:
{
  "success": true,
  "post": {
    "id": "post_id",
    "title": "string",
    "content": "string",
    "tag": "string",
    "location": "string",
    "image": "string (filename only)",
    "author": "user_id",
    "createdAt": "timestamp"
  }
}
```

#### Database Schema Changes:

```javascript
// Posts table/collection
{
  id: String,
  title: String,
  content: String,
  tag: String,
  location: String,
  image: String,  // IMPORTANT: Store ONLY the filename, not full URL
                  // Example: "user_123_20241102_143025_abc123.jpg"
                  // NOT: "https://bucket.r2.dev/uploads/user_123_..."
  author: String (user_id reference),
  likes: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Key Changes:

1. **Remove file upload middleware** (multer, busboy, etc.)
2. **Accept JSON instead of FormData** - `image` field is now a string
3. **Store only the filename in database**, not full URL
4. **No file validation needed on backend** - frontend handles this before R2 upload
5. **When returning posts**, return the filename as-is (frontend will construct URL)

#### Example Backend Code (Node.js/Express):

```javascript
// POST /api/posts - Create new post
router.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, tag, location, image } = req.body;
    
    // Validate required fields
    if (!title || !content || !image) {
      return res.status(400).json({ 
        message: 'Title, content, and image are required' 
      });
    }
    
    // Create post with filename only
    const post = await Post.create({
      title,
      content,
      tag,
      location,
      image, // This is just the filename string
      author: req.user.id,
      likes: 0
    });
    
    res.status(201).json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/posts - Get all posts
router.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });
    
    // Return posts with filename only - frontend will construct full URL
    res.json({
      success: true,
      posts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

## File Naming Convention

Files are automatically named with the following pattern:
```
{prefix}_{timestamp}_{random}.{extension}

Example: user_123_20241102_143025_abc123def.jpg
```

Where:
- **prefix**: User ID or category (e.g., 'user_123', 'post', 'avatar')
- **timestamp**: YYYYMMDD_HHmmss format
- **random**: 8-character random string
- **extension**: Original file extension

## File Constraints

- **Max file size**: 10MB (configurable in `uploadFileToR2`)
- **Supported types**: Images (PNG, JPG, WEBP) and Videos (MP4, MOV, etc.)
- **Upload location**: All files stored in `uploads/` folder in R2 bucket

## Integration Points

The R2 integration has been added to:

1. **CreatePost.jsx** - Uploads files when creating posts
2. **PostCard.jsx** - Displays images from R2
3. **PostDetail.jsx** - Shows full images from R2

## Error Handling

The utility includes comprehensive error handling:

```javascript
try {
  const filename = await uploadFileToR2(file, 'user_123');
  console.log('Upload successful:', filename);
} catch (error) {
  // Error cases:
  // - No file provided
  // - File too large
  // - R2 URL not configured
  // - Upload failed (network, permissions, etc.)
  console.error('Upload failed:', error.message);
}
```

## Cloudflare Worker Example

Your Cloudflare Worker should handle upload and delete operations:

```javascript
// Example Cloudflare Worker endpoint
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Upload endpoint
    if (url.pathname === '/upload' && request.method === 'POST') {
      const key = url.searchParams.get('key');
      const body = await request.arrayBuffer();
      
      await env.R2_BUCKET.put(key, body, {
        httpMetadata: {
          contentType: request.headers.get('Content-Type')
        }
      });
      
      return new Response('Upload successful', { status: 200 });
    }
    
    // Delete endpoint (optional)
    if (url.pathname === '/delete' && request.method === 'DELETE') {
      const key = url.searchParams.get('key');
      await env.R2_BUCKET.delete(key);
      return new Response('Delete successful', { status: 200 });
    }
    
    return new Response('Not found', { status: 404 });
  }
}
```

## Testing

1. Ensure environment variables are set in `.env`
2. Try uploading a file in CreatePost
3. Verify file appears in R2 bucket
4. Confirm image displays correctly in feed
5. Check database stores only filename, not full URL

## Troubleshooting

### Images not loading
- Check `VITE_R2_PUBLIC_URL` is set correctly
- Verify R2 bucket has public read access
- Inspect network tab for 404 errors

### Upload fails
- Verify `VITE_R2_UPLOAD_URL` is correct
- Check Cloudflare Worker is deployed
- Ensure Worker has R2 bucket binding
- Check file size is under limit

### CORS errors
- Add CORS headers to Cloudflare Worker
- Allow POST, GET, DELETE methods
- Allow necessary headers

## Security Considerations

1. **No authentication on upload** - Consider adding authentication to your Cloudflare Worker
2. **File validation** - Done on frontend, but also validate on Worker
3. **Rate limiting** - Add rate limiting to Worker to prevent abuse
4. **Content moderation** - Consider image scanning/moderation service
5. **Signed URLs** - For private content, use signed URLs instead of public bucket

