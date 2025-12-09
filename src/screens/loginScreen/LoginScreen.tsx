import React, { useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ReusableButton, ReusableInput, GradientText } from '../../components';
import { fonts } from '../../constants/typography';
import { AppRoutes } from '../../types';
import HomeLogo from '../../../assets/icons/HomeLogo';
import WavingHand from '../../../assets/icons/WavingHand';
import Letter from '../../../assets/icons/Letter';
import LockPassword from '../../../assets/icons/LockPassword';
import EyeIcon from '../../../assets/icons/EyeIcon';
import FacebookLogo from '../../../assets/icons/FacebookLogo';
import GoogleIcon from '../../../assets/icons/GoogleIcon';
import AppleIcon from '../../../assets/icons/AppleIcon';

type LoginScreenNavigationProp = StackNavigationProp<AppRoutes, 'login-screen'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
              rightIcon={<EyeIcon />}
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
            title="Login"
            variant="gradient"
            fullWidth={true}
            className="mb-8"
          />

          {/* Social Login */}
          <View className="items-center mb-8">
            <Text className="text-gray-400 text-sm mb-6" style={{ fontFamily: fonts.SharpSansRegular }}>
              Or Login With
            </Text>
            
            <View className="flex-row justify-center space-x-4">
              <TouchableOpacity className=" py-4 px-2 mr-2">
                <AppleIcon />
              </TouchableOpacity>
              
              <TouchableOpacity className="py-4 px-2 mr-2">
                <GoogleIcon />
              </TouchableOpacity>
              
              <TouchableOpacity className=" py-4 px-2">
                <FacebookLogo />
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