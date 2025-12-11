import { useMutation } from "@tanstack/react-query";
import { onboardingApi, OnboardingPayload } from "../apis/OnboardingApis";
import { useApiStore } from "../../store";

export const useOnboardingMutation = () => {
  const { setLoading, setError } = useApiStore();

  return useMutation({
    mutationFn: ({ payload, accessToken }: { payload: OnboardingPayload; accessToken: string }) => 
      onboardingApi.completeOnboarding(payload, accessToken),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onError: (error: any) => {
      console.error('Onboarding failed:', error);
      const message = error?.message || 'Failed to complete onboarding. Please try again.';
      setError(message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};