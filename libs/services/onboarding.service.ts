import { apiClient } from '@/libs/config/api-client.config';
import { API_ROUTES } from '@/libs/constants/api-routes';
import { OnboardingPayload, OnboardingResponse } from '@/libs/interfaces/onboarding.types';

export const onboardingService = {
  completeOnboarding: async (
    payload: OnboardingPayload,
    accessToken: string
  ): Promise<OnboardingResponse> => {
    if (!payload) {
      throw new Error('Onboarding payload is required');
    }

    if (!accessToken || typeof accessToken !== 'string' || accessToken.trim() === '') {
      throw new Error('Valid access token is required');
    }

    const formData = new FormData();

    if (typeof payload.username === 'string' && payload.username.trim() !== '') {
      formData.append('username', payload.username);
    } else {
      throw new Error('Username is required');
    }

    if (typeof payload.display_name === 'string' && payload.display_name.trim() !== '') {
      formData.append('display_name', payload.display_name);
    } else {
      throw new Error('Display name is required');
    }

    if (payload.bio && typeof payload.bio === 'string' && payload.bio.trim() !== '') {
      formData.append('bio', payload.bio);
    }

    const validInterestSlugs = Array.isArray(payload.interest_slugs)
      ? payload.interest_slugs.filter(slug => slug != null && slug !== '')
      : [];

    if (validInterestSlugs.length > 0) {
      validInterestSlugs.forEach((slug, index) => {
        if (typeof slug === 'string') {
          formData.append(`interest_slugs[${index}]`, slug);
        }
      });
    }

    if (payload.profile_image && typeof payload.profile_image === 'string' && payload.profile_image.trim() !== '') {
      const fileExtension = payload.profile_image.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

      const fileInfo = {
        uri: payload.profile_image,
        type: mimeType,
        name: `profile.${fileExtension}`
      };

      formData.append('profile_image', fileInfo as any);
    }

    console.log('Sending onboarding request with token:', accessToken ? 'Token exists (length: ' + accessToken.length + ')' : 'No token');

    const response = await apiClient.post(API_ROUTES.USER.ONBOARDING, formData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Onboarding response status:', response.status);
    return response.data;
  },
};
