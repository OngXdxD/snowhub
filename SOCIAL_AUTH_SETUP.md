# Google & Apple Sign-In Setup Guide

Complete guide to enable Google and Apple authentication in SnowHub.

---

## 📋 Prerequisites

- Firebase account (free)
- Google Cloud Console account
- Apple Developer account (for Apple Sign-In)

---

## 🔥 Step 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `snowhub` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 1.2 Add Web App

1. Click the Web icon (</>) in Project Overview
2. Register app name: `SnowHub Web`
3. Copy the Firebase configuration object
4. Click "Continue to console"

### 1.3 Get Firebase Config

You'll receive a config object like this:

```javascript
{
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "snowhub-xxxxx.firebaseapp.com",
  projectId: "snowhub-xxxxx",
  storageBucket: "snowhub-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
}
```

---

## 🔐 Step 2: Enable Authentication

### 2.1 Enable Google Sign-In

1. In Firebase Console, go to **Authentication**
2. Click **"Get Started"** (if first time)
3. Go to **Sign-in method** tab
4. Click **Google**
5. Toggle **Enable**
6. Set Project public-facing name: `SnowHub`
7. Choose support email
8. Click **Save**

✅ **Google Sign-In is now enabled!**

### 2.2 Enable Apple Sign-In

1. In Sign-in method tab, click **Apple**
2. Toggle **Enable**
3. You'll need:
   - Apple Developer Team ID
   - Service ID
   - Key ID
   - Private Key

#### Get Apple Developer Credentials:

1. Go to [Apple Developer](https://developer.apple.com/)
2. **Create Service ID:**
   - Identifiers → (+) → Service IDs
   - Description: `SnowHub`
   - Identifier: `com.yourcompany.snowhub`
   - Enable "Sign In with Apple"
   - Configure with your domain and redirect URL from Firebase

3. **Create Key:**
   - Keys → (+) → "Sign in with Apple"
   - Key Name: `SnowHub Auth Key`
   - Download the `.p8` key file
   - Save Key ID

4. **Get Team ID:**
   - Found in Apple Developer Account → Membership

5. **Enter in Firebase:**
   - Paste all credentials into Firebase Apple settings
   - Click **Save**

✅ **Apple Sign-In is now enabled!**

---

## 🔧 Step 3: Configure Your App

### 3.1 Create Environment Variables

Create a `.env` file in your project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3.2 Update Firebase Config

The config file (`src/config/firebase.js`) will automatically read from `.env`.

---

## 🚀 Step 4: Test Authentication

### 4.1 Google Sign-In

1. Start your app: `yarn dev`
2. Go to login page
3. Click "Google" button
4. Google popup opens
5. Select/sign in with Google account
6. Redirects to home page
7. ✅ You're logged in!

### 4.2 Apple Sign-In

1. Click "Apple" button
2. Apple popup opens
3. Sign in with Apple ID
4. Approve permissions
5. Redirects to home page
6. ✅ You're logged in!

---

## 📝 What Happens Behind the Scenes

### Authentication Flow:

```
User Clicks Button
     ↓
Firebase Opens Popup
     ↓
User Signs In
     ↓
Firebase Returns:
  - ID Token
  - User Info (email, name, photo)
     ↓
Store in localStorage:
  - authToken
  - userId
  - username
  - email
     ↓
Navigate to Home
```

### User Data Retrieved:

**Google:**
- ✅ Email
- ✅ Display Name
- ✅ Profile Photo
- ✅ Unique ID

**Apple:**
- ✅ Email
- ✅ Name (first time only)
- ✅ Unique ID
- ❌ No photo

---

## 🔒 Security Features

✅ **Firebase handles all OAuth flows**  
✅ **Secure token management**  
✅ **HTTPS required in production**  
✅ **Automatic token refresh**  
✅ **Cross-platform compatible**

---

## 🌐 Production Deployment

### Before deploying:

1. **Add Authorized Domains** in Firebase:
   - Authentication → Settings → Authorized domains
   - Add your production domain

2. **Update Apple Service ID:**
   - Add production domain and redirect URLs
   - In Apple Developer console

3. **Environment Variables:**
   - Set all `VITE_FIREBASE_*` variables in your hosting platform
   - Vercel: Settings → Environment Variables
   - Netlify: Site settings → Environment variables

4. **Test thoroughly:**
   - Test Google sign-in on production
   - Test Apple sign-in on production
   - Test on mobile devices

---

## 🐛 Troubleshooting

### Google Sign-In Not Working

**Problem:** Popup blocked  
**Solution:** Allow popups for your site

**Problem:** "Unauthorized domain"  
**Solution:** Add domain to Firebase authorized domains

**Problem:** "API key invalid"  
**Solution:** Check `.env` file and restart dev server

### Apple Sign-In Not Working

**Problem:** "Invalid client"  
**Solution:** Verify Service ID matches Firebase config

**Problem:** "Invalid redirect"  
**Solution:** Check redirect URL in Apple Developer console

**Problem:** "Missing credentials"  
**Solution:** Ensure all Apple credentials are in Firebase

---

## 📱 Mobile Support

### iOS Safari:
✅ Google Sign-In: Works with popup
✅ Apple Sign-In: Native integration

### Android Chrome:
✅ Google Sign-In: Works with popup
✅ Apple Sign-In: Works via web flow

### Redirect Method (Alternative):

For better mobile support, use redirect instead of popup:

```javascript
// In socialAuth.js
import { signInWithGoogleRedirect } from '../services/socialAuth';

// Use redirect method
await signInWithGoogleRedirect();
```

The redirect method is more reliable on mobile but navigates away from your app.

---

## 💰 Cost

### Firebase Authentication:
- **Free tier:** 50,000 monthly active users
- **Pricing:** $0.0055 per user after free tier
- ✅ More than enough for most apps!

### Apple Developer:
- **$99/year** for Apple Developer Program (required for Apple Sign-In)

### Google Cloud:
- **Free** for authentication

---

## ✨ Summary

You now have:

✅ Google Sign-In enabled  
✅ Apple Sign-In enabled  
✅ Secure authentication flow  
✅ User data management  
✅ Production-ready setup

Users can now sign in with one click! 🎉

---

## 📚 Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Google Sign-In Guide](https://developers.google.com/identity/sign-in/web)
- [Apple Sign-In Guide](https://developer.apple.com/sign-in-with-apple/)
- [Firebase Console](https://console.firebase.google.com/)
- [Apple Developer Portal](https://developer.apple.com/)

---

## 🤝 Need Help?

1. Check Firebase Console logs
2. Check browser console for errors
3. Verify all credentials are correct
4. Ensure domains are authorized
5. Test in incognito mode (clears cache)

Happy coding! 🚀🎿

