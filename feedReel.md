# Instagram Reel-Style Vertical Feed Implementation Plan

## Overview
Create a TikTok/Instagram Reels-style vertical scrolling feed with full-screen posts, replacing the current Home tab. Includes 5-tab bottom navigation (Feed, Groups, Create, Chat, Profile) with dummy screens for non-Feed tabs.

## User Decisions
- ✅ Feed replaces current Home tab (not separate)
- ✅ Use online video URLs (Pexels/Pixabay - not dummy images)
- ✅ Mock data in service layer
- ✅ Create button navigates to dummy screen
- ✅ Focus on feed/scroll functionality (NO comments implementation)

## Folder Structure

### New Files to Create (28 files - Simplified)
```
app/(app)/
├── _layout.tsx                    # Modified: Add (tabs) group routing
└── (tabs)/                        # NEW: Tabs subfolder for better organization
    ├── _layout.tsx                # Tab navigator configuration
    ├── index.tsx                  # Feed tab (replaces old index.tsx)
    ├── groups.tsx                 # Groups tab (dummy)
    ├── create.tsx                 # Create tab (dummy)
    ├── chat.tsx                   # Chat tab (dummy)
    └── profile.tsx                # Profile tab (moved from app/(app)/)

components/feed/
├── FeedList.container.tsx         # Feed list logic (data, pagination, viewability)
├── FeedList.view.tsx              # Feed list UI (CustomFlatList wrapper)
├── FeedPost.container.tsx         # Post logic (interaction orchestration, video state)
├── FeedPost.view.tsx              # Post UI (layout, composition)
├── FeedVideo.tsx                  # Video player (combined - moderate complexity)
├── FeedTopBar.tsx                 # Top bar (simple - logo, saved, search)
├── FeedCaption.tsx                # Caption (simple - truncation with read more/less)
└── index.ts                       # Barrel export

components/feed/interactions/      # Action buttons (only complex ones split)
├── LikeButton.container.tsx       # Like logic (mutation, optimistic update, sync queue)
├── LikeButton.view.tsx            # Like UI (button, heart animation, count)
├── SaveButton.container.tsx       # Save logic (mutation, optimistic update, sync queue)
├── SaveButton.view.tsx            # Save UI (button, bookmark icon, count)
├── FollowButton.container.tsx     # Follow logic (mutation, optimistic update, sync queue)
├── FollowButton.view.tsx          # Follow UI (+ button on avatar)
├── ShareButton.tsx                # Share (simple - just Share.share() call)
├── CommentButton.tsx              # Comment (simple - just UI, no logic yet)
└── index.ts                       # Barrel export

libs/services/
├── feed.service.ts                # Feed API service with mock video URLs
├── sync-queue.service.ts          # Offline sync queue (structure only - placeholders)
└── video-cache.service.ts         # Video cache management (structure only - placeholders)

libs/queries/
├── feed.query.ts                  # Feed infinite query
├── like.query.ts                  # Like mutation
├── save.query.ts                  # Save mutation
└── follow.query.ts                # Follow mutation

libs/interfaces/
├── feed.types.ts                  # Feed post, video, creator types
└── sync.types.ts                  # Sync queue action types

libs/stores/
├── feed.store.ts                  # Feed interaction state (likes, saves, follows)
├── sync-queue.store.ts            # Offline sync queue store (structure only)
└── video-cache.store.ts           # Video cache store (structure only)

libs/hooks/
└── use-video-player.ts            # Reusable video player hook (play/pause/mute, autoplay)
```

### Files to Modify (5 files)
```
app/(app)/
└── _layout.tsx                    # Update: Add (tabs) group routing

libs/constants/
├── api-routes.ts                  # Add: FEED routes
└── query-keys.ts                  # Add: feed query keys

components/index.ts                # Add: feed component exports
libs/stores/index.ts               # Add: feed stores exports
```

## Implementation Sequence (Simplified - 28 New Files)

### Phase 1: Foundation - Types & Constants (4 files)
1. **libs/constants/api-routes.ts** - Add FEED, SYNC routes
2. **libs/constants/query-keys.ts** - Add feed, like, save, follow keys
3. **libs/interfaces/feed.types.ts** - Feed post, video, creator types
4. **libs/interfaces/sync.types.ts** - Sync queue action types (structure only)

### Phase 2: Services Layer (3 files)
5. **libs/services/feed.service.ts** - Feed API with Pexels/Pixabay video URLs
6. **libs/services/sync-queue.service.ts** - Sync queue placeholders (structure only)
7. **libs/services/video-cache.service.ts** - Video cache placeholders (structure only)

### Phase 3: State Management (3 files)
8. **libs/stores/feed.store.ts** - Feed interactions (Set-based: likes, saves, follows)
9. **libs/stores/sync-queue.store.ts** - Sync queue structure (placeholders only)
10. **libs/stores/video-cache.store.ts** - Cache store structure (placeholders only)

### Phase 4: Query Hooks (4 files)
11. **libs/queries/feed.query.ts** - Feed useInfiniteQuery
12. **libs/queries/like.query.ts** - useLikePost mutation
13. **libs/queries/save.query.ts** - useSavePost mutation
14. **libs/queries/follow.query.ts** - useFollowCreator mutation

### Phase 5: Custom Hook (1 file)
15. **libs/hooks/use-video-player.ts** - Video player hook (play/pause/mute, autoplay)

### Phase 6: Simple Interaction Components (2 files)
16. **components/feed/interactions/ShareButton.tsx** - Share (calls Share.share())
17. **components/feed/interactions/CommentButton.tsx** - Comment (UI only, no logic)

### Phase 7: Complex Interaction Components (6 files - Container/View pairs)
18. **components/feed/interactions/LikeButton.container.tsx** - Like mutation logic
19. **components/feed/interactions/LikeButton.view.tsx** - Like UI with heart animation
20. **components/feed/interactions/SaveButton.container.tsx** - Save mutation logic
21. **components/feed/interactions/SaveButton.view.tsx** - Save UI with bookmark icon
22. **components/feed/interactions/FollowButton.container.tsx** - Follow mutation logic
23. **components/feed/interactions/FollowButton.view.tsx** - Follow UI with + button
24. **components/feed/interactions/index.ts** - Barrel export

### Phase 8: Simple Feed Components (2 files)
25. **components/feed/FeedTopBar.tsx** - Top bar (logo, saved, search)
26. **components/feed/FeedCaption.tsx** - Caption with read more/less

### Phase 9: Moderate Feed Components (1 file)
27. **components/feed/FeedVideo.tsx** - Video player (combined - expo-av + gestures)

### Phase 10: Complex Feed Components (4 files - Container/View pairs)
28. **components/feed/FeedList.container.tsx** - Feed list logic (pagination, viewability)
29. **components/feed/FeedList.view.tsx** - Feed list UI (CustomFlatList)
30. **components/feed/FeedPost.container.tsx** - Post logic (interactions, video state)
31. **components/feed/FeedPost.view.tsx** - Post layout UI
32. **components/feed/index.ts** - Barrel export

### Phase 11: Tab Structure (6 files)
33. **app/(app)/_layout.tsx** - Update: Change Tabs to Stack, wrap (tabs) group
34. **app/(app)/(tabs)/_layout.tsx** - NEW: Tab navigator with 5 tabs + icons
35. **app/(app)/(tabs)/index.tsx** - NEW: Feed screen (orchestrates FeedList)
36. **app/(app)/(tabs)/groups.tsx** - NEW: Groups dummy screen
37. **app/(app)/(tabs)/create.tsx** - NEW: Create dummy screen
38. **app/(app)/(tabs)/chat.tsx** - NEW: Chat dummy screen
39. Move **app/(app)/profile.tsx** → **app/(app)/(tabs)/profile.tsx**

### Phase 12: Final Exports (2 files)
40. **components/index.ts** - Add feed component exports
41. **libs/stores/index.ts** - Add feed stores exports

**Total: 28 new files + 5 modified = 33 files touched**

## Technical Architecture

### Container/View Pattern (Selective Use)

**When to Use Container/View:**
Only split components that have **significant business logic** separate from UI:
- ✅ **FeedList**: Pagination, infinite scroll, viewability logic
- ✅ **FeedPost**: Interaction orchestration, video state management
- ✅ **LikeButton**: Mutation, optimistic updates, sync queue (future)
- ✅ **SaveButton**: Same as LikeButton
- ✅ **FollowButton**: Same as LikeButton

**When NOT to Use Container/View:**
Keep as single components when logic is simple:
- ❌ **ShareButton**: Just calls `Share.share()` - inline in component
- ❌ **FeedVideo**: Video player + controls in one component
- ❌ **FeedCaption**: Simple truncation logic, no API calls
- ❌ **FeedTopBar**: Static UI with navigation buttons
- ❌ **CommentButton**: Just UI, no logic yet

**Benefits of Selective Use:**
- Avoid over-engineering simple components
- Keep moderate component sizes
- Parent components stay manageable
- Easy to extend complex features (like, save, follow) without touching UI
- Simpler components don't get unnecessarily complex

### State Management Strategy

**React Query** (Server State):
- Feed data with `useInfiniteQuery`
- Cursor-based pagination
- 5-minute stale time
- Background refetch on focus
- Optimistic updates for mutations

**Zustand Stores** (Client State):
- `feed.store.ts`: Interactions (likes, saves, follows) - Set-based
- `sync-queue.store.ts`: Pending sync actions when offline (structure only)
- `video-cache.store.ts`: Cached video metadata (structure only)

**Local Component State**:
- Active post index (viewability)
- Video play/pause/mute state (per post)
- Caption expanded/collapsed (per post)
- Double-tap heart animation state

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

## Video Library Research & Selection

### Options Compared

| Library | Pros | Cons | Verdict |
|---------|------|------|---------|
| **expo-av** | ✅ Built into Expo<br>✅ Simple API<br>✅ Programmatic control<br>✅ Works with gestures overlay<br>✅ Native platform support | ❌ Fewer advanced features<br>❌ Basic controls | ⭐ **SELECTED** |
| **react-native-video** | ✅ More features<br>✅ Better performance claims<br>✅ Large community | ❌ Extra setup<br>❌ Config.plugin needed for Expo<br>❌ Platform-specific issues<br>❌ Overkill for our needs | ❌ Not needed |
| **react-native-video-player** | ✅ Built-in controls | ❌ Less flexible<br>❌ Harder to customize<br>❌ Built on react-native-video | ❌ Too opinionated |

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

**3. Gesture Integration Example**
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

### Optional Dependencies (Future - Offline Support)
- **`@react-native-community/netinfo`** - Network state detection
- **`expo-file-system`** - Video caching to local storage

### Already Installed
- `react-native-gesture-handler` - Double-tap to like, gesture overlays
- `react-native-reanimated` - Heart animation, smooth transitions
- `@expo/vector-icons` - Icons (Ionicons)
- `expo-linear-gradient` - Bottom gradient overlay
- `@tanstack/react-query` - Data fetching & caching
- `zustand` - State management

## Critical Review & Validation

### Potential Issues Addressed

**1. Over-Engineering Risk** ❌ → ✅ **FIXED**
- Original: 32 files with Container/View for everything
- Revised: 28 files, selective Container/View pattern
- Only complex components split (Like, Save, Follow, FeedList, FeedPost)
- Simple components stay single-file (Share, Comment, Video, Caption, TopBar)

**2. Parent Component Size** ❌ → ✅ **MANAGED**
- FeedPost.view: ~200 lines (moderate) - just layout + composition
- FeedPost.container: ~150 lines - interaction orchestration
- Business logic pushed to child containers (LikeButton, SaveButton, etc.)
- Parent stays clean and maintainable

**3. Component Size Balance** ✅ **OPTIMAL**
- Small: 50-100 lines (simple UI components)
- Moderate: 100-200 lines (video player, button views)
- Large: 200-350 lines (list, post containers/views)
- No components > 350 lines

**4. Video Library Choice** ✅ **VALIDATED**
- expo-av supports programmatic control (play/pause/mute)
- Works perfectly with react-native-gesture-handler overlay
- Double-tap, single-tap, swipe all handled separately
- Lightweight, no extra config needed

**5. Gesture Conflicts** ✅ **PREVENTED**
- Video library renders video element only
- Gestures handled by TapGestureHandler wrapper
- No conflicts between video player and gesture detection
- Tested pattern from Instagram Reels clones

### Architecture Validation

**Scalability** ✅
- (tabs) subfolder allows future non-tab screens
- Sync queue structure ready for offline expansion
- Video cache structure ready for caching
- Each interaction component independently extensible

**Maintainability** ✅
- Clear separation: Data (services) → State (stores) → UI (components)
- Container/View only where needed
- Moderate component sizes
- Well-defined interfaces

**Performance** ✅
- React Query with infinite scroll pagination
- Viewability-based video autoplay (plays only visible video)
- Optimistic updates for instant UI feedback
- CustomFlatList with proper pagination

## Success Criteria
✅ Vertical scrolling feed with full-screen video posts (expo-av)
✅ 5-tab bottom navigation with icons in (tabs) subfolder
✅ Online video URLs from Pexels/Pixabay (15-20 real videos)
✅ Container/View pattern for complex components ONLY (selective use)
✅ Like, save, follow interactions (optimistic updates, client-side)
✅ Share opens native share sheet (Share.share())
✅ Double-tap to like with heart animation (TapGestureHandler)
✅ Video player with play/pause/mute (expo-av + gesture overlay)
✅ Caption truncation with Read more/less (local state)
✅ Creator avatar shows + button when not following
✅ Infinite scroll pagination (React Query useInfiniteQuery)
✅ Pull-to-refresh functionality (CustomFlatList)
✅ Dummy screens for Groups, Chat, Create
✅ Top bar with logo, saved, search icons
✅ Mock data with 60 posts across 6 pages
✅ Scalable structure for future offline sync (structure only)
✅ Sync queue and video cache prepared (placeholders)
✅ Moderate component sizes (50-350 lines max)
✅ Parent components stay clean (no bloat)

## Component Size Guidelines

**Small Components** (50-100 lines):
- ShareButton, CommentButton, FeedTopBar, FeedCaption

**Moderate Components** (100-200 lines):
- FeedVideo, LikeButton.view, SaveButton.view, FollowButton.view

**Large Components** (200-350 lines):
- FeedList.container, FeedPost.container, FeedList.view, FeedPost.view

**Containers** (100-150 lines):
- LikeButton.container, SaveButton.container, FollowButton.container

**Parent Component** (FeedPost.view: ~200 lines):
- Orchestrates child components
- Layout and composition
- Passes props down
- Doesn't contain business logic

## Implementation Time Estimate
- Phase 1-5 (Foundation + Hooks): ~3-4 hours
- Phase 6-10 (Components): ~5-6 hours
- Phase 11 (Tab Integration): ~1-2 hours
- Phase 12 (Exports & Testing): ~1 hour
- **Total**: ~10-13 hours for complete implementation

## Future Expansion Path
When implementing offline sync later:
1. Fill in sync queue placeholders in `sync-queue.service.ts`
2. Add NetInfo listener in LikeButton/SaveButton/FollowButton containers
3. Implement video caching in `video-cache.service.ts`
4. Hook up sync queue to mutation containers
5. **No refactoring needed** - architecture already supports it!
