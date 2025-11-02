/**
 * Cloudflare R2 Upload Utility
 * Handles file uploads to Cloudflare R2 bucket
 */

/**
 * Upload a file to Cloudflare R2 bucket
 * @param {File} file - The file object to upload
 * @param {string} prefix - Prefix for the file (e.g., 'post', 'avatar', 'user_123')
 * @returns {Promise<string>} - Returns the filename stored in R2
 */
export const uploadFileToR2 = async (file, prefix = 'uploads') => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file size (max 10MB by default)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
  }

  // Get file extension from original file
  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  // Create a timestamp string (YYYYMMDD_HHmmss)
  const now = new Date();
  const timestamp = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') + '_' +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  
  // Generate a random string to ensure uniqueness
  const randomStr = Math.random().toString(36).substring(2, 10);
  
  // Create filename using prefix, timestamp, random string and original extension
  const filename = `${prefix}_${timestamp}_${randomStr}.${fileExtension}`;
  
  // Create file path for R2
  const filePath = `uploads/${filename}`;
  
  // Get R2 upload URL from environment variable and append the key parameter
  const r2BaseUrl = import.meta.env.VITE_R2_UPLOAD_URL;
  
  if (!r2BaseUrl) {
    throw new Error('R2 upload URL not configured. Please set VITE_R2_UPLOAD_URL in your .env file');
  }
  
  // Ensure base URL ends with a slash
  const baseUrl = r2BaseUrl.endsWith('/') ? r2BaseUrl : `${r2BaseUrl}/`;
  const uploadUrl = `${baseUrl}upload?key=${filePath}`;
  
  // Upload directly to Cloudflare R2
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': file.type   // ensures Worker sees correct MIME type
    },
    body: file 
  });
  
  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text().catch(() => 'Unknown error');
    throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
  }
  
  // Return the filename (this is what gets stored in the database)
  return filename;
};

/**
 * Get the full URL for a file stored in R2
 * @param {string} filename - The filename stored in the database
 * @returns {string} - The full URL to access the file
 */
export const getR2FileUrl = (filename) => {
  if (!filename) {
    return null;
  }
  
  const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL;
  
  if (!r2PublicUrl) {
    console.warn('R2 public URL not configured. Please set VITE_R2_PUBLIC_URL in your .env file');
    return filename;
  }
  
  // If filename already includes the full path
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // If filename includes 'uploads/' prefix, remove it as it's already in the path
  const cleanFilename = filename.replace(/^uploads\//, '');
  
  // Construct the full URL
  return `${r2PublicUrl}/uploads/${cleanFilename}`;
};

/**
 * Upload multiple files to R2
 * @param {File[]} files - Array of file objects
 * @param {string} prefix - Prefix for the files
 * @returns {Promise<string[]>} - Array of filenames
 */
export const uploadMultipleFilesToR2 = async (files, prefix = 'uploads') => {
  if (!files || files.length === 0) {
    throw new Error('No files provided');
  }
  
  const uploadPromises = files.map(file => uploadFileToR2(file, prefix));
  return Promise.all(uploadPromises);
};

/**
 * Validate file type
 * @param {File} file - The file to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types or extensions
 * @returns {boolean} - Whether the file type is valid
 */
export const validateFileType = (file, allowedTypes = ['image/*', 'video/*']) => {
  if (!file) return false;
  
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const category = type.split('/')[0];
      return file.type.startsWith(category + '/');
    }
    return file.type === type || file.name.toLowerCase().endsWith(type);
  });
};

/**
 * Delete a file from R2 (requires backend endpoint)
 * @param {string} filename - The filename to delete
 * @returns {Promise<void>}
 */
export const deleteFileFromR2 = async (filename) => {
  if (!filename) {
    throw new Error('No filename provided');
  }
  
  const r2BaseUrl = import.meta.env.VITE_R2_UPLOAD_URL;
  
  if (!r2BaseUrl) {
    throw new Error('R2 upload URL not configured');
  }
  
  // Ensure base URL ends with a slash
  const baseUrl = r2BaseUrl.endsWith('/') ? r2BaseUrl : `${r2BaseUrl}/`;
  const filePath = filename.startsWith('uploads/') ? filename : `uploads/${filename}`;
  const deleteUrl = `${baseUrl}delete?key=${filePath}`;
  
  const response = await fetch(deleteUrl, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete file: ${response.status} ${response.statusText}`);
  }
};

