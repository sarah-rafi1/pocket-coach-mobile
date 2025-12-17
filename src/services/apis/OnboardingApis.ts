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
    
    // Validate required parameters
    if (!payload) {
      throw new Error('Onboarding payload is required');
    }
    
    if (!accessToken || typeof accessToken !== 'string' || accessToken.trim() === '') {
      throw new Error('Valid access token is required');
    }
    
    // Create FormData for multipart/form-data upload
    const formData = new FormData();
    
    // Safely append required fields with validation
    if (typeof payload.username === 'string' && payload.username.trim() !== '') {
      formData.append('username', payload.username);
    } else {
      throw new Error('Username is required and must be a valid string');
    }
    
    if (typeof payload.display_name === 'string' && payload.display_name.trim() !== '') {
      formData.append('display_name', payload.display_name);
    } else {
      throw new Error('Display name is required and must be a valid string');
    }
    
    if (payload.bio && typeof payload.bio === 'string' && payload.bio.trim() !== '') {
      formData.append('bio', payload.bio);
    }
    
    // Handle interest_slugs array - append each item separately
    // Ensure interest_slugs is always an array and has valid values
    const validInterestSlugs = Array.isArray(payload.interest_slugs) ? payload.interest_slugs.filter(slug => slug != null && slug !== '') : [];
    
    if (validInterestSlugs.length > 0) {
      validInterestSlugs.forEach((slug, index) => {
        if (typeof slug === 'string') {
          formData.append(`interest_slugs[${index}]`, slug);
        }
      });
      console.log('🎯 [INTERESTS] Added to FormData:', validInterestSlugs);
    } else {
      console.error('❌ [INTERESTS] No valid interests provided:', {
        originalInterestSlugs: payload.interest_slugs,
        filteredInterestSlugs: validInterestSlugs,
        type: typeof payload.interest_slugs,
        isArray: Array.isArray(payload.interest_slugs)
      });
    }
    
    // Handle profile image upload if present
    if (payload.profile_image && typeof payload.profile_image === 'string' && payload.profile_image.trim() !== '') {
      try {
        console.log('📸 [IMAGE UPLOAD] Processing image:', payload.profile_image);
        
        // For React Native, create the proper file object format
        const fileExtension = payload.profile_image.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
        
        const fileInfo = {
          uri: payload.profile_image,
          type: mimeType,
          name: `profile.${fileExtension}`
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
      console.log('ℹ️ [IMAGE UPLOAD] No valid profile image provided');
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