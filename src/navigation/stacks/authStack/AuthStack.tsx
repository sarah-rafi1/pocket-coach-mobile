import { createStackNavigator } from '@react-navigation/stack';
import { SplashScreen, HomeScreen, LoginScreen, SignUpScreen, ForgotPasswordScreen, EmailVerificationScreen, ResetPasswordScreen, ProfileCompletionScreen, ProfileSuccessScreen } from '../../../screens';
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
        name="login-screen"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="sign-up-screen"
        component={SignUpScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="forgot-password-screen"
        component={ForgotPasswordScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="email-verification-screen"
        component={EmailVerificationScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="reset-password-screen"
        component={ResetPasswordScreen}
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
    </Stack.Navigator>
  );
}