import axiosInstance from './index';

// Posts API interfaces
export interface CreatePostPayload {
  description: string;
  mimeType: string;
  fileSize: number;
  hashtags: string[];
  interests: string[];
  fileUri?: string; // Optional file URI for upload
}

export interface PostResponse {
  success: boolean;
  timestamp: string;
  data: {
    post: {
      id: string;
      description: string;
      hashtags: string[];
      interests: string[];
      media: any;
      created_at: string;
      updated_at: string;
      user: any;
    };
    uploadUrl: string; // Presigned URL for file upload
    expiresAt: string;
  };
}

// Posts API functions
export const postsApi = {
  createPost: async (payload: CreatePostPayload) => {
    try {
      console.log('🚀 [CREATE POST] Starting two-step upload process', {
        description: payload.description,
        mimeType: payload.mimeType,
        fileSize: payload.fileSize,
        hashtagsCount: payload.hashtags.length,
        interestsCount: payload.interests.length,
        hasFileUri: !!payload.fileUri,
        apiBaseUrl: process.env.API_BASE_URL,
        timestamp: new Date().toISOString()
      });

      // STEP 1: Send metadata to posts API to get upload URL
      const postData = {
        description: payload.description,
        mimeType: payload.mimeType,
        fileSize: payload.fileSize,
        hashtags: payload.hashtags,
        interests: payload.interests,
      };

      console.log('📤 [STEP 1] Posting metadata to /posts endpoint...');
      const response = await axiosInstance.post('/posts', postData);
      
      console.log('✅ [STEP 1] Metadata posted successfully:', {
        status: response.status,
        statusText: response.statusText,
        postId: response.data?.data?.post?.id,
        uploadUrl: response.data?.data?.uploadUrl ? 'received' : 'missing',
        expiresAt: response.data?.data?.expiresAt
      });

      const postResponse = response.data as PostResponse;

      // STEP 2: Upload file to S3 if fileUri is provided
      if (payload.fileUri && postResponse.data.uploadUrl) {
        console.log('📤 [STEP 2] Uploading file to S3 presigned URL...');
        
        // Try using fetch with proper file handling for S3 upload
        try {
          // Create a file reference for React Native
          const fileUpload = {
            uri: payload.fileUri,
            type: payload.mimeType,
            name: `video.${payload.mimeType.split('/')[1] || 'mp4'}`,
          };

          console.log('🚀 [S3 UPLOAD] Preparing file upload...', {
            uploadUrl: postResponse.data.uploadUrl.substring(0, 100) + '...',
            fileType: payload.mimeType,
            fileUri: payload.fileUri?.substring(0, 50) + '...',
            fileSize: payload.fileSize
          });

          // Use fetch with FormData for React Native compatibility
          const formData = new FormData();
          formData.append('file', fileUpload as any);

          const uploadResponse = await fetch(postResponse.data.uploadUrl, {
            method: 'PUT',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          console.log('✅ [S3 UPLOAD] Upload attempt completed:', {
            status: uploadResponse.status,
            statusText: uploadResponse.statusText,
            ok: uploadResponse.ok,
            url: uploadResponse.url,
            type: uploadResponse.type,
            headers: Array.from(uploadResponse.headers.entries())
          });

          if (!uploadResponse.ok) {
            // Try to get response text for debugging
            let responseText = '';
            try {
              responseText = await uploadResponse.text();
            } catch (e) {
              responseText = 'Could not read response';
            }
            
            console.error('❌ [S3 UPLOAD] Upload failed with response:', {
              status: uploadResponse.status,
              statusText: uploadResponse.statusText,
              responseText: responseText.substring(0, 200),
              redirected: uploadResponse.redirected,
              url: uploadResponse.url
            });
            
            throw new Error(`S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${responseText}`);
          }

        } catch (uploadError: any) {
          console.error('❌ [S3 UPLOAD] Exception during upload:', uploadError);
          throw uploadError;
        }

        const uploadResponse = { ok: true, status: 200, statusText: 'OK' };

        console.log('✅ [STEP 2] File upload response:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          ok: uploadResponse.ok,
          uploadUrl: postResponse.data.uploadUrl.substring(0, 100) + '...'
        });

        if (!uploadResponse.ok) {
          throw new Error(`File upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        console.log('🎉 [CREATE POST] Both steps completed successfully!');
      } else if (payload.fileUri) {
        console.warn('⚠️ [CREATE POST] FileUri provided but no uploadUrl received');
      } else {
        console.log('ℹ️ [CREATE POST] No file upload required (metadata only)');
      }

      return postResponse;
    } catch (error: any) {
      console.error('❌ [CREATE POST ERROR] Full details:', {
        error: error,
        message: error?.message,
        status: error?.response?.status,
        responseData: error?.response?.data,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

};