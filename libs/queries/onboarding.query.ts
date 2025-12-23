import { useMutation } from '@tanstack/react-query';
import { onboardingService } from '@/libs/services/onboarding.service';
import { OnboardingPayload } from '@/libs/interfaces/onboarding.types';

export function useOnboardingMutation() {
  return useMutation({
    mutationFn: ({ payload, accessToken }: { payload: OnboardingPayload; accessToken: string }) =>
      onboardingService.completeOnboarding(payload, accessToken),
    onError: (error: any) => {
      console.error('Onboarding failed:', error);
    },
  });
}
