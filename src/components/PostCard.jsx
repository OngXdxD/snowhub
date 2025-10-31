import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import './PostCard.css';

function PostCard({ post, onClick }) {
  const { showToast } = useToast();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  
  const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
  };

  const handleProtectedAction = (e, message, callback) => {
    e.stopPropagation(); // Prevent card click
    
    if (!isAuthenticated()) {
      showToast(message, 'warning');
    } else {
      callback();
    }
  };

  const handleLike = (e) => {
    handleProtectedAction(e, 'Please login to like this post', () => {
      setLiked(!liked);
      // TODO: Call API to like post
      console.log('Liked post:', post.id);
    });
  };

  const handleBookmark = (e) => {
    handleProtectedAction(e, 'Please login to bookmark this post', () => {
      setBookmarked(!bookmarked);
      // TODO: Call API to bookmark post
      console.log('Bookmarked post:', post.id);
    });
  };

  const handleShare = (e) => {
    e.stopPropagation();
    // Share doesn't require authentication - copy link
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Link copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy link', 'error');
    });
  };

  const handleComment = (e) => {
    e.stopPropagation();
    if (!isAuthenticated()) {
      showToast('Please login to comment on this post', 'warning');
    } else {
      onClick(); // Open post detail
    }
  };

  return (
    <div className="post-card" onClick={onClick}>
      <div className="post-image-container">
        <img src={post.image} alt={post.title} className="post-image" />
        {post.tag && <span className="post-tag">{post.tag}</span>}
      </div>
      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <div className="post-footer">
          <div className="post-author">
            <img src={post.avatar} alt={post.author} className="author-avatar" />
            <span className="author-name">{post.author}</span>
          </div>
          <div className="post-actions">
            <button 
              className={`action-btn ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              title={isAuthenticated() ? 'Like' : 'Login to like'}
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
              <span>{post.likes}</span>
            </button>
            <button 
              className="action-btn"
              onClick={handleComment}
              title={isAuthenticated() ? 'Comment' : 'Login to comment'}
            >
              <MessageCircle size={16} />
            </button>
            <button 
              className={`action-btn ${bookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmark}
              title={isAuthenticated() ? 'Bookmark' : 'Login to bookmark'}
            >
              <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
            <button 
              className="action-btn"
              onClick={handleShare}
              title="Share"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostCard;

