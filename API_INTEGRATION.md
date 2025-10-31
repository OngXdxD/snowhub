# SnowHub API Integration Guide

This document describes how the SnowHub frontend is integrated with the backend API.

## Configuration

The API base URL is configured through environment variables:

1. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3000
```

2. Update the URL based on your environment:
   - **Development**: `http://localhost:3000`
   - **Production**: Your deployed backend URL

## API Service

All API calls are centralized in `src/services/api.js`. This module exports organized API functions grouped by resource:

### Authentication (`authAPI`)

```javascript
import { authAPI } from './services/api';

// Register new user
await authAPI.register({ username, email, password });

// Login
const response = await authAPI.login({ email, password });
// Returns: { token, user }

// Get current user profile (requires auth)
await authAPI.getProfile();

// Update profile (requires auth)
await authAPI.updateProfile({ username, avatar, password });
```

### Posts (`postsAPI`)

```javascript
import { postsAPI } from './services/api';

// Get all posts with filters
await postsAPI.getAll({ page: 1, limit: 20, sort: 'recent' });

// Get single post
await postsAPI.getById(postId);

// Create post (requires auth)
const formData = new FormData();
formData.append('image', file);
formData.append('title', 'Post title');
await postsAPI.create(formData);

// Update post (requires auth, author only)
await postsAPI.update(postId, { title: 'New title' });

// Delete post (requires auth, author only)
await postsAPI.delete(postId);

// Like/unlike post (requires auth)
await postsAPI.toggleLike(postId);

// Get post comments
await postsAPI.getComments(postId);

// Add comment (requires auth)
await postsAPI.addComment(postId, { content: 'Great post!' });
```

### Users (`usersAPI`)

```javascript
import { usersAPI } from './services/api';

// Get user profile and stats
await usersAPI.getProfile(userId);

// Get user's posts
await usersAPI.getPosts(userId, { page: 1, limit: 20 });

// Follow/unfollow user (requires auth)
await usersAPI.toggleFollow(userId);

// Get followers list
await usersAPI.getFollowers(userId);

// Get following list
await usersAPI.getFollowing(userId);
```

### Comments (`commentsAPI`)

```javascript
import { commentsAPI } from './services/api';

// Update comment (requires auth, author only)
await commentsAPI.update(commentId, { content: 'Updated comment' });

// Delete comment (requires auth, author only)
await commentsAPI.delete(commentId);
```

### Utility (`utilityAPI`)

```javascript
import { utilityAPI } from './services/api';

// Get API info
await utilityAPI.getWelcome();

// Health check
await utilityAPI.healthCheck();
```

## Authentication Flow

### 1. User Registration
```javascript
const response = await authAPI.register({
  username: 'user123',
  email: 'user@example.com',
  password: 'SecurePass123'
});

// Store auth token
localStorage.setItem('authToken', response.token);
localStorage.setItem('userId', response.user.id);
localStorage.setItem('username', response.user.username);
```

### 2. User Login
```javascript
const response = await authAPI.login({
  email: 'user@example.com',
  password: 'SecurePass123'
});

// Store auth token
localStorage.setItem('authToken', response.token);
localStorage.setItem('userId', response.user.id);
localStorage.setItem('username', response.user.username);
```

### 3. Authenticated Requests
The API service automatically adds the JWT token to protected endpoints:

```javascript
// The Authorization header is added automatically
// Authorization: Bearer <token>
await authAPI.getProfile();
await postsAPI.create(postData);
await postsAPI.toggleLike(postId);
```

### 4. Logout
```javascript
// Clear all auth data
localStorage.removeItem('authToken');
localStorage.removeItem('userId');
localStorage.removeItem('username');
localStorage.removeItem('isAuthenticated');
```

## Error Handling

All API calls should be wrapped in try-catch blocks:

```javascript
try {
  const response = await authAPI.login(credentials);
  // Handle success
} catch (error) {
  // Handle error
  console.error(error.message);
  // Display error to user
}
```

## Components Using API

### Login Component
- **Endpoint**: `POST /api/auth/login`
- **File**: `src/components/Login.jsx`
- **Features**: Email/password authentication, error handling, loading states

### Signup Component
- **Endpoint**: `POST /api/auth/register`
- **File**: `src/components/Signup.jsx`
- **Features**: User registration, form validation, error handling

### Navbar Component
- **Action**: Logout (clears auth data)
- **File**: `src/components/Navbar.jsx`
- **Features**: Profile menu, logout functionality

## Next Steps

To complete the integration, update these components:

1. **MasonryGrid** - Fetch posts from `postsAPI.getAll()`
2. **PostCard** - Add like functionality with `postsAPI.toggleLike()`
3. **PostDetail** - Fetch comments with `postsAPI.getComments()`
4. **Create Post Modal** - Upload posts with `postsAPI.create()`
5. **User Profile** - Fetch user data with `usersAPI.getProfile()`

## Testing

### With Mock Backend
If you don't have a backend ready, the current sample data will continue to work. The API calls will fail gracefully.

### With Real Backend
1. Start your backend server on port 3000 (or update `VITE_API_URL`)
2. Ensure CORS is configured to allow requests from `http://localhost:5173`
3. Test authentication flow: register → login → view posts

## API Response Format

Expected response formats from the backend:

### Auth Responses
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "username": "user123",
    "email": "user@example.com",
    "avatar": "https://..."
  }
}
```

### Posts Response
```json
{
  "posts": [...],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### Error Response
```json
{
  "message": "Invalid credentials"
}
```

