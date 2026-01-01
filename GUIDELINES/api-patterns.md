# API Patterns & Backend Response Handling

Guidelines for handling API responses, service layer organization, and centralized error handling.

## Philosophy: No Try-Catch Everywhere

Inspired by your backend's `asyncHandler` pattern, we use React Query as our error handler wrapper.


### Backend Pattern (Your mend-backend):
```javascript
// ❌ Without asyncHandler - repetitive try-catch
app.post('/users', async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ With asyncHandler - clean, errors handled centrally
app.post('/users', asyncHandler(async (req, res) => {
  const user = await createUser(req.body);
  res.json(user);
  // No try-catch - asyncHandler catches → errorHandler middleware
}));
```

### Frontend Pattern (React Query IS Our AsyncHandler):
```typescript
// ❌ AVOID - try-catch in components
function MyComponent() {
  const handleSubmit = async () => {
    try {
      await userService.createUser(data);
      showToast('success', 'User created');
    } catch (error: any) {
      showToast('error', 'Error', error.message);
    }
  };
}

// ✅ BETTER - React Query handles errors
function MyComponent() {
  const mutation = useCreateUser(); // Has error handling built-in

  const handleSubmit = () => {
    mutation.mutate(data); // No try-catch needed!
  };
}
```

---

## Our Strategy: Accept Backend Inconsistency

**Current Reality:** The backend returns different response formats per endpoint.

**Our Approach:** We accept this inconsistency and handle it **at the service layer**.

---

## Backend Response Formats

### Format 1: Wrapper with Nested Data

Some endpoints return data wrapped in a standardized format:

```typescript
// Example: GET /api/interests
{
  data: {
    // Actual payload nested here
    interests: [...],
    categories: [...]
  },
  success: true,
  timestamp: "2025-12-26T10:30:00Z"
}
```

**Service handles extraction:**
```typescript
// libs/services/interests.service.ts
export const interestsService = {
  getInterests: async (): Promise<Interest[]> => {
    const response = await apiClient.get(API_ROUTES.INTERESTS);
    return response.data.data; // ← Extract nested data
  },
};
```

### Format 2: Direct Response

Other endpoints return data directly:

```typescript
// Example: POST /api/auth/login
{
  user: {
    id: "123",
    email: "user@example.com",
    firstName: "John"
  },
  token: "jwt-token-here"
}
```

**Service returns directly:**
```typescript
// libs/services/auth.service.ts
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ROUTES.AUTH.LOGIN, credentials);
    return response.data; // ← Return entire response.data
  },
};
```

---

## Service Layer Responsibilities

The service layer is the **adapter** between inconsistent backend and consistent frontend.

### ✅ Services MUST:

1. **Return clean, consistent data to components**
2. **Handle response structure differences**
3. **Extract nested data when needed**
4. **Export TypeScript interfaces for data types**
5. **NOT handle errors** (let React Query handle them)

### Example: Service Layer Pattern

```typescript
// libs/services/user.service.ts
import { apiClient } from '@/libs/config/api-client.config';
import { API_ROUTES } from '@/libs/constants/api-routes';

// 1. Define interfaces
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
}

export interface UsernameCheckResponse {
  available: boolean;
}

// 2. Service object with methods (NO try-catch - let errors bubble up)
export const userService = {
  // Method 1: Returns direct data
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get(API_ROUTES.USER.PROFILE);
    return response.data;
  },

  // Method 2: Extracts nested data
  checkUsername: async (username: string, token: string): Promise<UsernameCheckResponse> => {
    const response = await apiClient.get(
      `${API_ROUTES.USER.CHECK_USERNAME}?username=${username}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data; // Extract nested
  },
};
```

**⚠️ Notice:** No try-catch blocks in services. Errors propagate to React Query hooks.

---

## Centralized Error Handling

### Create handleApiError Utility

Instead of repeating error handling code in every mutation, use a central utility:

```typescript
// libs/utils/handleApiError.ts (NEW FILE)
import { useRouter } from 'expo-router';
import { formatApiError } from '@/libs/utils/errorHandling';
import { showToast } from '@/libs/utils';
import { ROUTES } from '@/libs/constants/routes';

export function handleApiError(error: any, context?: string) {
  // Log with context for debugging
  console.error(`[API Error] ${context || 'Unknown'}:`, error);

  // Extract error details
  const { title, message, code } = formatApiError(error);

  // Handle specific status codes
  if (code === '401') {
    showToast('error', 'Session Expired', 'Please login again');
    // Redirect to login
    const router = useRouter();
    router.push(ROUTES.AUTH.LOGIN);
    return;
  }

  if (code === '409') {
    showToast('error', 'Already Exists', message);
    return;
  }

  if (code === '403') {
    showToast('error', 'Access Denied', 'You don\'t have permission');
    return;
  }

  // Default error display
  showToast('error', title, message);
}
```

### Use in Query Hooks (One Line!)

```typescript
// libs/queries/user.query.ts
import { handleApiError } from '@/libs/utils/handleApiError';

export function useCreateUser() {
  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      showToast('success', 'User Created', 'Welcome!');
    },
    onError: (error) => handleApiError(error, 'Create User'), // ← One line!
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => {
      showToast('success', 'Profile Updated');
    },
    onError: (error) => handleApiError(error, 'Update Profile'), // ← Same handler!
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: userService.deleteAccount,
    onError: (error) => handleApiError(error, 'Delete Account'), // ← Consistent!
  });
}
```

**Benefits:**
- ✅ No repetitive error handling code
- ✅ Consistent error UX across the app
- ✅ Change error behavior in ONE place
- ✅ Easier to add new error handling logic

---

## Components Should Never Know Response Structure

❌ **BAD - Component handles response structure:**
```typescript
// ❌ Component knows about nested data
function MyComponent() {
  const { data } = useQuery({
    queryKey: ['interests'],
    queryFn: async () => {
      const res = await apiClient.get('/api/interests');
      return res.data.data; // ❌ Component handles extraction
    },
  });

  return <div>{data.interests}</div>;
}
```

✅ **GOOD - Service handles response structure:**
```typescript
// ✅ Service
export const interestsService = {
  getInterests: async (): Promise<Interest[]> => {
    const response = await apiClient.get(API_ROUTES.INTERESTS);
    return response.data.data; // Service handles extraction
  },
};

// ✅ Query hook
export function useInterests() {
  return useQuery({
    queryKey: QUERY_KEYS.interests.all,
    queryFn: interestsService.getInterests,
    onError: (error) => handleApiError(error, 'Fetch Interests'), // Central handler
  });
}

// ✅ Component gets clean data
function MyComponent() {
  const { data: interests } = useInterests();
  // `interests` is Interest[], not { data: { data: Interest[] } }

  return <div>{interests?.map(...)}</div>;
}
```

---

## Backend Error Response Format

Your mend-backend sends standardized error responses:

```typescript
// From your errorHandler middleware
{
  success: false,
  error: "Username already exists",    // ← User-friendly message
  errorCode: "CONFLICT"                 // ← Machine-readable code
}

// Other error codes from your backend:
// - VALIDATION_ERROR
// - UNAUTHORIZED
// - FORBIDDEN
// - NOT_FOUND
// - CONFLICT
// - DUPLICATE_KEY
// - INVALID_TOKEN
// - TOKEN_EXPIRED
// - INTERNAL_ERROR
```

The `formatApiError()` utility automatically extracts this for you.

**See:** [Error Handling](./error-handling.md) for complete details.

---

## Token Management

### Current Pattern

**Request Interceptor** (automatic):
```typescript
// libs/config/api-client.config.ts
apiClient.interceptors.request.use(async (config) => {
  // Automatically retrieves token from SecureStore
  const token = await SecureStore.getItemAsync('__clerk_client_jwt');

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

**Explicit Token Passing** (when needed):
```typescript
// Some endpoints need explicit token
export const userService = {
  checkUsername: async (username: string, token: string) => {
    const response = await apiClient.get(
      API_ROUTES.USER.CHECK_USERNAME,
      {
        headers: {
          Authorization: `Bearer ${token}` // Explicit token
        }
      }
    );
    return response.data.data;
  },
};
```

### When to Pass Token Explicitly

✅ **Pass explicit token when:**
- Onboarding flow (token not yet in SecureStore)
- Username availability check during signup
- Interceptor fails to retrieve token
- Endpoint needs different token than stored

❌ **DON'T pass explicit token when:**
- Normal authenticated requests
- Token is already in SecureStore
- Interceptor works correctly

---

## File Upload Pattern

For uploading files (images, documents):

### Use FormData with Explicit Headers

```typescript
// libs/services/onboarding.service.ts
export const onboardingService = {
  completeOnboarding: async (
    payload: OnboardingPayload,
    accessToken: string
  ): Promise<OnboardingResponse> => {
    const formData = new FormData();

    // Add text fields
    formData.append('username', payload.username);
    formData.append('display_name', payload.display_name);

    // Add file
    if (payload.profile_image) {
      const fileInfo = {
        uri: payload.profile_image,
        type: 'image/jpeg',
        name: 'profile.jpg'
      };
      formData.append('profile_image', fileInfo as any);
    }

    // Send with explicit headers (NO try-catch!)
    const response = await apiClient.post(
      API_ROUTES.USER.ONBOARDING,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },
};
```

**Key points:**
- Use `FormData` for file uploads
- Set `Content-Type: 'multipart/form-data'`
- Pass auth token explicitly in headers
- **NO try-catch** - let React Query handle errors

---

## Comparison: Backend vs Frontend Error Handling

| Aspect | Backend (mend) | Frontend (React Native) |
|--------|----------------|-------------------------|
| Error wrapper | `asyncHandler` | React Query (useMutation, useQuery) |
| Central handler | `errorHandler` middleware | `handleApiError()` utility |
| Services | No try-catch | No try-catch |
| Error flow | Route → asyncHandler → errorHandler | Component → Mutation → handleApiError |
| Error formatting | In middleware | In formatApiError() |
| Result | Clean routes | Clean mutations |

**Key Insight:** Same philosophy, different tools. React Query IS our asyncHandler!

---

## Summary

### Service Layer Pattern:
1. Services are adapters between backend and frontend
2. Handle response structure differences
3. Return clean, consistent data
4. Export TypeScript interfaces
5. **NO try-catch blocks** - let errors bubble up

### Error Handling Philosophy:
❌ Avoid try-catch in services and components
✅ Use React Query's built-in error handling
✅ Create central `handleApiError()` utility
✅ Use it consistently in all query hooks (one line!)
✅ Handle special cases (401, 403, 409) in one place

### Response Handling:
✅ Extract nested data in services
✅ Return clean data to components
✅ Components never know about response structure

### Token Management:
✅ Trust interceptor for most requests
✅ Pass explicit token for onboarding/special cases
✅ Handle 401 errors with redirect to login

### File Uploads:
✅ Use FormData
✅ Set Content-Type: multipart/form-data
✅ Pass explicit auth token
✅ No try-catch needed

---

**See also:**
- [Error Handling](./error-handling.md) - Complete handleApiError() implementation
- [React Query](./react-query.md) - Query/mutation patterns
- **libs/config/api-client.config.ts** - API client setup
- **libs/services/** - Service layer examples
- **libs/utils/errorHandling.ts** - formatApiError utility
