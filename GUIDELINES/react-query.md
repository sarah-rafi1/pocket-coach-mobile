# React Query Patterns

Best practices for data fetching, mutations, and caching with TanStack Query (React Query).

## Overview

We use **TanStack Query v5** (React Query) for all server state management. It provides:
- Automatic caching and background updates
- Loading/error states
- Request deduplication
- Optimistic updates
- **Built-in error handling** (our "asyncHandler")

---

## Query Configuration

### Default Configuration

Located in `libs/config/query-client.config.ts`:

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      retry: 1,                   // Retry failed requests once
      refetchOnWindowFocus: true, // Refetch when window regains focus
    },
  },
});
```

### Basic Query Pattern

```typescript
// libs/queries/user.query.ts
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/libs/services/user.service';
import { QUERY_KEYS } from '@/libs/constants/query-keys';
import { handleApiError } from '@/libs/utils/handleApiError';

export function useUserProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.user.profile,
    queryFn: userService.getProfile,
    onError: (error) => handleApiError(error, 'Fetch Profile'),
  });
}
```

### Custom Query Configuration

```typescript
export function useInterests() {
  return useQuery({
    queryKey: QUERY_KEYS.interests.all,
    queryFn: interestsService.getInterests,
    staleTime: 10 * 60 * 1000,  // 10 minutes (longer for static data)
    retry: 2,                    // Retry twice
    onError: (error) => handleApiError(error, 'Fetch Interests'),
  });
}
```

---

## Mutation Patterns

### Basic Mutation

```typescript
export function useCreateUser() {
  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      showToast('success', 'User Created', 'Welcome!');
    },
    onError: (error) => handleApiError(error, 'Create User'),
  });
}
```

### Mutation with Cache Invalidation

```typescript
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.profile });
      showToast('success', 'Profile Updated');
    },
    onError: (error) => handleApiError(error, 'Update Profile'),
  });
}
```

### Mutation with Optimistic Updates

For instant UI updates before server confirms:

```typescript
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      isLiked ? feedService.unlikePost(postId) : feedService.likePost(postId),

    // Before mutation runs
    onMutate: async ({ postId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.feed.all });

      // Snapshot current data for rollback
      const previousData = queryClient.getQueriesData({
        queryKey: QUERY_KEYS.feed.all
      });

      // Optimistically update UI
      queryClient.setQueriesData<InfiniteData<GetFeedResponse>>(
        { predicate: (query) => query.queryKey[0] === 'feed' },
        (oldData) => {
          if (!oldData?.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      isLikedByCurrentUser: !post.isLikedByCurrentUser,
                      likesCount: post.isLikedByCurrentUser
                        ? post.likesCount - 1
                        : post.likesCount + 1,
                    }
                  : post
              ),
            })),
          };
        }
      );

      // Return context for rollback
      return { previousData };
    },

    // If mutation fails, rollback
    onError: (error, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      handleApiError(error, 'Like Post');
    },

    // After mutation settles (success or error)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feed.all });
    },
  });
}
```

---

## Infinite Queries (Pagination)

For paginated lists (feeds, search results, etc.):

```typescript
export function useFeed() {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.feed.posts,
    queryFn: ({ pageParam }) =>
      feedService.getPosts({ cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    onError: (error) => handleApiError(error, 'Fetch Feed'),
  });
}

// In component:
function FeedScreen() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed();

  const posts = data?.pages.flatMap(page => page.posts) || [];

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <Post item={item} />}
      onEndReached={() => hasNextPage && fetchNextPage()}
      ListFooterComponent={
        isFetchingNextPage ? <Loading /> : null
      }
    />
  );
}
```

---

## Query Keys

### Centralized in `libs/constants/query-keys.ts`

```typescript
export const QUERY_KEYS = {
  user: {
    all: ['user'] as const,
    profile: ['user', 'profile'] as const,
    settings: ['user', 'settings'] as const,
  },
  feed: {
    all: ['feed'] as const,
    posts: ['feed', 'posts'] as const,
    post: (id: string) => ['feed', 'post', id] as const,
  },
  interests: {
    all: ['interests'] as const,
  },
} as const;
```

**Usage:**
```typescript
// Query
queryKey: QUERY_KEYS.user.profile

// Invalidate all user queries
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.all });

// Invalidate specific post
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feed.post('123') });
```

---

## Error Handling

### Use Central handleApiError

**✅ ALWAYS use `handleApiError()` in `onError`:**

```typescript
export function useMyQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.data.all,
    queryFn: dataService.fetchAll,
    onError: (error) => handleApiError(error, 'Fetch Data'), // ← Required!
  });
}

export function useMyMutation() {
  return useMutation({
    mutationFn: dataService.create,
    onError: (error) => handleApiError(error, 'Create Data'), // ← Required!
  });
}
```

### Custom Error Handling (When Needed)

```typescript
export function useDeleteAccount() {
  return useMutation({
    mutationFn: userService.deleteAccount,
    onError: (error) => {
      const { code } = formatApiError(error);

      // Custom handling for specific case
      if (code === '403') {
        showToast(
          'error',
          'Cannot Delete',
          'You must cancel subscriptions first'
        );
        return;
      }

      // Otherwise use central handler
      handleApiError(error, 'Delete Account');
    },
  });
}
```

---

## Loading States

### Query Loading

```typescript
function ProfileScreen() {
  const { data: user, isLoading, isError } = useUserProfile();

  if (isLoading) return <Loading />;
  if (isError) return <Error />;
  if (!user) return <NotFound />;

  return <ProfileView user={user} />;
}
```

### Mutation Loading

```typescript
function UpdateButton() {
  const mutation = useUpdateProfile();

  return (
    <Button
      onPress={() => mutation.mutate(data)}
      loading={mutation.isPending}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Saving...' : 'Save'}
    </Button>
  );
}
```

---

## Cache Management

### Manual Cache Updates

```typescript
// Update cache after mutation
queryClient.setQueryData(
  QUERY_KEYS.user.profile,
  (oldData) => ({ ...oldData, ...newData })
);

// Read from cache
const cachedUser = queryClient.getQueryData(QUERY_KEYS.user.profile);

// Invalidate (triggers refetch)
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.all });

// Remove from cache
queryClient.removeQueries({ queryKey: QUERY_KEYS.user.profile });
```

### Prefetching

```typescript
// Prefetch data before user needs it
await queryClient.prefetchQuery({
  queryKey: QUERY_KEYS.user.settings,
  queryFn: userService.getSettings,
});
```

---

## Retry Configuration

### Global Retry

```typescript
// In query-client.config.ts
{
  queries: {
    retry: 1, // Retry once
  },
}
```

### Custom Retry Logic

```typescript
export function useFetchData() {
  return useQuery({
    queryKey: QUERY_KEYS.data.all,
    queryFn: dataService.fetchAll,
    retry: (failureCount, error) => {
      // Don't retry on 404
      if (error.response?.status === 404) return false;

      // Don't retry on network errors
      if (!navigator.onLine) return false;

      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
```

---

## Background Refetching

### On Window Focus

```typescript
// Enabled by default
refetchOnWindowFocus: true

// Disable for specific query
export function useStaticData() {
  return useQuery({
    queryKey: QUERY_KEYS.static.data,
    queryFn: staticService.getData,
    refetchOnWindowFocus: false, // Data never changes
  });
}
```

### Polling (Auto-refresh)

```typescript
export function useLiveData() {
  return useQuery({
    queryKey: QUERY_KEYS.live.data,
    queryFn: liveService.getData,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}
```

---

## Query Organization

### One File Per Feature

```typescript
// libs/queries/feed.query.ts (~400 lines)
// ALL feed-related queries and mutations in ONE file

export function useFeed() { /* ... */ }
export function useLikePost() { /* ... */ }
export function useSavePost() { /* ... */ }
export function useFollowCreator() { /* ... */ }
export function useSharePost() { /* ... */ }
```

**Reference:** See `libs/queries/auth.query.ts` and `libs/queries/community.query.ts`

---

## Summary

### Query Basics:
- Use `useQuery` for GET requests
- Use `useMutation` for POST/PUT/DELETE
- Use `useInfiniteQuery` for pagination
- Centralize query keys in `QUERY_KEYS`

### Error Handling:
✅ ALWAYS use `handleApiError()` in `onError`
✅ Add context string for debugging
✅ Custom handling only when necessary

### Cache Management:
- Invalidate queries after mutations
- Use optimistic updates for instant UI
- Prefetch for better UX
- Control refetch behavior

### Organization:
- One query file per feature (all queries/mutations together)
- Group related queries with shared keys
- Export hooks, not raw functions

### Best Practices:
✅ Use query keys from constants
✅ Handle loading and error states
✅ Invalidate queries after mutations
✅ Use optimistic updates for likes/favorites
✅ Configure retry logic per query needs
✅ Keep query files comprehensive (~400 lines OK)

---

**See also:**
- [API Patterns](./api-patterns.md) - Service layer, no try-catch
- [Error Handling](./error-handling.md) - handleApiError utility
- **libs/config/query-client.config.ts** - Default configuration
- **libs/constants/query-keys.ts** - Query key definitions
- **feedReel.md:270-334** - Optimistic update pattern
