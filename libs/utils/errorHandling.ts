import { z } from 'zod';

// Error handling utilities for better user experience
export interface ErrorDetails {
  title: string;
  message: string;
  field?: string;
  code?: string;
}

export class ValidationError extends Error {
  public field?: string;
  public code?: string;
  
  constructor(message: string, field?: string, code?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
  }
}

// Convert Zod errors to user-friendly messages
export function formatZodError(error: z.ZodError): ErrorDetails[] {
  return error.errors.map((err) => {
    const field = err.path.join('.');
    let message = err.message;
    
    // Customize error messages for better UX
    switch (err.code) {
      case 'too_small':
        if (err.type === 'string') {
          if (err.minimum === 1) {
            message = `${field} is required`;
          } else {
            message = `${field} must be at least ${err.minimum} characters`;
          }
        } else if (err.type === 'array') {
          message = `Please select at least ${err.minimum} item${err.minimum > 1 ? 's' : ''}`;
        }
        break;
      case 'too_big':
        if (err.type === 'string') {
          message = `${field} must be less than ${err.maximum} characters`;
        } else if (err.type === 'array') {
          message = `Please select no more than ${err.maximum} item${err.maximum > 1 ? 's' : ''}`;
        }
        break;
      case 'invalid_string':
        if (err.validation === 'email') {
          message = 'Please enter a valid email address';
        } else if (err.validation === 'regex') {
          // Custom regex error messages
          if (field === 'username') {
            message = 'Username can only contain letters, numbers, dots, and underscores';
          } else if (field.includes('password')) {
            message = 'Password does not meet security requirements';
          }
        }
        break;
      case 'custom':
        // Keep custom messages as-is
        break;
      default:
        // Keep default message
        break;
    }
    
    return {
      title: 'Validation Error',
      message,
      field,
      code: err.code
    };
  });
}

// API error handling
export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  errors?: Record<string, string>;
  path?: string;
}

export function formatApiError(error: any): ErrorDetails {
  // Handle different types of API errors
  if (error.response?.data) {
    const errorData = error.response.data;
    
    if (errorData.errors && typeof errorData.errors === 'object') {
      // Multiple field errors
      const firstError = Object.entries(errorData.errors)[0];
      if (firstError) {
        return {
          title: 'Validation Error',
          message: firstError[1] as string,
          field: firstError[0]
        };
      }
    }
    
    return {
      title: 'Error',
      message: errorData.message || 'An error occurred',
      code: errorData.statusCode?.toString()
    };
  }
  
  if (error.message) {
    return {
      title: 'Error',
      message: error.message
    };
  }
  
  return {
    title: 'Error',
    message: 'An unexpected error occurred'
  };
}

// Network error handling
export function handleNetworkError(error: any): ErrorDetails {
  if (!navigator.onLine) {
    return {
      title: 'No Internet Connection',
      message: 'Please check your internet connection and try again.'
    };
  }
  
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please try again later.'
    };
  }
  
  if (error.code === 'TIMEOUT_ERROR') {
    return {
      title: 'Request Timeout',
      message: 'The request took too long. Please try again.'
    };
  }
  
  return formatApiError(error);
}

// Success message utilities
export interface SuccessDetails {
  title: string;
  message: string;
  action?: string;
}

export function createSuccessMessage(action: string, details?: string): SuccessDetails {
  const messages: Record<string, SuccessDetails> = {
    'profile-updated': {
      title: 'Success!',
      message: 'Your profile has been updated successfully.',
      action: 'Continue'
    },
    'profile-created': {
      title: 'Welcome!',
      message: 'Your profile has been created successfully.',
      action: 'Get Started'
    },
    'email-verified': {
      title: 'Email Verified!',
      message: 'Your email has been successfully verified.',
      action: 'Continue'
    },
    'password-reset': {
      title: 'Password Updated!',
      message: 'Your password has been successfully updated.',
      action: 'Login Now'
    },
    'account-created': {
      title: 'Account Created!',
      message: 'Please check your email to verify your account.',
      action: 'Continue'
    }
  };
  
  return messages[action] || {
    title: 'Success!',
    message: details || 'Operation completed successfully.',
    action: 'Continue'
  };
}

// Logging utilities for debugging
export function logValidationError(error: z.ZodError, context?: string) {
  console.group(`🔍 [VALIDATION ERROR] ${context || 'Unknown context'}`);
  console.log('Error details:', error.errors);
  console.log('Formatted errors:', formatZodError(error));
  console.groupEnd();
}

export function logApiError(error: any, context?: string) {
  console.group(`❌ [API ERROR] ${context || 'Unknown context'}`);
  console.log('Raw error:', error);
  console.log('Formatted error:', formatApiError(error));
  console.groupEnd();
}