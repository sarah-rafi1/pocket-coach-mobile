export const QUERY_KEYS = {
  user: {
    profile: ['user', 'profile'] as const,
    all: ['user'] as const,
  },
  auth: {
    session: ['auth', 'session'] as const,
  },
  interests: {
    all: ['interests'] as const,
  },
  onboarding: {
    complete: ['onboarding', 'complete'] as const,
  },
} as const;
