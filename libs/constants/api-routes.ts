// API route constants
export const API_ROUTES = {
  // User routes
  USER: {
    ME: '/users/me',
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    DELETE_ACCOUNT: '/user/account',
    CHECK_USERNAME: '/users/check-username',
    ONBOARDING: '/users/me/onboarding',
  },
  // Auth routes
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    SEND_VERIFICATION: '/auth/send-verification-code',
  },
  // Interest routes
  INTERESTS: '/interests',
} as const;
