import { createStackNavigator } from '@react-navigation/stack';
import { SplashScreen, HomeScreen, AuthScreen, FeedScreen, PasswordRecoveryScreen, ProfileCompletionScreen, ProfileSuccessScreen } from '../../../screens';
import { AppRoutes } from '../../../types';

const Stack = createStackNavigator<AppRoutes>();

export function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="home-screen">
      <Stack.Screen
        name="splash-screen"
        component={SplashScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="home-screen"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile-completion-screen"
        component={ProfileCompletionScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile-success-screen"
        component={ProfileSuccessScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="auth-screen"
        component={AuthScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="password-recovery-screen"
        component={PasswordRecoveryScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="feed-screen"
        component={FeedScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}