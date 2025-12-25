# Error Handling Guidelines

Centralized error handling patterns for consistent user experience and maintainable code.

## Philosophy: Central Error Handler

Like your backend's `errorHandler` middleware, we use a central `handleApiError()` utility.

### Backend Inspiration (Your mend-backend):
```javascript
// All errors flow to one place
app.use(errorHandler);

export const errorHandler = (err, req, res, next) => {
  // Custom application errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      errorCode: err.errorCode
    });
  }

  // Mongoose, JWT errors, etc. all handled here
  // ONE place for ALL error handling
};
```

### Frontend Equivalent:
```typescript
// All API errors flow to one utility
export function handleApiError(error: any, context?: string) {
  // ONE place for ALL error handling logic
  const { title, message, code } = formatApiError(error);

  // Handle special cases
  if (code === '401') { /* redirect to login */ }
  if (code === '409') { /* show conflict message */ }

  // Default error display
  showToast('error', title, message);
}
```

---

## The handleApiError Utility

### Implementation

Create this file:

```typescript
// libs/utils/handleApiError.ts
import { formatApiError } from './errorHandling';
import { showToast } from './showToast';
import { ROUTES } from '@/libs/constants/routes';

/**
 * Central API error handler
 * Use this in all React Query mutation/query onError callbacks
 *
 * @param error - The error object from axios/fetch
 * @param context - Optional context for logging (e.g., 'Create User', 'Update Profile')
 */
export function handleApiError(error: any, context?: string): void {
  // 1. Log for debugging
  console.error(`[API Error] ${context || 'Unknown context'}:`, {
    error,
    message: error?.message,
    status: error?.response?.status,
    data: error?.response?.data,
  });

  // 2. Extract error details
  const { title, message, code } = formatApiError(error);

  // 3. Handle specific status codes

  // 401 Unauthorized - Session expired
  if (code === '401') {
    showToast('error', 'Session Expired', 'Please login again');
    // Note: Router redirect would go here, but needs to be passed in
    // or use a navigation service
    return;
  }

  // 403 Forbidden - Access denied
  if (code === '403') {
    showToast('error', 'Access Denied', 'You don\'t have permission to perform this action');
    return;
  }

  // 409 Conflict - Resource already exists
  if (code === '409') {
    showToast('error', 'Already Exists', message);
    return;
  }

  // 404 Not Found
  if (code === '404') {
    showToast('error', 'Not Found', message || 'The requested resource was not found');
    return;
  }

  // 422 Validation Error
  if (code === '422' || code === '400') {
    showToast('error', 'Validation Error', message);
    return;
  }

  // Network Error - No internet
  if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
    showToast('error', 'No Internet', 'Please check your connection and try again');
    return;
  }

  // Timeout Error
  if (error.code === 'ECONNABORTED') {
    showToast('error', 'Request Timeout', 'The request took too long. Please try again');
    return;
  }

  // 4. Default error handling
  showToast('error', title, message);
}
```

### Usage in Query Hooks

```typescript
// libs/queries/user.query.ts
import { handleApiError } from '@/libs/utils/handleApiError';
import { userService } from '@/libs/services/user.service';

export function useCreateUser() {
  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      showToast('success', 'User Created', 'Welcome to the app!');
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
    onError: (error) => handleApiError(error, 'Update Profile'), // ← One line!
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.user.profile,
    queryFn: userService.getProfile,
    onError: (error) => handleApiError(error, 'Fetch Profile'), // ← Works for queries too!
  });
}
```

---

## The formatApiError Utility (Already Exists)

Located at `libs/utils/errorHandling.ts:86-121`:

```typescript
export function formatApiError(error: any): ErrorDetails {
  // Handle different types of API errors
  if (error.response?.data) {
    const errorData = error.response.data;

    // Backend error with field-level errors
    if (errorData.errors && typeof errorData.errors === 'object') {
      const firstError = Object.entries(errorData.errors)[0];
      if (firstError) {
        return {
          title: 'Validation Error',
          message: firstError[1] as string,
          field: firstError[0]
        };
      }
    }

    // Standard error response
    return {
      title: 'Error',
      message: errorData.message || errorData.error || 'An error occurred',
      code: errorData.statusCode?.toString() || error.response.status?.toString()
    };
  }

  // Network error
  if (error.message) {
    return {
      title: 'Error',
      message: error.message
    };
  }

  // Fallback
  return {
    title: 'Error',
    message: 'An unexpected error occurred'
  };
}
```

**Backend Error Response (Your mend-backend format):**
```typescript
{
  success: false,
  error: "Username already exists",  // ← formatApiError extracts this
  errorCode: "CONFLICT"               // ← Used for code matching
}
```

---

## Clerk-Specific Error Handling

Clerk (authentication) has its own error format. Handle it separately:

### Pattern from libs/queries/auth.query.ts

```typescript
import { isClerkAPIResponseError } from '@clerk/clerk-expo';

export function useLogin() {
  return useMutation({
    mutationFn: authService.login,
    onError: (error) => {
      console.error('Login failed:', error);
      let errorMessage = 'Login failed. Please try again.';

      // Check if it's a Clerk error
      if (isClerkAPIResponseError(error)) {
        const firstError = error.errors?.[0];

        switch (firstError?.code) {
          case 'form_identifier_not_found':
            errorMessage = 'No account found with this email.';
            break;
          case 'form_password_incorrect':
            errorMessage = 'Incorrect password.';
            break;
          case 'strategy_for_user_invalid':
            errorMessage = 'This account was created with Google, Facebook, or Apple. Please use the same sign-in method.';
            break;
          case 'form_password_not_set':
            errorMessage = 'No password set for this account. Please use social sign-in or reset your password.';
            break;
          default:
            errorMessage = firstError?.message || errorMessage;
        }
      }

      showToast('error', 'Login Failed', errorMessage);
    },
  });
}
```

### Common Clerk Error Codes

| Code | Meaning | User Message |
|------|---------|--------------|
| `form_identifier_not_found` | Email not found | "No account found with this email" |
| `form_password_incorrect` | Wrong password | "Incorrect password" |
| `form_identifier_exists` | Email already used | "An account with this email already exists" |
| `form_password_pwned` | Password compromised | "This password has been compromised. Please choose another" |
| `verification_expired` | Code expired | "Verification code expired. Request a new one" |
| `verification_failed` | Invalid code | "Invalid verification code" |
| `strategy_for_user_invalid` | Wrong login method | "Use your original sign-in method (Google/Apple/Email)" |

---

## Status Code Handling

### Standard HTTP Status Codes

Handle these in `handleApiError()`:

| Code | Type | Handling |
|------|------|----------|
| **200** | Success | No error |
| **400** | Bad Request | Show validation message |
| **401** | Unauthorized | Redirect to login + toast |
| **403** | Forbidden | Show access denied message |
| **404** | Not Found | Show resource not found |
| **409** | Conflict | Show "already exists" message |
| **422** | Validation Error | Show validation details |
| **500** | Server Error | Show generic error + retry |

### Example: Handling 409 Conflict

```typescript
// In handleApiError()
if (code === '409') {
  showToast('error', 'Already Exists', message);
  return;
}

// Component can also handle specifically if needed
export function useCreateUsername() {
  return useMutation({
    mutationFn: userService.createUsername,
    onError: (error) => {
      const { code, message } = formatApiError(error);

      if (code === '409') {
        // Custom handling for this specific mutation
        showToast('error', 'Username Taken', 'Please choose a different username');
        // Maybe navigate back to form
        return;
      }

      // Otherwise use central handler
      handleApiError(error, 'Create Username');
    },
  });
}
```

---

## Toast Notification Standards

### Toast Utility Location

`libs/utils/showToast.tsx` - Already exists

### Usage

```typescript
import { showToast } from '@/libs/utils';

// Success
showToast('success', 'Profile Updated', 'Your changes have been saved');

// Error
showToast('error', 'Upload Failed', 'Image must be less than 5MB');

// Info
showToast('info', 'New Feature', 'Check out dark mode in settings!');

// Alert/Warning
showToast('alert', 'Unsaved Changes', 'You have unsaved changes');
```

### When to Use Each Type

| Type | When to Use | Example |
|------|-------------|---------|
| `success` | Operation completed successfully | "Profile updated", "Login successful" |
| `error` | Operation failed | "Upload failed", "Invalid credentials" |
| `info` | Informational message | "New feature available", "App updated" |
| `alert` | Warning/caution | "Unsaved changes", "Low storage" |

### Toast Best Practices

✅ **DO:**
- Keep titles short (2-3 words)
- Make messages actionable
- Use for user-triggered actions
- Auto-dismiss after 3-4 seconds

❌ **DON'T:**
- Show multiple toasts at once
- Use for every small action
- Show technical error messages
- Keep toasts visible too long

---

## Network Error Handling

### Pattern

```typescript
import { handleNetworkError } from '@/libs/utils/errorHandling';

export function useFetchData() {
  return useQuery({
    queryKey: QUERY_KEYS.data.all,
    queryFn: dataService.fetchAll,
    onError: (error) => {
      // Check for network error first
      if (!navigator.onLine || error.code === 'ERR_NETWORK') {
        showToast(
          'error',
          'No Internet',
          'Please check your connection and try again'
        );
        return;
      }

      // Otherwise use central handler
      handleApiError(error, 'Fetch Data');
    },
    retry: (failureCount, error) => {
      // Don't retry on network errors
      if (!navigator.onLine) return false;
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
}
```

---

## Validation Error Handling

### Zod Validation Errors

Use `formatZodError()` from `libs/utils/errorHandling.ts:24-76`:

```typescript
import { formatZodError } from '@/libs/utils/errorHandling';
import { loginSchema } from '@/libs/schemas';

function LoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    try {
      // Validate with Zod
      const validated = loginSchema.parse(formData);
      // Submit if valid
      mutation.mutate(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format errors for display
        const formatted = formatZodError(error);
        const errorMap: Record<string, string> = {};
        formatted.forEach(err => {
          if (err.field) {
            errorMap[err.field] = err.message;
          }
        });
        setErrors(errorMap);
      }
    }
  };

  return (
    <>
      <Input
        value={email}
        onChange={setEmail}
        error={errors.email} // Show inline
      />
      <Input
        value={password}
        onChange={setPassword}
        error={errors.password}
      />
    </>
  );
}
```

---

## Global Error Boundary (Future Enhancement)

For catching unexpected React errors:

```typescript
// libs/components/ErrorBoundary.tsx (TODO: Create)
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-xl font-bold mb-4">Something went wrong</Text>
      <Text className="text-gray-600 mb-4">{error.message}</Text>
      <Button onPress={resetErrorBoundary}>Try Again</Button>
    </View>
  );
}

export function AppErrorBoundary({ children }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Uncaught error:', error, errorInfo);
        // Could send to error tracking service
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
```

---

## Summary

### Central Error Handler Pattern:
1. Create `handleApiError()` utility
2. Use it in ALL mutation/query `onError` callbacks
3. ONE place for ALL error handling logic
4. Handle special cases (401, 403, 409) centrally

### Key Utilities:
- **handleApiError()** - Central error handler (use everywhere)
- **formatApiError()** - Extracts error details from backend
- **formatZodError()** - Formats Zod validation errors
- **showToast()** - Display errors to users

### Error Flow:
```
API Error
  → React Query onError
    → handleApiError()
      → formatApiError() (extract details)
        → Check status code (401, 403, 409, etc.)
          → showToast() (display to user)
```

### Clerk Errors:
✅ Use `isClerkAPIResponseError()` to detect
✅ Check `error.errors[0].code` for specific error
✅ Map codes to user-friendly messages
✅ Display with `showToast()`

### Best Practices:
✅ NO try-catch in services (let errors bubble up)
✅ Use central `handleApiError()` in all queries/mutations
✅ Handle Clerk errors separately (different format)
✅ Show user-friendly messages (not technical details)
✅ Log errors for debugging
✅ Use toasts consistently

---

**See also:**
- [API Patterns](./api-patterns.md) - Service layer, no try-catch pattern
- [React Query](./react-query.md) - Mutation/query error handling
- **libs/utils/errorHandling.ts** - All error utilities
- **libs/utils/handleApiError.ts** - Central error handler (create this!)
- **libs/queries/auth.query.ts** - Clerk error handling example
