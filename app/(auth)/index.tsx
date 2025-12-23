import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ImageBackground, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ReusableButton, ReusableInput, GradientText, SocialAuthButtons } from '@/components';
import { fonts } from '@/libs/constants/typography';
import { validateEmailField } from '@/libs/utils/validationSchemas';
import { useLogin, useSSOSignIn } from '@/libs/queries/auth.query';
import { showToast } from '@/libs/utils';
import {
  HomeLogo,
  WavingHand,
  Letter,
  LockPassword,
  EyeIcon,
  CloseEyeIcon
} from '@/assets/icons';

export default function LoginScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // Keyboard state
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Validation errors
  const [emailError, setEmailError] = useState('');

  // UI states
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Auth hooks
  const loginMutation = useLogin();
  const googleSSOSignIn = useSSOSignIn('oauth_google');
  const facebookSSOSignIn = useSSOSignIn('oauth_facebook');
  const appleSSOSignIn = useSSOSignIn('oauth_apple');

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  const handleEmailBlur = () => {
    if (email) {
      const validation = validateEmailField(email);
      if (!validation.isValid) {
        setEmailError(validation.error || 'Please enter a valid email');
      }
    }
  };

  const handleLogin = () => {
    if (!email || !password) {
      showToast('error', 'Missing Fields', 'Please enter email and password');
      return;
    }

    const emailValidation = validateEmailField(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email');
      return;
    }

    loginMutation.mutate({ email, password });
  };

  const handleGoogleAuth = () => {
    setSocialLoading('google');
    googleSSOSignIn.mutate(undefined, {
      onSettled: () => setSocialLoading(null),
    });
  };

  const handleFacebookAuth = () => {
    setSocialLoading('facebook');
    facebookSSOSignIn.mutate(undefined, {
      onSettled: () => setSocialLoading(null),
    });
  };

  const handleAppleAuth = () => {
    setSocialLoading('apple');
    appleSSOSignIn.mutate(undefined, {
      onSettled: () => setSocialLoading(null),
    });
  };

  const navigateToForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const switchToSignUp = () => {
    router.push('/(auth)/signup');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ImageBackground
        source={require('@/assets/images/Background.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -100}
        >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: Platform.OS === 'ios' ? 20 : 0,
            paddingBottom: isKeyboardVisible ? 200 : 0
          }}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={isKeyboardVisible}
          nestedScrollEnabled={true}
        >
          {/* Header */}
          <View className="pt-12 px-6 pb-6">
            <HomeLogo />
          </View>

          {/* Welcome Section */}
          <View className="px-6 mb-6">
            <View className="flex-row items-center mb-3">
              <Text className="text-white text-3xl font-bold mr-3" style={{ fontFamily: fonts.SharpSansBold }}>
                Welcome Back
              </Text>
              <WavingHand />
            </View>
            <Text className="text-gray-400 text-base leading-6" style={{ fontFamily: fonts.SharpSansRegular }}>
              Sign in to your account to continue your fitness journey
            </Text>
          </View>

          {/* Form Fields */}
          <View className="px-6">
            {/* Email Field */}
            <View className="mb-4">
              <Text className="text-white text-base font-medium mb-2" style={{ fontFamily: fonts.SharpSansMedium }}>
                Email Address
              </Text>
              <ReusableInput
                placeholder="Enter your email"
                value={email}
                onChangeText={handleEmailChange}
                onBlur={handleEmailBlur}
                leftIcon={<Letter color={emailError ? '#FF5050' : 'white'} />}
                error={emailError}
                hasError={!!emailError}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Field */}
            <View className="mb-3">
              <Text className="text-white text-base font-medium mb-2" style={{ fontFamily: fonts.SharpSansMedium }}>
                Password
              </Text>
              <ReusableInput
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                isPassword={true}
                leftIcon={<LockPassword color='white' />}
                rightIcon={isPasswordVisible ? <CloseEyeIcon /> : <EyeIcon />}
                onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
              />
            </View>

            {/* Forgot Password */}
            <View className="mb-4 flex-row justify-end">
              <GradientText style={{ fontSize: 14, fontWeight: '500' }} onPress={navigateToForgotPassword}>
                Forgot Password?
              </GradientText>
            </View>

            {/* Submit Button */}
            <View className="mb-6">
              <ReusableButton
                title={loginMutation.isPending ? "Signing In..." : "Sign In"}
                variant="gradient"
                fullWidth={true}
                onPress={handleLogin}
                disabled={loginMutation.isPending || socialLoading !== null}
              />
            </View>

            {/* Social Auth */}
            <SocialAuthButtons
              mode="login"
              socialLoading={socialLoading}
              onGooglePress={handleGoogleAuth}
              onFacebookPress={handleFacebookAuth}
              onApplePress={handleAppleAuth}
              disabled={loginMutation.isPending}
            />

            {/* Switch Mode */}
            <View className="flex-row justify-center items-center pb-4">
              <Text className="text-gray-400 text-sm" style={{ fontFamily: fonts.SharpSansRegular }}>
                Don't have an account?{' '}
              </Text>
              <GradientText style={{ fontSize: 14, fontWeight: '500' }} onPress={switchToSignUp}>
                Sign Up
              </GradientText>
            </View>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}
