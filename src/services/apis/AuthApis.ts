import { api } from '../../lib/api';
import { User } from '../../types';

// Auth API interfaces
export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

// Auth API functions
export const authApi = {
  login: async (payload: LoginPayload) => {
    console.log(`[INIT] => /api/auth/login`);
    const response = await api.post<AuthResponse>('/api/auth/login', payload);
    console.log(`[OK] => /api/auth/login`);
    return response.data;
  },

  signUp: async (payload: SignUpPayload) => {
    console.log(`[INIT] => /api/auth/signup`);
    const response = await api.post<AuthResponse>('/api/auth/signup', payload);
    console.log(`[OK] => /api/auth/signup`);
    return response.data;
  },

  logout: async () => {
    console.log(`[INIT] => /api/auth/logout`);
    const response = await api.post('/api/auth/logout');
    console.log(`[OK] => /api/auth/logout`);
    return response.data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload) => {
    console.log(`[INIT] => /api/auth/forgot-password`);
    const response = await api.post('/api/auth/forgot-password', payload);
    console.log(`[OK] => /api/auth/forgot-password`);
    return response.data;
  },

  resetPassword: async (payload: ResetPasswordPayload) => {
    console.log(`[INIT] => /api/auth/reset-password`);
    const response = await api.post('/api/auth/reset-password', payload);
    console.log(`[OK] => /api/auth/reset-password`);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    console.log(`[INIT] => /api/auth/refresh`);
    const response = await api.post<AuthResponse>('/api/auth/refresh', { refreshToken });
    console.log(`[OK] => /api/auth/refresh`);
    return response.data;
  },

  getProfile: async () => {
    console.log(`[INIT] => /api/auth/profile`);
    const response = await api.get<User>('/api/auth/profile');
    console.log(`[OK] => /api/auth/profile`);
    return response.data;
  },
};