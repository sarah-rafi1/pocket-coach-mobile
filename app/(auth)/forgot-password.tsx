import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ReusableButton, ReusableInput, InfoModal, PasswordRequirements, BackArrowButton, PasswordUpdatedModal } from '@/components';
import { fonts } from '@/libs/constants/typography';
import { validateEmailField, validatePasswordField } from '@/libs/utils/validationSchemas';
import {
  ForgotPasswordLogo,
  EmailVerificationLogo,
  ResetPasswordLogo,
  Letter,
  LockPassword,
  EyeIcon,
  CloseEyeIcon,
  TickIcon
} from '@/assets/icons';

type ScreenMode = 'forgot-password' | 'email-verification' | 'reset-password';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: ScreenMode; email?: string; password?: string }>();
  const scrollViewRef = useRef<ScrollView>(null);

  // Keyboard state
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Screen state management
  const [currentMode, setCurrentMode] = useState<ScreenMode>(params.mode || 'forgot-password');

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Form fields
  const [email, setEmail] = useState(params.email || '');
  const [password, setPassword] = useState(params.password || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Timer
  const [timeLeft, setTimeLeft] = useState(180);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Validation errors
  const [emailError, setEmailError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // UI states
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPasswordUpdatedModal, setShowPasswordUpdatedModal] = useState(false);

  // Timer logic
  useEffect(() => {
    if (currentMode === 'email-verification') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendCode = async () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    const emailValidation = validateEmailField(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Please enter a valid email');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentMode('email-verification');
    }, 1000);
  };

  const handleVerifyCode = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentMode('reset-password');
    }, 1000);
  };

  const handleResetPassword = async () => {
    let hasError = false;

    if (!newPassword) {
      hasError = true;
    } else {
      const passwordValidation = validatePasswordField(newPassword);
      if (!passwordValidation.isValid) {
        hasError = true;
      }
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (!hasError) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setShowPasswordUpdatedModal(true);
      }, 1000);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackPress = () => {
    if (currentMode === 'email-verification') {
      setCurrentMode('forgot-password');
    } else if (currentMode === 'reset-password') {
      setCurrentMode('email-verification');
    } else {
      router.back();
    }
  };

  const renderForgotPasswordMode = () => (
    <>
      <View className="items-center mb-8">
        <ForgotPasswordLogo />
      </View>
      <View className="mb-6">
        <Text className="text-white text-2xl font-bold text-center mb-3" style={{ fontFamily: fonts.SharpSansBold }}>
          Forgot Password
        </Text>
        <Text className="text-gray-400 text-sm text-center px-4" style={{ fontFamily: fonts.SharpSansRegular }}>
          Enter your email address to receive a verification code
        </Text>
      </View>
      <View className="mb-4">
        <Text className="text-white text-base font-medium mb-2" style={{ fontFamily: fonts.SharpSansMedium }}>
          Email Address
        </Text>
        <ReusableInput
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => { setEmail(text); if (emailError) setEmailError(''); }}
          onBlur={() => {
            if (email) {
              const validation = validateEmailField(email);
              if (!validation.isValid) {
                setEmailError(validation.error || 'Please enter a valid email');
              }
            }
          }}
          leftIcon={<Letter color={emailError ? '#FF5050' : 'white'} />}
          error={emailError}
          hasError={!!emailError}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <ReusableButton title={loading ? "Sending..." : "Send Code"} variant="gradient" fullWidth={true}
        onPress={handleSendCode} disabled={loading} />
    </>
  );

  const renderEmailVerificationMode = () => (
    <>
      <View className="items-center mb-8">
        <EmailVerificationLogo />
      </View>
      <View className="mb-6">
        <Text className="text-white text-2xl font-bold text-center mb-3" style={{ fontFamily: fonts.SharpSansBold }}>
          Email Verification
        </Text>
        <Text className="text-gray-400 text-sm text-center px-4" style={{ fontFamily: fonts.SharpSansRegular }}>
          We have sent a code to your email {email}
        </Text>
      </View>
      <View className="flex-row justify-between mb-6 px-4">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            keyboardType="number-pad"
            maxLength={1}
            className={`w-12 h-14 rounded-lg text-center text-white text-xl ${
              focusedIndex === index ? 'border-2 border-purple-500' : 'border border-gray-600'
            } bg-gray-800`}
            style={{ fontFamily: fonts.SharpSansBold }}
          />
        ))}
      </View>
      <View className="mb-6">
        <Text className="text-gray-400 text-sm text-center" style={{ fontFamily: fonts.SharpSansRegular }}>
          {canResend ? 'Didn\'t receive code?' : `Resend code in ${formatTime(timeLeft)}`}
        </Text>
      </View>
      <ReusableButton title={loading ? "Verifying..." : "Verify"} variant="gradient" fullWidth={true}
        onPress={handleVerifyCode} disabled={loading || otp.join('').length !== 6} />
    </>
  );

  const renderResetPasswordMode = () => (
    <>
      <View className="items-center mb-8">
        <ResetPasswordLogo />
      </View>
      <View className="mb-6">
        <Text className="text-white text-2xl font-bold text-center mb-3" style={{ fontFamily: fonts.SharpSansBold }}>
          Reset Password
        </Text>
        <Text className="text-gray-400 text-sm text-center px-4" style={{ fontFamily: fonts.SharpSansRegular }}>
          Create a new password for your account
        </Text>
      </View>
      <View className="mb-3">
        <Text className="text-white text-base font-medium mb-2" style={{ fontFamily: fonts.SharpSansMedium }}>
          New Password
        </Text>
        <ReusableInput
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={setNewPassword}
          isPassword={true}
          leftIcon={<LockPassword color='white' />}
          rightIcon={isNewPasswordVisible ? <CloseEyeIcon /> : <EyeIcon />}
          onRightIconPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
        />
        <PasswordRequirements password={newPassword} visible={newPassword.length > 0} showOnlyErrors={true} />
      </View>
      <View className="mb-6">
        <Text className="text-white text-base font-medium mb-2" style={{ fontFamily: fonts.SharpSansMedium }}>
          Confirm Password
        </Text>
        <ReusableInput
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={(text) => { setConfirmPassword(text); if (confirmPasswordError) setConfirmPasswordError(''); }}
          onBlur={() => { if (confirmPassword && confirmPassword !== newPassword) setConfirmPasswordError('Passwords do not match'); }}
          isPassword={true}
          leftIcon={<LockPassword color={confirmPasswordError ? '#FF5050' : 'white'} />}
          rightIcon={isConfirmPasswordVisible ? <CloseEyeIcon /> : <EyeIcon />}
          onRightIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
          error={confirmPasswordError}
          hasError={!!confirmPasswordError}
        />
      </View>
      <ReusableButton title={loading ? "Resetting..." : "Reset Password"} variant="gradient" fullWidth={true}
        onPress={handleResetPassword} disabled={loading} />
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ImageBackground source={require('@/assets/images/Background.png')} style={{ flex: 1 }} resizeMode="cover">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingTop: Platform.OS === 'ios' ? 20 : 0, paddingBottom: isKeyboardVisible ? 200 : 0 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="pt-8 px-6">
              <BackArrowButton onPress={handleBackPress} />
            </View>

            <View className="flex-1 justify-center px-6">
              {currentMode === 'forgot-password' && renderForgotPasswordMode()}
              {currentMode === 'email-verification' && renderEmailVerificationMode()}
              {currentMode === 'reset-password' && renderResetPasswordMode()}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <PasswordUpdatedModal
          visible={showPasswordUpdatedModal}
          onClose={() => {
            setShowPasswordUpdatedModal(false);
            router.push('/(auth)/login');
          }}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}
