import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import PostDetail from './PostDetail';
import { postsAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import samplePosts from '../data/samplePosts';
import '../css/PostPage.css';

const normalizePost = (rawPost) => {
  if (!rawPost) {
    return null;
  }

  return {
    id: rawPost._id || rawPost.id,
    image: rawPost.image,
    title: rawPost.title,
    author: rawPost.author?.username || rawPost.author?.name || rawPost.author,
    avatar: rawPost.author?.avatar || rawPost.avatar,
    likes: typeof rawPost.likeCount === 'number'
      ? rawPost.likeCount
      : Array.isArray(rawPost.likes)
        ? rawPost.likes.length
        : rawPost.likes || 0,
    tag: rawPost.tag,
    location: rawPost.location,
    content: rawPost.content,
    comments: typeof rawPost.commentCount === 'number'
      ? rawPost.commentCount
      : Array.isArray(rawPost.comments)
        ? rawPost.comments.length
        : rawPost.comments || 0,
    isLiked: rawPost.isLiked,
    isBookmarked: rawPost.isBookmarked,
  };
};

function PostPage() {
  const { postId } = useParams();
  const { showToast } = useToast();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const fallbackPost = useMemo(() => (
    samplePosts.find((item) => String(item.id) === String(postId)) || null
  ), [postId]);

  useEffect(() => {
    let isMounted = true;

    const loadPost = async () => {
      if (!postId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await postsAPI.getById(postId);
        const payload = response?.data ?? response;
        const normalized = normalizePost(payload);

        if (isMounted) {
          setPost(normalized || fallbackPost);
        }
      } catch (error) {
        console.error('Failed to load post', error);
        if (isMounted) {
          if (fallbackPost) {
            setPost(fallbackPost);
          } else {
            showToast('Unable to load this post. It may have been removed.', 'error');
            setPost(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPost();

    return () => {
      isMounted = false;
    };
  }, [postId, fallbackPost, showToast]);

  return (
    <>
      <Navbar />
      <div className="post-page-wrapper">
        {loading ? (
          <div className="post-page-loading">
            <div className="loading-spinner" />
          </div>
        ) : post ? (
          <PostDetail post={post} variant="page" />
        ) : (
          <div className="post-page-empty">
            <h2>Post not found</h2>
            <p>The post you are looking for may have been removed or is unavailable.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default PostPage;


