import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as AppleAuthentication from 'expo-apple-authentication';
import { ReusableButton, ReusableInput, GradientText, InfoModal, PasswordRequirements } from '../../components';
import { fonts } from '../../constants/typography';
import { AppRoutes } from '../../types';
import { 
  signInWithGoogle, signInWithFacebook, signInWithApple, signIn,
  signUpWithGoogle, signUpWithFacebook, signUpWithApple, signUp
} from '../../services/authService';
import { userApi } from '../../services/apis/UserApis';
import useAuthStore from '../../store/useAuthStore';
import { validateEmail, isPasswordValid, getPasswordErrorMessage } from '../../utils/formValidators';
import { 
  loginSchema, 
  signUpSchema, 
  validateForm, 
  validateEmailField, 
  validatePasswordField,
  LoginFormData,
  SignUpFormData 
} from '../../utils/validationSchemas';
import {
  HomeLogo,
  WavingHand,
  Letter,
  LockPassword,
  EyeIcon,
  CloseEyeIcon,
  FacebookLogo,
  GoogleIcon,
  AppleIcon,
  TickIcon
} from '../../../assets/icons';

type AuthScreenNavigationProp = StackNavigationProp<AppRoutes, 'auth-screen'>;
type AuthScreenRouteProp = RouteProp<AppRoutes, 'auth-screen'>;

export function AuthScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const route = useRoute<AuthScreenRouteProp>();
  const { setUser } = useAuthStore();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Initialize mode based on route params
  const [isLogin, setIsLogin] = useState(true);
  
  // Keyboard state
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  useEffect(() => {
    if (route.params?.mode) {
      setIsLogin(route.params.mode === 'login');
    }
  }, [route.params?.mode]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    });

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
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // UI states
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', action: () => {} });

  // Form validation functions
  const validateEmailField = validateEmail;
  const validatePasswordField = isPasswordValid;

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    // Clear confirm password error if passwords now match
    if (!isLogin && confirmPasswordError && text === confirmPassword) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordFocus = () => {
    // Scroll to bottom to ensure confirm password field is visible
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleEmailBlur = () => {
    if (email && !validateEmailField(email)) {
      setEmailError('Please enter a valid email');
    }
  };

  const handlePasswordBlur = () => {
    if (isLogin && password && password.length < 6) {
      setPasswordError('Incorrect password');
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (!isLogin && confirmPassword && confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    // Clear form errors when switching modes
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
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
    try {
      const tokens = await signIn(email, password);
      
      // Extract user info from tokens and set user
      setUser({ 
        id: email, // Use email as temporary ID
        email: email, 
        firstName: email.split('@')[0] // Use part before @ as name
      });

      // Check if user profile is complete (with fallback for API unavailability)
      try {
        const userProfile = await userApi.getUserProfile(tokens.access_token || '');
        
        // Check if user has essential profile data
        if (!userProfile || !userProfile.username || !userProfile.display_name || !userProfile.interest_slugs || userProfile.interest_slugs.length === 0) {
          // User profile is incomplete, navigate to profile completion
          setModalContent({
            title: "Complete Your Profile",
            message: "Please complete your profile to continue.",
            action: () => {
              setShowSuccessModal(false);
              navigation.navigate('profile-completion-screen');
            }
          });
          setShowSuccessModal(true);
        } else {
          // User profile is complete, show success
          setModalContent({
            title: "Success",
            message: "Signed in successfully!",
            action: () => setShowSuccessModal(false)
          });
          setShowSuccessModal(true);
        }
      } catch (profileError: any) {
        console.error('Error checking user profile:', profileError);
        
        // If API is unavailable (404, network error, etc.), assume profile needs completion
        setModalContent({
          title: "Complete Your Profile",
          message: "Please complete your profile to continue.",
          action: () => {
            setShowSuccessModal(false);
            navigation.navigate('profile-completion-screen');
          }
        });
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Check if user is not confirmed
      if (error.name === "UserNotConfirmedException" || 
          error.message?.includes("User is not confirmed") ||
          error.code === "UserNotConfirmedException") {
        setModalContent({
          title: "Email Not Verified",
          message: "Your email address is not verified. Please verify your email to continue.",
          action: () => {
            setShowConfirmationModal(false);
            navigation.navigate('password-recovery-screen', { mode: 'email-verification', email, fromLogin: true });
          }
        });
        setShowConfirmationModal(true);
      } else {
        setModalContent({
          title: "Login Failed",
          message: error.message || "An error occurred",
          action: () => setShowErrorModal(false)
        });
        setShowErrorModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    let hasError = false;
    
    // Validate email
    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmailField(email)) {
      setEmailError('Please enter a valid email');
      hasError = true;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (!validatePasswordField(password)) {
      // Password validation errors are shown by PasswordRequirements component
      hasError = true;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (!hasError) {
      setLoading(true);
      try {
        const result = await signUp(email, password);
        
        if (result.emailSent) {
          // Navigate to email verification screen with email and password for auto sign-in after verification
          navigation.navigate('password-recovery-screen', { mode: 'email-verification', email, password });
        } else {
          // User is automatically confirmed
          if (result.tokens) {
            // Tokens were returned, user is signed in - check profile completeness
            setUser({ 
              id: email, 
              email: email, 
              firstName: email.split('@')[0] 
            });

            // Check if user needs to complete profile (for auto-confirmed users, they likely need to)
            navigation.navigate('profile-completion-screen');
          } else {
            // No tokens, navigate to login
            navigation.navigate('auth-screen', { mode: 'login' });
          }
        }
      } catch (error: any) {
        setModalContent({
          title: "Sign Up Failed",
          message: error.message || "An error occurred",
          action: () => setShowErrorModal(false)
        });
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleSignUp();
    }
  };

  const extractEmailFromIdToken = (idToken: string): string | null => {
    try {
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
      return decoded.email || null;
    } catch (error) {
      console.error('Error extracting email from token:', error);
      return null;
    }
  };

  const handleGoogleAuth = async () => {
    setSocialLoading("google");
    try {
      const tokens = isLogin ? await signInWithGoogle() : await signUpWithGoogle();
      
      // Extract email from ID token
      const userEmail = tokens.id_token ? extractEmailFromIdToken(tokens.id_token) : null;
      
      if (!userEmail) {
        setModalContent({
          title: "Error",
          message: "Unable to get email from Google account. Please try again.",
          action: () => setShowErrorModal(false)
        });
        setShowErrorModal(true);
        return;
      }

      // Handle Google auth success based on mode
      if (isLogin) {
        // Login mode - check profile completeness
        try {
          const userProfile = await userApi.getUserProfile(tokens.access_token || '');
          
          if (!userProfile || !userProfile.username || !userProfile.display_name || !userProfile.interest_slugs || userProfile.interest_slugs.length === 0) {
            if (userProfile && !userProfile.email_verified) {
              await userApi.sendVerificationCode(userEmail, tokens.access_token);
              setModalContent({
                title: "Email Verification Required",
                message: "Please verify your email address to continue.",
                action: () => {
                  setShowSuccessModal(false);
                  navigation.navigate('password-recovery-screen', { mode: 'email-verification', email: userEmail, fromLogin: true });
                }
              });
              setShowSuccessModal(true);
            } else {
              setUser({ id: (userProfile && userProfile.id) || "google_user", email: userEmail, firstName: userEmail.split('@')[0] });
              setModalContent({
                title: "Complete Your Profile",
                message: "Please complete your profile to continue.",
                action: () => {
                  setShowSuccessModal(false);
                  navigation.navigate('profile-completion-screen');
                }
              });
              setShowSuccessModal(true);
            }
          } else {
            setUser({ id: userProfile.id, email: userEmail, firstName: (userProfile.display_name && userProfile.display_name.split(' ')[0]) || userEmail.split('@')[0] });
            setModalContent({
              title: "Success",
              message: "Signed in with Google successfully!",
              action: () => setShowSuccessModal(false)
            });
            setShowSuccessModal(true);
          }
        } catch (profileError: any) {
          if (profileError.message?.includes('404') || profileError.message?.includes('not found') || profileError.message?.includes('User not found')) {
            // User exists in Cognito but not in our database - direct to profile completion
            setUser({ id: "google_user", email: userEmail, firstName: userEmail.split('@')[0] });
            setModalContent({
              title: "Welcome!",
              message: "Let's complete your profile to get started.",
              action: () => {
                setShowSuccessModal(false);
                navigation.navigate('profile-completion-screen');
              }
            });
            setShowSuccessModal(true);
          } else {
            setModalContent({
              title: "Error",
              message: "Failed to verify account status. Please try again.",
              action: () => setShowErrorModal(false)
            });
            setShowErrorModal(true);
          }
        }
      } else {
        // Signup mode - set user and navigate appropriately
        setUser({ id: "google_user", email: userEmail, firstName: userEmail.split('@')[0] });
        setModalContent({
          title: "Success",
          message: "Signed up with Google successfully!",
          action: () => {
            setShowSuccessModal(false);
            navigation.navigate('profile-completion-screen');
          }
        });
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      const actionType = isLogin ? "Sign In" : "Sign Up";
      setModalContent({
        title: `Google ${actionType} Failed`,
        message: error.message || "An error occurred",
        action: () => setShowErrorModal(false)
      });
      setShowErrorModal(true);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebookAuth = async () => {
    setSocialLoading("facebook");
    try {
      const tokens = isLogin ? await signInWithFacebook() : await signUpWithFacebook();
      const actionType = isLogin ? "in" : "up";
      setUser({ 
        id: "facebook_user", 
        email: "test@facebook.com", 
        firstName: "Facebook User" 
      });
      setModalContent({
        title: "Success",
        message: `Signed ${actionType} with Facebook successfully!`,
        action: () => setShowSuccessModal(false)
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      const actionType = isLogin ? "Sign In" : "Sign Up";
      setModalContent({
        title: `Facebook ${actionType} Failed`,
        message: error.message || "An error occurred",
        action: () => setShowErrorModal(false)
      });
      setShowErrorModal(true);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleAuth = async () => {
    setSocialLoading("apple");
    try {
      const tokens = isLogin ? await signInWithApple() : await signUpWithApple();
      const actionType = isLogin ? "in" : "up";
      setUser({ 
        id: "apple_user", 
        email: "test@icloud.com", 
        firstName: "Apple User" 
      });
      setModalContent({
        title: "Success",
        message: `Signed ${actionType} with Apple successfully!`,
        action: () => setShowSuccessModal(false)
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      const actionType = isLogin ? "Sign In" : "Sign Up";
      setModalContent({
        title: `Apple ${actionType} Failed`,
        message: error.message || "An error occurred",
        action: () => setShowErrorModal(false)
      });
      setShowErrorModal(true);
    } finally {
      setSocialLoading(null);
    }
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('password-recovery-screen', { mode: 'forgot-password' });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ImageBackground 
        source={require('../../../assets/images/Background.png')} 
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
                {isLogin ? 'Welcome Back' : 'Create Your Account'}
              </Text>
              {isLogin && <WavingHand />}
            </View>
            <Text className="text-gray-400 text-base leading-6" style={{ fontFamily: fonts.SharpSansRegular }}>
              {isLogin 
                ? 'Sign in to your account to continue your fitness journey'
                : 'Create your account by adding your account basic details'
              }
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
                onChangeText={handlePasswordChange}
                onBlur={handlePasswordBlur}
                isPassword={true}
                leftIcon={<LockPassword color='white' />}
                rightIcon={isPasswordVisible ? <CloseEyeIcon /> : <EyeIcon />}
                onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
              />
              
              {/* Password Requirements (only show for signup) */}
              {!isLogin && (
                <PasswordRequirements password={password} visible={password.length > 0} showOnlyErrors={true} />
              )}
            </View>

            {/* Confirm Password Field (only for signup) */}
            {!isLogin && (
              <View className="mb-3">
                <Text className="text-white text-base font-medium mb-2" style={{ fontFamily: fonts.SharpSansMedium }}>
                  Confirm Password
                </Text>
                <ReusableInput
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  onBlur={handleConfirmPasswordBlur}
                  onFocus={handleConfirmPasswordFocus}
                  isPassword={true}
                  leftIcon={<LockPassword color={confirmPasswordError ? '#FF5050' : 'white'} />}
                  rightIcon={isConfirmPasswordVisible ? <CloseEyeIcon /> : <EyeIcon />}
                  onRightIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  error={confirmPasswordError}
                  hasError={!!confirmPasswordError}
                />
              </View>
            )}

            {/* Forgot Password (only for login) */}
            {isLogin && (
              <View className="mb-4 flex-row justify-end">
                <TouchableOpacity onPress={navigateToForgotPassword}>
                  <GradientText style={{ fontSize: 14, fontWeight: '500' }}>
                    Forgot Password?
                  </GradientText>
                </TouchableOpacity>
              </View>
            )}

            {/* Submit Button */}
            <View className="mb-6">
              <ReusableButton
                title={loading ? (isLogin ? "Signing In..." : "Creating Account...") : (isLogin ? "Sign In" : "Sign Up")}
                variant="gradient"
                fullWidth={true}
                onPress={handleSubmit}
                disabled={loading || socialLoading !== null}
              />
            </View>

            {/* Social Auth */}
            <View className="items-center mb-6">
              <Text className="text-gray-400 text-sm mb-4" style={{ fontFamily: fonts.SharpSansRegular }}>
                Or {isLogin ? 'Sign In' : 'Sign Up'} With
              </Text>
              
              <View className="flex-row justify-center gap-x-4">
                {/* Google */}
                <TouchableOpacity 
                  onPress={handleGoogleAuth}
                  disabled={loading || socialLoading !== null}
                  className="w-14 h-14 rounded-full items-center justify-center"
                >
                  {socialLoading === "google" ? (
                    <ActivityIndicator size="small" color="#4285F4" />
                  ) : (
                    <GoogleIcon />
                  )}
                </TouchableOpacity>

                {/* Facebook */}
                <TouchableOpacity 
                  onPress={handleFacebookAuth}
                  disabled={loading || socialLoading !== null}
                  className="w-14 h-14 rounded-full items-center justify-center mx-4"
                >
                  {socialLoading === "facebook" ? (
                    <ActivityIndicator size="small" color="#1877F2" />
                  ) : (
                    <FacebookLogo />
                  )}
                </TouchableOpacity>

                {/* Apple */}
                {Platform.OS === 'ios' && (
                  <TouchableOpacity 
                    onPress={handleAppleAuth}
                    disabled={loading || socialLoading !== null}
                    className="w-14 h-14 rounded-full items-center justify-center "
                  >
                    {socialLoading === "apple" ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <AppleIcon />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Switch Mode */}
            <View className="flex-row justify-center items-center pb-4">
              <Text className="text-gray-400 text-sm" style={{ fontFamily: fonts.SharpSansRegular }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={switchMode}>
                <GradientText style={{ fontSize: 14, fontWeight: '500' }}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </GradientText>
              </TouchableOpacity>
            </View>
          </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modals */}
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

        {/* Email Verification Confirmation Modal */}
        <InfoModal
          visible={showConfirmationModal}
          title={modalContent.title}
          message={modalContent.message}
          buttonText="Verify Email"
          onButtonPress={modalContent.action}
          showCloseButton={true}
          onClose={() => setShowConfirmationModal(false)}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}