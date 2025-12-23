import '../global.css';
import { Slot, SplashScreen } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/libs/config/query-client.config';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/libs/config/toast.config';
import * as SecureStore from 'expo-secure-store';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Token cache for Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (error) {
      return;
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <Slot />
        <Toast config={toastConfig} />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
