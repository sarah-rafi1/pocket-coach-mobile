export const ROUTES = {
  AUTH: {
    WELCOME: '/(auth)/welcome',
    LOGIN: '/(auth)/login',
    SIGNUP: '/(auth)/signup',
    FORGOT_PASSWORD: '/(auth)/forgot-password',
    EMAIL_VERIFICATION: '/(auth)/email-verification',
  },
  ONBOARDING: {
    PROFILE_COMPLETION: '/(onboarding)/profile-completion',
    SUCCESS: '/(onboarding)/success',
  },
  APP: {
    HOME: '/(app)/(tabs)/home',
    PROFILE: '/(app)/(tabs)/profile',
    SETTINGS: '/(app)/(tabs)/settings',
  },
} as const;

export const FLOWS = {
  ONBOARDING_COMPLETE: '/(app)/(tabs)/home',
  AUTH_COMPLETE: '/(onboarding)/profile-completion',
  LOGOUT: '/(auth)/welcome',
} as const;
