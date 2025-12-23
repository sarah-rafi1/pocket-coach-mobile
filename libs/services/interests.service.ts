import { apiClient } from '@/libs/config/api-client.config';
import { Interest } from '@/libs/interfaces/user.types';

export const interestsService = {
  getInterests: async (): Promise<Interest[]> => {
    const response = await apiClient.get('/interests');
    return response.data.data;
  },
};
