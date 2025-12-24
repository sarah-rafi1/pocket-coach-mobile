import { apiClient } from '@/libs/config/api-client.config';
import { API_ROUTES } from '@/libs/constants/api-routes';

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

export interface UsernameCheckResponse {
  data: {
    available: boolean;
  };
  success: boolean;
  timestamp: string;
}

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get(API_ROUTES.USER.PROFILE);
    return response.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const response = await apiClient.put(API_ROUTES.USER.UPDATE_PROFILE, payload);
    return response.data;
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete(API_ROUTES.USER.DELETE_ACCOUNT);
  },

  checkUsernameAvailability: async (
    username: string,
    accessToken: string
  ): Promise<UsernameCheckResponse> => {
    const response = await apiClient.post(
      API_ROUTES.USER.CHECK_USERNAME,
      { username },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  },
};
