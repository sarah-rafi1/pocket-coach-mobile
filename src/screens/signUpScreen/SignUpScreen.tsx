import React, { useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ReusableButton, ReusableInput } from '../../components';
import { fonts } from '../../constants/typography';
import { AppRoutes } from '../../types';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

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

  const handleSignUp = () => {
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
      // Navigate to profile completion screen
      navigation.navigate('profile-completion-screen');
    }
  };

  const handleLoginPress = () => {
    navigation.navigate('login-screen');
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
            title="Sign Up"
            variant="gradient"
            fullWidth={true}
            className="mb-6"
            onPress={handleSignUp}
          />

          {/* Social Sign Up */}
          <View className="items-center mb-6">
            <Text className="text-gray-400 text-sm mb-4" style={{ fontFamily: fonts.SharpSansRegular }}>
              Or Sign Up With
            </Text>
            
            <View className="flex-row justify-center space-x-4">
              <TouchableOpacity className="py-3 px-2 mr-2">
                <AppleIcon />
              </TouchableOpacity>
              
              <TouchableOpacity className="py-3 px-2 mr-2">
                <GoogleIcon />
              </TouchableOpacity>
              
              <TouchableOpacity className="py-3 px-2">
                <FacebookLogo />
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