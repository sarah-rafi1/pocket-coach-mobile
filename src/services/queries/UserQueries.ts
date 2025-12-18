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
  return useQuery({
    queryKey: ['interests'],
    queryFn: async () => {
      try {
        const interests = await userApi.getInterests();
        // Ensure we always return an array, even if the API fails
        return Array.isArray(interests) ? interests : [];
      } catch (error) {
        console.error('Interests fetch failed:', error);
        // Return empty array instead of throwing to prevent component crashes
        return [];
      }
    },
    retry: 2, // Retry up to 2 times for interests
    staleTime: 10 * 60 * 1000, // Consider interests data fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    // Provide default data to prevent undefined issues
    initialData: [],
  });
};

export const useCheckUsernameQuery = (username: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['checkUsername', username],
    queryFn: async () => {
      if (!username || username.length < 3) {
        return { 
          success: true, 
          timestamp: new Date().toISOString(),
          data: { available: true, message: '' }
        };
      }
      return await userApi.checkUsername(username);
    },
    enabled: enabled && !!username && username.length >= 3, // Only run if username is at least 3 chars
    retry: 1, // Only retry once for username checks
    staleTime: 30 * 1000, // Consider username data fresh for 30 seconds
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });
};