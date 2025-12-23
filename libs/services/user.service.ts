import { apiClient } from '@/libs/config/api-client.config';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  profileImage?: string;
  interests?: string[];
}

export interface UpdateProfilePayload {
  username?: string;
  displayName?: string;
  bio?: string;
  profileImage?: string;
}

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const response = await apiClient.put('/user/profile', payload);
    return response.data;
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/user/account');
  },
};
