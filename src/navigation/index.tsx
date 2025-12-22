import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthStack } from './stacks';
import * as ExpoSplashScreen from 'expo-splash-screen';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { StatusBar, Animated } from 'react-native';
import { MainTabs } from './tabs';
import { SplashScreen as CustomSplashScreen } from '../screens';

/**
 * Application Navigation Flow
 * 
 * This component manages the entire navigation flow of the app:
 * 
 * 1. App Initialization:
 *    - Keeps splash screen visible during initialization
 *    - Loads custom fonts
 *    - Checks for existing auth token
 *    - Fetches user details if token exists
 * 
 * 2. Authentication Flow:
 *    - Shows AuthStack if no user is authenticated
 *    - Shows MainTabs if user is authenticated
 * 
 */

ExpoSplashScreen.preventAutoHideAsync(); // keep native splash visible

export default function Navigator() {
  const theme = useThemeStore((state) => state.theme);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const prepare = async () => {
      try {
        // Hide expo splash immediately since we're using custom splash
        await ExpoSplashScreen.hideAsync();
        
        // Show custom splash for 5 seconds
        setTimeout(() => {
          // Start fade animation
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500, // 0.5 second fade duration
            useNativeDriver: true,
          }).start(() => {
            setShowCustomSplash(false);
          });
        }, 5000); // Show for 5 seconds
        
        // Simulate auth check (you can replace this with actual auth logic)
        // const token = await retrieveTokenSecurely();
        // if (token) {
        //   setTimeout(() => {
        //     setUser({
        //       id: '1',
        //       firstName: 'John', 
        //       email: 'john@example.com'
        //     });
        //   }, 3000);
        // }
      } catch (e) {
        // await removeTokenSecurely();
      } finally {
        setAppIsReady(true);
      }
    };

    prepare();
  }, [fadeAnim]);

  // Cleanup when component unmounts
  useEffect(()=>{
    return () => {
      
    }
  }, []);

  // Remove the expo splash screen hide logic since we handle it in useEffect
  const onLayoutRootView = useCallback(async () => {
    // App is ready, no need to hide expo splash here
  }, []);

  // Show custom splash screen for 5 seconds with fade animation
  if (!appIsReady || showCustomSplash) {
    return (
      <>
        <StatusBar barStyle={'light-content'} backgroundColor="transparent" translucent />
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <CustomSplashScreen />
        </Animated.View>
      </>
    );
  }

  return (
    <NavigationContainer onReady={onLayoutRootView}>
      <>
        <StatusBar barStyle={'light-content'} backgroundColor="transparent" translucent />
        {user ? <MainTabs /> : <AuthStack />}
      </>
    </NavigationContainer>
  );
}
