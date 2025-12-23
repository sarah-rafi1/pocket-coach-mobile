import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ImageBackground, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ReusableButton, ReusableInput, GradientText, InfoModal, SocialAuthButtons } from '@/components';
import { fonts } from '@/libs/constants/typography';
import { validateEmailField } from '@/libs/utils/validationSchemas';
import {
  HomeLogo,
  WavingHand,
  Letter,
  LockPassword,
  EyeIcon,
  CloseEyeIcon,
  TickIcon
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
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', action: () => {} });

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

  const handleLogin = async () => {
    if (!email || !password) {
      setModalContent({
        title: "Error",
        message: "Please enter email and password",
        action: () => setShowErrorModal(false)
      });
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setModalContent({
        title: "Success",
        message: "Login UI works! (No backend connected)",
        action: () => setShowSuccessModal(false)
      });
      setShowSuccessModal(true);
    }, 1000);
  };

  const handleGoogleAuth = async () => {
    setSocialLoading("google");
    setTimeout(() => {
      setSocialLoading(null);
      setModalContent({
        title: "Success",
        message: "Google Sign in UI works! (No backend connected)",
        action: () => setShowSuccessModal(false)
      });
      setShowSuccessModal(true);
    }, 1000);
  };

  const handleFacebookAuth = async () => {
    setSocialLoading("facebook");
    setTimeout(() => {
      setSocialLoading(null);
      setModalContent({
        title: "Success",
        message: "Facebook Sign in UI works! (No backend connected)",
        action: () => setShowSuccessModal(false)
      });
      setShowSuccessModal(true);
    }, 1000);
  };

  const handleAppleAuth = async () => {
    setSocialLoading("apple");
    setTimeout(() => {
      setSocialLoading(null);
      setModalContent({
        title: "Success",
        message: "Apple Sign in UI works! (No backend connected)",
        action: () => setShowSuccessModal(false)
      });
      setShowSuccessModal(true);
    }, 1000);
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
                title={loading ? "Signing In..." : "Sign In"}
                variant="gradient"
                fullWidth={true}
                onPress={handleLogin}
                disabled={loading || socialLoading !== null}
              />
            </View>

            {/* Social Auth */}
            <SocialAuthButtons
              mode="login"
              socialLoading={socialLoading}
              onGooglePress={handleGoogleAuth}
              onFacebookPress={handleFacebookAuth}
              onApplePress={handleAppleAuth}
              disabled={loading}
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

        {/* Success Modal */}
        <InfoModal
          visible={showSuccessModal}
          title={modalContent.title}
          message={modalContent.message}
          buttonText="Continue"
          onButtonPress={modalContent.action}
          icon={<TickIcon />}
        />

        {/* Error Modal */}
        <InfoModal
          visible={showErrorModal}
          title={modalContent.title}
          message={modalContent.message}
          buttonText="Try Again"
          onButtonPress={modalContent.action}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}
