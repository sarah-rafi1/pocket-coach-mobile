import { api } from '../../lib/api';
import { API_BASE_URL } from '../../config/env';

// User API interfaces
export interface UserProfile {
  id: string;
  username?: string;
  display_name?: string;
  email: string;
  email_verified?: boolean;
  bio?: string;
  interest_slugs?: string[];
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

// Interest API interfaces
export interface Interest {
  label: string;
  value: string;
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

    const response_data = await response.json();
    console.log('✅ [API SUCCESS] => GET /users/me', {
      responseData: response_data,
      timestamp: new Date().toISOString()
    });
    return response_data.data as UserProfile;
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

    const response_data = await response.json();
    console.log('✅ [API SUCCESS] => GET /interests', {
      responseData: response_data,
      interestCount: Array.isArray(response_data.data) ? response_data.data.length : 'unknown',
      timestamp: new Date().toISOString()
    });
    return response_data.data as Interest[];
  },
};