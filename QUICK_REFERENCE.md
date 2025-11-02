# Quick Reference - R2 Integration

## 🚀 Quick Start (3 Steps)

### 1. Add to `.env`:
```env
VITE_R2_UPLOAD_URL=https://your-worker.workers.dev/
VITE_R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### 2. Deploy Cloudflare Worker:
- Use code from `CLOUDFLARE_WORKER_EXAMPLE.js`
- Add R2 binding: `R2_BUCKET`

### 3. Update Backend:
- Accept `image` as **string**, not File
- Remove file upload middleware
- Store **filename only** in database

---

## 📝 Usage Examples

### Upload File:
```javascript
import { uploadFileToR2 } from '../utils/r2Upload';

const filename = await uploadFileToR2(file, 'user_123');
// Returns: "user_123_20241102_143025_abc.jpg"
```

### Get File URL:
```javascript
import { getR2FileUrl } from '../utils/r2Upload';

const url = getR2FileUrl(filename);
// Returns: "https://bucket.r2.dev/uploads/user_123_20241102_143025_abc.jpg"
```

### Validate File:
```javascript
import { validateFileType } from '../utils/r2Upload';

const isValid = validateFileType(file, ['image/*', 'video/*']);
```

---

## 🔧 Backend API Format

### Request (JSON):
```json
{
  "title": "My Post",
  "content": "Description...",
  "image": "user_123_20241102_143025_abc.jpg"
}
```

### Response:
```json
{
  "success": true,
  "post": {
    "id": "post_123",
    "title": "My Post",
    "image": "user_123_20241102_143025_abc.jpg"
  }
}
```

---

## 📊 Data Flow

```
Upload:  Frontend → R2 → Get filename → Backend → Database (filename)
Display: Database → Frontend → Construct URL → Display from R2
```

---

## ⚙️ File Specs

- **Max Size:** 10MB
- **Types:** Images (JPG, PNG, WEBP), Videos (MP4, MOV)
- **Location:** `uploads/` folder in R2
- **Format:** `{prefix}_{timestamp}_{random}.{ext}`

---

## 🔗 Documentation Links

| Need | Document |
|------|----------|
| Full setup guide | `R2_SETUP_GUIDE.md` |
| Backend instructions | `BACKEND_API_INSTRUCTIONS.md` |
| Environment setup | `ENV_SETUP.md` |
| Worker code | `CLOUDFLARE_WORKER_EXAMPLE.js` |
| Complete summary | `R2_INTEGRATION_SUMMARY.md` |

---

## ✅ Checklist

**Frontend:**
- [ ] Add env variables
- [ ] Restart dev server

**Cloudflare:**
- [ ] Create R2 bucket
- [ ] Deploy Worker
- [ ] Add R2 binding

**Backend:**
- [ ] Remove multer
- [ ] Accept JSON
- [ ] Store filename only

**Test:**
- [ ] Upload works
- [ ] Images display
- [ ] Database correct

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Upload fails | Check `VITE_R2_UPLOAD_URL` |
| Images don't load | Check `VITE_R2_PUBLIC_URL` |
| Backend 400 error | Use JSON, not FormData |
| "Not configured" | Add vars to `.env`, restart |

---

## 💡 Key Points

✅ Upload happens **before** API call
✅ Database stores **filename only**
✅ Frontend constructs **full URL**
✅ Backend does **NOT** handle files
✅ Use **JSON**, not FormData

---

**Files Modified:**
- `src/utils/r2Upload.js` (new)
- `src/components/CreatePost.jsx`
- `src/components/PostCard.jsx`
- `src/components/PostDetail.jsx`

**Ready to use!** 🎿

