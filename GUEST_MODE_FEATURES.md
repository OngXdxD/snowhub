# Guest Mode Features - SnowHub

## Overview
Users can now browse the homepage without logging in, but protected actions (like, comment, follow, bookmark, post) require authentication.

---

## ✅ What's Been Implemented

### 1. **Dynamic Navbar Based on Auth State**

**For Guest Users (Not Logged In):**
- ✅ Logo (clickable, goes to home)
- ✅ Search bar
- ✅ Home icon
- ✅ **Login button** (blue outlined)
- ✅ **Sign Up button** (blue gradient)
- ❌ No Post, Messages, or Profile icons

**For Authenticated Users:**
- ✅ Logo (clickable, goes to home)
- ✅ Search bar
- ✅ Home icon
- ✅ Post button (create posts)
- ✅ Messages button
- ✅ Profile menu with logout option
- ❌ No Login/Signup buttons

### 2. **Protected Actions on Posts**

**Actions that require login:**
- ❤️ **Like** - Shows confirmation dialog
- 💬 **Comment** - Shows confirmation dialog
- 🔖 **Bookmark** - Shows confirmation dialog
- ➕ **Follow** - Shows confirmation dialog (when implemented)

**Actions available to everyone:**
- 🔍 **View posts** - Full access
- 🔄 **Share** - Available to all users

### 3. **Interactive Post Cards**

Each post card now has action buttons:
```
[❤️ 3.2k] [💬] [🔖] [🔄]
```

- **Heart button** - Like/Unlike (requires auth)
- **Message button** - Comment (requires auth, opens post detail)
- **Bookmark button** - Save for later (requires auth)
- **Share button** - Share post (available to all)

### 4. **User Experience Flow**

#### Guest User tries to like a post:
1. Clicks the ❤️ button
2. See confirmation: "You need to login to like this post. Go to login page?"
3. Options:
   - **OK** → Redirects to login page
   - **Cancel** → Stays on current page

#### After Login:
1. User completes login
2. Redirected to homepage
3. Navbar updates automatically (shows Post, Messages, Profile)
4. All protected actions now work

---

## 🎨 Visual Changes

### Navbar Buttons

**Login Button:**
- Transparent background
- Blue border and text
- Hover: Light blue background

**Sign Up Button:**
- Blue gradient background
- White text
- Hover: Lift effect with shadow

### Post Action Buttons

**Default State:**
- Gray color
- Transparent background

**Hover State:**
- Light blue background
- Blue color

**Active State:**
- ❤️ Like: Pink/Red color
- 🔖 Bookmark: Orange color

---

## 🔧 Technical Implementation

### Files Modified:

1. **`src/components/Navbar.jsx`**
   - Added authentication state check
   - Conditional rendering for guest vs authenticated users
   - Login/Signup buttons for guests
   - Profile menu for authenticated users

2. **`src/components/Navbar.css`**
   - Styles for login/signup buttons
   - Hover effects and transitions

3. **`src/components/PostCard.jsx`**
   - Added interactive action buttons
   - Authentication checks before protected actions
   - Confirmation dialogs for guests
   - State management for likes/bookmarks

4. **`src/components/PostCard.css`**
   - Action button styles
   - Different colors for different actions
   - Hover and active states

5. **`src/hooks/useAuth.js`** (NEW)
   - Custom hook for authentication management
   - Reusable `requireAuth` function
   - Login/logout utilities

---

## 🚀 How It Works

### Authentication Check
```javascript
const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};
```

### Protected Action Handler
```javascript
const handleProtectedAction = (e, action, callback) => {
  e.stopPropagation(); // Prevent card click
  
  if (!isAuthenticated()) {
    const shouldRedirect = window.confirm(
      `You need to login to ${action}. Go to login page?`
    );
    if (shouldRedirect) {
      navigate('/login');
    }
  } else {
    callback(); // Execute the action
  }
};
```

### Real-time Auth State Updates
```javascript
useEffect(() => {
  const checkAuth = () => {
    const authToken = localStorage.getItem('authToken');
    setIsAuthenticated(!!authToken);
  };
  
  checkAuth();
  
  // Listen for changes across tabs
  window.addEventListener('storage', checkAuth);
  return () => window.removeEventListener('storage', checkAuth);
}, []);
```

---

## 📋 Future Enhancements

### Ready to Implement:

1. **Follow Users**
   - Add follow button to user profiles
   - Protect with authentication

2. **Create Posts**
   - Modal or page for creating posts
   - File upload for images
   - Connect to `postsAPI.create()`

3. **Comments Section**
   - Show comments in PostDetail
   - Add comment form (protected)
   - Connect to `postsAPI.addComment()`

4. **Bookmarks Page**
   - View saved posts
   - Remove from bookmarks

5. **Share Functionality**
   - Copy link to clipboard
   - Share to social media
   - Native share API

---

## 🎯 User Flows

### Guest User Journey
```
1. Land on homepage
   ↓
2. Browse posts (✓ allowed)
   ↓
3. Try to like a post
   ↓
4. See "Login required" dialog
   ↓
5. Choose to login or continue browsing
   ↓
6. If login: Redirect to /login
   ↓
7. After login: Redirect back to homepage
   ↓
8. Now can like, comment, bookmark, post
```

### Authenticated User Journey
```
1. Login
   ↓
2. Redirect to homepage
   ↓
3. See full navbar (Post, Messages, Profile)
   ↓
4. Can like, comment, bookmark without restrictions
   ↓
5. Can create new posts
   ↓
6. Can logout from profile menu
```

---

## 🔐 Security Notes

1. **Client-side checks only** - These are UX improvements
2. **Backend must validate** - All protected API endpoints should verify JWT tokens
3. **Token storage** - Currently using localStorage (consider httpOnly cookies for production)

---

## 💡 Benefits

✅ **Better UX** - Users can explore before committing to sign up
✅ **Clear CTAs** - Login/Signup buttons prominently displayed
✅ **Protected Actions** - Users understand what requires authentication
✅ **Smooth Flow** - Easy redirect to login when needed
✅ **Multi-tab Support** - Auth state syncs across tabs

---

## 🧪 Testing Checklist

- [ ] Visit homepage without logging in
- [ ] See Login and Sign Up buttons in navbar
- [ ] Browse posts without restrictions
- [ ] Try to like a post → See login prompt
- [ ] Try to bookmark → See login prompt
- [ ] Try to comment → See login prompt
- [ ] Click Login button → Go to /login
- [ ] Complete login
- [ ] Verify navbar shows Post, Messages, Profile
- [ ] Like a post → Works without prompt
- [ ] Bookmark a post → Works without prompt
- [ ] Logout → Navbar shows Login/Signup again

---

## 📱 Responsive Behavior

All features work seamlessly on:
- 💻 Desktop
- 📱 Mobile
- 📱 Tablet

Guest mode login buttons are optimized for all screen sizes.

