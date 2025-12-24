import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ImageBackground, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ReusableButton, ReusableInput, GradientText, PasswordRequirements, SocialAuthButtons } from '@/components';
import { fonts } from '@/libs/constants/typography';
import { validateEmailField, validatePasswordField } from '@/libs/utils/validationSchemas';
import { useSignUp, useSSOSignIn } from '@/libs/queries/auth.query';
import { showToast } from '@/libs/utils';
import {
  HomeLogo,
  Letter,
  LockPassword,
  EyeIcon,
  CloseEyeIcon
} from '@/assets/icons';

export default function SignUpScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // Keyboard state
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validation errors
  const [emailError, setEmailError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // UI states
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Auth hooks
  const signUpMutation = useSignUp();
  const googleSSOSignIn = useSSOSignIn('oauth_google');
  const facebookSSOSignIn = useSSOSignIn('oauth_facebook');
  const appleSSOSignIn = useSSOSignIn('oauth_apple');

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (confirmPasswordError && text === confirmPassword) setConfirmPasswordError('');
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) setConfirmPasswordError('');
  };

  const handleConfirmPasswordFocus = () => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleEmailBlur = () => {
    if (email) {
      const validation = validateEmailField(email);
      if (!validation.isValid) {
        setEmailError(validation.error || 'Please enter a valid email');
      }
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword && confirmPassword !== password) setConfirmPasswordError('Passwords do not match');
  };

  const handleSignUp = () => {
    let hasError = false;

    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else {
      const emailValidation = validateEmailField(email);
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.error || 'Please enter a valid email');
        hasError = true;
      }
    }

    if (!password) {
      hasError = true;
    } else {
      const passwordValidation = validatePasswordField(password);
      if (!passwordValidation.isValid) {
        hasError = true;
      }
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (!hasError) {
      signUpMutation.mutate({ email, password });
    }
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

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ImageBackground source={require('@/assets/images/Background.png')} style={{ flex: 1 }} resizeMode="cover">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} className="flex-1" keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -100}>
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingTop: Platform.OS === 'ios' ? 20 : 0, paddingBottom: isKeyboardVisible ? 200 : 0 }}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={isKeyboardVisible}
          nestedScrollEnabled={true}
        >
          <View className="pt-12 px-6 pb-6">
            <HomeLogo />
          </View>

          <View className="px-6 mb-6">
            <Text className="text-white text-3xl font-bold mb-3" style={{ fontFamily: fonts.SharpSansBold }}>
              Create Your Account
            </Text>
            <Text className="text-gray-400 text-base leading-6" style={{ fontFamily: fonts.SharpSansRegular }}>
              Create your account by adding your account basic details
            </Text>
          </View>

          <View className="px-6">
            <View className="mb-4">
              <Text className="text-white text-base font-medium mb-2" style={{ fontFamily: fonts.SharpSansMedium }}>Email Address</Text>
              <ReusableInput placeholder="Enter your email" value={email} onChangeText={handleEmailChange} onBlur={handleEmailBlur}
                leftIcon={<Letter color={emailError ? '#FF5050' : 'white'} />} error={emailError} hasError={!!emailError}
                keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View className="mb-3">
              <Text className="text-white text-base font-medium mb-2" style={{ fontFamily: fonts.SharpSansMedium }}>Password</Text>
              <ReusableInput placeholder="Enter your password" value={password} onChangeText={handlePasswordChange} isPassword={true}
                leftIcon={<LockPassword color='white' />} rightIcon={isPasswordVisible ? <CloseEyeIcon /> : <EyeIcon />}
                onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)} />
              <PasswordRequirements password={password} visible={password.length > 0} showOnlyErrors={true} />
            </View>

            <View className="mb-3">
              <Text className="text-white text-base font-medium mb-2" style={{ fontFamily: fonts.SharpSansMedium }}>Confirm Password</Text>
              <ReusableInput placeholder="Confirm your password" value={confirmPassword} onChangeText={handleConfirmPasswordChange}
                onBlur={handleConfirmPasswordBlur} onFocus={handleConfirmPasswordFocus} isPassword={true}
                leftIcon={<LockPassword color={confirmPasswordError ? '#FF5050' : 'white'} />}
                rightIcon={isConfirmPasswordVisible ? <CloseEyeIcon /> : <EyeIcon />}
                onRightIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                error={confirmPasswordError} hasError={!!confirmPasswordError} />
            </View>

            <View className="mb-6">
              <ReusableButton title={signUpMutation.isPending ? "Creating Account..." : "Sign Up"} variant="gradient" fullWidth={true}
                onPress={handleSignUp} disabled={signUpMutation.isPending || socialLoading !== null} />
            </View>

            <SocialAuthButtons mode="signup" socialLoading={socialLoading}
              onGooglePress={handleGoogleAuth}
              onFacebookPress={handleFacebookAuth}
              onApplePress={handleAppleAuth} disabled={signUpMutation.isPending} />

            <View className="flex-row justify-center items-center pb-4">
              <Text className="text-gray-400 text-sm" style={{ fontFamily: fonts.SharpSansRegular }}>Already have an account? </Text>
              <GradientText style={{ fontSize: 14, fontWeight: '500' }} onPress={() => router.push('/(auth)/login')}>Sign In</GradientText>
            </View>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}
