import { useQuery } from "@tanstack/react-query";
import { authApi } from "../apis/AuthApis";
import { userApi } from "../apis/UserApis";
import { useAuthStore, useApiStore } from "../../store";

// Query keys for cache management
export const userQueryKeys = {
  all: ['user'] as const,
  profile: () => [...userQueryKeys.all, 'profile'] as const,
  details: (id: string) => [...userQueryKeys.all, 'details', id] as const,
};

export const useGetUserProfileQuery = (options = {}) => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: userQueryKeys.profile(),
    queryFn: () => authApi.getProfile(),
    enabled: !!user, // only run if user is authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

export const useUserProfileQuery = (accessToken: string | null, enabled: boolean = true) => {
  const { setLoading, setError } = useApiStore();

  return useQuery({
    queryKey: ['userProfile', accessToken],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('Access token is required');
      }
      return userApi.getUserProfile(accessToken);
    },
    enabled: enabled && !!accessToken,
    onError: (error: any) => {
      console.error('User profile fetch failed:', error);
      const message = error?.message || 'Failed to fetch user profile.';
      setError(message);
    },
    retry: false, // Don't retry on user profile failures
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};

export const useInterestsQuery = () => {
  const { setLoading, setError } = useApiStore();

  return useQuery({
    queryKey: ['interests'],
    queryFn: () => userApi.getInterests(),
    onError: (error: any) => {
      console.error('Interests fetch failed:', error);
      const message = error?.message || 'Failed to fetch interests.';
      setError(message);
    },
    retry: 2, // Retry up to 2 times for interests
    staleTime: 10 * 60 * 1000, // Consider interests data fresh for 10 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
};