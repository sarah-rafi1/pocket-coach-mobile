import React, { useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as AppleAuthentication from 'expo-apple-authentication';
import { ReusableButton, ReusableInput, GradientText } from '../../components';
import { fonts } from '../../constants/typography';
import { AppRoutes } from '../../types';
import { signInWithGoogle, signInWithFacebook, signInWithApple, signIn } from '../../services/authService';
import useAuthStore from '../../store/useAuthStore';
import HomeLogo from '../../../assets/icons/HomeLogo';
import WavingHand from '../../../assets/icons/WavingHand';
import Letter from '../../../assets/icons/Letter';
import LockPassword from '../../../assets/icons/LockPassword';
import EyeIcon from '../../../assets/icons/EyeIcon';
import CloseEyeIcon from '../../../assets/icons/CloseEyeIcon';
import FacebookLogo from '../../../assets/icons/FacebookLogo';
import GoogleIcon from '../../../assets/icons/GoogleIcon';
import AppleIcon from '../../../assets/icons/AppleIcon';

type LoginScreenNavigationProp = StackNavigationProp<AppRoutes, 'login-screen'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email');
    }
  };

  const handlePasswordBlur = () => {
    if (password && password.length < 6) {
      setPasswordError('Incorrect password');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // TODO: Update user store with user data once traditional auth is implemented
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading("google");
    try {
      const tokens = await signInWithGoogle();
      // Set mock user data for testing
      setUser({ 
        id: "google_user_123", 
        email: "test@gmail.com", 
        firstName: "Google Test User" 
      });
      Alert.alert("Success", "Signed in with Google successfully!");
    } catch (error: any) {
      Alert.alert("Google Sign In Failed", error.message || "An error occurred");
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebookSignIn = async () => {
    setSocialLoading("facebook");
    try {
      const tokens = await signInWithFacebook();
      // Set mock user data for testing
      setUser({ 
        id: "facebook_user_123", 
        email: "test@facebook.com", 
        firstName: "Facebook Test User" 
      });
      Alert.alert("Success", "Signed in with Facebook successfully!");
    } catch (error: any) {
      Alert.alert("Facebook Sign In Failed", error.message || "An error occurred");
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setSocialLoading("apple");
    try {
      const tokens = await signInWithApple();
      // Set mock user data for testing
      setUser({ 
        id: "apple_user_123", 
        email: "test@icloud.com", 
        firstName: "Apple Test User" 
      });
      Alert.alert("Success", "Signed in with Apple successfully!");
    } catch (error: any) {
      Alert.alert("Apple Sign In Failed", error.message || "An error occurred");
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
        <View className="flex-row items-center justify-start px-6 pt-20 pb-8">
          <HomeLogo />
        </View>

        {/* Main Content */}
        <View className="flex-1 px-6 pb-8">
          {/* Welcome Title */}
          <View className="flex-row items-center mb-2">
            <Text className="text-white text-2xl font-bold mr-2" style={{ fontFamily: fonts.SharpSansBold }}>
              Welcome Back
            </Text>
            <WavingHand />
          </View>
          
          <Text className="text-gray-400 text-sm mb-8" style={{ fontFamily: fonts.SharpSansRegular }}>
            To access your account please enter your account details.
          </Text>

          {/* Email Field */}
          <View className="mb-6">
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

          {/* Forgot Password */}
          <TouchableOpacity onPress={() => navigation.navigate('forgot-password-screen')} className="mb-8">
            <GradientText style={{ fontSize: 16, fontWeight: '500' }}>
              Forgot Password?
            </GradientText>
          </TouchableOpacity>

          {/* Login Button */}
          <ReusableButton
            title={loading ? "Signing In..." : "Login"}
            variant="gradient"
            fullWidth={true}
            className="mb-8"
            onPress={handleLogin}
            disabled={loading || socialLoading !== null}
          />

          {/* Social Login */}
          <View className="items-center mb-8">
            <Text className="text-gray-400 text-sm mb-6" style={{ fontFamily: fonts.SharpSansRegular }}>
              Or Login With
            </Text>
            
            <View className="flex-row justify-center space-x-4">
              {/* Apple Sign In - iOS only */}
              {Platform.OS === "ios" && (
                <TouchableOpacity 
                  className="py-4 px-2 mr-2 opacity-100" 
                  onPress={handleAppleSignIn}
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
                className="py-4 px-2 mr-2" 
                onPress={handleGoogleSignIn}
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
                className="py-4 px-2" 
                onPress={handleFacebookSignIn}
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

          {/* Create Account */}
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-400 text-base" style={{ fontFamily: fonts.SharpSansRegular }}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('sign-up-screen')}>
              <Text className="text-blue-400 text-base font-medium" style={{ fontFamily: fonts.SharpSansMedium }}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}