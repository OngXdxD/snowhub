import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Grid, Bookmark, Tag, MapPin, Calendar, UserPlus, UserCheck } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { usersAPI } from '../services/api';
import { getR2FileUrl } from '../utils/r2Upload';
import Navbar from './Navbar';
import './UserProfile.css';

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'saved', 'tagged'
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    checkIfOwnProfile();
    loadUserProfile();
  }, [userId]);

  const checkIfOwnProfile = () => {
    const currentUserId = localStorage.getItem('userId');
    const profileUserId = userId || currentUserId;
    setIsOwnProfile(currentUserId === profileUserId);
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profileUserId = userId || localStorage.getItem('userId');
      
      if (!profileUserId) {
        showToast('Please login to view profile', 'warning');
        navigate('/login');
        return;
      }

      // Fetch user profile data
      const userResponse = await usersAPI.getProfile(profileUserId);
      const userData = userResponse.user || userResponse;
      setUser(userData);

      // Check if following (if viewing another user's profile)
      if (userData.isFollowing !== undefined) {
        setIsFollowing(userData.isFollowing);
      }

      // Fetch user's posts
      const postsResponse = await usersAPI.getPosts(profileUserId);
      const userPostsData = postsResponse.posts || postsResponse;
      setPosts(Array.isArray(userPostsData) ? userPostsData : []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      showToast(error.message || 'Failed to load profile', 'error');
      setLoading(false);
      
      // If unauthorized, redirect to login
      if (error.message?.includes('unauthorized') || error.message?.includes('not found')) {
        setTimeout(() => navigate('/'), 1500);
      }
    }
  };

  const handleFollow = async () => {
    if (!localStorage.getItem('authToken')) {
      showToast('Please login to follow users', 'warning');
      navigate('/login');
      return;
    }

    try {
      const result = await usersAPI.toggleFollow(user.id);
      
      setIsFollowing(result.isFollowing);
      
      // Update follower count if provided
      if (result.followerCount !== undefined) {
        setUser(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followers: result.followerCount
          }
        }));
      } else {
        // Fallback: manually adjust count
        setUser(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followers: result.isFollowing ? prev.stats.followers + 1 : prev.stats.followers - 1
          }
        }));
      }
      
      showToast(result.isFollowing ? 'Following!' : 'Unfollowed', 'success');
    } catch (error) {
      console.error('Error toggling follow:', error);
      showToast(error.message || 'Action failed', 'error');
    }
  };

  const handleEditProfile = () => {
    showToast('Edit profile coming soon!', 'info');
    // TODO: Navigate to edit profile page or open modal
  };

  const handlePostClick = (post) => {
    navigate(`/post/${post.id}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-loading">
          <div className="loading-spinner"></div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="user-profile">
          <div className="profile-container">
            <div className="profile-no-posts">
              <div className="no-posts-icon">👤</div>
              <h3>User not found</h3>
              <p>This profile doesn't exist or has been removed</p>
              <button 
                className="create-first-post-btn"
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Get avatar URL from R2 or use default
  const avatarUrl = user.avatar ? getR2FileUrl(user.avatar) : 'https://i.pravatar.cc/150?img=1';

  return (
    <>
      <Navbar />
      <div className="user-profile">
        <div className="profile-container">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-info-top">
              {/* Avatar */}
              <div className="profile-avatar-wrapper">
                <img 
                  src={avatarUrl} 
                  alt={user.username} 
                  className="profile-avatar"
                />
              </div>

              {/* Stats and Actions */}
              <div className="profile-info-right">
                <div className="profile-username-row">
                  <h1 className="profile-username">{user.username}</h1>
                  {isOwnProfile ? (
                    <button className="profile-edit-btn" onClick={handleEditProfile}>
                      <Settings size={18} />
                      Edit Profile
                    </button>
                  ) : (
                    <button 
                      className={`profile-follow-btn ${isFollowing ? 'following' : ''}`}
                      onClick={handleFollow}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck size={18} />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus size={18} />
                          Follow
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Stats */}
                <div className="profile-stats">
                  <div className="stat-item">
                    <span className="stat-number">{user.stats.posts}</span>
                    <span className="stat-label">posts</span>
                  </div>
                  <div className="stat-item clickable">
                    <span className="stat-number">{user.stats.followers}</span>
                    <span className="stat-label">followers</span>
                  </div>
                  <div className="stat-item clickable">
                    <span className="stat-number">{user.stats.following}</span>
                    <span className="stat-label">following</span>
                  </div>
                </div>

                {/* Bio */}
                <div className="profile-bio">
                  <p className="bio-text">{user.bio}</p>
                  {user.location && (
                    <div className="profile-location">
                      <MapPin size={14} />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.joinedDate && (
                    <div className="profile-joined">
                      <Calendar size={14} />
                      <span>Joined {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <Grid size={14} />
              <span>Posts</span>
            </button>
            {isOwnProfile && (
              <>
                <button
                  className={`profile-tab ${activeTab === 'saved' ? 'active' : ''}`}
                  onClick={() => setActiveTab('saved')}
                >
                  <Bookmark size={14} />
                  <span>Saved</span>
                </button>
                <button
                  className={`profile-tab ${activeTab === 'tagged' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tagged')}
                >
                  <Tag size={14} />
                  <span>Tagged</span>
                </button>
              </>
            )}
          </div>

          {/* Posts Grid */}
          <div className="profile-posts-grid">
            {posts.length > 0 ? (
              posts.map(post => {
                const postImageUrl = post.image ? getR2FileUrl(post.image) : post.image;
                return (
                  <div 
                    key={post.id} 
                    className="profile-post-item"
                    onClick={() => handlePostClick(post)}
                  >
                    <img 
                      src={postImageUrl} 
                      alt={post.title || ''} 
                      className="profile-post-image"
                    />
                    <div className="profile-post-overlay">
                      <div className="overlay-stats">
                        <span className="overlay-stat">
                          ❤️ {post.likes || 0}
                        </span>
                        <span className="overlay-stat">
                          💬 {post.comments || post.commentCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="profile-no-posts">
                <div className="no-posts-icon">📸</div>
                <h3>{activeTab === 'posts' ? 'No posts yet' : `No ${activeTab} posts`}</h3>
                <p>{isOwnProfile ? 'Share your first winter adventure!' : 'This user hasn\'t posted anything yet'}</p>
                {isOwnProfile && activeTab === 'posts' && (
                  <button 
                    className="create-first-post-btn"
                    onClick={() => navigate('/create')}
                  >
                    Create Your First Post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default UserProfile;

