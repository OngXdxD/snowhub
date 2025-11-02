# User Profile Page - Implementation Guide

## Overview

The User Profile page has been implemented following the Instagram/Xiaohongshu (小红书) design pattern. Users can view their own profile or other users' profiles, see stats (followers, following, posts), and browse posts in a grid layout.

---

## ✅ What Was Implemented

### Components Created:
1. **`UserProfile.jsx`** - Main profile component
2. **`UserProfile.css`** - Responsive Instagram-style CSS

### Features:
- ✅ User avatar and username display
- ✅ Bio and location information
- ✅ Join date display
- ✅ Stats section (posts, followers, following)
- ✅ Follow/Unfollow button (for other users)
- ✅ Edit Profile button (for own profile)
- ✅ Tabs: Posts, Saved (own profile), Tagged (own profile)
- ✅ Posts displayed in 3-column grid
- ✅ Hover overlay showing likes and comments
- ✅ Empty state with call-to-action
- ✅ Loading state
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Dark mode support

---

## 🎨 Design Pattern

### Layout Structure:
```
┌─────────────────────────────────────────────┐
│           User Profile Header               │
│  ┌───────┐  Username                        │
│  │ Avatar│  [Edit Profile / Follow Button] │
│  └───────┘                                   │
│            Posts  Followers  Following      │
│            42     1.2K       567            │
│                                              │
│  Bio text and description...                │
│  📍 Location                                 │
│  📅 Joined Date                              │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│      [Posts] [Saved] [Tagged]               │
├─────────────────────────────────────────────┤
│  ┌───────┐ ┌───────┐ ┌───────┐            │
│  │ Post  │ │ Post  │ │ Post  │            │
│  │   1   │ │   2   │ │   3   │            │
│  └───────┘ └───────┘ └───────┘            │
│  ┌───────┐ ┌───────┐ ┌───────┐            │
│  │ Post  │ │ Post  │ │ Post  │            │
│  │   4   │ │   5   │ │   6   │            │
│  └───────┘ └───────┘ └───────┘            │
└─────────────────────────────────────────────┘
```

---

## 🚀 Routes Added

### Profile Routes:
- `/profile` - View own profile (requires authentication)
- `/profile/:userId` - View another user's profile

### Navigation:
- Navbar → Profile dropdown → "View Profile" button
- Click on any user's avatar/name (to be implemented)
- Direct URL navigation

---

## 📱 Responsive Breakpoints

### Desktop (>735px):
- Large avatar (150px)
- Full stats display
- 3-column grid
- Full tab labels

### Tablet (480px - 735px):
- Medium avatar (77px)
- Compact stats
- 3-column grid
- Full tab labels

### Mobile (<480px):
- Small avatar (64px)
- Compact stats
- 3-column grid (tighter gaps)
- Icon-only tabs

---

## 🎯 User Interactions

### Own Profile View:
- ✅ Shows "Edit Profile" button
- ✅ Shows all three tabs (Posts, Saved, Tagged)
- ✅ Can view and manage own posts
- ✅ Empty state encourages creating first post

### Other User's Profile View:
- ✅ Shows "Follow" button
- ✅ Toggle to "Following" when clicked
- ✅ Only shows "Posts" tab
- ✅ Can view user's public posts

### Post Grid Interaction:
- ✅ Hover shows likes and comments overlay
- ✅ Click navigates to post detail (to be implemented)
- ✅ Smooth transitions and animations

---

## 🔧 Integration with Backend

### API Endpoints Needed:

#### 1. Get User Profile
```javascript
// GET /api/users/:userId
{
  "success": true,
  "user": {
    "id": "user_123",
    "username": "SkiPro",
    "bio": "Powder chaser 🎿",
    "avatar": "avatar_filename.jpg",  // Just filename
    "location": "Whistler, BC",
    "joinedDate": "2023-11-15T00:00:00Z",
    "stats": {
      "posts": 42,
      "followers": 1234,
      "following": 567
    }
  }
}
```

#### 2. Get User's Posts
```javascript
// GET /api/users/:userId/posts
{
  "success": true,
  "posts": [
    {
      "id": "post_123",
      "image": "user_123_20241102_abc.jpg",  // Just filename
      "title": "Epic Powder Day",
      "likes": 3200,
      "comments": 128,
      "createdAt": "2024-11-02T10:30:00Z"
    }
  ],
  "totalPosts": 42
}
```

#### 3. Follow/Unfollow User
```javascript
// POST /api/users/:userId/follow
// Headers: Authorization: Bearer <token>

// Response:
{
  "success": true,
  "isFollowing": true,
  "followerCount": 1235
}
```

#### 4. Update Profile (For Edit Profile)
```javascript
// PUT /api/auth/me
// Headers: Authorization: Bearer <token>
{
  "username": "NewUsername",
  "bio": "New bio text",
  "avatar": "avatar_filename.jpg",  // If avatar changed
  "location": "New location"
}

// Response:
{
  "success": true,
  "user": { ...updated user data }
}
```

---

## 💻 Code Usage

### Navigate to Profile:
```javascript
// From any component
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigate to own profile
navigate('/profile');

// Navigate to another user's profile
navigate(`/profile/${userId}`);
```

### Check if Own Profile:
```javascript
const currentUserId = localStorage.getItem('userId');
const isOwnProfile = currentUserId === profileUserId;
```

### Display Avatar from R2:
```javascript
import { getR2FileUrl } from '../utils/r2Upload';

// Avatar URL
const avatarUrl = user.avatar ? getR2FileUrl(user.avatar) : defaultAvatar;
```

---

## 🎨 Styling Customization

### Key CSS Variables to Customize:

```css
/* Profile Colors */
--profile-primary: #1976d2;        /* Follow button, links */
--profile-text: #262626;           /* Main text */
--profile-secondary: #8e8e8e;      /* Secondary text */
--profile-border: #dbdbdb;         /* Borders */
--profile-hover: #fafafa;          /* Hover backgrounds */

/* Spacing */
--profile-container-max-width: 935px;
--profile-grid-gap: 4px;
--profile-avatar-size: 150px;

/* Responsive */
@media (max-width: 735px) {
  --profile-avatar-size: 77px;
}
```

### Dark Mode:
Dark mode styles are automatically applied when system preference is set to dark:
```css
@media (prefers-color-scheme: dark) {
  /* Dark mode styles */
}
```

---

## 🔄 State Management

### Component State:
```javascript
const [activeTab, setActiveTab] = useState('posts');
const [isFollowing, setIsFollowing] = useState(false);
const [isOwnProfile, setIsOwnProfile] = useState(false);
const [loading, setLoading] = useState(true);
const [user, setUser] = useState({...});
const [posts, setPosts] = useState([]);
```

### Local Storage Items Used:
- `authToken` - Authentication token
- `userId` - Current user's ID
- `username` - Current user's username

---

## 📋 TODO: Future Enhancements

### Phase 1 (Core):
- [ ] Connect to real backend API
- [ ] Load user data from database
- [ ] Load user posts dynamically
- [ ] Implement follow/unfollow functionality
- [ ] Edit profile modal/page

### Phase 2 (Features):
- [ ] Saved posts tab (bookmark functionality)
- [ ] Tagged posts tab
- [ ] Followers/Following list modals
- [ ] Infinite scroll for posts
- [ ] Post filtering and sorting
- [ ] Profile image upload
- [ ] Cover photo feature

### Phase 3 (Social):
- [ ] Follow suggestions
- [ ] Activity feed
- [ ] User verification badges
- [ ] Profile sharing
- [ ] QR code for profile
- [ ] Analytics (views, reach)

### Phase 4 (Advanced):
- [ ] Stories/Highlights
- [ ] Collections/Albums
- [ ] Private account settings
- [ ] Block/Report users
- [ ] Profile themes
- [ ] Custom URLs

---

## 🐛 Known Limitations

### Current Limitations:
1. **Sample Data**: Currently using hardcoded sample data
2. **Post Click**: Navigates but post detail not yet connected
3. **Edit Profile**: Shows toast, no actual edit functionality yet
4. **Followers List**: Stats are clickable but no modal yet
5. **Saved/Tagged**: Tabs visible but no backend integration

### To Be Resolved:
All limitations will be resolved once backend API is connected. The frontend structure is complete and ready for integration.

---

## 🧪 Testing Checklist

### Manual Testing:
- [ ] Navigate to `/profile` when logged in
- [ ] Navigate to `/profile/userId` for another user
- [ ] Click "View Profile" in navbar dropdown
- [ ] View own profile shows Edit Profile button
- [ ] View other profile shows Follow button
- [ ] Click Follow button toggles state
- [ ] Tabs switch correctly (Posts, Saved, Tagged)
- [ ] Posts grid displays correctly
- [ ] Hover on posts shows overlay
- [ ] Empty state shows when no posts
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Dark mode works correctly
- [ ] Loading state shows on initial load

### Backend Integration Testing:
- [ ] Profile loads from API
- [ ] Posts load from API
- [ ] Follow/unfollow updates database
- [ ] Stats update correctly
- [ ] Avatar displays from R2
- [ ] Error handling works

---

## 🔗 Related Files

### Components:
- `src/components/UserProfile.jsx`
- `src/components/UserProfile.css`
- `src/components/Navbar.jsx`
- `src/components/Navbar.css`

### Routes:
- `src/App.jsx` - Added profile routes

### Utilities:
- `src/utils/r2Upload.js` - Used for avatar URLs

### Services:
- `src/services/api.js` - Will use `usersAPI` methods

---

## 📖 Usage Examples

### Example 1: View Own Profile
```javascript
// User clicks "View Profile" in navbar
// Navigates to /profile
// Shows their posts, stats, and edit button
```

### Example 2: View Another User
```javascript
// User clicks on another user's avatar (in feed or comments)
navigate(`/profile/${user.id}`);
// Shows that user's profile with Follow button
```

### Example 3: Follow a User
```javascript
const handleFollow = async () => {
  if (!isAuthenticated) {
    navigate('/login');
    return;
  }
  
  try {
    const result = await usersAPI.toggleFollow(userId);
    setIsFollowing(result.isFollowing);
    updateFollowerCount(result.followerCount);
  } catch (error) {
    showToast('Failed to follow user', 'error');
  }
};
```

---

## 🎓 Design References

### Inspired By:
- **Instagram**: Profile layout, stats display, grid view
- **Xiaohongshu (小红书)**: Clean aesthetic, tab navigation
- **Pinterest**: Grid layout for posts
- **Twitter**: Bio section, follow button placement

### Key Design Principles:
1. **Clean & Minimal**: Focus on content
2. **Responsive First**: Works on all devices
3. **Fast Loading**: Optimized images and lazy loading
4. **Intuitive Navigation**: Clear tabs and actions
5. **Social Focus**: Easy to follow and engage

---

## 🚀 Quick Start

### View Your Profile:
1. Login to SnowHub
2. Click Profile icon in navbar
3. Click "View Profile"
4. Your profile page loads with your posts

### View Another User:
1. Navigate to `/profile/user_123` (replace with actual user ID)
2. Profile loads with Follow button
3. Click Follow to follow the user

### Customize Profile (Coming Soon):
1. Click "Edit Profile" on your profile
2. Update avatar, bio, location
3. Save changes

---

## ✅ Implementation Status

**Status**: ✅ Complete and Ready for Backend Integration

### Completed:
- ✅ Profile page component
- ✅ Responsive CSS styling
- ✅ Route configuration
- ✅ Navbar integration
- ✅ Loading states
- ✅ Empty states
- ✅ Follow/unfollow UI
- ✅ Grid layout
- ✅ Hover effects
- ✅ Dark mode support

### Pending Backend:
- 📋 API integration
- 📋 Real data loading
- 📋 Edit profile functionality
- 📋 Saved posts feature
- 📋 Tagged posts feature

---

**Last Updated**: November 2024
**Version**: 1.0
**Status**: ✅ Frontend Complete, Awaiting Backend Integration

