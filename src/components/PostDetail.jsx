import { X, Heart, MessageCircle, Bookmark, Share2, MapPin } from 'lucide-react';
import './PostDetail.css';

function PostDetail({ post, onClose }) {
  if (!post) return null;

  return (
    <div className="post-detail-overlay" onClick={onClose}>
      <div className="post-detail-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="post-detail-content">
          {/* Left side - Image */}
          <div className="post-detail-image-section">
            <img src={post.image} alt={post.title} className="post-detail-image" />
          </div>

          {/* Right side - Content */}
          <div className="post-detail-info">
            {/* Author Header */}
            <div className="post-detail-header">
              <div className="author-info">
                <img src={post.avatar} alt={post.author} className="author-avatar-large" />
                <div className="author-details">
                  <h3 className="author-name-large">{post.author}</h3>
                  <button className="follow-btn">+ Follow</button>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="post-detail-body">
              <h1 className="post-detail-title">{post.title}</h1>
              
              <div className="post-meta">
                <span className="post-tag-detail">{post.tag}</span>
                {post.location && (
                  <span className="post-location">
                    <MapPin size={14} />
                    {post.location}
                  </span>
                )}
              </div>

              <div className="post-description">
                <p>{post.content}</p>
              </div>

              {/* Engagement Stats */}
              <div className="post-engagement">
                <button className="engagement-btn liked">
                  <Heart size={20} fill="currentColor" />
                  <span>{post.likes}</span>
                </button>
                <button className="engagement-btn">
                  <MessageCircle size={20} />
                  <span>{post.comments || '128'}</span>
                </button>
                <button className="engagement-btn">
                  <Bookmark size={20} />
                </button>
                <button className="engagement-btn">
                  <Share2 size={20} />
                </button>
              </div>

              {/* Comments Section */}
              <div className="comments-section">
                <h3 className="comments-title">Comments</h3>
                <div className="comment">
                  <img src="https://i.pravatar.cc/150?img=20" alt="commenter" className="comment-avatar" />
                  <div className="comment-content">
                    <span className="comment-author">SnowRider92</span>
                    <p className="comment-text">This looks amazing! What conditions were like?</p>
                    <span className="comment-time">2 hours ago</span>
                  </div>
                </div>
                <div className="comment">
                  <img src="https://i.pravatar.cc/150?img=21" alt="commenter" className="comment-avatar" />
                  <div className="comment-content">
                    <span className="comment-author">MountainLover</span>
                    <p className="comment-text">Great tips! Bookmarked for my next trip 🏔️</p>
                    <span className="comment-time">5 hours ago</span>
                  </div>
                </div>
              </div>

              {/* Comment Input */}
              <div className="comment-input-section">
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  className="comment-input"
                />
                <button className="comment-submit-btn">Post</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;

