import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/libs/config/env';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Log the full request URL for debugging
    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`API Request: ${config.method?.toUpperCase()} ${fullUrl}`);

    // Only set Authorization header if one isn't already provided
    const token = await SecureStore.getItemAsync('__clerk_client_jwt');
    console.log('Auth token retrieved from SecureStore:', token);

    if (!config.headers.Authorization) {
      try {
        // Clerk stores the JWT token in secure store
        console.log('Retrieved token from SecureStore:', token ? 'Exists' : 'Not found');

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized - token may be expired');
    }
    return Promise.reject(error);
  }
);
