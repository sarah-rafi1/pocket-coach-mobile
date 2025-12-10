import React, { useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as AppleAuthentication from 'expo-apple-authentication';
import { ReusableButton, ReusableInput } from '../../components';
import { fonts } from '../../constants/typography';
import { AppRoutes } from '../../types';
import { signUpWithGoogle, signUpWithFacebook, signUpWithApple, signUp } from '../../services/authService';
import useAuthStore from '../../store/useAuthStore';
import HomeLogo from '../../../assets/icons/HomeLogo';
import Letter from '../../../assets/icons/Letter';
import LockPassword from '../../../assets/icons/LockPassword';
import EyeIcon from '../../../assets/icons/EyeIcon';
import CloseEyeIcon from '../../../assets/icons/CloseEyeIcon';
import FacebookLogo from '../../../assets/icons/FacebookLogo';
import GoogleIcon from '../../../assets/icons/GoogleIcon';
import AppleIcon from '../../../assets/icons/AppleIcon';

type SignUpScreenNavigationProp = StackNavigationProp<AppRoutes, 'sign-up-screen'>;

export function SignUpScreen() {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) {
      setPasswordError('');
    }
    // Clear confirm password error if passwords now match
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

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email');
    }
  };

  const handlePasswordBlur = () => {
    if (password && !validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters');
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword && confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
    }
  };

  const handleSignUp = async () => {
    let hasError = false;

    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
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
      try {
        const result = await signUp(email, password);
        
        if (result.emailSent) {
          // Navigate to email verification screen
          navigation.navigate('email-verification-screen', { email });
        } else {
          // User is automatically confirmed, proceed to profile completion
          navigation.navigate('profile-completion-screen');
        }
      } catch (error: any) {
        Alert.alert("Sign Up Failed", error.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLoginPress = () => {
    navigation.navigate('login-screen');
  };

  const handleGoogleSignUp = async () => {
    setSocialLoading("google");
    try {
      const tokens = await signUpWithGoogle();
      setUser({ 
        id: "google_user_123", 
        email: "test@gmail.com", 
        firstName: "Google Test User" 
      });
      Alert.alert("Success", "Signed up with Google successfully!");
    } catch (error: any) {
      Alert.alert("Google Sign Up Failed", error.message || "An error occurred");
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebookSignUp = async () => {
    setSocialLoading("facebook");
    try {
      const tokens = await signUpWithFacebook();
      setUser({ 
        id: "facebook_user_123", 
        email: "test@facebook.com", 
        firstName: "Facebook Test User" 
      });
      Alert.alert("Success", "Signed up with Facebook successfully!");
    } catch (error: any) {
      Alert.alert("Facebook Sign Up Failed", error.message || "An error occurred");
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleSignUp = async () => {
    setSocialLoading("apple");
    try {
      const tokens = await signUpWithApple();
      setUser({ 
        id: "apple_user_123", 
        email: "test@icloud.com", 
        firstName: "Apple Test User" 
      });
      Alert.alert("Success", "Signed up with Apple successfully!");
    } catch (error: any) {
      Alert.alert("Apple Sign Up Failed", error.message || "An error occurred");
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <ImageBackground 
      source={require('../../../assets/images/Background.png')} 
      className="flex-1"
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
        {/* Header with Logo */}
        <View className="flex-row items-center justify-start px-6 pt-20 pb-4">
          <HomeLogo />
        </View>

        {/* Main Content */}
        <View className="flex-1 px-6 pb-8">
          {/* Title */}
          <Text className="text-white text-2xl font-bold mb-1" style={{ fontFamily: fonts.SharpSansBold }}>
            Create Your Account
          </Text>
          
          <Text className="text-gray-400 text-sm mb-6" style={{ fontFamily: fonts.SharpSansRegular }}>
            Create your account by adding your account basic details
          </Text>

          {/* Email Field */}
          <View className="mb-4">
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

          {/* Password Field */}
          <View className="mb-4">
            <Text className="text-white text-base font-medium mb-3" style={{ fontFamily: fonts.SharpSansMedium }}>
              Password
            </Text>
            <ReusableInput
              placeholder="••••••••"
              value={password}
              onChangeText={handlePasswordChange}
              onBlur={handlePasswordBlur}
              isPassword={true}
              leftIcon={<LockPassword color={passwordError ? '#FF5050' : 'white'} />}
              rightIcon={isPasswordVisible ? <CloseEyeIcon /> : <EyeIcon />}
              onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
              error={passwordError}
              hasError={!!passwordError}
            />
          </View>

          {/* Confirm Password Field */}
          <View className="mb-6">
            <Text className="text-white text-base font-medium mb-3" style={{ fontFamily: fonts.SharpSansMedium }}>
              Confirm Password
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

          {/* Sign Up Button */}
          <ReusableButton
            title={loading ? "Creating Account..." : "Sign Up"}
            variant="gradient"
            fullWidth={true}
            className="mb-6"
            onPress={handleSignUp}
            disabled={loading || socialLoading !== null}
          />

          {/* Social Sign Up */}
          <View className="items-center mb-6">
            <Text className="text-gray-400 text-sm mb-4" style={{ fontFamily: fonts.SharpSansRegular }}>
              Or Sign Up With
            </Text>
            
            <View className="flex-row justify-center space-x-4">
              {/* Apple Sign Up - iOS only */}
              {Platform.OS === "ios" && (
                <TouchableOpacity 
                  className="py-3 px-2 mr-2" 
                  onPress={handleAppleSignUp}
                  disabled={socialLoading !== null}
                  style={{ opacity: socialLoading === "apple" ? 0.5 : 1 }}
                >
                  {socialLoading === "apple" ? (
                    <ActivityIndicator color="#000" size="small" />
                  ) : (
                    <AppleIcon />
                  )}
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                className="py-3 px-2 mr-2" 
                onPress={handleGoogleSignUp}
                disabled={socialLoading !== null}
                style={{ opacity: socialLoading === "google" ? 0.5 : 1 }}
              >
                {socialLoading === "google" ? (
                  <ActivityIndicator color="#4285F4" size="small" />
                ) : (
                  <GoogleIcon />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="py-3 px-2" 
                onPress={handleFacebookSignUp}
                disabled={socialLoading !== null}
                style={{ opacity: socialLoading === "facebook" ? 0.5 : 1 }}
              >
                {socialLoading === "facebook" ? (
                  <ActivityIndicator color="#1877F2" size="small" />
                ) : (
                  <FacebookLogo />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-400 text-base" style={{ fontFamily: fonts.SharpSansRegular }}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleLoginPress}>
              <Text className="text-cyan-400 text-base font-medium" style={{ fontFamily: fonts.SharpSansMedium }}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}