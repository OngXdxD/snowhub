# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the root of your project with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Cloudflare R2 Configuration
VITE_R2_UPLOAD_URL=https://your-r2-worker.workers.dev/
VITE_R2_PUBLIC_URL=https://your-bucket.r2.dev

# Firebase Configuration (for social auth)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Variable Descriptions

### API Configuration
- **VITE_API_URL**: Backend API base URL (default: http://localhost:5000)

### Cloudflare R2 Configuration
- **VITE_R2_UPLOAD_URL**: Cloudflare Worker endpoint for uploading files to R2
  - Example: `https://snowhub-upload.your-subdomain.workers.dev/`
  - This Worker should handle POST requests to upload files
  
- **VITE_R2_PUBLIC_URL**: Public URL to access files from R2 bucket
  - Example: `https://snowhub-media.r2.dev`
  - Can be a custom domain pointing to your R2 bucket
  - Must have public read access enabled

### Firebase Configuration
Used for Google OAuth authentication. Get these from Firebase Console:
- **VITE_FIREBASE_API_KEY**: Firebase API key
- **VITE_FIREBASE_AUTH_DOMAIN**: Firebase auth domain
- **VITE_FIREBASE_PROJECT_ID**: Firebase project ID
- **VITE_FIREBASE_STORAGE_BUCKET**: Firebase storage bucket
- **VITE_FIREBASE_MESSAGING_SENDER_ID**: Firebase messaging sender ID
- **VITE_FIREBASE_APP_ID**: Firebase app ID

## Setup Steps

### 1. Copy the template above to `.env` file

### 2. Configure Cloudflare R2

#### Create R2 Bucket:
1. Go to Cloudflare Dashboard → R2
2. Create a new bucket (e.g., "snowhub-media")
3. Enable public access if needed
4. Note the bucket URL

#### Create Cloudflare Worker:
1. Create a new Worker in Cloudflare Dashboard
2. Use the example code from `R2_SETUP_GUIDE.md`
3. Add R2 bucket binding to the Worker
4. Deploy the Worker
5. Copy the Worker URL to `VITE_R2_UPLOAD_URL`

### 3. Configure Firebase (if using Google Auth)
1. Go to Firebase Console (https://console.firebase.google.com)
2. Create a new project or select existing
3. Enable Google Authentication
4. Copy configuration values to .env

### 4. Update Backend API URL
Set `VITE_API_URL` to your backend server URL

## Verifying Setup

After setting up environment variables:

1. **Test API Connection:**
   - Ensure backend is running
   - Check browser console for API calls

2. **Test R2 Upload:**
   - Try creating a post with an image
   - Check if file appears in R2 bucket
   - Verify image loads in the feed

3. **Test Image Display:**
   - Existing posts should show images
   - Check browser network tab for image requests

## Troubleshooting

### Images not uploading
- Verify `VITE_R2_UPLOAD_URL` is correct and includes trailing slash
- Check Cloudflare Worker is deployed and active
- Ensure Worker has R2 bucket binding configured
- Check browser console for CORS errors

### Images not displaying
- Verify `VITE_R2_PUBLIC_URL` is correct
- Ensure R2 bucket has public read access
- Check image URLs in browser network tab
- Verify bucket contains the uploaded files

### CORS Errors
Add CORS headers to your Cloudflare Worker:
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

## Security Notes

1. **Never commit .env file** - Add it to .gitignore
2. **Use environment-specific values** - Different URLs for dev/prod
3. **Secure your Worker** - Consider adding authentication
4. **Rate limiting** - Implement rate limiting on Worker
5. **File validation** - Validate file types and sizes

## Production Setup

For production, set these variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment
- Custom server: Use `.env.production` file

Make sure to use production URLs:
```env
VITE_API_URL=https://api.snowhub.com
VITE_R2_UPLOAD_URL=https://upload.snowhub.com/
VITE_R2_PUBLIC_URL=https://media.snowhub.com
```
