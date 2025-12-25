# Component Architecture Guidelines

Component patterns and best practices for building maintainable React Native components.

## Our Architecture Pattern

We use a **parent-child orchestration pattern** where:
- **Parents** manage business logic (data fetching, mutations, state)
- **Children** handle UI and receive callbacks as props

This creates clear separation of concerns and improves reusability.

---

## The Complete Flow: Parent → Child Pattern

This is ONE cohesive architectural approach with two complementary parts working together.

### Part 1: Parent Orchestration (Smart/Container Component)

**Responsibilities:**
- Fetch data using React Query hooks
- Create mutations
- Manage business logic
- Pass callbacks to children

**Example:**
```typescript
// Parent: FeedScreen.tsx
import { useFeed, useLikePost, useSavePost } from '@/libs/queries/feed.query';
import { FeedList } from '@/components/feed';

export default function FeedScreen() {
  // Data fetching
  const { data, fetchNextPage, hasNextPage } = useFeed();

  // Mutations
  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();

  // Business logic handlers
  const handleLike = (postId: string, isLiked: boolean) => {
    likePost({ postId, isLiked });
  };

  const handleSave = (postId: string, isSaved: boolean) => {
    savePost({ postId, isSaved });
  };

  const handleLoadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  // Pass everything down as props
  return (
    <FeedList
      posts={data?.pages.flatMap(page => page.posts) || []}
      onLike={handleLike}
      onSave={handleSave}
      onLoadMore={handleLoadMore}
      hasMore={hasNextPage}
    />
  );
}
```

### Part 2: Child Receives Callbacks (Presentational/Dumb Component)

**Responsibilities:**
- Render UI
- Handle UI-only state (animations, hover, focus)
- Call parent callbacks on user interaction
- NO knowledge of data fetching or API

**Example:**
```typescript
// Child: LikeButton.tsx
import { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface LikeButtonProps {
  isLiked: boolean;
  count: number;
  onPress: () => void; // ← Callback from parent
}

export default function LikeButton({ isLiked, count, onPress }: LikeButtonProps) {
  // UI-only state (animation)
  const [showAnimation, setShowAnimation] = useState(false);

  const handlePress = () => {
    // UI logic
    setShowAnimation(true);

    // Call parent's business logic
    onPress();

    // Cleanup UI state
    setTimeout(() => setShowAnimation(false), 500);
  };

  return (
    <TouchableOpacity onPress={handlePress} className="items-center">
      {showAnimation && <HeartAnimation />}
      <Icon name={isLiked ? 'heart' : 'heart-outline'} />
      <Text className="text-xs">{count}</Text>
    </TouchableOpacity>
  );
}
```

### How They Work Together

```typescript
// FLOW:
// 1. User taps LikeButton
// 2. LikeButton shows animation (UI state)
// 3. LikeButton calls onPress() (parent's callback)
// 4. Parent's handleLike() runs business logic (mutation)
// 5. React Query updates cache → FeedScreen re-renders
// 6. LikeButton receives new props → UI updates

// PARENT (FeedScreen)
const handleLike = (postId, isLiked) => {
  likePost({ postId, isLiked }); // Business logic
};

return <LikeButton onPress={handleLike} />; // Pass callback

// CHILD (LikeButton)
const handlePress = () => {
  setShowAnimation(true); // UI logic
  onPress(); // Call parent's business logic
};
```

---

## Component Organization Rules

### Single Component Files

✅ **DO: Keep components in single files**
```
components/feed/
├── FeedList.tsx        // One component per file
├── FeedPost.tsx        // Not split into container/view
├── LikeButton.tsx      // Self-contained
└── index.ts            // Barrel export
```

❌ **DON'T: Split into container/view**
```
components/feed/
├── FeedListContainer.tsx  // ❌ Don't do this
├── FeedListView.tsx       // ❌ Unnecessary split
```

### One Query File Per Feature

✅ **DO: Group all queries/mutations in one file**
```typescript
// libs/queries/feed.query.ts (~400 lines)

export function useFeed() { /* ... */ }
export function useLikePost() { /* ... */ }
export function useSavePost() { /* ... */ }
export function useFollowCreator() { /* ... */ }
// All feed-related queries in ONE file
```

**Reference:** See `libs/queries/auth.query.ts` and `libs/queries/community.query.ts` for examples.

---

## When to Extract Custom Hooks

Extract logic into a custom hook when:

### ✅ Extract if:
- Logic exceeds **50 lines**
- Logic is **reusable** across multiple components
- Complex **state management** (multiple useState, useEffect)
- **Side effects** that need cleanup

### Examples:

**✅ GOOD - Custom hook for reusable logic:**
```typescript
// libs/hooks/use-video-player.ts
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

  return { videoRef, isMuted, isPlaying, toggleMute };
}
```

**❌ DON'T extract for simple logic:**
```typescript
// ❌ BAD - Unnecessary hook for simple state
function useCounter() {
  const [count, setCount] = useState(0);
  return { count, setCount };
}

// ✅ GOOD - Just use useState directly
const [count, setCount] = useState(0);
```

---

## When to Split Components

Split a component into smaller pieces when:

### ✅ Split if:
- Component exceeds **300 lines**
- Component has **distinct responsibilities** (e.g., form + modal)
- Part of component is **reusable** across features

### ❌ DON'T split if:
- Component is under 300 lines and cohesive
- Split would create artificial separation
- Logic is tightly coupled

### Example:

**BEFORE (400 lines - too large):**
```typescript
// components/onboarding/OnboardingFlow.tsx (400 lines)
export default function OnboardingFlow() {
  // Step 1 logic (100 lines)
  // Step 2 logic (100 lines)
  // Step 3 logic (100 lines)
  // Navigation logic (100 lines)

  return (
    <View>
      {/* All steps in one component */}
    </View>
  );
}
```

**AFTER (split into focused components):**
```typescript
// components/onboarding/OnboardingFlow.tsx (150 lines)
import { ProfileStep1, ProfileStep2, InterestsStep } from './steps';

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => setCurrentStep(prev => prev + 1);

  return (
    <View>
      {currentStep === 1 && <ProfileStep1 onNext={handleNext} />}
      {currentStep === 2 && <ProfileStep2 onNext={handleNext} />}
      {currentStep === 3 && <InterestsStep onNext={handleNext} />}
    </View>
  );
}

// components/onboarding/steps/ProfileStep1.tsx (100 lines)
export default function ProfileStep1({ onNext }: Props) {
  // Focused on step 1 logic only
}
```

---

## Prop Drilling vs Context

### Use Props (Default)

✅ **DO: Use props for 1-2 levels deep**
```typescript
<Parent>
  <Child onAction={handleAction} /> {/* ✅ 1 level - use props */}
</Parent>

<Parent>
  <MiddleComponent>
    <Child onAction={handleAction} /> {/* ✅ 2 levels - still OK */}
  </MiddleComponent>
</Parent>
```

### Use Context

✅ **DO: Use context for 3+ levels or global state**
```typescript
// ✅ GOOD - Auth state used everywhere
<AuthContext.Provider value={{ user, logout }}>
  <App />
</AuthContext.Provider>

// ✅ GOOD - Theme used across many components
<ThemeContext.Provider value={{ theme, toggleTheme }}>
  <App />
</ThemeContext.Provider>
```

❌ **DON'T: Use context for local component state**
```typescript
// ❌ BAD - Unnecessary context for local state
<FormContext.Provider value={{ formData, setFormData }}>
  <MyForm />
</FormContext.Provider>

// ✅ GOOD - Just use props
<MyForm data={formData} onChange={setFormData} />
```

---

## File Organization

### Component Size Guidelines

| Size | Action |
|------|--------|
| < 100 lines | Perfect - keep as is |
| 100-200 lines | Good - monitor for growth |
| 200-300 lines | Consider splitting if distinct sections |
| > 300 lines | **Split into smaller components** |

### Folder Structure

```
components/
├── auth/
│   ├── LoginForm.tsx          // Single component file
│   ├── SignUpForm.tsx         // Single component file
│   └── index.ts               // Barrel export
├── feed/
│   ├── FeedList.tsx           // Parent orchestrator
│   ├── FeedPost.tsx           // Child component
│   ├── LikeButton.tsx         // Reusable button
│   └── index.ts
└── shared/
    ├── Button.tsx             // Shared across features
    ├── Input.tsx
    └── index.ts

libs/
├── hooks/
│   ├── use-video-player.ts    // Custom hooks
│   ├── use-feed-viewability.ts
│   └── index.ts
└── queries/
    ├── auth.query.ts          // All auth queries
    ├── feed.query.ts          // All feed queries
    └── user.query.ts          // All user queries
```

---

## Component Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Component file | PascalCase.tsx | `FeedList.tsx` |
| Component name | PascalCase | `export default function FeedList()` |
| Props interface | ComponentNameProps | `interface FeedListProps` |
| Custom hook file | kebab-case.ts | `use-video-player.ts` |
| Custom hook name | useCamelCase | `export function useVideoPlayer()` |

---

## Summary

### The Pattern (Parent → Child):
1. **Parent** fetches data and manages mutations
2. **Parent** creates handler functions
3. **Parent** passes handlers to children as props
4. **Children** handle UI and call parent callbacks
5. **Children** manage only UI-related state

### Key Rules:
✅ Single component files (no container/view splits)
✅ One query file per feature
✅ Extract hooks when logic > 50 lines or reusable
✅ Split components when > 300 lines
✅ Use props for 1-2 levels, context for 3+ or global state

### References:
- **feedReel.md lines 133-244** - Complete pattern examples
- **libs/queries/auth.query.ts** - Query organization example
- **components/feed/** - Parent-child pattern (when implemented)

---

**See also:**
- [React Query](./react-query.md) - Data fetching patterns
- [Code Standards](./code-standards.md) - File naming conventions
