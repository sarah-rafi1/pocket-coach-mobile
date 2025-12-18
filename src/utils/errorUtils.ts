/**
 * Utility functions for cleaning up and formatting error messages
 */

export const cleanErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  let message = error.message || error.toString();
  
  // Handle Cognito UserLambdaValidationException with custom message extraction
  if (message.includes('UserLambdaValidationException') || message.includes('PreSignUp failed with error')) {
    // Extract the actual error message after "PreSignUp failed with error"
    const preSignUpMatch = message.match(/PreSignUp failed with error (.+?)\.\.?$/);
    if (preSignUpMatch && preSignUpMatch[1]) {
      return preSignUpMatch[1].trim();
    }
    
    // Fallback: Look for common user-friendly messages
    if (message.includes('account with this email already exists')) {
      return 'An account with this email already exists.';
    }
  }
  
  // Handle other common AWS Cognito errors with cleaner messages
  const errorMappings: { [key: string]: string } = {
    'UsernameExistsException': 'An account with this email already exists.',
    'InvalidPasswordException': 'Password does not meet requirements.',
    'InvalidParameterException': 'Invalid email format.',
    'CodeMismatchException': 'Invalid confirmation code.',
    'ExpiredCodeException': 'Confirmation code has expired.',
    'UserNotFoundException': 'No account found with this email.',
    'NotAuthorizedException': 'Incorrect email or password.',
    'UserNotConfirmedException': 'Please verify your email address.',
    'LimitExceededException': 'Too many requests. Please try again later.',
    'TooManyRequestsException': 'Too many requests. Please try again later.',
    'NetworkError': 'Please check your internet connection.',
    'TimeoutError': 'Request timed out. Please try again.'
  };
  
  // Check if the message contains any of the error types
  for (const [errorType, cleanMessage] of Object.entries(errorMappings)) {
    if (message.includes(errorType)) {
      return cleanMessage;
    }
  }
  
  // Clean up technical prefixes and suffixes
  message = message
    .replace(/^\[Error:\s*/, '') // Remove [Error: prefix
    .replace(/\]$/, '') // Remove ] suffix
    .replace(/^\w+Exception:\s*/, '') // Remove exception type prefix
    .replace(/\s*\.\.\s*$/, '.') // Replace .. with single period
    .replace(/\s*\.\s*$/, '.') // Ensure single period ending
    .trim();
  
  // Ensure the message ends with a period
  if (message && !message.endsWith('.') && !message.endsWith('!') && !message.endsWith('?')) {
    message += '.';
  }
  
  return message || 'An unexpected error occurred.';
};

export const isNetworkError = (error: any): boolean => {
  const message = error?.message?.toLowerCase() || '';
  return message.includes('network') || 
         message.includes('internet') || 
         message.includes('connection') ||
         message.includes('timeout') ||
         error?.code === 'NETWORK_ERROR';
};

export const isAuthenticationError = (error: any): boolean => {
  const message = error?.message || '';
  const authErrors = [
    'NotAuthorizedException',
    'UserNotConfirmedException', 
    'UserNotFoundException',
    'InvalidPasswordException',
    'CodeMismatchException'
  ];
  
  return authErrors.some(errorType => message.includes(errorType));
};