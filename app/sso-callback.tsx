import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';

export default function SSOCallback() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  useEffect(() => {
    const handleCallback = async () => {
      // Wait for auth and user to be loaded
      if (!isLoaded || !userLoaded) {
        return;
      }

      // Check if user has completed onboarding
      const hasCompletedOnboarding = user?.publicMetadata?.onboardingCompleted === true;

      if (hasCompletedOnboarding) {
        // User is fully onboarded, go to main app
        router.replace('/(app)');
      } else {
        // User needs to complete onboarding/profile
        router.replace('/(onboarding)');
      }
    };

    handleCallback();
  }, [isLoaded, userLoaded, isSignedIn, user]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>Completing sign in...</Text>
    </View>
  );
}
