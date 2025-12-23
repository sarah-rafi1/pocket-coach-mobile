# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Postpartum**, a React Native mobile app for postpartum nutrition and meal planning. Built with Expo SDK 53, TypeScript, and a comprehensive tech stack including Zustand, React Query, GluestackUI, NativeWind, and Supabase authentication.

## Common Development Commands

### Development
- `npm start` - Start Expo development server
- `npm run android` - Run on Android (with dark mode)
- `npm run ios` - Run on iOS (with dark mode)
- `npm run web` - Run on web (with dark mode)

### Testing & Build
- `npm test` - Run Jest tests in watch mode
- `npm run generate-icons` - Generate React components from SVG icons in `/assets/icons/`

### EAS Build Commands
- `eas build --platform android --profile development`
- `eas build --platform ios --profile testflight`
- `eas build --platform all --profile production`

## Project Architecture

### Route Protection System
The app uses a 3-tier route protection pattern:
1. Unauthenticated → `(auth)` flow
2. Authenticated but not onboarded → `(onboarding)` flow
3. Authenticated and onboarded → `(app)` flow with tabs

**Premium Feature Protection**: Individual premium features are protected using the `PremiumFeature` HOC wrapper (`components/HOCs/PremiumFeature.tsx`) rather than route-level subscription gates. This allows users to browse the app while restricting premium actions.

### Key Directories
- `app/` - Expo Router file-based routing with grouped routes
- `components/` - React components organized by feature
- `libs/stores/` - Zustand state management stores
- `libs/services/` - API service layer (currently mock data)
- `libs/queries/` - React Query hooks for data fetching
- `libs/interfaces/` - TypeScript type definitions
- `libs/validations/` - Zod schemas for forms and API responses

### State Management Pattern
- **Zustand stores** for global state (auth, dashboard, subscription, etc.)
- **React Query** for server state with 5-minute stale time
- **Service layer** using Axios with interceptors
- All stores follow loading/error state patterns

### UI System
- **GluestackUI** component library with extensive customization
- **NativeWind** for Tailwind CSS styling
- **Typography system**: H1-H4 headings, P1-P3 paragraphs with Raleway/Montserrat fonts
- **Color system** with CSS variables and semantic tokens (0-950 shade ranges)

## Development Phase

**Current Phase**: Phase 2 - Feature Extensions & Enhancements

### Phase 2 Features

#### Recipe Extensions
- **User-Added Recipes**: Users can create and save their own recipes
- **My Recipes Section**: Personal recipe library management
- **Recipe Adjustments**:
  - Adjust servings (e.g., "make recipe for 2 people")
  - Toddler-friendly modifications
  - Voice instructions: Text-to-speech for hands-free cooking

#### Community Features
- **Social Feed**: Twitter/X-style posts and interactions
- **User Profiles**: View other users' profiles and recipes
- **Engagement**: Comments, likes, and sharing functionality
- **Community Recipes**: Discover and save recipes from other users

#### Advanced Analytics
- **Streak Tracking**: Monitor consecutive days of meal and mood logging
- **Badge System**: Earn achievements based on logging streaks and milestones
- **Enhanced Mood Analytics**: Detailed mood patterns and insights
- **Nutrition Trends**: Long-term macro and calorie tracking

### Backend Integration Status

✅ **Completed Services**:
- Onboarding Service
- Profile Service
- Preference Service
- Analytics Service
- Auth Service (Supabase + Google OAuth)

🔄 **Active Services with Real Data**:
- Dashboard Service
- Meal Plans Service
- Recipe Service
- Grocery Service
- Subscription Service (RevenueCat)

API specification available in `/postpartum-api-specs/api_specification.md`

## Environment Variables Required

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_BASE_URL=your_backend_api_url
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id
```

## Code Conventions

### File Naming Pattern

**CRITICAL**: The project MUST follow a single consistent naming convention:

**Rule**:
- **Components** (`components/` folder): **PascalCase** - `GoogleSignInButton.tsx`, `DashboardHeader.tsx`, `MoodBarsSkeleton.tsx`
- **Everything else** (libs, services, stores, queries, types, utils, configs, etc.): **kebab-case** - `dashboard.service.ts`, `auth.store.ts`, `recipe-search.store.ts`

**Format Pattern**: `resource.usecase.ts` (kebab-case)
- `dashboard.service.ts`, `dashboard.types.ts`, `dashboard.query.ts`
- `auth.store.ts`, `grocery.store.ts`, `recipe-search.store.ts`
- `profile-info.skeleton.tsx`, `meal-category-list.skeleton.tsx`

**Component Pattern**: `FeatureName.tsx` (PascalCase)
- `GoogleSignInButton.tsx`, `DashboardHeader.tsx`, `ImageUpload.tsx`
- `MoodBarsSkeleton.tsx`, `NutritionAnalytics.tsx`

### Import Organization
```typescript
// External libraries
import { create } from 'zustand'
import { router } from 'expo-router'

// Internal utilities
import { ROUTES } from '@/libs/constants/routes'

// Components
import { Button } from '@/components/ui/button'
```

### Navigation Pattern
```typescript
import { ROUTES, FLOWS } from '@/libs/constants/routes'

// Use centralized route constants
router.push(ROUTES.AUTH.LOGIN)
router.replace(FLOWS.ONBOARDING_COMPLETE)
```

### Component Structure
- Use functional components with TypeScript interfaces
- Follow GluestackUI component patterns with custom variants
- Implement proper loading and error states with consistent patterns
- Use React Query for data fetching through service layer abstraction

### Form Handling
- React Hook Form with Zod validation schemas in `/libs/validations/`
- Consistent error handling and user feedback patterns

## Key Documentation

- `WARP.md` - Comprehensive development guide
- `FONT_IMPLEMENTATION.md` - Typography system details
- `docs/ROUTING.md` - Routing architecture
- `.github/copilot-instructions.md` - AI development guidelines
- `postpartum-api-specs/api_specification.md` - Backend API requirements

## Authentication & Subscription Flow

Authentication handled by Supabase with Google OAuth. Subscription model uses RevenueCat with premium feature gates throughout the app. User onboarding collects health data and preferences for personalized meal recommendations.

### Subscription Architecture

**RevenueCat Configuration:**
- **Entitlement ID**: `premium` (unlocks all premium features)
- **Google Play Products**:
  - `postpartum_premium:monthly` (ONE subscription with monthly base plan)
  - `postpartum_premium:yearly` (SAME subscription with yearly base plan)
- **App Store Products**:
  - `postpartum_monthly`
  - `postpartum_yearly`

**Subscription Status Derivation:**
- Centralized logic in `libs/utils/subscription.utils.ts`
- States: `free`, `trial`, `active`, `cancelled`, `expired`
- Status synced to Supabase auth metadata with retry logic

**Customer Center:**
- **iOS**: Uses `RevenueCat Customer Center` (`RevenueCatUI.presentCustomerCenter()`)
  - Handles subscription management, upgrades, downgrades, and cancellations natively
  - Auto-refreshes subscription status when user returns to app via `useFocusEffect`
- **Android**: Uses custom in-app flow due to Customer Center limitations
  - "Manage Subscription" redirects to paywall (`/app/(app)/subscription?fromManage=true`)
  - Auto-selects the non-active plan for easy upgrade/downgrade
  - Shows "Active" badge on current plan (cannot be re-selected)
  - Includes "Cancel Subscription" button that deep-links to Google Play
  - Plan changes handled through RevenueCat purchase flow with automatic proration

**Important**: Google Play subscription structure uses ONE subscription (`postpartum_premium`) with TWO base plans (monthly/yearly), enabling proper upgrade/downgrade behavior.

## Bundle Identifier & Build

Bundle ID: `com.nourishwise.postpartum`
Expo project slug: `postpartum`
EAS configured with development, preview, testflight, and production profiles.

## Query Keys Management

All TanStack Query keys are centralized in `libs/constants/query-keys.ts`. If you need query invalidation utilities for specific patterns (like invalidating all recipes, or all grocery lists), create them only when needed following YAGNI principle.

## Analytics Implementation

The analytics dashboard uses stacked bar charts for macronutrient tracking with `react-native-gifted-charts`. Key components:

- **AnalyticsStackedChart**: Stacked bars showing carbs (blue), protein (yellow), fats (green)
- **AnalyticsPeriodDropdown**: Week/Month switcher using existing CustomSelect
- **AnalyticsStatsCards**: Total calories and daily average display
- **Skeleton**: AnalyticsChartSkeleton for loading states

Chart configuration: 7 bars (weekly) with 24px width, 4 bars (monthly) with 40px width.

## Architecture Patterns

### Zustand Store Pattern
```typescript
type EntityState = {
  data: Entity[] | null;
  loading: boolean;
  error: string | null;
};

type EntityActions = {
  setData: (data: Entity[]) => void;
  fetchData: () => Promise<void>;
};

export const useEntityStore = create<EntityState & EntityActions>((set) => ({
  data: null,
  loading: false,
  error: null,

  setData: (data) => set({ data }),
  fetchData: async () => {
    set({ loading: true });
    // API call logic
    set({ loading: false });
  },
}));
```

### Service Layer Pattern
```typescript
export const entityService = {
  getAll: async (): Promise<Entity[]> => {
    const response = await apiClient.get('/entities');
    return response.data;
  },
};
```

### React Query Pattern
```typescript
export function useEntities() {
  return useQuery({
    queryKey: ['entities'],
    queryFn: entityService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Component Development Guidelines

**GluestackUI Customization Pattern**:
1. Replace base styling with color tokens (`primary-500`, `secondary-500`)
2. Add variant system: `primary | secondary | tertiary | error | success | warning | info`
3. Add fontFamily support: `raleway | montserrat` options
4. Set default variants to `raleway + primary`
5. Follow existing Text/Heading/Button patterns

**YAGNI Principle**: Write only what you need RIGHT NOW. Avoid "future-proof" features, complex abstractions, or unused utility functions.

**Commenting Guidelines**: Only add comments when code is NOT self-explanatory. Prefer simple inline comments for business context or non-obvious workarounds.

## API Integration Guidelines

### Query Configuration & Error Handling
- **Stale time**: Use `staleTime: 5 * 60 * 1000` (5 minutes) default. Use `staleTime: 0` only for critical fresh data
- **Move UI feedback to query hooks**: Handle onSuccess/onError in query hooks, not UI components
- **Toasts**: Only add when user explicitly needs notification (success actions, critical errors)
- **Error logging**: Always log errors in query hooks, never log success

```typescript
export function useEntityMutation() {
  const { showToast } = useCustomToast();
  return useMutation({
    mutationFn: entityService.update,
    onSuccess: () => {
      showToast({ type: 'success', title: 'Updated successfully' });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.entity.list });
    },
    onError: (error) => {
      console.error('Update failed:', error);
      showToast({ type: 'error', title: 'Update failed' });
    },
  });
}
```