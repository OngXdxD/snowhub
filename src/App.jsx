import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { postsAPI } from './services/api';
import Navbar from './components/Navbar';
import MasonryGrid from './components/MasonryGrid';
import PostDetail from './components/PostDetail';
import Login from './components/Login';
import Signup from './components/Signup';
import CreatePost from './components/CreatePost';
import UserProfile from './components/UserProfile';
import PostPage from './components/PostPage';
import samplePosts from './data/samplePosts';
import './css/App.css';

// Home Component
function Home({ onPostClick }) {
  const [posts, setPosts] = useState(samplePosts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // Fetch real posts from API
      const response = await postsAPI.getAll({ page: 1, limit: 50 });
      
      // Extract posts from nested structure
      const realPosts = response.data?.posts || response.posts || response.data || response || [];
      
      // Transform backend data structure to match frontend format
      const transformedPosts = realPosts.map(post => ({
        id: post._id || post.id,
        image: post.image,
        title: post.title,
        author: post.author?.username || post.author,
        avatar: post.author?.avatar,
        likes: post.likeCount || post.likes?.length || 0,
        tag: post.tag,
        location: post.location,
        content: post.content,
        comments: post.commentCount || 0
      }));
      
      // Combine real posts with sample posts (real posts first)
      const allPosts = [...transformedPosts, ...samplePosts];
      setPosts(allPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      // If API fails, just use sample posts
      setPosts(samplePosts);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      {loading ? (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          paddingTop: '80px'
        }}>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <MasonryGrid posts={posts} onPostClick={onPostClick} />
      )}
    </>
  );
}

function App() {
  const [selectedPost, setSelectedPost] = useState(null);

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleCloseDetail = () => {
    setSelectedPost(null);
  };

  return (
    <ToastProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/post/:postId" element={<PostPage />} />
            <Route 
              path="/" 
              element={<Home onPostClick={handlePostClick} />} 
            />
          </Routes>
          {selectedPost && (
            <PostDetail post={selectedPost} onClose={handleCloseDetail} />
          )}
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
