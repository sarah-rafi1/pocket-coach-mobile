// app/_layout.tsx
import '../global.css';
import { Stack } from 'expo-router';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/libs/config/query-client.config';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/libs/config/toast.config';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { SplashScreen } from 'expo-router';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <ProtectedRootLayout />
        <Toast config={toastConfig} />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function ProtectedRootLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  const isFullyLoaded = isLoaded && userLoaded;

  useEffect(() => {
    if (isFullyLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isFullyLoaded]);

  if (!isFullyLoaded) {
    return null; // or <LoadingScreen />
  }

  const hasCompletedOnboarding =
    user?.publicMetadata?.onboardingCompleted === true;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Unauthenticated → show only auth routes */}
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      {/* Signed in but not onboarded → show only onboarding */}
      <Stack.Protected guard={isSignedIn && !hasCompletedOnboarding}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>

      {/* Fully onboarded → show main app */}
      <Stack.Protected guard={isSignedIn && hasCompletedOnboarding}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}