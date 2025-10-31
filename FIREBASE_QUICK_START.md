# Firebase Quick Start - 5 Minutes ⚡

Get Google & Apple Sign-In working in 5 minutes!

---

## 🚀 Quick Setup (No Firebase Account Needed Yet)

Your app currently works WITHOUT Firebase! The social sign-in buttons will show a friendly message:

> "Google/Apple Sign-In requires Firebase configuration. Please set up Firebase first."

Everything else works:
- ✅ Browse posts as guest
- ✅ Email/password login/signup (when backend is ready)
- ✅ All UI features

---

## 🔥 To Enable Social Sign-In (5 min)

### Step 1: Create Firebase Project (2 min)

1. Go to https://console.firebase.google.com/
2. Click "Add Project"
3. Name it: `SnowHub`
4. Disable Analytics (optional, click Continue)
5. Click "Create Project"

### Step 2: Add Web App (1 min)

1. Click the **Web icon** `</>` in Project Overview
2. App nickname: `SnowHub Web`
3. Don't check "Firebase Hosting"
4. Click "Register app"
5. **Copy the config object** (looks like this):

```javascript
{
  apiKey: "AIzaSyXXXXXXXXXXXXXXXX",
  authDomain: "snowhub-xxxxx.firebaseapp.com",
  projectId: "snowhub-xxxxx",
  storageBucket: "snowhub-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
}
```

### Step 3: Enable Google Sign-In (1 min)

1. In Firebase Console, click **Authentication** (left sidebar)
2. Click **"Get Started"**
3. Click **"Sign-in method"** tab
4. Click **Google** 
5. Toggle **Enable**
6. Select support email
7. Click **Save**

✅ **Done!** Google Sign-In is enabled!

### Step 4: Add Config to Your App (1 min)

Create a `.env` file in your project root:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=snowhub-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=snowhub-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=snowhub-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

**Replace the values** with your actual Firebase config!

### Step 5: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
yarn dev
```

---

## ✨ Test It!

1. Go to login page
2. Click **Google** button
3. Google popup appears!
4. Sign in with your Google account
5. ✅ You're logged in!

---

## 🍎 Apple Sign-In (Optional)

Apple Sign-In requires:
- Apple Developer Account ($99/year)
- Additional configuration

**For now, skip Apple and just use Google!** Most users prefer Google anyway.

Full Apple setup instructions are in `SOCIAL_AUTH_SETUP.md`.

---

## 🐛 Troubleshooting

### "Firebase configuration not found"

**Solution**: Make sure you:
1. Created `.env` file in project root (same folder as `package.json`)
2. Added `VITE_` prefix to all variables
3. Restarted dev server after creating `.env`

### Google button shows warning message

**Solution**: This means Firebase isn't configured yet. Follow steps above!

### Popup gets blocked

**Solution**: Allow popups for `localhost:5173` in your browser settings

---

## 📝 Current State

**Without Firebase Config:**
- ✅ App works perfectly
- ✅ Can browse as guest
- ✅ Beautiful UI
- ⚠️ Social buttons show friendly message
- ✅ Email/password forms ready (needs backend)

**With Firebase Config:**
- ✅ Everything above
- ✅ Google Sign-In works!
- ✅ One-click authentication
- ✅ No password needed

---

## 💰 Cost

**Firebase Free Tier:**
- 50,000 users/month: **FREE**
- After that: $0.0055 per user
- Perfect for starting out!

---

## 🎯 Summary

1. **No Firebase?** → App works fine, social buttons show setup message
2. **Want social sign-in?** → Follow 5-minute setup above
3. **Have Firebase?** → Just add `.env` file and restart!

That's it! 🎉

---

## 📚 More Info

- Full setup guide: `SOCIAL_AUTH_SETUP.md`
- Firebase Console: https://console.firebase.google.com/
- Questions? Check browser console for errors

Happy coding! 🚀🎿

