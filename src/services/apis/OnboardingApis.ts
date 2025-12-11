import { api } from '../../lib/api';
import { API_BASE_URL } from '../../config/env';

// Onboarding API interfaces
export interface OnboardingPayload {
  username: string;
  display_name: string;
  bio?: string;
  interest_slugs: string[];
  profile_image?: string;
}

export interface OnboardingResponse {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  interest_slugs: string[];
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

// Onboarding API functions
export const onboardingApi = {
  completeOnboarding: async (payload: OnboardingPayload, accessToken: string) => {
    console.log('🚀 [API CALL] => POST /users/me/onboarding');
    
    // Create FormData for multipart/form-data upload
    const formData = new FormData();
    formData.append('username', payload.username);
    formData.append('display_name', payload.display_name);
    if (payload.bio) {
      formData.append('bio', payload.bio);
    }
    
    // Handle interest_slugs array - append each item separately
    if (payload.interest_slugs && payload.interest_slugs.length > 0) {
      payload.interest_slugs.forEach((slug, index) => {
        formData.append(`interest_slugs[${index}]`, slug);
      });
      console.log('🎯 [INTERESTS] Added to FormData:', payload.interest_slugs);
    } else {
      console.error('❌ [INTERESTS] No interests provided or empty array');
    }
    
    // Handle profile image upload if present
    if (payload.profile_image) {
      try {
        console.log('📸 [IMAGE UPLOAD] Processing image:', payload.profile_image);
        
        // For React Native, we need to use the URI directly with proper metadata
        const fileInfo = {
          uri: payload.profile_image,
          type: 'image/jpeg',
          name: 'profile.jpg'
        };
        
        console.log('📸 [IMAGE UPLOAD] File info prepared:', fileInfo);
        
        // Append the file object directly to FormData (React Native style)
        formData.append('profile_image', fileInfo as any);
        console.log('✅ [IMAGE UPLOAD] File appended to FormData');
      } catch (error) {
        console.error('❌ [IMAGE UPLOAD] Error processing image:', error);
        throw new Error('Failed to process profile image');
      }
    } else {
      console.log('ℹ️ [IMAGE UPLOAD] No profile image provided');
    }
    
    console.log('📦 [REQUEST PAYLOAD] =>', {
      url: `${API_BASE_URL}/users/me/onboarding`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.substring(0, 20)}...`,
        'Accept': 'application/json',
      },
      contentType: 'multipart/form-data',
      timestamp: new Date().toISOString()
    });
    
    const response = await fetch(`${API_BASE_URL}/users/me/onboarding`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        // Don't set Content-Type for FormData - let the browser set it with boundary
      },
      body: formData,
    });

    console.log('📡 [API RESPONSE] =>', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url,
      timestamp: new Date().toISOString()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [API ERROR] =>', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData,
        timestamp: new Date().toISOString()
      });
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [API SUCCESS] => POST /users/me/onboarding', {
      responseData: data,
      timestamp: new Date().toISOString()
    });
    return data as OnboardingResponse;
  },
};