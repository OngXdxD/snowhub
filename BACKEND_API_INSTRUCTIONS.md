# Backend API Update Instructions for R2 Integration

## Overview

The frontend now uploads images/videos directly to Cloudflare R2 **before** sending data to the backend. The backend should **NOT** handle file uploads anymore - it only receives and stores **filenames**.

---

## Critical Changes Required

### 1. Remove File Upload Handling

❌ **REMOVE** these:
- Multer middleware
- File upload libraries (busboy, formidable, etc.)
- File storage logic
- File validation on backend
- Any filesystem operations for user uploads

### 2. Update POST /api/posts Endpoint

#### OLD (Remove this approach):
```javascript
// OLD - Don't use this anymore
router.post('/api/posts', 
  authenticateToken, 
  upload.single('image'),  // ❌ REMOVE multer/upload middleware
  async (req, res) => {
    const file = req.file;  // ❌ No more file handling
    // ... save file to disk, get path, etc.
  }
);
```

#### NEW (Use this approach):
```javascript
// NEW - Accept JSON with filename
router.post('/api/posts', 
  authenticateToken, 
  async (req, res) => {
    try {
      const { title, content, tag, location, image } = req.body;
      
      // Validate required fields
      if (!title || !content || !image) {
        return res.status(400).json({ 
          message: 'Title, content, and image are required' 
        });
      }
      
      // Validate types
      if (typeof title !== 'string' || typeof content !== 'string' || typeof image !== 'string') {
        return res.status(400).json({ 
          message: 'Invalid data types' 
        });
      }
      
      // Create post - image is just a filename string
      const newPost = await Post.create({
        title: title.trim(),
        content: content.trim(),
        tag: tag?.trim() || null,
        location: location?.trim() || null,
        image: image.trim(), // ✅ Store filename only
        author: req.user.id,
        likes: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        post: newPost
      });
      
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to create post',
        error: error.message 
      });
    }
  }
);
```

---

## Request/Response Schema Changes

### POST /api/posts (Create Post)

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body (JSON - NOT FormData):**
```json
{
  "title": "Epic Powder Day at Whistler! ❄️⛷️",
  "content": "The conditions were absolutely perfect today...",
  "tag": "Skiing",
  "location": "Whistler Blackcomb, BC",
  "image": "user_123_20241102_143025_abc123def.jpg"
}
```

**Field Specifications:**
- `title` (string, required): 3-100 characters
- `content` (string, required): 10+ characters
- `tag` (string, optional): Category/tag for the post
- `location` (string, optional): Where the photo/video was taken
- `image` (string, required): **Filename only** (already uploaded to R2)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "id": "post_abc123",
    "title": "Epic Powder Day at Whistler! ❄️⛷️",
    "content": "The conditions were absolutely perfect today...",
    "tag": "Skiing",
    "location": "Whistler Blackcomb, BC",
    "image": "user_123_20241102_143025_abc123def.jpg",
    "author": {
      "id": "user_123",
      "username": "SkiPro",
      "avatar": "avatar_filename.jpg"
    },
    "likes": 0,
    "createdAt": "2024-11-02T14:30:25.000Z",
    "updatedAt": "2024-11-02T14:30:25.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Title, content, and image are required"
}
```

---

## Database Schema Updates

### Posts Table/Collection

```javascript
{
  id: String (Primary Key),
  title: String (required, 3-100 chars),
  content: String (required, 10+ chars),
  tag: String (optional),
  location: String (optional),
  image: String (required), // ✅ ONLY the filename, NOT full URL
  author: ObjectId/String (User reference),
  likes: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

**Example values for `image` field:**
```
✅ CORRECT: "user_123_20241102_143025_abc123def.jpg"
✅ CORRECT: "post_20241102_143025_xyz789.png"
❌ WRONG: "https://bucket.r2.dev/uploads/user_123_20241102_143025_abc123def.jpg"
❌ WRONG: "/uploads/user_123_20241102_143025_abc123def.jpg"
❌ WRONG: "uploads/user_123_20241102_143025_abc123def.jpg"
```

**Why only filename?**
- Frontend constructs the full URL using environment variables
- Easier to migrate storage providers
- No hardcoded URLs in database
- Cleaner data model

---

## GET Endpoints (No Changes Needed)

Your existing GET endpoints should work fine. Just return the filename as-is:

### GET /api/posts (Get All Posts)

**Response:**
```json
{
  "success": true,
  "posts": [
    {
      "id": "post_abc123",
      "title": "Epic Powder Day",
      "content": "Amazing conditions...",
      "image": "user_123_20241102_143025_abc123def.jpg", // ✅ Just the filename
      "author": {
        "id": "user_123",
        "username": "SkiPro",
        "avatar": "avatar_filename.jpg" // ✅ Also just filename
      },
      "likes": 250,
      "tag": "Skiing",
      "location": "Whistler, BC",
      "createdAt": "2024-11-02T14:30:25.000Z"
    }
  ],
  "totalPosts": 150,
  "page": 1,
  "limit": 20
}
```

### GET /api/posts/:id (Get Single Post)

**Response:** Same structure as above, single post object

---

## PUT /api/posts/:id (Update Post)

If users can update posts, accept the same JSON format:

```javascript
router.put('/api/posts/:id', 
  authenticateToken, 
  async (req, res) => {
    try {
      const { title, content, tag, location, image } = req.body;
      const postId = req.params.id;
      
      // Check if user owns the post
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      if (post.author.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      // Update fields
      const updates = {};
      if (title) updates.title = title.trim();
      if (content) updates.content = content.trim();
      if (tag !== undefined) updates.tag = tag?.trim() || null;
      if (location !== undefined) updates.location = location?.trim() || null;
      if (image) updates.image = image.trim(); // New filename if image was changed
      updates.updatedAt = new Date();
      
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        updates,
        { new: true, runValidators: true }
      ).populate('author', 'username avatar');
      
      res.json({
        success: true,
        message: 'Post updated successfully',
        post: updatedPost
      });
      
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to update post',
        error: error.message 
      });
    }
  }
);
```

---

## User Avatar/Profile Images

Apply the same pattern for user avatars:

### PUT /api/auth/me (Update Profile)

**Request Body:**
```json
{
  "username": "SkiPro2024",
  "bio": "Ski enthusiast",
  "avatar": "user_123_20241102_150030_xyz789.jpg" // ✅ Filename only
}
```

### User Schema:
```javascript
{
  id: String,
  username: String,
  email: String,
  password: String (hashed),
  avatar: String, // ✅ Filename only
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Migration Strategy

If you already have posts with old file paths:

```javascript
// One-time migration script
const migrateImagePaths = async () => {
  const posts = await Post.find({});
  
  for (const post of posts) {
    if (post.image.startsWith('http://') || post.image.startsWith('https://')) {
      // Extract filename from URL
      const filename = post.image.split('/').pop();
      post.image = filename;
      await post.save();
      console.log(`Migrated post ${post.id}: ${filename}`);
    }
  }
  
  console.log('Migration complete');
};
```

---

## Important Notes

### ✅ DO:
1. Accept `image` field as a **string** in JSON body
2. Store **only the filename** in database
3. Return **only the filename** in API responses
4. Validate required fields (title, content, image)
5. Keep authentication/authorization logic
6. Populate user/author data in responses

### ❌ DON'T:
1. Don't use file upload middleware
2. Don't store files on backend server
3. Don't construct full URLs on backend
4. Don't validate file types/sizes (frontend does this)
5. Don't modify or process the filename
6. Don't store full URLs in database

---

## Testing Checklist

- [ ] POST /api/posts accepts JSON with image filename
- [ ] POST /api/posts rejects requests without image
- [ ] POST /api/posts validates title and content
- [ ] GET /api/posts returns posts with filename only
- [ ] GET /api/posts/:id returns single post correctly
- [ ] PUT /api/posts/:id updates post with new image filename
- [ ] DELETE /api/posts/:id still works
- [ ] User profile endpoints work with avatar filenames
- [ ] All responses use consistent JSON structure

---

## Example Test Request (cURL)

```bash
# Create a new post
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -d '{
    "title": "Amazing Day at the Slopes",
    "content": "The powder was incredible today! Fresh snow all morning.",
    "tag": "Skiing",
    "location": "Aspen, CO",
    "image": "user_123_20241102_143025_abc123def.jpg"
  }'
```

---

## Summary for Backend AI

**Previous workflow:** 
Frontend → Send file via FormData → Backend saves file → Backend stores file path

**New workflow:** 
Frontend → Upload to R2 → Get filename → Send filename to backend → Backend stores filename

**Key change:** 
The `image` field is now a **string (filename)** instead of a **File object**. No file handling needed on backend.

---

## Questions?

If the backend implementation has issues:
1. Ensure Content-Type is `application/json`, not `multipart/form-data`
2. Check that `image` field is a string, not a file
3. Verify filename is stored without any URL prefix
4. Confirm API returns filename as-is in responses

