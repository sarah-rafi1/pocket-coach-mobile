import axiosInstance from './index';
import { retrieveCognitoTokens } from '../../utils/AsyncStorageApis';

// User API interfaces
export interface UserProfileData {
  id: string;
  username?: string;
  display_name?: string;
  email: string;
  email_verified?: boolean;
  bio?: string;
  interest_slugs?: string[];
  profile_image?: string;
  avatar_url?: string;
  account_status?: string;
  is_onboarding_complete?: boolean;
  is_verified?: boolean;
  is_private?: boolean;
  role?: string;
  stripe_connected?: boolean;
  country_code?: string | null;
  date_of_birth?: string | null;
  language?: string;
  timezone?: string | null;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  success: boolean;
  timestamp: string;
  data: UserProfileData;
}

// Interest API interfaces
export interface Interest {
  id?: string; // UUID identifier
  label: string;
  value: string; // slug/name
}

export interface InterestsApiResponse {
  success: boolean;
  timestamp: string;
  data: Interest[];
}

export interface CheckUsernameResponse {
  success: boolean;
  timestamp: string;
  data: {
    available: boolean;
    message?: string;
  };
}

// User API functions
export const userApi = {
  getUserProfile: async () => {
    try {
      const response = await axiosInstance.get('/users/me');
      return response.data as UserProfile;
    } catch (error) {
      console.error('Error checking user profile:', error);
      throw error;
    }
  },

  sendVerificationCode: async (email: string) => {
    try {
      const response = await axiosInstance.post('/auth/send-verification-code', { email });
      return response.data;
    } catch (error) {
      console.error('❌ [API ERROR] => sendVerificationCode failed:', error);
      throw error;
    }
  },

  getInterests: async () => {
    try {
      const baseURL = process.env.API_BASE_URL || 'http://34.201.245.56:3000';
      const fullURL = `${baseURL}/interests`;
      
      console.log('🚀 [STARTING INTERESTS API CALL]', {
        url: fullURL,
        method: 'GET (direct fetch - no auth)',
        timestamp: new Date().toISOString(),
        baseURL: process.env.API_BASE_URL,
        fullPath: `/interests`
      });
      
      // Use direct fetch without authentication since interests API doesn't require auth
      const response = await fetch(fullURL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 [FULL RESPONSE]:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        contentType: response.headers.get('content-type'),
        timestamp: new Date().toISOString()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [HTTP ERROR]:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const responseText = await response.text();
      console.log('📄 [RAW RESPONSE TEXT]:', responseText.substring(0, 500) + '...');
      
      let apiResponse;
      try {
        apiResponse = JSON.parse(responseText);
        console.log('✅ [JSON PARSED SUCCESSFULLY]');
      } catch (parseError) {
        console.error('❌ [JSON PARSE ERROR]:', {
          error: parseError,
          responseText: responseText.substring(0, 200)
        });
        throw new Error(`Failed to parse JSON response: ${parseError}`);
      }
      
      console.log('🔍 [DEBUG] Parsed API Response:', {
        responseType: typeof apiResponse,
        hasData: 'data' in apiResponse,
        hasSuccess: 'success' in apiResponse,
        successValue: apiResponse.success,
        dataType: typeof apiResponse.data,
        isDataArray: Array.isArray(apiResponse.data),
        dataLength: Array.isArray(apiResponse.data) ? apiResponse.data.length : 'N/A',
        firstDataItem: Array.isArray(apiResponse.data) ? apiResponse.data[0] : 'N/A'
      });
      
      // Handle the expected API response structure
      if (apiResponse && apiResponse.success === true && Array.isArray(apiResponse.data)) {
        console.log('✅ [SUCCESS PATH] Found expected structure with', apiResponse.data.length, 'interests');
        console.log('📝 [FIRST 3 INTERESTS]:', apiResponse.data.slice(0, 3));
        return apiResponse.data as Interest[];
      }
      
      console.warn('⚠️ [UNEXPECTED STRUCTURE] API response structure not as expected:', {
        fullResponse: apiResponse,
        keys: Object.keys(apiResponse || {}),
        type: typeof apiResponse
      });
      
      // Fallback handling for different response structures
      const data = apiResponse as any;
      if (Array.isArray(data)) {
        console.log('✅ [FALLBACK 1] Response is direct array with', data.length, 'items');
        return data as Interest[];
      } else if (data && typeof data === 'object' && Array.isArray(data.interests)) {
        console.log('✅ [FALLBACK 2] Found interests array with', data.interests.length, 'items');
        return data.interests as Interest[];
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        console.log('✅ [FALLBACK 3] Found data array with', data.data.length, 'items');
        return data.data as Interest[];
      } else {
        console.error('❌ [NO FALLBACK MATCHED] Returning empty array');
        return [] as Interest[];
      }
    } catch (error: any) {
      console.error('❌ [API ERROR] getInterests failed with full context:', {
        error: error,
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  checkUsername: async (username: string): Promise<CheckUsernameResponse> => {
    try {
      console.log('🚀 [CHECK USERNAME] Starting API call with AUTH TOKEN for:', username);
      
      // Verify we have tokens before making the call
      const cognitoTokens = await retrieveCognitoTokens();
      console.log('🔐 [CHECK USERNAME - TOKEN CHECK]:', {
        hasTokens: !!cognitoTokens,
        hasAccessToken: !!cognitoTokens?.access_token,
        tokenPreview: cognitoTokens?.access_token?.substring(0, 50) + '...' || 'none'
      });
      
      // Use axios instance which automatically adds auth token via interceptor
      const response = await axiosInstance.post('/users/check-username', { username });
      console.log('✅ [CHECK USERNAME] Success with token:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [CHECK USERNAME ERROR] Full details:', {
        error,
        message: error?.message,
        status: error?.response?.status,
        responseData: error?.response?.data,
        username,
        note: 'This API requires authentication token'
      });
      throw error;
    }
  },
};