# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm start

# Run on specific platforms
npm run android
npm run ios
npm run web
```

## Architecture Overview

### Tech Stack
- **Framework**: Expo (React Native)
- **Routing**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Authentication**: Clerk
- **State Management**:
  - TanStack Query (React Query) for server state
  - Zustand for client state
- **Validation**: Zod
- **HTTP Client**: Axios

### Project Structure

```
app/                    # Expo Router file-based routing
  ├── (auth)/          # Auth flow routes (login, signup, etc.)
  ├── (onboarding)/    # Onboarding flow (profile completion)
  ├── (app)/           # Main authenticated app routes
  ├── _layout.tsx      # Root layout with auth guards
  ├── oauth-callback.tsx
  └── sso-callback.tsx

libs/                   # Shared business logic
  ├── config/          # Configuration files (API client, React Query, env)
  ├── constants/       # App constants (routes, API routes, query keys)
  ├── interfaces/      # TypeScript interfaces
  ├── queries/         # React Query hooks
  ├── services/        # API service layer
  ├── stores/          # Zustand stores
  └── utils/           # Utility functions and validation schemas

components/            # Reusable UI components
  ├── auth/
  ├── buttons/
  ├── inputs/
  ├── modals/
  ├── onboarding/
  └── ...
```

## Key Architecture Patterns

### Authentication Flow with Route Guards

The app uses a sophisticated three-tier authentication system managed in `app/_layout.tsx`:

1. **Unauthenticated users** → Only see `(auth)` routes
2. **Authenticated but not onboarded** → Only see `(onboarding)` routes
3. **Fully authenticated and onboarded** → See `(app)` routes

Route guards are implemented using:
- `Stack.Protected` with conditional `guard` props
- Clerk's `useAuth()` and `useUser()` hooks
- User metadata flag: `user.unsafeMetadata.onboardingCompleted`

OAuth/SSO callbacks (`oauth-callback.tsx`, `sso-callback.tsx`) are available to all users and handle redirects based on auth state.

### Environment Configuration

Environment variables are centralized in `libs/config/env.ts` and must use the `EXPO_PUBLIC_` prefix to be accessible in the app.

**Required variables** (see `.env.example`):
- `EXPO_PUBLIC_API_BASE_URL` - Backend API base URL (without `/api` suffix)
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk authentication key

The env config includes validation to throw errors if required variables are missing.

### API Client Configuration

Located in `libs/config/api-client.config.ts`:
- Axios instance with base URL from env config
- Request interceptor logs all API requests for debugging
- Attempts to get Clerk JWT from SecureStore and attach to requests
- Response interceptor handles 401 errors

**Note**: Currently, some endpoints (like onboarding and username check) explicitly pass the auth token in headers rather than relying on the interceptor. *(This will be changed to a better centralized approach later)*

### Centralized Route Management

All routes are defined as constants in `libs/constants/routes.ts`:
- `ROUTES.AUTH.*` - Authentication routes
- `ROUTES.ONBOARDING.*` - Onboarding routes
- `ROUTES.APP.*` - Main app routes
- `FLOWS.*` - Common navigation flows

All API endpoints are in `libs/constants/api-routes.ts`:
- Routes include the `/api` prefix (e.g., `/api/users/check-username`)
- Used throughout service layer for consistency

**Always use these constants instead of hardcoded strings.**

### Data Fetching Pattern

The app uses a three-layer architecture for data:

1. **Service Layer** (`libs/services/*.service.ts`)
   - Pure functions that make API calls
   - Handle request/response transformation
   - Export TypeScript interfaces for data types

2. **Query Layer** (`libs/queries/*.query.ts`)
   - React Query hooks wrapping service functions
   - Handle loading states, caching, and error handling
   - Use query keys from `libs/constants/query-keys.ts`

3. **Component Layer**
   - Components call query hooks
   - No direct API calls in components

Example:
```typescript
// Service (libs/services/user.service.ts)
export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get(API_ROUTES.USER.PROFILE);
    return response.data;
  }
};

// Query (libs/queries/user.query.ts)
export function useUserProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.user.profile,
    queryFn: userService.getProfile,
  });
}

// Component
const { data: user } = useUserProfile();
```

### Validation with Zod

All form validation uses Zod schemas in `libs/utils/validationSchemas.ts`:
- Reusable field-level schemas (email, password, username, etc.)
- Form-level schemas for each flow (login, signup, onboarding)
- Helper functions: `validateForm()`, `validateField()`, `createFieldValidator()`
- Real-time validation helpers exported for immediate feedback

### API Response Format

The backend uses a standardized wrapper format for responses:

```typescript
{
  data: { /* actual data */ },
  success: boolean,
  timestamp: string
}
```

Service functions should return the wrapper, and components access nested data via `result.data.*`.

## Important Implementation Details

### Path Aliases

TypeScript is configured with path aliases (see `tsconfig.json`):
- `@/*` - Project root
- `@/components/*` - Components directory
- `@/libs/*` - Libs directory
- `@/assets/*` - Assets directory

Always use these aliases instead of relative imports.

### Clerk Token Management

During onboarding and similar flows, pass Clerk tokens explicitly to API calls:
```typescript
const token = await getToken(); // from useAuth()
await mutation.mutateAsync({ payload, token });
```

The API client interceptor retrieves tokens from SecureStore using key `'__clerk_client_jwt'`, but this may not be reliable during onboarding flows. *(This will be changed to a better centralized approach later)*

### FormData for File Uploads

When uploading files (e.g., profile images during onboarding):
- Use `FormData` with proper content type
- Set `Content-Type: 'multipart/form-data'`
- Pass auth token explicitly in headers *(temporary - will be improved)*
- See `libs/services/onboarding.service.ts` for reference

### Toast Notifications

Toast configuration is in `libs/config/toast.config.ts`. Use the `showToast` utility:
```typescript
import { showToast } from '@/libs/utils';
showToast('success', 'Title', 'Message');
showToast('error', 'Title', 'Message');
```

### NativeWind (Tailwind) Usage

The app uses NativeWind v4 for styling:
- Use className prop with Tailwind classes
- See `global.css` for custom configurations
- Platform-specific spacing may be needed (check for `Platform.OS === 'ios'`)

## Common Patterns

### Multi-Step Forms
Onboarding uses a multi-step pattern with local state and validation per step. See `app/(onboarding)/index.tsx` for reference on:
- Step-by-step validation
- Preserving state between steps
- Error handling and user feedback

### Modal Patterns
Reusable modal components in `components/modals/`:
- `InfoModal` - Success/error messages
- `ImagePickerModal` - Camera/gallery selection
- Controlled via visible prop and callback functions

### Error Handling
- Services throw errors with descriptive messages
- Queries handle errors in `onError` callbacks
- Display user-friendly messages via toast notifications
- Log detailed errors to console for debugging
