import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, MapPin, Tag, Image as ImageIcon, Snowflake } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { postsAPI } from '../services/api';
import { uploadFileToR2, validateFileType } from '../utils/r2Upload';
import './CreatePost.css';

function CreatePost() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tag: '',
    location: ''
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (supports images and videos)
      if (!validateFileType(file, ['image/*', 'video/*'])) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image or video file' }));
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'File size should be less than 10MB' }));
        return;
      }

      setImageFile(file);
      setErrors(prev => ({ ...prev, image: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Description is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Description must be at least 10 characters';
    }

    if (!imageFile && !imagePreview) {
      newErrors.image = 'Please select an image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      let uploadedFilename = null;

      // Upload image/video to R2 first
      if (imageFile) {
        showToast('Uploading file to cloud storage...', 'info');
        
        // Get user ID for prefix, or use 'post' as default
        const userId = localStorage.getItem('userId') || 'post';
        uploadedFilename = await uploadFileToR2(imageFile, userId);
        
        showToast('File uploaded successfully! ✓', 'success');
      }

      // Create post with the filename (not the file itself)
      const postPayload = {
        title: formData.title,
        content: formData.content,
        tag: formData.tag,
        location: formData.location,
        image: uploadedFilename, // Send only the filename to backend
      };

      const response = await postsAPI.create(postPayload);
      console.log('Post created:', response);

      showToast('Post created successfully! 🎿', 'success');
      setTimeout(() => navigate('/'), 500);
    } catch (error) {
      console.error('Create post error:', error);
      setErrors({
        api: error.message || 'Failed to create post. Please try again.',
      });
      showToast(error.message || 'Failed to create post', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (imagePreview || formData.title || formData.content) {
      if (window.confirm('Are you sure you want to discard this post?')) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const popularTags = [
    'Skiing',
    'Snowboarding',
    'Powder',
    'Backcountry',
    'Resort',
    'Gear Review',
    'Tips & Tricks',
    'Adventure'
  ];

  return (
    <div className="create-post-container">
      <div className="create-post-header">
        <button className="back-btn" onClick={handleCancel} disabled={isLoading}>
          <X size={24} />
        </button>
        <div className="header-content">
          <Snowflake className="header-icon" size={28} />
          <h1>Create New Post</h1>
        </div>
        <button 
          className="publish-btn" 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      <div className="create-post-content">
        <form onSubmit={handleSubmit} className="create-post-form">
          {errors.api && (
            <div className="api-error-message">
              {errors.api}
            </div>
          )}

          {/* Image Upload Section */}
          <div className="form-section image-section">
            <label className="section-label">
              <ImageIcon size={20} />
              Photo *
            </label>
            
            {!imagePreview ? (
              <div 
                className={`image-upload-area ${errors.image ? 'error' : ''}`}
                onClick={handleImageClick}
              >
                <Upload size={48} />
                <h3>Click to upload image or video</h3>
                <p>Images (PNG, JPG, WEBP) or Videos (MP4, MOV) up to 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button 
                  type="button"
                  className="remove-image-btn"
                  onClick={handleRemoveImage}
                  disabled={isLoading}
                >
                  <X size={20} />
                  Remove Image
                </button>
              </div>
            )}
            {errors.image && <span className="error-message">{errors.image}</span>}
          </div>

          {/* Title Input */}
          <div className="form-section">
            <label htmlFor="title" className="section-label">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Give your post a catchy title..."
              className={`form-input ${errors.title ? 'error' : ''}`}
              disabled={isLoading}
              maxLength={100}
            />
            <div className="input-footer">
              {errors.title && <span className="error-message">{errors.title}</span>}
              <span className="char-count">{formData.title.length}/100</span>
            </div>
          </div>

          {/* Description Textarea */}
          <div className="form-section">
            <label htmlFor="content" className="section-label">
              Description *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Share your story, tips, or experience..."
              className={`form-textarea ${errors.content ? 'error' : ''}`}
              disabled={isLoading}
              rows={6}
            />
            {errors.content && <span className="error-message">{errors.content}</span>}
          </div>

          {/* Tag Input */}
          <div className="form-section">
            <label htmlFor="tag" className="section-label">
              <Tag size={20} />
              Tag
            </label>
            <input
              type="text"
              id="tag"
              name="tag"
              value={formData.tag}
              onChange={handleChange}
              placeholder="e.g., Skiing, Snowboarding, Powder..."
              className="form-input"
              disabled={isLoading}
            />
            <div className="popular-tags">
              <span className="tags-label">Popular:</span>
              {popularTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-chip ${formData.tag === tag ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tag }))}
                  disabled={isLoading}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Location Input */}
          <div className="form-section">
            <label htmlFor="location" className="section-label">
              <MapPin size={20} />
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Where was this taken?"
              className="form-input"
              disabled={isLoading}
            />
          </div>

          {/* Mobile Submit Buttons */}
          <div className="mobile-actions">
            <button
              type="button"
              className="cancel-btn-mobile"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn-mobile"
              disabled={isLoading}
            >
              {isLoading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;

