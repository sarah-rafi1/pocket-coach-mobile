import { Redirect } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useEffect } from 'react';
import { SplashScreen } from 'expo-router';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return null;
  }

  // 3-Tier Route Protection (following CLAUDE.md pattern)

  // Tier 1: Not authenticated → Auth flow
  if (!isSignedIn) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Tier 2: Authenticated but not onboarded → Onboarding flow
  // Check if user has completed onboarding (via Clerk metadata)
  const hasCompletedOnboarding = user?.publicMetadata?.onboardingCompleted === true;

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)/profile-completion" />;
  }

  // Tier 3: Authenticated and onboarded → Main app
  return <Redirect href="/(app)" />;
}
