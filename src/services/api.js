// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};

// Helper function to create headers
const createHeaders = (includeAuth = false, isFormData = false) => {
  const headers = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// ============================================
// AUTHENTICATION ENDPOINTS (/api/auth)
// ============================================

export const authAPI = {
  // POST /register - Register new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // POST /login - Login & get JWT token
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  // GET /me - Get current user profile (protected)
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: createHeaders(true),
    });
    return handleResponse(response);
  },

  // PUT /me - Update profile/avatar/password (protected)
  updateProfile: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },
};

// ============================================
// POSTS ENDPOINTS (/api/posts)
// ============================================

export const postsAPI = {
  // GET / - Get all posts (with pagination, filters, sorting)
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/api/posts${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // GET /:id - Get single post
  getById: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // POST / - Create post with image (protected)
  create: async (postData) => {
    const isFormData = postData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      headers: createHeaders(true, isFormData),
      body: isFormData ? postData : JSON.stringify(postData),
    });
    return handleResponse(response);
  },

  // PUT /:id - Update post (protected, author only)
  update: async (postId, postData) => {
    const isFormData = postData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
      method: 'PUT',
      headers: createHeaders(true, isFormData),
      body: isFormData ? postData : JSON.stringify(postData),
    });
    return handleResponse(response);
  },

  // DELETE /:id - Delete post (protected, author only)
  delete: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    return handleResponse(response);
  },

  // POST /:id/like - Like/unlike post (protected)
  toggleLike: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
      method: 'POST',
      headers: createHeaders(true),
    });
    return handleResponse(response);
  },

  // GET /:id/comments - Get post comments
  getComments: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // POST /:id/comments - Add comment (protected)
  addComment: async (postId, commentData) => {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(commentData),
    });
    return handleResponse(response);
  },
};

// ============================================
// USERS ENDPOINTS (/api/users)
// ============================================

export const usersAPI = {
  // GET /:id - Get user profile & stats
  getProfile: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // GET /:id/posts - Get user's posts
  getPosts: async (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/api/users/${userId}/posts${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // POST /:id/follow - Follow/unfollow user (protected)
  toggleFollow: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/follow`, {
      method: 'POST',
      headers: createHeaders(true),
    });
    return handleResponse(response);
  },

  // GET /:id/followers - Get followers list
  getFollowers: async (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/api/users/${userId}/followers${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  // GET /:id/following - Get following list
  getFollowing: async (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/api/users/${userId}/following${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================
// COMMENTS ENDPOINTS (/api/comments)
// ============================================

export const commentsAPI = {
  // PUT /:id - Update comment (protected, author only)
  update: async (commentId, commentData) => {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(commentData),
    });
    return handleResponse(response);
  },

  // DELETE /:id - Delete comment (protected, author only)
  delete: async (commentId) => {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    return handleResponse(response);
  },
};

// ============================================
// UTILITY ENDPOINTS
// ============================================

export const utilityAPI = {
  // GET / - Welcome & API info
  getWelcome: async () => {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
    });
    return handleResponse(response);
  },

  // GET /api/health - Health check
  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
    });
    return handleResponse(response);
  },
};

// Export a default API object with all endpoints
export default {
  auth: authAPI,
  posts: postsAPI,
  users: usersAPI,
  comments: commentsAPI,
  utility: utilityAPI,
};

