import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, MapPin, Tag, Image as ImageIcon, Snowflake, Sparkles, Loader } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { postsAPI } from '../services/api';
import { uploadFileToR2, validateFileType } from '../utils/r2Upload';
import Navbar from './Navbar';
import './CreatePost.css';

function CreatePost() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const placePickerRef = useRef(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tag: '',
    location: ''
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiInput, setAiInput] = useState('');

  // Load Google Maps Extended Components
  useEffect(() => {
    const loadGoogleMaps = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      // If no API key, don't load Google Maps
      if (!apiKey) {
        console.warn('Google Maps API key not configured. Location autocomplete disabled.');
        setIsGoogleLoaded(false);
        return;
      }

      // Check if already loaded
      if (window.google && window.customElements && customElements.get('gmpx-place-picker')) {
        setIsGoogleLoaded(true);
        return;
      }

      // Load the Extended Components library
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js';
      script.onload = () => {
        // Wait for custom elements to be defined
        customElements.whenDefined('gmpx-place-picker').then(() => {
          setIsGoogleLoaded(true);
        });
      };
      script.onerror = () => {
        console.warn('Google Maps Extended Components failed to load');
        setIsGoogleLoaded(false);
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize Place Picker
  useEffect(() => {
    if (isGoogleLoaded && placePickerRef.current) {
      const placePicker = placePickerRef.current;
      
      const handlePlaceChange = (event) => {
        const place = event.detail || event.target.value;
        const locationText = place?.formattedAddress || place?.formatted_address || '';
        if (locationText) {
          setFormData(prev => ({ ...prev, location: locationText }));
        }
      };

      placePicker.addEventListener('gmpx-placechange', handlePlaceChange);
      
      return () => {
        placePicker.removeEventListener('gmpx-placechange', handlePlaceChange);
      };
    }
  }, [isGoogleLoaded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      if (!validateFileType(file, ['image/*', 'video/*'])) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image or video file' }));
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'File size should be less than 10MB' }));
        return;
      }

      setImageFile(file);
      setErrors(prev => ({ ...prev, image: '' }));

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

  const openAIModal = () => {
    setShowAIModal(true);
  };

  const closeAIModal = () => {
    setShowAIModal(false);
    setAiInput('');
  };

  const generateWithAI = async () => {
    if (!aiInput.trim()) {
      showToast('Please provide some details about your post', 'warning');
      return;
    }

    setIsAIGenerating(true);
    
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: `Based on the following information about a winter sports post, generate engaging social media content:

User's input: "${aiInput}"

Generate:
1. A catchy title (emojis welcome)
2. A detailed description (100-300 words)
3. A relevant tag (one word like: Skiing, Snowboarding, Powder, Backcountry, Resort, Gear Review, Tips & Tricks, Adventure, Climbing, Tutorial, Lifestyle, Racing, Safety)
4. A location suggestion

Return ONLY a JSON object in this exact format:
{
  "title": "...",
  "description": "...",
  "tag": "...",
  "location": "..."
}`
            }
          ],
          max_tokens: 800,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AI API error:', errorData);
        throw new Error(errorData.error?.message || 'AI generation failed');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      // Parse JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiData = JSON.parse(jsonMatch[0]);
        
        setFormData(prev => ({
          ...prev,
          title: aiData.title || prev.title,
          content: aiData.description || prev.content,
          tag: aiData.tag || prev.tag,
          location: aiData.location || prev.location
        }));
        
        showToast('AI content generated! ✨', 'success');
        closeAIModal();
      } else {
        throw new Error('Invalid AI response format');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      showToast(error.message || 'AI generation failed. Please try again.', 'error');
    } finally {
      setIsAIGenerating(false);
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

      if (imageFile) {
        showToast('Uploading file to cloud storage...', 'info');
        const userId = localStorage.getItem('userId') || 'post';
        uploadedFilename = await uploadFileToR2(imageFile, userId);
        showToast('File uploaded successfully! ✓', 'success');
      }

      const postPayload = {
        title: formData.title,
        content: formData.content,
        tag: formData.tag,
        location: formData.location,
        image: uploadedFilename,
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
    <>
      <Navbar />
      <div className="create-post-container">

      {/* Content */}
      <div className="create-post-content">
        <form onSubmit={handleSubmit} className="create-post-form">
          {errors.api && (
            <div className="api-error-message">
              {errors.api}
            </div>
          )}

          {/* Left side - Image Upload */}
          <div className="create-post-main">
            <div className="image-upload-section">
              {!imagePreview ? (
                <div 
                  className={`image-upload-area ${errors.image ? 'error' : ''}`}
                  onClick={handleImageClick}
                >
                  <Upload size={48} />
                  <h3>Add photo/video</h3>
                  <p>PNG, JPG, WEBP, MP4, MOV up to 10MB</p>
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
                  </button>
                </div>
              )}
              {errors.image && <span className="error-message">{errors.image}</span>}
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-fields-section">
            {/* Title */}
            <div className="form-field">
              <label htmlFor="title" className="field-label">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="What's on your mind?"
                className={`field-input ${errors.title ? 'error' : ''}`}
                disabled={isLoading || isAIGenerating}
                maxLength={100}
              />
              <div className="input-footer">
                {errors.title && <span className="error-message">{errors.title}</span>}
                <span className="char-count">{formData.title.length}/100</span>
              </div>
            </div>

            {/* Description */}
            <div className="form-field">
              <label htmlFor="content" className="field-label">
                Description *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Share your story..."
                className={`field-textarea ${errors.content ? 'error' : ''}`}
                disabled={isLoading || isAIGenerating}
                rows={8}
              />
              <div className="description-footer">
                {errors.content && <span className="error-message">{errors.content}</span>}
                <button
                  type="button"
                  className="ai-helper-link"
                  onClick={openAIModal}
                  disabled={isAIGenerating || isLoading}
                >
                  <Sparkles size={14} />
                  Need help? Generate with AI
                </button>
              </div>
            </div>

            {/* Tag and Location Row */}
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="tag" className="field-label">
                  <Tag size={16} />
                  Category
                </label>
                <input
                  type="text"
                  id="tag"
                  name="tag"
                  value={formData.tag}
                  onChange={handleChange}
                  placeholder="Select category"
                  className="field-input"
                  disabled={isLoading || isAIGenerating}
                />
                <div className="popular-tags">
                  {popularTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-chip ${formData.tag === tag ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, tag }))}
                      disabled={isLoading || isAIGenerating}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="location" className="field-label">
                  <MapPin size={16} />
                  Location
                </label>
                {isGoogleLoaded ? (
                  <gmpx-api-loader key={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} solution-channel="GMP_GE_snowhub_v1">
                    <gmpx-place-picker
                      ref={placePickerRef}
                      placeholder="Enter location"
                      style={{
                        width: '100%',
                        '--gmpx-color-primary': '#1976d2',
                      }}
                    />
                  </gmpx-api-loader>
                ) : (
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Add location"
                    className="field-input"
                    disabled={isLoading || isAIGenerating}
                  />
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="publish-btn"
                disabled={isLoading || isAIGenerating}
              >
                {isLoading ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* AI Modal */}
      {showAIModal && (
        <div className="ai-modal-overlay" onClick={closeAIModal}>
          <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-header">
              <h2>
                <Sparkles size={24} />
                AI Content Generator
              </h2>
              <button className="ai-modal-close" onClick={closeAIModal}>
                <X size={24} />
              </button>
            </div>
            
            <div className="ai-modal-body">
              <p className="ai-modal-description">
                Tell me about your post and I'll create a catchy title, description, tag, and location for you!
              </p>
              
              <textarea
                className="ai-modal-input"
                placeholder="e.g., Just went skiing in Hokkaido Japan, amazing powder snow, best conditions ever..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                rows={6}
                disabled={isAIGenerating}
              />
            </div>
            
            <div className="ai-modal-footer">
              <button 
                className="ai-modal-cancel" 
                onClick={closeAIModal}
                disabled={isAIGenerating}
              >
                Cancel
              </button>
              <button 
                className="ai-modal-generate" 
                onClick={generateWithAI}
                disabled={isAIGenerating || !aiInput.trim()}
              >
                {isAIGenerating ? (
                  <>
                    <Loader className="spinning" size={18} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default CreatePost;
