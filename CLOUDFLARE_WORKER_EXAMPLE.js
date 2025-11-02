/**
 * Cloudflare Worker for R2 File Upload/Delete
 * 
 * Setup Instructions:
 * 1. Create a new Worker in Cloudflare Dashboard
 * 2. Copy this code to the Worker editor
 * 3. Add R2 bucket binding named "R2_BUCKET"
 * 4. Deploy the Worker
 * 5. Copy the Worker URL to your .env file as VITE_R2_UPLOAD_URL
 * 
 * Worker Bindings:
 * - R2_BUCKET: Your R2 bucket binding
 * 
 * Environment Variables (optional):
 * - ALLOWED_ORIGINS: Comma-separated list of allowed origins for CORS
 * - MAX_FILE_SIZE: Maximum file size in bytes (default: 10MB)
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    
    // ============================================
    // UPLOAD ENDPOINT: POST /upload?key=path/to/file.jpg
    // ============================================
    if (url.pathname === '/upload' && request.method === 'POST') {
      try {
        // Get the file key from query parameter
        const key = url.searchParams.get('key');
        
        if (!key) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Missing key parameter' 
            }), 
            { 
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              }
            }
          );
        }
        
        // Validate key format (prevent path traversal)
        if (key.includes('..') || !key.startsWith('uploads/')) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Invalid key format' 
            }), 
            { 
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              }
            }
          );
        }
        
        // Get content type from request header
        const contentType = request.headers.get('Content-Type') || 'application/octet-stream';
        
        // Validate content type (only allow images and videos)
        const allowedTypes = [
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'image/gif',
          'image/webp',
          'video/mp4',
          'video/quicktime',
          'video/x-msvideo',
          'video/webm'
        ];
        
        if (!allowedTypes.includes(contentType.toLowerCase())) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Invalid file type. Only images and videos are allowed.' 
            }), 
            { 
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              }
            }
          );
        }
        
        // Get file size from Content-Length header
        const contentLength = request.headers.get('Content-Length');
        const maxSize = env.MAX_FILE_SIZE || 10 * 1024 * 1024; // 10MB default
        
        if (contentLength && parseInt(contentLength) > maxSize) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB` 
            }), 
            { 
              status: 413,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              }
            }
          );
        }
        
        // Get the file body
        const body = await request.arrayBuffer();
        
        // Upload to R2
        await env.R2_BUCKET.put(key, body, {
          httpMetadata: {
            contentType: contentType
          },
          customMetadata: {
            uploadedAt: new Date().toISOString()
          }
        });
        
        // Return success response
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'File uploaded successfully',
            key: key
          }), 
          { 
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          }
        );
        
      } catch (error) {
        console.error('Upload error:', error);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Upload failed: ' + error.message 
          }), 
          { 
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          }
        );
      }
    }
    
    // ============================================
    // DELETE ENDPOINT: DELETE /delete?key=path/to/file.jpg
    // ============================================
    if (url.pathname === '/delete' && request.method === 'DELETE') {
      try {
        // Get the file key from query parameter
        const key = url.searchParams.get('key');
        
        if (!key) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Missing key parameter' 
            }), 
            { 
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              }
            }
          );
        }
        
        // Validate key format
        if (key.includes('..') || !key.startsWith('uploads/')) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Invalid key format' 
            }), 
            { 
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
              }
            }
          );
        }
        
        // Optional: Add authentication check here
        // const authHeader = request.headers.get('Authorization');
        // if (!authHeader || !isValidToken(authHeader)) {
        //   return new Response('Unauthorized', { status: 401 });
        // }
        
        // Delete from R2
        await env.R2_BUCKET.delete(key);
        
        // Return success response
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'File deleted successfully',
            key: key
          }), 
          { 
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          }
        );
        
      } catch (error) {
        console.error('Delete error:', error);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Delete failed: ' + error.message 
          }), 
          { 
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            }
          }
        );
      }
    }
    
    // ============================================
    // GET ENDPOINT (Optional): GET /file?key=path/to/file.jpg
    // Use this if you want to serve files through the Worker
    // Otherwise, use direct R2 bucket URL
    // ============================================
    if (url.pathname === '/file' && request.method === 'GET') {
      try {
        const key = url.searchParams.get('key');
        
        if (!key) {
          return new Response('Missing key parameter', { 
            status: 400,
            headers: corsHeaders 
          });
        }
        
        // Get file from R2
        const object = await env.R2_BUCKET.get(key);
        
        if (!object) {
          return new Response('File not found', { 
            status: 404,
            headers: corsHeaders 
          });
        }
        
        // Return the file
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', 'public, max-age=31536000');
        
        // Add CORS headers
        Object.entries(corsHeaders).forEach(([key, value]) => {
          headers.set(key, value);
        });
        
        return new Response(object.body, {
          headers
        });
        
      } catch (error) {
        console.error('Get file error:', error);
        return new Response('Error retrieving file', { 
          status: 500,
          headers: corsHeaders 
        });
      }
    }
    
    // ============================================
    // HEALTH CHECK: GET /health
    // ============================================
    if (url.pathname === '/health' && request.method === 'GET') {
      return new Response(
        JSON.stringify({ 
          success: true,
          status: 'healthy',
          timestamp: new Date().toISOString()
        }), 
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        }
      );
    }
    
    // ============================================
    // DEFAULT RESPONSE
    // ============================================
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Not found',
        availableEndpoints: [
          'POST /upload?key=uploads/filename.jpg',
          'DELETE /delete?key=uploads/filename.jpg',
          'GET /file?key=uploads/filename.jpg (optional)',
          'GET /health'
        ]
      }), 
      { 
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );
  }
};

/**
 * Setup Instructions:
 * 
 * 1. In Cloudflare Dashboard:
 *    - Workers & Pages → Create Application → Create Worker
 *    - Paste this code
 *    - Click "Save and Deploy"
 * 
 * 2. Add R2 Bucket Binding:
 *    - Go to Worker Settings → Variables
 *    - R2 Bucket Bindings → Add binding
 *    - Variable name: R2_BUCKET
 *    - R2 bucket: Select your bucket
 *    - Click "Save"
 * 
 * 3. (Optional) Add Environment Variables:
 *    - ALLOWED_ORIGINS: https://yourdomain.com
 *    - MAX_FILE_SIZE: 10485760 (10MB in bytes)
 * 
 * 4. Test the Worker:
 *    curl -X POST "https://your-worker.workers.dev/upload?key=uploads/test.jpg" \
 *      -H "Content-Type: image/jpeg" \
 *      --data-binary "@test.jpg"
 * 
 * 5. Copy Worker URL to .env:
 *    VITE_R2_UPLOAD_URL=https://your-worker.workers.dev/
 * 
 * 6. Set R2 Public URL in .env:
 *    VITE_R2_PUBLIC_URL=https://your-bucket.r2.dev
 *    (or your custom domain)
 */

