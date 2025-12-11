import { useQueryClient } from '@tanstack/react-query';
import { userQueryKeys } from '../services/queries/UserQueries';

/**
 * Custom hook for common React Query operations
 * Provides utilities for cache invalidation and management
 */
export const useQueryUtils = () => {
  const queryClient = useQueryClient();

  return {
    // Invalidate all user queries
    invalidateUserQueries: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },

    // Invalidate user profile query specifically
    invalidateUserProfile: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
    },

    // Clear all cached data
    clearAllQueries: () => {
      queryClient.clear();
    },

    // Remove specific query from cache
    removeQuery: (queryKey: unknown[]) => {
      queryClient.removeQueries({ queryKey });
    },

    // Set query data manually (useful for optimistic updates)
    setQueryData: <T>(queryKey: unknown[], data: T) => {
      queryClient.setQueryData(queryKey, data);
    },

    // Get cached query data
    getQueryData: <T>(queryKey: unknown[]): T | undefined => {
      return queryClient.getQueryData(queryKey);
    },
  };
};

/**
 * Query key factory for consistent cache key management
 * Extend this as you add more API endpoints
 */
export const queryKeys = {
  user: userQueryKeys,
  // Add more query key factories here as needed
  // posts: postQueryKeys,
  // comments: commentQueryKeys,
};

/**
 * Common query options that can be reused across queries
 */
export const commonQueryOptions = {
  // For data that changes frequently
  fastRefresh: {
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 2, // 2 minutes
  },
  
  // For data that changes rarely
  slowRefresh: {
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  },
  
  // For critical data that should always be fresh
  alwaysFresh: {
    staleTime: 0,
    gcTime: 1000 * 60 * 5, // 5 minutes
  },
  
  // For background data that can be stale
  background: {
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  },
};