import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, UpdateProfilePayload } from '@/libs/services/user.service';
import { QUERY_KEYS } from '@/libs/constants/query-keys';

export function useUserProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.user.profile,
    queryFn: userService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userService.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.user.profile, data);
      console.log('Profile updated successfully');
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });
}

export function useCheckUsername() {
  return useMutation({
    mutationFn: ({ username, token }: { username: string; token: string }) =>
      userService.checkUsernameAvailability(username, token),
    onError: (error) => {
      console.error('Username check failed:', error);
    },
  });
}
