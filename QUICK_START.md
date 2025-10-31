# Quick Start Guide - API Integration

## 🚀 Get Started in 3 Steps

### Step 1: Configure Environment

Create `.env` file in project root:

```env
VITE_API_URL=http://localhost:3000
```

### Step 2: Import API Service

```javascript
import { authAPI, postsAPI, usersAPI, commentsAPI } from '../services/api';
```

### Step 3: Make API Calls

```javascript
// Example: Login
const response = await authAPI.login({ email, password });
localStorage.setItem('authToken', response.token);
```

---

## 📋 Common Use Cases

### 1. User Authentication

**Login:**
```javascript
try {
  const response = await authAPI.login({
    email: 'user@example.com',
    password: 'password123'
  });
  
  localStorage.setItem('authToken', response.token);
  localStorage.setItem('userId', response.user.id);
  navigate('/');
} catch (error) {
  console.error('Login failed:', error.message);
}
```

**Register:**
```javascript
try {
  const response = await authAPI.register({
    username: 'newuser',
    email: 'user@example.com',
    password: 'password123'
  });
  
  localStorage.setItem('authToken', response.token);
  localStorage.setItem('userId', response.user.id);
  navigate('/');
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

**Logout:**
```javascript
localStorage.removeItem('authToken');
localStorage.removeItem('userId');
localStorage.removeItem('username');
navigate('/login');
```

### 2. Fetch Posts

```javascript
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchPosts = async () => {
    try {
      const data = await postsAPI.getAll({
        page: 1,
        limit: 20,
        sort: 'recent'
      });
      setPosts(data.posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchPosts();
}, []);
```

### 3. Create a Post

```javascript
const handleCreatePost = async (title, image) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('image', image);
  formData.append('content', 'Post content here...');
  
  try {
    const newPost = await postsAPI.create(formData);
    console.log('Post created:', newPost);
    // Refresh posts or navigate
  } catch (error) {
    console.error('Failed to create post:', error);
  }
};
```

### 4. Like a Post

```javascript
const handleLike = async (postId) => {
  try {
    await postsAPI.toggleLike(postId);
    // Update UI to reflect new like status
  } catch (error) {
    console.error('Failed to like post:', error);
  }
};
```

### 5. Add Comment

```javascript
const handleAddComment = async (postId, content) => {
  try {
    await postsAPI.addComment(postId, { content });
    // Refresh comments
  } catch (error) {
    console.error('Failed to add comment:', error);
  }
};
```

### 6. Follow User

```javascript
const handleFollow = async (userId) => {
  try {
    await usersAPI.toggleFollow(userId);
    // Update follow button state
  } catch (error) {
    console.error('Failed to follow user:', error);
  }
};
```

---

## 🎨 Complete Component Example

```javascript
import { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';

function PostsFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await postsAPI.getAll({ 
        page, 
        limit: 20,
        sort: 'recent' 
      });
      setPosts(data.posts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await postsAPI.toggleLike(postId);
      // Update local state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      ));
    } catch (err) {
      console.error('Failed to like:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <img src={post.image} alt={post.title} />
          <button onClick={() => handleLike(post.id)}>
            ❤️ {post.likes}
          </button>
        </div>
      ))}
      
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        Previous
      </button>
      <button onClick={() => setPage(p => p + 1)}>
        Next
      </button>
    </div>
  );
}
```

---

## 🔒 Checking Authentication

```javascript
// Check if user is logged in
const isAuthenticated = () => {
  return localStorage.getItem('authToken') !== null;
};

// Get current user ID
const getCurrentUserId = () => {
  return localStorage.getItem('userId');
};

// Use in component
function ProtectedComponent() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  return <div>Protected content</div>;
}
```

---

## 📦 All Available Endpoints

### Authentication
- `authAPI.register(userData)` - Register
- `authAPI.login(credentials)` - Login
- `authAPI.getProfile()` - Get profile (protected)
- `authAPI.updateProfile(data)` - Update profile (protected)

### Posts
- `postsAPI.getAll(params)` - Get all posts
- `postsAPI.getById(id)` - Get single post
- `postsAPI.create(data)` - Create post (protected)
- `postsAPI.update(id, data)` - Update post (protected)
- `postsAPI.delete(id)` - Delete post (protected)
- `postsAPI.toggleLike(id)` - Like/unlike (protected)
- `postsAPI.getComments(id)` - Get comments
- `postsAPI.addComment(id, data)` - Add comment (protected)

### Users
- `usersAPI.getProfile(id)` - Get user profile
- `usersAPI.getPosts(id, params)` - Get user posts
- `usersAPI.toggleFollow(id)` - Follow/unfollow (protected)
- `usersAPI.getFollowers(id)` - Get followers
- `usersAPI.getFollowing(id)` - Get following

### Comments
- `commentsAPI.update(id, data)` - Update comment (protected)
- `commentsAPI.delete(id)` - Delete comment (protected)

### Utility
- `utilityAPI.getWelcome()` - API welcome
- `utilityAPI.healthCheck()` - Health check

---

## 🐛 Debugging Tips

### Check if API is reachable
```javascript
import { utilityAPI } from '../services/api';

utilityAPI.healthCheck()
  .then(() => console.log('✅ API is reachable'))
  .catch(() => console.log('❌ API is not reachable'));
```

### View API requests in browser
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Perform an action (login, create post, etc.)
5. Click on request to see details

### Common Issues

**CORS Error:**
- Backend needs to allow your frontend origin
- Add CORS middleware to backend

**401 Unauthorized:**
- Token expired or invalid
- User needs to login again

**Network Error:**
- Check if backend is running
- Verify `VITE_API_URL` in `.env`
- Ensure port is correct

**Token not sent:**
- Check localStorage has `authToken`
- Verify API service reads token correctly

---

## 📚 Documentation Files

- `API_INTEGRATION.md` - Detailed integration guide
- `API_ENDPOINTS_SUMMARY.md` - Complete endpoints list
- `API_ARCHITECTURE.md` - System architecture
- `ENV_SETUP.md` - Environment configuration
- `QUICK_START.md` - This file

---

## 💡 Tips

1. **Always handle errors** - Wrap API calls in try-catch
2. **Show loading states** - Better UX during API calls
3. **Validate before sending** - Client-side validation first
4. **Store tokens securely** - Consider httpOnly cookies in production
5. **Test without backend** - App works in dev mode with sample data

---

## ✅ Checklist

- [ ] Create `.env` file with `VITE_API_URL`
- [ ] Start backend API server
- [ ] Test health check endpoint
- [ ] Test login/register
- [ ] Integrate posts feed
- [ ] Add like functionality
- [ ] Implement comments
- [ ] Create post upload
- [ ] Add user profiles

Happy coding! 🚀

