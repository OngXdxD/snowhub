# SnowHub API Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      SnowHub Frontend                        │
│                   (React + Vite)                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Service Layer                          │
│                  (src/services/api.js)                       │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Centralized API calls                             │  │
│  │  • JWT token management                              │  │
│  │  • Error handling                                    │  │
│  │  • Request/Response formatting                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API Server                        │
│                   (Your Backend)                             │
│                                                               │
│  Authentication (/api/auth)     Posts (/api/posts)          │
│  ├─ POST /register              ├─ GET /                    │
│  ├─ POST /login                 ├─ GET /:id                 │
│  ├─ GET /me                     ├─ POST /                   │
│  └─ PUT /me                     ├─ PUT /:id                 │
│                                  ├─ DELETE /:id              │
│  Users (/api/users)             ├─ POST /:id/like           │
│  ├─ GET /:id                    ├─ GET /:id/comments        │
│  ├─ GET /:id/posts              └─ POST /:id/comments       │
│  ├─ POST /:id/follow                                         │
│  ├─ GET /:id/followers          Comments (/api/comments)    │
│  └─ GET /:id/following          ├─ PUT /:id                 │
│                                  └─ DELETE /:id              │
└─────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌─────────┐         ┌──────────┐         ┌─────────┐         ┌──────────┐
│  User   │────────▶│ Login/   │────────▶│   API   │────────▶│ Backend  │
│         │         │ Signup   │         │ Service │         │   API    │
└─────────┘         └──────────┘         └─────────┘         └──────────┘
     ▲                                         │                    │
     │                                         │                    │
     │                                         ▼                    │
     │                                  ┌──────────┐               │
     │                                  │   JWT    │◀──────────────┘
     │                                  │  Token   │
     │                                  └──────────┘
     │                                         │
     │                                         ▼
     │                                  ┌──────────┐
     └──────────────────────────────────│localStorage│
                                        └──────────┘
```

### Flow Steps:

1. **User enters credentials** → Login/Signup form
2. **Form submits** → API Service (`authAPI.login()` or `authAPI.register()`)
3. **API Service makes HTTP request** → Backend API
4. **Backend validates & responds** → JWT token + user data
5. **API Service receives response** → Stores token in localStorage
6. **User is authenticated** → Redirected to home page

## Protected Requests Flow

```
┌─────────────┐
│  Component  │
│  (e.g. Post)│
└──────┬──────┘
       │
       │ Call API
       ▼
┌─────────────────────────────────┐
│      API Service                 │
│  1. Get token from localStorage  │
│  2. Add Authorization header     │
│  3. Make HTTP request            │
└──────┬──────────────────────────┘
       │
       │ Authorization: Bearer <token>
       ▼
┌─────────────────────────────────┐
│         Backend API              │
│  1. Verify JWT token             │
│  2. Process request              │
│  3. Return response              │
└─────────────────────────────────┘
```

## Component Integration Map

```
Frontend Components                   API Endpoints Used
─────────────────────                ──────────────────

Login.jsx ───────────────────────▶  POST /api/auth/login
                                     
Signup.jsx ──────────────────────▶  POST /api/auth/register

Navbar.jsx ──────────────────────▶  (Logout - clear localStorage)

MasonryGrid.jsx ─────────────────▶  GET /api/posts
(To be integrated)                   

PostCard.jsx ────────────────────▶  POST /api/posts/:id/like
(To be integrated)                   

PostDetail.jsx ──────────────────▶  GET /api/posts/:id
(To be integrated)                   GET /api/posts/:id/comments
                                     POST /api/posts/:id/comments

CreatePost Modal ────────────────▶  POST /api/posts
(To be created)                      

UserProfile ─────────────────────▶  GET /api/users/:id
(To be created)                      GET /api/users/:id/posts
                                     POST /api/users/:id/follow
```

## Data Flow Example: Creating a Post

```
1. User fills form ───▶ CreatePost Component
                              │
                              ▼
2. Form submits ──────▶ handleSubmit()
                              │
                              ▼
3. API call ──────────▶ postsAPI.create(formData)
                              │
                              ▼
4. Add auth token ────▶ Authorization: Bearer <token>
                              │
                              ▼
5. HTTP POST ─────────▶ Backend: POST /api/posts
                              │
                              ▼
6. Backend processes          │
   - Validates token          │
   - Uploads image            │
   - Saves to database        │
                              ▼
7. Response ◀─────────── { id, title, image, ... }
                              │
                              ▼
8. Update UI ─────────▶ Add new post to feed
```

## Error Handling Flow

```
┌─────────────┐
│  Component  │
└──────┬──────┘
       │
       │ try { await API.call() }
       ▼
┌─────────────────────┐
│    API Service      │
└──────┬──────────────┘
       │
       │ HTTP Request
       ▼
┌─────────────────────┐       ┌──────────────┐
│   Backend API       │──────▶│  Error?      │
└─────────────────────┘       └───┬──────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
                    ▼                            ▼
              ┌──────────┐              ┌──────────────┐
              │ Success  │              │    Error     │
              └────┬─────┘              └──────┬───────┘
                   │                           │
                   │                           │ catch (error)
                   ▼                           ▼
         ┌─────────────────┐         ┌─────────────────┐
         │  Update State   │         │  Set Error      │
         │  Show Success   │         │  Show Message   │
         └─────────────────┘         └─────────────────┘
```

## localStorage Structure

```javascript
{
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isAuthenticated": "true",
  "userId": "123",
  "username": "snowboarder123",
  "userEmail": "user@example.com"
}
```

## Security Considerations

1. **JWT Storage**: Currently in localStorage (consider httpOnly cookies for production)
2. **Token Expiration**: Handle token refresh or re-login when expired
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Backend must allow frontend origin
5. **XSS Protection**: Sanitize user inputs

## Performance Optimizations

1. **Caching**: Consider caching GET requests
2. **Pagination**: Implemented for posts, users, followers
3. **Lazy Loading**: Load images and data on demand
4. **Debouncing**: Debounce search and filter operations
5. **Error Retry**: Implement retry logic for failed requests

## Next Steps for Scaling

1. **State Management**: Consider Redux/Zustand for global state
2. **React Query**: Use for caching and synchronizing server state
3. **WebSockets**: For real-time notifications and updates
4. **Service Worker**: For offline support
5. **Error Boundary**: Catch and handle React errors gracefully

