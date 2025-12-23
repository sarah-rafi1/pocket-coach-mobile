import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ImageBackground, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ReusableButton, ReusableInput, GradientText, InfoModal, PasswordRequirements, SocialAuthButtons } from '@/components';
import { fonts } from '@/libs/constants/typography';
import { validateEmailField, validatePasswordField } from '@/libs/utils/validationSchemas';
import {
  HomeLogo,
  Letter,
  LockPassword,
  EyeIcon,
  CloseEyeIcon,
  TickIcon
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
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', action: () => {} });

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

  const handleSignUp = async () => {
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
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setModalContent({
          title: "Success",
          message: "Sign up UI works! (No backend connected)",
          action: () => setShowSuccessModal(false)
        });
        setShowSuccessModal(true);
      }, 1000);
    }
  };

  const handleSocialAuth = (provider: 'google' | 'facebook' | 'apple') => {
    setSocialLoading(provider);
    setTimeout(() => {
      setSocialLoading(null);
      setModalContent({
        title: "Success",
        message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Sign up UI works!`,
        action: () => setShowSuccessModal(false)
      });
      setShowSuccessModal(true);
    }, 1000);
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
              <ReusableButton title={loading ? "Creating Account..." : "Sign Up"} variant="gradient" fullWidth={true}
                onPress={handleSignUp} disabled={loading || socialLoading !== null} />
            </View>

            <SocialAuthButtons mode="signup" socialLoading={socialLoading}
              onGooglePress={() => handleSocialAuth('google')}
              onFacebookPress={() => handleSocialAuth('facebook')}
              onApplePress={() => handleSocialAuth('apple')} disabled={loading} />

            <View className="flex-row justify-center items-center pb-4">
              <Text className="text-gray-400 text-sm" style={{ fontFamily: fonts.SharpSansRegular }}>Already have an account? </Text>
              <GradientText style={{ fontSize: 14, fontWeight: '500' }} onPress={() => router.push('/(auth)/login')}>Sign In</GradientText>
            </View>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <InfoModal visible={showSuccessModal} title={modalContent.title} message={modalContent.message}
          buttonText="Continue" onButtonPress={modalContent.action} icon={<TickIcon />} />
        <InfoModal visible={showErrorModal} title={modalContent.title} message={modalContent.message}
          buttonText="Try Again" onButtonPress={modalContent.action} />
      </ImageBackground>
    </SafeAreaView>
  );
}
