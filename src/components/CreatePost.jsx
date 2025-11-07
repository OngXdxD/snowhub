import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, MapPin, Tag, Image as ImageIcon, Snowflake, Sparkles, Loader } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { postsAPI, categoriesAPI } from '../services/api';
import { uploadFileToR2, validateFileType } from '../utils/r2Upload';
import Navbar from './Navbar';
import '../css/CreatePost.css';

function CreatePost() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const skipNextLocationFetchRef = useRef(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categories: [],
    location: ''
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiInput, setAiInput] = useState('');

  const normalizeCategoryName = (value) => {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const isCategoryEqual = (a, b) => a.toLowerCase() === b.toLowerCase();

  const ensureCategoryInList = (list, categoryName) => {
    if (!categoryName) return list;
    return list.some(cat => isCategoryEqual(cat, categoryName))
      ? list
      : [...list, categoryName];
  };

  // Load categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await categoriesAPI.getAll();
        const categoryItems = Array.isArray(data?.categories) ? data.categories : data;
        const names = (categoryItems || []).map(item => normalizeCategoryName(item.name || item));
        const uniqueNames = [...new Set(names)];
        uniqueNames.sort((a, b) => a.localeCompare(b));
        setAvailableCategories(uniqueNames);
      } catch (error) {
        console.error('Failed to load categories:', error);
        showToast('Unable to load categories. You can still add your own.', 'warning');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, [showToast]);

  // Fetch location suggestions from Google Places API
  const fetchLocationSuggestions = async (input) => {
    if (!input || input.length < 2) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not configured');
      return;
    }

    setIsLoadingLocations(true);

    try {
      const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey
        },
        body: JSON.stringify({
          input: input,
          // Optional: Add location bias for better results
          // locationBias: {
          //   circle: {
          //     center: {
          //       latitude: 37.7937,
          //       longitude: -122.3965
          //     },
          //     radius: 500.0
          //   }
          // }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch location suggestions');
      }

      const data = await response.json();
      console.log('📍 Location suggestions:', data);
      
      if (data.suggestions && data.suggestions.length > 0) {
        setLocationSuggestions(data.suggestions);
        setShowLocationDropdown(true);
      } else {
        setLocationSuggestions([]);
        setShowLocationDropdown(false);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  // Debounce location input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (skipNextLocationFetchRef.current) {
        skipNextLocationFetchRef.current = false;
        return;
      }

      fetchLocationSuggestions(formData.location);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData.location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.location-autocomplete-wrapper')) {
        setShowLocationDropdown(false);
      }
    };

    if (showLocationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLocationDropdown]);

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

  const addCategoryToSelection = (categoryName) => {
    const normalized = normalizeCategoryName(categoryName);
    if (!normalized) return;

    setAvailableCategories(prev => ensureCategoryInList(prev, normalized).sort((a, b) => a.localeCompare(b)));

    setFormData(prev => {
      if (prev.categories.some(cat => isCategoryEqual(cat, normalized))) {
        return prev;
      }
      return {
        ...prev,
        categories: [...prev.categories, normalized]
      };
    });
  };

  const removeCategoryFromSelection = (categoryName) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => !isCategoryEqual(cat, categoryName))
    }));
  };

  const handleCategoryToggle = (categoryName) => {
    const normalized = normalizeCategoryName(categoryName);
    if (!normalized) return;

    setAvailableCategories(prev => ensureCategoryInList(prev, normalized).sort((a, b) => a.localeCompare(b)));

    setFormData(prev => {
      const isSelected = prev.categories.some(cat => isCategoryEqual(cat, normalized));
      return {
        ...prev,
        categories: isSelected
          ? prev.categories.filter(cat => !isCategoryEqual(cat, normalized))
          : [...prev.categories, normalized]
      };
    });
  };

  const handleCategoryInputChange = (e) => {
    setCategoryInput(e.target.value);
  };

  const persistCategoryIfNeeded = async (categoryName) => {
    const normalized = normalizeCategoryName(categoryName);
    if (!normalized) return normalized;

    if (!availableCategories.some(cat => isCategoryEqual(cat, normalized))) {
      try {
        const created = await categoriesAPI.create({ name: normalized });
        const createdName = normalizeCategoryName(created?.name || normalized);
        setAvailableCategories(prev => ensureCategoryInList(prev, createdName).sort((a, b) => a.localeCompare(b)));
        return createdName;
      } catch (error) {
        console.error('Failed to create category:', error);
        showToast('Category saved locally. It will be synced later.', 'info');
        setAvailableCategories(prev => ensureCategoryInList(prev, normalized).sort((a, b) => a.localeCompare(b)));
        return normalized;
      }
    }

    return normalized;
  };

  const handleAddCategory = async () => {
    const normalized = normalizeCategoryName(categoryInput);
    if (!normalized) return;

    const finalName = await persistCategoryIfNeeded(normalized);
    addCategoryToSelection(finalName);
    setCategoryInput('');
  };

  const handleCategoryInputKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleAddCategory();
    }
  };

  const handleLocationSelect = (suggestion) => {
    // Extract the main text from the suggestion
    const locationText = suggestion.placePrediction?.text?.text || 
                        suggestion.placePrediction?.structuredFormat?.mainText?.text || 
                        '';
    
    skipNextLocationFetchRef.current = true;
    setFormData(prev => ({ ...prev, location: locationText }));
    setShowLocationDropdown(false);
    setLocationSuggestions([]);
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
      const existingContext = {
        currentTitle: formData.title,
        currentDescription: formData.content,
        currentCategories: formData.categories,
        currentLocation: formData.location
      };

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
              role: 'system',
              content: [
                'You are an award-winning winter sports storyteller and social media strategist.',
                'Write energetic, authentic copy that appeals to skiers, snowboarders, and mountain lovers.',
                'Keep descriptions vivid, with 2-3 short paragraphs, sensory details, and a clear call-to-action or takeaway.',
                'Limit emojis to at most 3 total and only when they add excitement.',
                'Ensure the suggested tag is one clear keyword (Title Case).',
                'Tailor the location suggestion to match the story vibe and be a real, recognizable destination.'
              ].join(' ')
            },
            {
              role: 'user',
              content: [
                'User brief about their winter sports post:',
                aiInput,
                '',
                'Current draft values (use only if they strengthen the result):',
                JSON.stringify(existingContext, null, 2),
                '',
                'Please return polished copy following this exact JSON schema:',
                '{',
              '  "title": "Short punchy title with up to 2 emojis",',
              '  "description": "Two or three paragraphs (100-220 words) of engaging storytelling",',
              '  "categories": ["Up to three values chosen from: Skiing, Snowboarding, Powder, Backcountry, Resort, Gear Review, Tips & Tricks, Adventure, Climbing, Tutorial, Lifestyle, Racing, Safety"],',
                '  "location": "Concise destination recommendation"',
                '}',
                '',
                'Do not include extra commentary—only output valid JSON.'
              ].join('\n')
            }
          ],
          max_tokens: 900,
          temperature: 1.5,
          top_p: 0.9
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
        
        const aiCategories = Array.isArray(aiData.categories)
          ? aiData.categories.map(normalizeCategoryName).filter(Boolean)
          : aiData.categories
            ? [normalizeCategoryName(aiData.categories)].filter(Boolean)
            : aiData.tag
              ? [normalizeCategoryName(aiData.tag)].filter(Boolean)
              : [];

        setFormData(prev => ({
          ...prev,
          title: aiData.title || prev.title,
          content: aiData.description || prev.content,
          categories: aiCategories.length ? aiCategories : prev.categories,
          location: aiData.location || prev.location
        }));

        if (aiCategories.length) {
          setAvailableCategories(prev => {
            const combined = [...prev];
            aiCategories.forEach(category => {
              if (!combined.some(existing => isCategoryEqual(existing, category))) {
                combined.push(category);
              }
            });
            combined.sort((a, b) => a.localeCompare(b));
            return combined;
          });
        }
        
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
        categories: formData.categories,
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

            {/* Category and Location Row */}
            <div className="form-row">
              <div className="form-field categories-field">
                <label htmlFor="category-input" className="field-label">
                  <Tag size={16} />
                  Categories
                </label>

                <div className="category-input-wrapper">
                  <div className="category-input-field">
                    {formData.categories.map(category => (
                      <span key={category} className="selected-category-chip">
                        {category}
                        <button
                          type="button"
                          aria-label={`Remove ${category}`}
                          onClick={() => removeCategoryFromSelection(category)}
                          disabled={isLoading || isAIGenerating}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      id="category-input"
                      value={categoryInput}
                      onChange={handleCategoryInputChange}
                      onKeyDown={handleCategoryInputKeyDown}
                      placeholder={formData.categories.length ? 'Add another category' : 'Type a category'}
                      className="category-chip-input"
                      disabled={isLoading || isAIGenerating}
                    />
                  </div>
                  <button
                    type="button"
                    className="category-add-btn"
                    onClick={handleAddCategory}
                    disabled={isLoading || isAIGenerating || !categoryInput.trim()}
                  >
                    Add
                  </button>
                </div>
                {isLoadingCategories && (
                  <div className="category-loading">
                    <Loader size={16} className="spinning" />
                    <span>Loading categories...</span>
                  </div>
                )}

                {availableCategories.length > 0 && (
                  <div className="available-categories">
                    <div className="available-categories-label">Quick add</div>
                    <div className="category-chip-group">
                      {availableCategories.map(category => {
                        const isSelected = formData.categories.some(cat => isCategoryEqual(cat, category));
                        return (
                          <button
                            key={category}
                            type="button"
                            className={`tag-chip ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleCategoryToggle(category)}
                            disabled={isLoading || isAIGenerating}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-field location-field">
                <label htmlFor="location" className="field-label">
                  <MapPin size={16} />
                  Location
                </label>
                <div className="location-autocomplete-wrapper">
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Search for a location..."
                    className="field-input"
                    disabled={isLoading || isAIGenerating}
                    autoComplete="off"
                  />
                  {isLoadingLocations && (
                    <div className="location-loading">
                      <Loader size={16} className="spinning" />
                    </div>
                  )}
                  
                  {showLocationDropdown && locationSuggestions.length > 0 && (
                    <div className="location-dropdown">
                      {locationSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="location-suggestion-item"
                          onClick={() => handleLocationSelect(suggestion)}
                        >
                          <MapPin size={16} className="location-icon" />
                          <div className="location-text">
                            <div className="location-main">
                              {suggestion.placePrediction?.structuredFormat?.mainText?.text || 
                               suggestion.placePrediction?.text?.text}
                            </div>
                            {suggestion.placePrediction?.structuredFormat?.secondaryText?.text && (
                              <div className="location-secondary">
                                {suggestion.placePrediction.structuredFormat.secondaryText.text}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
