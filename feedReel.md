# Instagram Reel-Style Vertical Feed Implementation Plan

## Overview
Create a TikTok/Instagram Reels-style vertical scrolling feed with full-screen posts, replacing the current Home tab. Includes 5-tab bottom navigation (Feed, Groups, Create, Chat, Profile) with dummy screens for non-Feed tabs.

## User Decisions
- ✅ Feed replaces current Home tab (not separate)
- ✅ Use online video URLs (Pexels/Pixabay - not dummy images)
- ✅ Mock data in service layer
- ✅ Create button navigates to dummy screen
- ✅ Focus on feed/scroll functionality (NO comments implementation)

## Architecture Pattern

Following existing codebase pattern (community feature):
- **Single component files** (no container/view splits)
- **One comprehensive query file** (all mutations in feed.query.ts)
- **Custom hooks** for complex reusable logic
- **Parent orchestration** via hooks and callbacks
- **Child components** receive callbacks as props

## Folder Structure

### New Files to Create (~15 files)
```
app/(app)/(tabs)/                  # NEW: Tabs subfolder
├── _layout.tsx                    # Tab navigator configuration (5 tabs)
├── index.tsx                      # Feed screen - orchestrates with hooks
├── groups.tsx                     # Groups tab (dummy)
├── create.tsx                     # Create tab (dummy)
├── chat.tsx                       # Chat tab (dummy)
└── profile.tsx                    # Profile tab (moved from app/(app)/)

components/feed/
├── FeedList.tsx                   # List with pagination & viewability logic
├── FeedPost.tsx                   # Post with all interactions
├── FeedVideo.tsx                  # Video player with expo-av
├── FeedCaption.tsx                # Caption with read more/less
├── FeedTopBar.tsx                 # Top bar (logo, saved, search)
├── LikeButton.tsx                 # Like button with animation
├── SaveButton.tsx                 # Save button with animation
├── FollowButton.tsx               # Follow button
├── ShareButton.tsx                # Share button
├── CommentButton.tsx              # Comment button (UI only)
└── index.ts                       # Barrel export

libs/services/
└── feed.service.ts                # Feed API service with mock Pexels/Pixabay URLs

libs/queries/
└── feed.query.ts                  # ALL feed queries/mutations (like community.query.ts)
                                   # - useFeed() infinite query
                                   # - useLikePost() mutation
                                   # - useSavePost() mutation
                                   # - useFollowCreator() mutation

libs/interfaces/
└── feed.types.ts                  # Feed post, video, creator types

libs/stores/
└── feed.store.ts                  # Feed interaction state (likes, saves, follows)

libs/hooks/
├── use-video-player.ts            # Video player hook (play/pause/mute logic)
└── use-feed-viewability.ts        # Viewability tracking hook
```

### Files to Modify (3 files)
```
libs/constants/
├── api-routes.ts                  # Add: FEED routes
└── query-keys.ts                  # Add: feed query keys

components/index.ts                # Add: feed component exports
```

**Total: ~15 new files + 3 modified = ~18 files**

## Implementation Sequence

### Phase 1: Foundation - Types & Constants (3 files)
1. **libs/constants/api-routes.ts** - Add FEED routes
2. **libs/constants/query-keys.ts** - Add feed query keys
3. **libs/interfaces/feed.types.ts** - Feed post, video, creator types

### Phase 2: Services & State (2 files)
4. **libs/services/feed.service.ts** - Feed API with Pexels/Pixabay video URLs
5. **libs/stores/feed.store.ts** - Feed interactions (Set-based: likes, saves, follows)

### Phase 3: Query Hooks (1 file)
6. **libs/queries/feed.query.ts** - ALL feed queries/mutations (~400 lines)
   - `useFeed()` - infinite query with cursor pagination
   - `useLikePost()` - mutation with optimistic updates
   - `useSavePost()` - mutation with optimistic updates
   - `useFollowCreator()` - mutation with optimistic updates

### Phase 4: Custom Hooks (2 files)
7. **libs/hooks/use-video-player.ts** - Video player hook (play/pause/mute, autoplay)
8. **libs/hooks/use-feed-viewability.ts** - Viewability tracking hook

### Phase 5: Simple Feed Components (5 files)
9. **components/feed/FeedTopBar.tsx** - Top bar (~80 lines)
10. **components/feed/FeedCaption.tsx** - Caption (~70 lines)
11. **components/feed/ShareButton.tsx** - Share (~50 lines)
12. **components/feed/CommentButton.tsx** - Comment (~50 lines)
13. **components/feed/FeedVideo.tsx** - Video player (~120 lines)

### Phase 6: Interaction Buttons (3 files)
14. **components/feed/LikeButton.tsx** - Like with animation (~100 lines)
15. **components/feed/SaveButton.tsx** - Save with animation (~100 lines)
16. **components/feed/FollowButton.tsx** - Follow (~80 lines)

### Phase 7: Complex Feed Components (2 files)
17. **components/feed/FeedList.tsx** - List with pagination & viewability (~150 lines)
18. **components/feed/FeedPost.tsx** - Post orchestrator (~200 lines)

### Phase 8: Tab Structure (6 files)
19. **app/(app)/(tabs)/_layout.tsx** - Tab navigator with 5 tabs
20. **app/(app)/(tabs)/index.tsx** - Feed screen (orchestrates with hooks ~150 lines)
21. **app/(app)/(tabs)/groups.tsx** - Dummy screen
22. **app/(app)/(tabs)/create.tsx** - Dummy screen
23. **app/(app)/(tabs)/chat.tsx** - Dummy screen
24. Move **app/(app)/profile.tsx** → **app/(app)/(tabs)/profile.tsx**

### Phase 9: Final Exports (1 file)
25. **components/feed/index.ts** - Barrel export
26. Update **components/index.ts** - Add feed component exports

**Total: ~15 new files + 3 modified = ~18 files**

## Technical Architecture

### Component Pattern (Following community.query.ts)

**Parent Orchestration (index.tsx - Feed Screen):**
```typescript
export default function FeedScreen() {
  const { data, fetchNextPage, hasNextPage } = useFeed();
  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: followCreator } = useFollowCreator();

  const handleLike = (postId: string, isLiked: boolean) => {
    likePost({ postId, isLiked });
  };

  const handleSave = (postId: string, isSaved: boolean) => {
    savePost({ postId, isSaved });
  };

  const handleFollow = (creatorId: string, isFollowing: boolean) => {
    followCreator({ creatorId, isFollowing });
  };

  const handleShare = async (post: FeedPost) => {
    await Share.share({ message: post.caption });
  };

  return (
    <FeedList
      posts={posts}
      onLike={handleLike}
      onSave={handleSave}
      onFollow={handleFollow}
      onShare={handleShare}
      onLoadMore={fetchNextPage}
      hasMore={hasNextPage}
    />
  );
}
```

**FeedList Component:**
```typescript
export default function FeedList({
  posts, onLike, onSave, onFollow, onShare, onLoadMore
}: FeedListProps) {
  const { activeIndex, onViewableItemsChanged } = useFeedViewability();

  return (
    <FlatList
      data={posts}
      renderItem={({ item, index }) => (
        <FeedPost
          post={item}
          isActive={index === activeIndex}
          onLike={onLike}
          onSave={onSave}
          onFollow={onFollow}
          onShare={onShare}
        />
      )}
      onViewableItemsChanged={onViewableItemsChanged}
      onEndReached={onLoadMore}
      pagingEnabled
      showsVerticalScrollIndicator={false}
    />
  );
}
```

**FeedPost Component:**
```typescript
export default function FeedPost({
  post, isActive, onLike, onSave, onFollow, onShare
}: FeedPostProps) {
  const [captionExpanded, setCaptionExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <FeedVideo uri={post.videoUrl} isActive={isActive} />

      <View style={styles.overlay}>
        <FeedTopBar />

        <View style={styles.sidebar}>
          <LikeButton
            isLiked={post.isLikedByCurrentUser}
            count={post.likesCount}
            onPress={() => onLike(post.id, post.isLikedByCurrentUser)}
          />
          <SaveButton
            isSaved={post.isSavedByCurrentUser}
            count={post.savesCount}
            onPress={() => onSave(post.id, post.isSavedByCurrentUser)}
          />
          <FollowButton
            isFollowing={post.creator.isFollowing}
            onPress={() => onFollow(post.creator.id, post.creator.isFollowing)}
          />
          <ShareButton onPress={() => onShare(post)} />
          <CommentButton count={post.commentsCount} />
        </View>

        <FeedCaption
          text={post.caption}
          expanded={captionExpanded}
          onToggle={() => setCaptionExpanded(!captionExpanded)}
        />
      </View>
    </View>
  );
}
```

**Button Components (Receive Callbacks):**
```typescript
// LikeButton.tsx
export default function LikeButton({ isLiked, count, onPress }: LikeButtonProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  const handlePress = () => {
    setShowAnimation(true);
    onPress(); // Parent's callback
    setTimeout(() => setShowAnimation(false), 500);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      {isLiked ? <HeartFilled /> : <HeartOutline />}
      <Text>{count}</Text>
      {showAnimation && <HeartAnimation />}
    </TouchableOpacity>
  );
}
```

### Query File Pattern (Following community.query.ts)

**feed.query.ts (~400 lines - ALL queries/mutations):**
```typescript
// Infinite query
export function useFeed() {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.feed.posts,
    queryFn: ({ pageParam }) => feedService.getPosts({ cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
  });
}

// Like mutation with optimistic updates
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      isLiked ? feedService.unlikePost(postId) : feedService.likePost(postId),

    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.feed.all });

      const previousData = queryClient.getQueriesData({
        queryKey: QUERY_KEYS.feed.all
      });

      // Optimistic update (similar to community.query.ts pattern)
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

      return { previousData };
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });
}

// useSavePost() - similar pattern
// useFollowCreator() - similar pattern
```

### State Management Strategy

**React Query** (Server State):
- Feed data with `useInfiniteQuery`
- Cursor-based pagination
- 5-minute stale time
- Background refetch on focus
- Optimistic updates for mutations

**Zustand Store** (Client State):
```typescript
// libs/stores/feed.store.ts
interface FeedState {
  likedPosts: Set<string>;
  savedPosts: Set<string>;
  followedCreators: Set<string>;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  toggleFollow: (creatorId: string) => void;
}
```

**Local Component State**:
- Active post index (viewability)
- Video play/pause/mute state (per post)
- Caption expanded/collapsed (per post)
- Double-tap heart animation state

### Custom Hooks

**use-video-player.ts (~100 lines):**
```typescript
export function useVideoPlayer(isActive: boolean) {
  const videoRef = useRef<Video>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.playAsync();
      setIsPlaying(true);
    } else {
      videoRef.current?.pauseAsync();
      setIsPlaying(false);
    }
  }, [isActive]);

  const toggleMute = () => {
    videoRef.current?.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      videoRef.current?.pauseAsync();
    } else {
      videoRef.current?.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  return { videoRef, isMuted, isPlaying, toggleMute, togglePlayPause };
}
```

**use-feed-viewability.ts (~80 lines):**
```typescript
export function useFeedViewability() {
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  return { activeIndex, onViewableItemsChanged, viewabilityConfig };
}
```

## Video Sources & Mock Data Strategy

### Online Video URLs (Free Stock Videos)
Use free stock video platforms for realistic mock data:

**Primary Sources:**
1. **Pexels Videos** (pexels.com/videos) - Free HD videos, no attribution
   - Fitness/sports videos for coach content
   - Direct video URLs (e.g., `https://videos.pexels.com/video-files/.../free-video.mp4`)
2. **Pixabay Videos** (pixabay.com/videos) - Free stock videos
   - Workout, running, training content
3. **Coverr** (coverr.co) - Free video footage
   - Sports, fitness, lifestyle

**Sample Mock Video URLs:**
```typescript
const mockVideoUrls = [
  'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4',
  'https://videos.pexels.com/video-files/4752980/4752980-hd_1080_1920_30fps.mp4',
  'https://videos.pexels.com/video-files/5319651/5319651-hd_1080_1920_30fps.mp4',
  // 15+ more URLs rotating through various fitness/sports content
];
```

### Mock Data Generation
- 10 posts per page, max 6 pages (60 posts total)
- Rotate through 15-20 real video URLs from stock platforms
- 5 mock creators with realistic usernames
- Random counts: likes (100-10k), comments (10-500), shares (50-1k), saves (20-200)
- All posts start: not liked, not saved, creator not followed
- 800ms delay to simulate network latency
- Video durations: 10-60 seconds (short-form content)
- Captions: Mix of short (<100 chars) and long (>100 chars) with hashtags

## Video Library - expo-av

### Why expo-av is Perfect for Instagram Reels

**1. Full Control Over Gestures**
- expo-av renders just the video element
- We overlay our own gestures using `react-native-gesture-handler`
- Double-tap, swipe, pinch all work independently
- Video library doesn't interfere with gesture detection

**2. Programmatic Control**
```typescript
const videoRef = useRef<Video>(null);

// Play/pause based on viewability
useEffect(() => {
  if (isActive) {
    videoRef.current?.playAsync();
  } else {
    videoRef.current?.pauseAsync();
  }
}, [isActive]);

// Mute toggle
const toggleMute = () => {
  videoRef.current?.setIsMutedAsync(!isMuted);
};
```

**3. Gesture Integration**
```typescript
<TapGestureHandler onActivated={handleDoubleTap} numberOfTaps={2}>
  <View>
    <Video
      ref={videoRef}
      source={{ uri: post.videoUrl }}
      style={styles.video}
      resizeMode={ResizeMode.COVER}
      isLooping
      shouldPlay={isActive}
      isMuted={isMuted}
    />
    {/* Overlays for buttons */}
  </View>
</TapGestureHandler>
```

### Gesture Handling Strategy

**Double-Tap to Like:**
- Use `TapGestureHandler` from `react-native-gesture-handler`
- Wrap video component, detect 2 taps
- Trigger like mutation + heart animation
- Video library is unaware - just plays video

**Single-Tap Play/Pause:**
- Use same `TapGestureHandler` with 1 tap
- Call `videoRef.current?.playAsync()` or `pauseAsync()`
- Show/hide play icon overlay

**Swipe Up/Down:**
- `FlatList` handles vertical scroll automatically
- `pagingEnabled` makes it snap between posts
- No additional gesture handling needed

## Dependencies

### New Dependency Required
- **`expo-av`** - Video playback component
  ```bash
  npx expo install expo-av
  ```

### Already Installed
- `react-native-gesture-handler` - Double-tap to like, gesture overlays
- `react-native-reanimated` - Heart animation, smooth transitions
- `@expo/vector-icons` - Icons (Ionicons)
- `expo-linear-gradient` - Bottom gradient overlay
- `@tanstack/react-query` - Data fetching & caching
- `zustand` - State management

## Component Size Guidelines

**Small Components** (50-100 lines):
- ShareButton, CommentButton, FeedTopBar, FeedCaption, FollowButton

**Moderate Components** (100-150 lines):
- FeedVideo, LikeButton, SaveButton, FeedList, use-video-player, use-feed-viewability

**Large Components** (150-250 lines):
- FeedPost (~200 lines - orchestrates child components)
- index.tsx (~150 lines - feed screen with hooks)

**Query File** (~400 lines):
- feed.query.ts - ALL mutations with optimistic updates

## Success Criteria
✅ Vertical scrolling feed with full-screen video posts (expo-av)
✅ 5-tab bottom navigation with icons in (tabs) subfolder
✅ Online video URLs from Pexels/Pixabay (15-20 real videos)
✅ Single component files (no container/view splits)
✅ Like, save, follow interactions (optimistic updates, client-side)
✅ Share opens native share sheet (Share.share())
✅ Double-tap to like with heart animation (TapGestureHandler)
✅ Video player with play/pause/mute (expo-av + gesture overlay)
✅ Caption truncation with Read more/less (local state)
✅ Creator avatar shows + button when not following
✅ Infinite scroll pagination (React Query useInfiniteQuery)
✅ Pull-to-refresh functionality (use-pull-to-refresh hook)
✅ Dummy screens for Groups, Chat, Create
✅ Top bar with logo, saved, search icons
✅ Mock data with 60 posts across 6 pages
✅ Custom hooks for complex logic
✅ Parent orchestration pattern
✅ One comprehensive query file

## Implementation Time Estimate
- Phase 1-4 (Foundation + Hooks): ~3-4 hours
- Phase 5-7 (Components): ~4-5 hours
- Phase 8 (Tab Integration): ~1-2 hours
- Phase 9 (Exports & Testing): ~1 hour
- **Total**: ~9-12 hours for complete implementation
