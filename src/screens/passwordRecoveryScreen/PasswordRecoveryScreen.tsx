import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as AppleAuthentication from 'expo-apple-authentication';
import { ReusableButton, ReusableInput, GradientText, InfoModal, PasswordRequirements, BackArrowButton, PasswordUpdatedModal } from '../../components';
import { fonts } from '../../constants/typography';
import { AppRoutes } from '../../types';
import { confirmSignUp, resendConfirmationCode } from '../../services/authService';
import { retrieveCognitoTokens } from '../../utils/AsyncStorageApis';
import { API_BASE_URL } from '../../config/env';
import { validateEmail, isPasswordValid } from '../../utils/formValidators';
import { 
  forgotPasswordSchema, 
  emailVerificationSchema, 
  resetPasswordSchema, 
  validateForm,
  validateEmailField,
  validatePasswordField 
} from '../../utils/validationSchemas';
import {
  ForgotPasswordLogo,
  EmailVerificationLogo,
  ResetPasswordLogo,
  Letter,
  LockPassword,
  EyeIcon,
  CloseEyeIcon,
  TickIcon
} from '../../../assets/icons';

type PasswordRecoveryNavigationProp = StackNavigationProp<AppRoutes, 'password-recovery-screen'>;
type PasswordRecoveryRouteProp = RouteProp<AppRoutes, 'password-recovery-screen'>;

export function PasswordRecoveryScreen() {
  const navigation = useNavigation<PasswordRecoveryNavigationProp>();
  const route = useRoute<PasswordRecoveryRouteProp>();
  
  // Screen state management
  type ScreenMode = 'forgot-password' | 'email-verification' | 'reset-password';
  const [currentMode, setCurrentMode] = useState<ScreenMode>('forgot-password');
  
  // Initialize mode based on route params
  useEffect(() => {
    if (route.params?.mode) {
      setCurrentMode(route.params.mode);
    }
  }, [route.params?.mode]);

  // Common form fields
  const [email, setEmail] = useState(route.params?.email || '');
  const [password, setPassword] = useState(route.params?.password || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // OTP related states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  
  // Timer for resend code
  const [timeLeft, setTimeLeft] = useState(180);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Validation errors
  const [emailError, setEmailError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // UI states
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [showPasswordUpdatedModal, setShowPasswordUpdatedModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', action: () => {} });
  
  // Get additional route params
  const fromLogin = route.params?.fromLogin || false;

  // Timer effect for email verification
  useEffect(() => {
    if (currentMode === 'email-verification' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (currentMode === 'email-verification' && timeLeft <= 0) {
      setCanResend(true);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, currentMode]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Email validation and handlers
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email');
    }
  };

  // OTP handlers
  const handleOtpChange = (value: string, index: number) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      const newOtp = [...otp];
      if (newOtp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Password handlers
  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    if (confirmPasswordError && text === confirmPassword) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword && confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
    }
  };

  // Navigation handlers
  const handleBackPress = () => {
    if (currentMode === 'email-verification' && fromLogin) {
      navigation.navigate('auth-screen', { mode: 'login' });
    } else if (currentMode === 'email-verification') {
      setCurrentMode('forgot-password');
    } else if (currentMode === 'reset-password') {
      setCurrentMode('email-verification');
    } else {
      navigation.goBack();
    }
  };

  // Main action handlers
  const handleSendCode = () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    setCurrentMode('email-verification');
    setTimeLeft(180);
    setCanResend(false);
  };

  const checkUserProfileAndNavigate = async () => {
    try {
      const tokens = await retrieveCognitoTokens();
      if (!tokens?.access_token) {
        navigation.navigate('profile-completion-screen');
        return;
      }

      console.log('🚀 [API CALL] => GET /users/me (from PasswordRecoveryScreen)');
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.access_token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const userProfile = await response.json();
        
        if (!userProfile.username || !userProfile.display_name || !userProfile.interest_slugs || userProfile.interest_slugs.length === 0) {
          navigation.navigate('profile-completion-screen');
        } else {
          navigation.navigate('profile-success-screen');
        }
      } else {
        navigation.navigate('profile-completion-screen');
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      navigation.navigate('profile-completion-screen');
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      setLoading(true);
      try {
        const result = await confirmSignUp(email, otpCode, password);
        
        if (fromLogin) {
          setModalContent({
            title: "Success",
            message: "Email verified successfully! Please log in again.",
            action: () => {
              setShowSuccessModal(false);
              navigation.navigate('auth-screen', { mode: 'login' });
            }
          });
          setShowSuccessModal(true);
        } else {
          if (result.tokens) {
            setModalContent({
              title: "Success",
              message: "Email verified successfully!",
              action: async () => {
                setShowSuccessModal(false);
                await checkUserProfileAndNavigate();
              }
            });
            setShowSuccessModal(true);
          } else {
            setCurrentMode('reset-password');
          }
        }
      } catch (error: any) {
        setModalContent({
          title: "Verification Failed",
          message: error.message || "Invalid verification code",
          action: () => setShowErrorModal(false)
        });
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    } else {
      setModalContent({
        title: "Error",
        message: "Please enter the complete verification code",
        action: () => setShowErrorModal(false)
      });
      setShowErrorModal(true);
    }
  };

  const handleResetPassword = () => {
    let hasError = false;

    if (!newPassword) {
      setNewPasswordError('New password is required');
      hasError = true;
    } else if (!isPasswordValid(newPassword)) {
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (!hasError) {
      setShowPasswordUpdatedModal(true);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    try {
      await resendConfirmationCode(email);
      setTimeLeft(180);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setShowResendModal(true);
    } catch (error: any) {
      setModalContent({
        title: "Error",
        message: error.message || "Failed to resend verification code",
        action: () => setShowErrorModal(false)
      });
      setShowErrorModal(true);
    }
  };

  const handleLoginNow = () => {
    setShowPasswordUpdatedModal(false);
    navigation.navigate('auth-screen', { mode: 'login' });
  };

  // Render functions for different modes
  const renderForgotPassword = () => (
    <>
      <View className="mb-12">
        <ForgotPasswordLogo />
      </View>
      <Text className="text-white text-3xl font-bold mb-4" style={{ fontFamily: fonts.SharpSansBold }}>
        Forgot Password?
      </Text>
      <Text className="text-gray-400 text-base text-center mb-12 leading-6" style={{ fontFamily: fonts.SharpSansRegular }}>
        Enter the email address on which we can send you{'\n'}verification OTP
      </Text>
      <View className="w-full">
        <Text className="text-white text-base font-medium mb-3" style={{ fontFamily: fonts.SharpSansMedium }}>
          Email Address
        </Text>
        <ReusableInput
          placeholder="example@gmail.com"
          value={email}
          onChangeText={handleEmailChange}
          onBlur={handleEmailBlur}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Letter color={emailError ? '#FF5050' : 'white'} />}
          error={emailError}
          hasError={!!emailError}
        />
      </View>
    </>
  );

  const renderEmailVerification = () => (
    <>
      <View className="mb-12">
        <EmailVerificationLogo />
      </View>
      <Text className="text-white text-3xl font-bold mb-4" style={{ fontFamily: fonts.SharpSansBold }}>
        Email Verification
      </Text>
      <View className="mb-12">
        {fromLogin && (
          <Text style={{ color: 'rgb(239, 68, 68)', fontSize: 14, textAlign: 'center', fontFamily: fonts.SharpSansMedium, lineHeight: 20, marginBottom: 8 }}>
            Email verification required to sign in
          </Text>
        )}
        <Text style={{ color: 'rgb(156, 163, 175)', fontSize: 16, textAlign: 'center', fontFamily: fonts.SharpSansRegular, lineHeight: 24 }}>
          Enter the OTP that we have sent you on your given
        </Text>
        <Text style={{ color: 'rgb(156, 163, 175)', fontSize: 16, textAlign: 'center', fontFamily: fonts.SharpSansRegular, lineHeight: 24 }}>
          email <Text style={{ color: 'white' }}>{email}</Text>
        </Text>
      </View>
      <View className="flex-row justify-center mb-8" style={{ paddingHorizontal: 20, gap: 12 }}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={{
              width: 40,
              height: 48,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              borderWidth: 2,
              borderColor: focusedIndex === index ? '#00C6FF' : 'rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
              color: 'white',
              fontSize: 18,
              fontWeight: 'bold',
              fontFamily: fonts.SharpSansBold,
            }}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            keyboardType="numeric"
            maxLength={1}
            selectTextOnFocus
          />
        ))}
      </View>
    </>
  );

  const renderResetPassword = () => (
    <>
      <View className="mb-12">
        <ResetPasswordLogo />
      </View>
      <Text className="text-white text-3xl font-bold mb-4" style={{ fontFamily: fonts.SharpSansBold }}>
        Reset Password
      </Text>
      <Text className="text-gray-400 text-base text-center mb-12 leading-6" style={{ fontFamily: fonts.SharpSansRegular }}>
        Enter your new password to access your account
      </Text>
      <View className="w-full gap-6">
        <View>
          <Text className="text-white text-base font-medium mb-3" style={{ fontFamily: fonts.SharpSansMedium }}>
            New Password
          </Text>
          <ReusableInput
            placeholder="••••••••"
            value={newPassword}
            onChangeText={handleNewPasswordChange}
            isPassword={true}
            leftIcon={<LockPassword color='white' />}
            rightIcon={isNewPasswordVisible ? <CloseEyeIcon /> : <EyeIcon />}
            onRightIconPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
          />
          <PasswordRequirements password={newPassword} visible={newPassword.length > 0} showOnlyErrors={true} />
        </View>
        <View>
          <Text className="text-white text-base font-medium mb-3" style={{ fontFamily: fonts.SharpSansMedium }}>
            Confirm New Password
          </Text>
          <ReusableInput
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            onBlur={handleConfirmPasswordBlur}
            isPassword={true}
            leftIcon={<LockPassword color={confirmPasswordError ? '#FF5050' : 'white'} />}
            rightIcon={isConfirmPasswordVisible ? <CloseEyeIcon /> : <EyeIcon />}
            onRightIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
            error={confirmPasswordError}
            hasError={!!confirmPasswordError}
          />
        </View>
      </View>
    </>
  );

  const renderBottomButton = () => {
    switch (currentMode) {
      case 'forgot-password':
        return (
          <ReusableButton
            title="Send Verification Code"
            variant="gradient"
            fullWidth={true}
            onPress={handleSendCode}
          />
        );
      case 'email-verification':
        return (
          <>
            <View className="items-center mb-6">
              {!canResend ? (
                <Text className="text-gray-400 text-sm mb-2" style={{ fontFamily: fonts.SharpSansRegular }}>
                  Resend code in {formatTime(timeLeft)}
                </Text>
              ) : (
                <Text className="text-gray-400 text-sm mb-2" style={{ fontFamily: fonts.SharpSansRegular }}>
                  Didn't receive the code?
                </Text>
              )}
              <TouchableOpacity 
                onPress={handleResendCode} 
                disabled={!canResend}
                style={{ opacity: canResend ? 1 : 0.5 }}
              >
                <GradientText style={{ fontSize: 16, fontWeight: '500' }}>
                  Resend Code
                </GradientText>
              </TouchableOpacity>
            </View>
            <ReusableButton
              title={loading ? "Verifying..." : "Verify"}
              variant="gradient"
              fullWidth={true}
              onPress={handleVerify}
              disabled={loading}
            />
          </>
        );
      case 'reset-password':
        return (
          <ReusableButton
            title="Continue"
            variant="gradient"
            fullWidth={true}
            onPress={handleResetPassword}
          />
        );
    }
  };

  const renderContent = () => {
    switch (currentMode) {
      case 'forgot-password':
        return renderForgotPassword();
      case 'email-verification':
        return renderEmailVerification();
      case 'reset-password':
        return renderResetPassword();
    }
  };

  return (
    <ImageBackground 
      source={require('../../../assets/images/Background.png')} 
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-row items-center px-5 pt-20">
            <BackArrowButton onPress={handleBackPress} />
          </View>

          <View className={`flex-1 px-6 items-center ${currentMode === 'reset-password' ? 'justify-center' : ''}`}>
            {renderContent()}
          </View>

          <View className="px-6 pb-12 pt-6">
            {renderBottomButton()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <InfoModal
        visible={showSuccessModal}
        title={modalContent.title}
        message={modalContent.message}
        buttonText="Continue"
        onButtonPress={modalContent.action}
        icon={<TickIcon />}
      />

      <InfoModal
        visible={showErrorModal}
        title={modalContent.title}
        message={modalContent.message}
        buttonText="Try Again"
        onButtonPress={modalContent.action}
      />

      <InfoModal
        visible={showResendModal}
        title="Code Sent!"
        message={`A new verification code has been sent to ${email}. Please check your email and enter the new code.`}
        buttonText="Continue"
        onButtonPress={() => setShowResendModal(false)}
        icon={<TickIcon />}
      />

      <PasswordUpdatedModal
        visible={showPasswordUpdatedModal}
        onLoginNow={handleLoginNow}
      />
    </ImageBackground>
  );
}