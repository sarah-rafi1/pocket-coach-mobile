import axios from 'axios';
import {
  removeTokenSecurely,
  retrieveTokenSecurely,
  storeTokenSecurely,
  retrieveCognitoTokens,
} from '../../utils';

const axiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://18.232.64.216:3000',
  timeout: 20000,
});

const refreshAccessToken = async () => {
  try {
    const cognitoTokens = await retrieveCognitoTokens();
    
    if (!cognitoTokens?.refresh_token) {
      console.log('⚠️ [NO REFRESH TOKEN] => Trying regular tokens...');
      const tokens = await retrieveTokenSecurely();
      if (!tokens) {
        throw new Error('No refresh token available');
      }
      const { accessToken, refreshToken } = tokens;
      const response = await axios.post(
        `${axiosInstance.defaults.baseURL}/token/refresh`,
        {
          refreshToken: refreshToken,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      console.log('Refresh Token Response -> ', response.data);

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
      await storeTokenSecurely({ accessToken: newAccessToken, refreshToken: newRefreshToken });
      return newAccessToken;
    }
    
    // Use Cognito refresh token
    console.log('🔄 [REFRESHING] => Using Cognito refresh token');
    // Note: Cognito token refresh should be handled by Cognito SDK
    // For now, we'll throw to indicate refresh needed
    throw new Error('Cognito token expired - need to re-authenticate');
  } catch (error) {
    console.error('Failed to refresh token');
    throw error;
  }
};

// Interceptor to attach the token to each request
axiosInstance.interceptors.request.use(
  async config => {
    console.log('🚀 [API CALL] =>', config.method?.toUpperCase(), config.url);
    console.log('📦 [REQUEST DETAILS] =>', {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL}${config.url}`,
      baseURL: config.baseURL,
      envApiBaseUrl: process.env.API_BASE_URL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...config.headers
      },
      body: config.data,
      timestamp: new Date().toISOString()
    });
    
    // First try Cognito tokens (current auth system)
    const cognitoTokens = await retrieveCognitoTokens();
    if (cognitoTokens?.access_token) {
      config.headers['Authorization'] = `Bearer ${cognitoTokens.access_token}`;
      console.log('🔐 [AUTH - USING COGNITO TOKEN] =>', {
        token: cognitoTokens.access_token,
        token_length: cognitoTokens.access_token.length,
        token_preview: `${cognitoTokens.access_token.substring(0, 50)}...`,
        expires_at: cognitoTokens.expires_at ? new Date(cognitoTokens.expires_at).toISOString() : 'unknown',
        timestamp: new Date().toISOString()
      });
      return config;
    }
    
    // Fallback to regular tokens if no Cognito tokens
    const tokens = await retrieveTokenSecurely();
    if (tokens?.accessToken) {
      config.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      console.log('🔐 [AUTH - USING REGULAR TOKEN] =>', {
        token: tokens.accessToken,
        token_length: tokens.accessToken.length,
        token_preview: `${tokens.accessToken.substring(0, 50)}...`,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('⚠️ [NO TOKEN] => No authentication token found');
    }
    
    return config;
  },
  error => {
    console.error('❌ [REQUEST ERROR] =>', error);
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  response => {
    console.log('📡 [API RESPONSE] =>', {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      timestamp: new Date().toISOString()
    });
    return response;
  },
  error => {
    const genericMessage = 'Something went wrong.';
    
    const errorData = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
      timestamp: new Date().toISOString()
    };
    
    console.log('❌ [API ERROR] =>', errorData);

    console.error('[INTERCEPTOR - ERROR] => ', {
      message: error.message,
      code: error.code,
      response: error.response?.data?.message || error
    });

    // Network error (no response from server)
    if (error.message === 'Network Error') {
      error.userMessage = genericMessage;
      return Promise.reject(error);
    }

    // Timeout or no response
    if (error.code === 'ECONNABORTED' || !error.response) {
      error.userMessage = genericMessage;
      return Promise.reject(error);
    }

    // HTML response from server (like 404 HTML page)
    if (
      typeof error.response.data === 'string' &&
      error.response.data.startsWith('<')
    ) {
      error.userMessage = genericMessage;
      return Promise.reject(error);
    }

    // Try to extract meaningful backend error message
    const backendMessage = error.response?.data?.message;

    if (typeof backendMessage === 'string') {
      error.userMessage = backendMessage;
    } else {
      error.userMessage = genericMessage;
    }

    return Promise.reject(error);
  }
);
export default axiosInstance;
