import { apiClient } from '@/libs/config/api-client.config';
import { Interest } from '@/libs/interfaces/user.types';
import { API_ROUTES } from '@/libs/constants/api-routes';

export const interestsService = {
  getInterests: async (): Promise<Interest[]> => {
    const response = await apiClient.get(API_ROUTES.INTERESTS);
    return response.data.data;
  },
};
