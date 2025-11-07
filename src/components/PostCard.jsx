import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { getR2FileUrl } from '../utils/r2Upload';
import { postsAPI } from '../services/api';
import '../css/PostCard.css';

function PostCard({ post, onClick }) {
  const { showToast } = useToast();
  const initialLikeCount = typeof post.likeCount === 'number'
    ? post.likeCount
    : typeof post.likes === 'number'
      ? post.likes
      : 0;
  const [liked, setLiked] = useState(Boolean(post.isLiked));
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [bookmarked, setBookmarked] = useState(Boolean(post.isBookmarked));
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  
  const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
  };

  const ensureAuthenticated = (e, actionDescription) => {
    e.stopPropagation();
    if (isAuthenticated()) {
      return true;
    }
    const message = actionDescription
      ? `Please log in or sign up to ${actionDescription}.`
      : 'Please log in or sign up to continue.';
    showToast(message, 'warning');
    return false;
  };

  const handleLike = async (e) => {
    if (!ensureAuthenticated(e, 'like posts') || likeLoading) {
      return;
    }

    setLikeLoading(true);
    try {
      const response = await postsAPI.toggleLike(post.id);
      const payload = response?.data ?? response;
      const nextLiked = Boolean(payload?.liked ?? !liked);
      setLiked(nextLiked);
      if (typeof payload?.likesCount === 'number') {
        setLikeCount(payload.likesCount);
      } else if (typeof payload?.likeCount === 'number') {
        setLikeCount(payload.likeCount);
      } else {
        setLikeCount((prev) => Math.max(prev + (nextLiked ? 1 : -1), 0));
      }
      showToast(nextLiked ? 'Post liked!' : 'Like removed.', 'success');
    } catch (error) {
      console.error('Like post failed:', error);
      showToast('Unable to update like. Please try again.', 'error');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleBookmark = async (e) => {
    if (!ensureAuthenticated(e, 'save posts') || bookmarkLoading) {
      return;
    }

    setBookmarkLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        showToast('Please log in or sign up to save posts.', 'warning');
        return;
      }
      const response = await postsAPI.toggleBookmark(userId, post.id);
      const payload = response?.data ?? response;
      const nextBookmarked = Boolean(payload?.bookmarked ?? !bookmarked);
      setBookmarked(nextBookmarked);
      showToast(nextBookmarked ? 'Post saved!' : 'Bookmark removed.', 'success');
    } catch (error) {
      console.error('Bookmark post failed:', error);
      showToast('Unable to update bookmark. Please try again.', 'error');
    } finally {
      setBookmarkLoading(false);
    }
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

  const handleComment = async (e) => {
    if (!ensureAuthenticated(e, 'comment on posts')) {
      return;
    }
    onClick();
  };

  // Get the full URL for the image from R2 or use the original URL
  const imageUrl = post.image ? getR2FileUrl(post.image) : post.image;
  const displayedLikeCount = initialLikeCount === 0 && typeof post.likes === 'string'
    ? post.likes
    : likeCount;

  return (
    <div className="post-card" onClick={onClick}>
      <div className="post-image-container">
        <img src={imageUrl || post.image} alt={post.title} className="post-image" />
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
              disabled={likeLoading}
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
              <span>{displayedLikeCount}</span>
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
              disabled={bookmarkLoading}
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

