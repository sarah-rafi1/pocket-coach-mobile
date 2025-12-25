# Code Standards & Style Guide

Coding conventions, import order, naming patterns, and TypeScript best practices.

## Import Order Standards

### The 7-Group System

Organize imports in **7 logical groups** that follow the dependency flow from framework → business logic → UI.

**Official References:**
- [Mastering Import Order in React](https://dev.to/melvinprince/mastering-import-order-in-react-a-deep-dive-into-best-practices-and-tools-43ma)
- [React Import Best Practices](https://dzone.com/articles/import-order-react-best-practices-tools)
- [React Native Coding Standards](https://gilshaan.medium.com/react-native-coding-standards-and-best-practices-5b4b5c9f4076)

### Import Order Template

```typescript
// 1. React & React Native Core (Framework Fundamentals)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';

// 2. External Libraries (Third-Party Dependencies)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { z } from 'zod';

// 3. Types & Interfaces (Type System)
import type { User, Profile } from '@/libs/interfaces/user.types';
import type { Interest } from '@/libs/interfaces/interests.types';
import type { OnboardingPayload } from '@/libs/interfaces/onboarding.types';

// 4. Business Logic (Services, Queries, Stores)
import { userService } from '@/libs/services/user.service';
import { authService } from '@/libs/services/auth.service';
import { useUserProfile, useUpdateProfile } from '@/libs/queries/user.query';
import { useAuthStore } from '@/libs/stores/auth.store';

// 5. Constants (Configuration)
import { ROUTES } from '@/libs/constants/routes';
import { API_ROUTES } from '@/libs/constants/api-routes';
import { QUERY_KEYS } from '@/libs/constants/query-keys';

// 6. Components & Utilities (UI & Helpers)
import { Button, Input, Loading } from '@/components';
import { showToast } from '@/libs/utils';
import { handleApiError } from '@/libs/utils/handleApiError';
import { formatApiError } from '@/libs/utils/errorHandling';

// 7. Styles (Visual Layer - Always Last)
import styles from './styles';
```

### Rationale for This Order

This order follows the **dependency hierarchy** and **conceptual flow**:

1. **React & React Native Core** - The foundation everything builds on. Without these, nothing else works.

2. **External Libraries** - Third-party tools that extend the framework. They depend on React/RN but are independent of your app logic.

3. **Types & Interfaces** - Type definitions must be loaded before business logic that uses them. This is the "contract" layer.

4. **Business Logic** - Services, queries, and stores that implement features. They consume types and provide functionality.

5. **Constants** - Configuration values consumed by business logic and components. Centralized settings.

6. **Components & Utilities** - UI elements and helper functions. They use business logic and constants to render/operate.

7. **Styles** - Visual presentation layer. Purely cosmetic, always last, doesn't affect functionality.

**Why This Works:**
- Clear separation of concerns (framework → data → UI)
- Easy to scan and find imports
- Matches mental model (foundation → implementation → presentation)
- Prevents circular dependencies (flows one direction)

### Within Each Group: Sort Alphabetically

```typescript
// ✅ GOOD - Alphabetical within group
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

// ❌ BAD - Random order
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth, useUser } from '@clerk/clerk-expo';
```

### Enforce with ESLint

Add to `.eslintrc.js`:

```javascript
{
  "plugins": ["import"],
  "rules": {
    "import/order": ["error", {
      "groups": [
        "builtin",        // Node built-ins
        "external",       // npm packages
        "internal",       // @/* path aliases
        ["parent", "sibling", "index"]
      ],
      "pathGroups": [
        {
          "pattern": "react",
          "group": "builtin",
          "position": "before"
        },
        {
          "pattern": "react-native",
          "group": "builtin",
          "position": "before"
        }
      ],
      "pathGroupsExcludedImportTypes": ["react", "react-native"],
      "newlines-between": "always",
      "alphabetize": {
        "order": "asc",
        "caseInsensitive": true
      }
    }]
  }
}
```

**Auto-fix on save:**
```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Naming Conventions

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| React Component | PascalCase.tsx | `FeedList.tsx`, `LikeButton.tsx` |
| Screen/Route | kebab-case.tsx or index.tsx | `profile.tsx`, `(onboarding)/index.tsx` |
| Utility/Helper | kebab-case.ts | `error-handling.ts`, `validation.ts` |
| Service | kebab-case.service.ts | `user.service.ts`, `auth.service.ts` |
| Query Hook | kebab-case.query.ts | `user.query.ts`, `feed.query.ts` |
| Custom Hook | use-kebab-case.ts | `use-video-player.ts`, `use-debounce.ts` |
| Type/Interface | kebab-case.types.ts | `user.types.ts`, `api.types.ts` |
| Constant | kebab-case.ts | `routes.ts`, `api-routes.ts` |
| Schema | kebab-case.schemas.ts | `auth.schemas.ts`, `user.schemas.ts` |

**Official Reference:**
- [React File Naming Best Practices](https://legacy.reactjs.org/docs/faq-structure.html)

### Variable Naming

| Type | Convention | Example |
|------|-----------|---------|
| Component | PascalCase | `function FeedList() {}` |
| Function | camelCase | `function handleSubmit() {}` |
| Variable | camelCase | `const userName = 'John'` |
| Boolean | is/has/should prefix | `isLoading`, `hasError`, `shouldShow` |
| Constant | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRIES` |
| Private/Internal | _prefixCamelCase | `_internalHelper()` |
| Type/Interface | PascalCase | `interface User {}`, `type Profile = {}` |
| Custom Hook | useCamelCase | `function useUserProfile() {}` |
| Event Handler | handle prefix | `handlePress`, `handleChange` |
| Callback Prop | on prefix | `onPress`, `onChange`, `onSubmit` |

### Examples

```typescript
// ✅ GOOD - Clear, consistent naming
interface User {
  id: string;
  email: string;
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function useUserProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleFetch = async () => {
    setIsLoading(true);
    // ...
  };

  return { isLoading, hasError, handleFetch };
}

// Component with clear prop names
interface ButtonProps {
  onPress: () => void;
  isDisabled?: boolean;
  children: React.ReactNode;
}

export default function Button({ onPress, isDisabled, children }: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={isDisabled}>
      <Text>{children}</Text>
    </TouchableOpacity>
  );
}
```

---

## TypeScript Standards

### Use Explicit Return Types

✅ **DO: Declare return types for functions**

```typescript
// ✅ GOOD - Explicit return type
export function formatName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export async function fetchUser(id: string): Promise<User> {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
}

// Components
export default function ProfileCard({ user }: Props): JSX.Element {
  return <View>...</View>;
}
```

❌ **DON'T: Let TypeScript infer return types**

```typescript
// ❌ BAD - No return type
export function formatName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`; // Inferred as string, but not explicit
}
```

**Why:** Explicit return types catch errors at function boundaries and improve IDE autocomplete.

**Official Reference:**
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

### Interface Over Type for Objects

✅ **DO: Use `interface` for object shapes**

```typescript
// ✅ GOOD - Interface for objects
export interface User {
  id: string;
  email: string;
  profile: Profile;
}

export interface Profile {
  username: string;
  displayName: string;
}
```

❌ **DON'T: Use `type` for simple objects**

```typescript
// ❌ BAD - Type for objects (use interface instead)
export type User = {
  id: string;
  email: string;
};
```

✅ **USE `type` for unions, primitives, and complex types**

```typescript
// ✅ GOOD - Type for unions
export type Status = 'idle' | 'loading' | 'success' | 'error';

// ✅ GOOD - Type for mapped types
export type Nullable<T> = T | null;

// ✅ GOOD - Type for function signatures
export type EventHandler = (event: Event) => void;
```

**Why:** Interfaces can be extended and merged, better for objects. Types are better for unions and complex compositions.

### No `any` Except Error Handling

✅ **DO: Use `unknown` or proper types**

```typescript
// ✅ GOOD - Use unknown for catch blocks
catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// ✅ GOOD - Type API responses
interface ApiResponse<T> {
  data: T;
  success: boolean;
}

async function fetchUser(): Promise<ApiResponse<User>> {
  // ...
}
```

❌ **DON'T: Use `any` unnecessarily**

```typescript
// ❌ BAD - any disables type checking
function processData(data: any) {
  return data.value; // No type safety!
}

// ✅ GOOD - Use generics
function processData<T extends { value: string }>(data: T) {
  return data.value; // Type-safe!
}
```

**Exception:** You can use `any` for error objects in catch blocks and React Query errors:
```typescript
// ✅ OK - Error handling with any
onError: (error: any) => {
  const { title, message } = formatApiError(error);
  showToast('error', title, message);
}
```

### Use Zod Inference for Form Types

✅ **DO: Infer types from Zod schemas**

```typescript
// ✅ GOOD - Define schema, infer type
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Use in component
function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
}
```

❌ **DON'T: Manually duplicate schema as type**

```typescript
// ❌ BAD - Duplicates validation logic
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export interface LoginFormData {
  email: string;
  password: string;
}
```

**Why:** Single source of truth for validation and types. Changes to schema automatically update types.

**Reference:** `libs/schemas/` - All schema files use this pattern.

### Prop Types for Components

✅ **DO: Define props interface**

```typescript
// ✅ GOOD - Clear prop interface
interface ButtonProps {
  onPress: () => void;
  title: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export default function Button({
  onPress,
  title,
  isLoading = false,
  isDisabled = false,
  variant = 'primary',
}: ButtonProps): JSX.Element {
  return (
    <TouchableOpacity onPress={onPress} disabled={isDisabled || isLoading}>
      <Text>{isLoading ? 'Loading...' : title}</Text>
    </TouchableOpacity>
  );
}
```

**Naming convention:** `ComponentNameProps`

---

## File Organization

### Component File Size Limits

| Size | Action |
|------|--------|
| < 100 lines | Perfect - keep as is |
| 100-200 lines | Good - monitor for growth |
| 200-300 lines | Consider splitting if distinct sections |
| > 300 lines | **Split into smaller components** |

### When to Extract Custom Hooks

Extract logic into a custom hook when:

✅ **Extract if:**
- Logic exceeds **50 lines**
- Logic is **reusable** across multiple components
- Complex **state management** (multiple useState, useEffect)
- **Side effects** that need cleanup

❌ **Don't extract if:**
- Simple state (< 10 lines)
- Used only once
- Tightly coupled to one component

**Example:**

```typescript
// ✅ GOOD - Extract complex reusable logic
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

    return () => {
      videoRef.current?.stopAsync();
    };
  }, [isActive]);

  const toggleMute = () => {
    videoRef.current?.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  };

  return { videoRef, isMuted, isPlaying, toggleMute };
}

// ❌ BAD - Don't extract simple state
function useCounter() {
  const [count, setCount] = useState(0);
  return { count, setCount };
}

// ✅ GOOD - Just use useState directly
const [count, setCount] = useState(0);
```

### Folder Structure Standards

```
app/                    # Expo Router (file-based routing)
├── (auth)/            # Auth flow routes
├── (onboarding)/      # Onboarding flow
├── (app)/             # Main app routes
└── _layout.tsx        # Root layout

components/            # Reusable UI components
├── auth/              # Auth-specific components
│   ├── LoginForm.tsx
│   ├── SignUpForm.tsx
│   └── index.ts       # Barrel export
├── feed/              # Feed-specific components
│   ├── FeedList.tsx
│   ├── FeedPost.tsx
│   └── index.ts
└── shared/            # Shared across features
    ├── Button.tsx
    ├── Input.tsx
    └── index.ts

libs/
├── config/            # Configuration files
├── constants/         # App constants
├── hooks/             # Custom hooks
│   ├── use-video-player.ts
│   ├── use-debounce.ts
│   └── index.ts
├── interfaces/        # TypeScript interfaces
├── queries/           # React Query hooks
│   ├── auth.query.ts
│   ├── user.query.ts
│   └── feed.query.ts
├── schemas/           # Zod validation schemas
│   ├── auth.schemas.ts
│   ├── onboarding.schemas.ts
│   └── index.ts
├── services/          # API service layer
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── index.ts
├── stores/            # Zustand stores
└── utils/             # Utility functions
```

### Barrel Exports (index.ts)

✅ **DO: Use barrel exports for cleaner imports**

```typescript
// components/auth/index.ts
export { default as LoginForm } from './LoginForm';
export { default as SignUpForm } from './SignUpForm';
export { default as ForgotPassword } from './ForgotPassword';

// Usage in other files
import { LoginForm, SignUpForm } from '@/components/auth';
```

❌ **DON'T: Import directly from nested paths**

```typescript
// ❌ BAD - Long import paths
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';

// ✅ GOOD - Use barrel export
import { LoginForm, SignUpForm } from '@/components/auth';
```

### One Component Per File

✅ **DO: Keep one component per file**

```
components/feed/
├── FeedList.tsx        // One component
├── FeedPost.tsx        // One component
├── LikeButton.tsx      // One component
└── index.ts            // Barrel export
```

❌ **DON'T: Multiple components in one file**

```typescript
// ❌ BAD - Multiple components in one file
// FeedComponents.tsx
export function FeedList() {}
export function FeedPost() {}
export function LikeButton() {}
```

**Exception:** Small helper components used only within parent:

```typescript
// ✅ OK - Small internal helper
function AvatarPlaceholder() {
  return <View className="w-10 h-10 bg-gray-300 rounded-full" />;
}

export default function UserProfile({ user }: Props) {
  return (
    <View>
      {user.avatar ? <Image source={{ uri: user.avatar }} /> : <AvatarPlaceholder />}
      <Text>{user.name}</Text>
    </View>
  );
}
```

---

## Code Quality Standards

### Avoid Over-Engineering

❌ **DON'T:**
- Add features beyond what was requested
- Refactor surrounding code when fixing bugs
- Add error handling for scenarios that can't happen
- Create helpers for one-time operations
- Add comments to code you didn't change

✅ **DO:**
- Solve the specific problem
- Keep solutions simple and focused
- Only add error handling at system boundaries
- Trust internal code and framework guarantees

**Reference:** See CLAUDE.md - "Avoid over-engineering" section.

### Comments & Documentation

✅ **DO: Comment WHY, not WHAT**

```typescript
// ✅ GOOD - Explains business logic
// Clerk doesn't store tokens in SecureStore during onboarding,
// so we must pass the token explicitly
const token = await getToken();

// ❌ BAD - States the obvious
// Get the token
const token = await getToken();
```

✅ **DO: Add JSDoc for public APIs**

```typescript
/**
 * Validates form data and returns formatted errors
 * @param schema - Zod schema to validate against
 * @param data - Form data to validate
 * @returns Object with field names as keys and error messages as values
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Record<string, string> {
  // ...
}
```

❌ **DON'T: Add unnecessary comments**

```typescript
// ❌ BAD - Redundant comments
// Set loading to true
setIsLoading(true);

// Call the API
const response = await apiClient.get('/users');

// Set loading to false
setIsLoading(false);
```

### DRY (Don't Repeat Yourself)

✅ **DO: Extract repeated logic**

```typescript
// ✅ GOOD - Central error handler
export function useCreateUser() {
  return useMutation({
    mutationFn: userService.createUser,
    onError: (error) => handleApiError(error, 'Create User'),
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationFn: userService.updateUser,
    onError: (error) => handleApiError(error, 'Update User'),
  });
}
```

❌ **DON'T: Duplicate error handling**

```typescript
// ❌ BAD - Repeated error logic
export function useCreateUser() {
  return useMutation({
    mutationFn: userService.createUser,
    onError: (error) => {
      const { title, message } = formatApiError(error);
      showToast('error', title, message);
    },
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationFn: userService.updateUser,
    onError: (error) => {
      const { title, message } = formatApiError(error);
      showToast('error', title, message);
    },
  });
}
```

---

## Summary

### Quick Reference:

**Import Order (7 Groups):**
1. React & React Native core
2. External libraries
3. Types & Interfaces
4. Business Logic (services, queries, stores)
5. Constants
6. Components & Utilities
7. Styles

**Naming Conventions:**
- Files: `kebab-case.tsx` or `PascalCase.tsx` (components)
- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Interfaces: `PascalCase`
- Custom Hooks: `useCamelCase`

**TypeScript:**
- Explicit return types
- Interface over type for objects
- No `any` (except error handling)
- Use Zod inference for form types

**File Organization:**
- Max 300 lines per component
- Extract hooks if logic > 50 lines
- One component per file
- Use barrel exports (index.ts)

**Code Quality:**
- Avoid over-engineering
- Comment WHY, not WHAT
- DRY - extract repeated logic
- Keep solutions simple and focused

---

**See also:**
- [Architecture](./architecture.md) - Component patterns
- [API Patterns](./api-patterns.md) - Service layer organization
- [Error Handling](./error-handling.md) - Central error handler
- [React Query](./react-query.md) - Query patterns
