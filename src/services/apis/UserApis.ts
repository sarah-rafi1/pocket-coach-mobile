import { API_BASE_URL } from '../../config/env';

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
  label: string;
  value: string;
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
  getUserProfile: async (accessToken: string) => {
    console.log('🚀 [API CALL] => GET /users/me');
    console.log('📦 [REQUEST DETAILS] =>', {
      url: `${API_BASE_URL}/users/me`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.substring(0, 20)}...`,
        'Accept': 'application/json',
      },
      timestamp: new Date().toISOString()
    });
    
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
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
    console.log('✅ [API SUCCESS] => GET /users/me', {
      responseData: data,
      timestamp: new Date().toISOString()
    });
    return data as UserProfile;
  },

  sendVerificationCode: async (email: string, accessToken?: string) => {
    console.log('🚀 [API CALL] => POST /auth/send-verification-code');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken.substring(0, 20)}...`;
    }

    console.log('📦 [REQUEST PAYLOAD] =>', {
      url: `${API_BASE_URL}/auth/send-verification-code`,
      method: 'POST',
      headers: headers,
      payload: { email },
      timestamp: new Date().toISOString()
    });

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (accessToken) {
      requestHeaders['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/auth/send-verification-code`, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({ email }),
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
    console.log('✅ [API SUCCESS] => POST /auth/send-verification-code', {
      responseData: data,
      timestamp: new Date().toISOString()
    });
    return data;
  },

  getInterests: async () => {
    console.log('🚀 [API CALL] => GET /interests');
    console.log('📦 [REQUEST DETAILS] =>', {
      url: `${API_BASE_URL}/interests`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      timestamp: new Date().toISOString()
    });
    
    try {
      const response = await fetch(`${API_BASE_URL}/interests`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
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

    const apiResponse: InterestsApiResponse = await response.json();
    console.log('✅ [API SUCCESS] => GET /interests', {
      responseData: apiResponse,
      success: apiResponse.success,
      interestCount: Array.isArray(apiResponse.data) ? apiResponse.data.length : 'unknown',
      timestamp: new Date().toISOString()
    });
    
    // Handle the expected API response structure
    if (apiResponse && apiResponse.success && Array.isArray(apiResponse.data)) {
      return apiResponse.data as Interest[];
    }
    
    // Fallback handling for different response structures
    const data = apiResponse as any;
    if (Array.isArray(data)) {
      return data as Interest[];
    } else if (data && typeof data === 'object' && Array.isArray(data.interests)) {
      return data.interests as Interest[];
    } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
      return data.data as Interest[];
    } else {
      console.warn('⚠️ [API WARNING] => getInterests returned unexpected structure:', apiResponse);
      return [] as Interest[];
    }
    } catch (error) {
      console.error('❌ [API ERROR] => getInterests failed:', error);
      throw error;
    }
  },

  checkUsername: async (username: string): Promise<CheckUsernameResponse> => {
    console.log('🚀 [API CALL] => POST /users/check-username');
    console.log('📦 [REQUEST DETAILS] =>', {
      url: `${API_BASE_URL}/users/check-username`,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: { username },
      timestamp: new Date().toISOString()
    });

    try {
      const response = await fetch(`${API_BASE_URL}/users/check-username`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
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

      const apiResponse: CheckUsernameResponse = await response.json();
      console.log('✅ [API SUCCESS] => POST /users/check-username', {
        responseData: apiResponse,
        available: apiResponse.data.available,
        timestamp: new Date().toISOString()
      });

      return apiResponse;
    } catch (error) {
      console.error('❌ [API ERROR] => checkUsername failed:', error);
      throw error;
    }
  },
};