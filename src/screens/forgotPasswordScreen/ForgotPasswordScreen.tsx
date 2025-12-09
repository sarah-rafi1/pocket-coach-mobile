import React, { useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ReusableButton, ReusableInput } from '../../components';
import { fonts } from '../../constants/typography';
import ForgotPasswordLogo from '../../../assets/icons/ForgotPasswordLogo';
import Letter from '../../../assets/icons/Letter';
import { AppRoutes } from '../../types';

type ForgotPasswordNavigationProp = StackNavigationProp<AppRoutes, 'forgot-password-screen'>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

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

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email');
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSendCode = () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    // Navigate to email verification screen with email parameter
    navigation.navigate('email-verification-screen', { email });
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
      {/* Header with Back Button */}
      <View className="flex-row items-center px-5 pt-20">
        <TouchableOpacity onPress={handleBackPress}>
          <Text className="text-cyan-400 text-4xl" style={{ fontFamily: fonts.SharpSansMedium }}>‹</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6 items-center">
        {/* Logo */}
        <View className="mb-12">
          <ForgotPasswordLogo />
        </View>

        {/* Title */}
        <Text className="text-white text-3xl font-bold mb-4" style={{ fontFamily: fonts.SharpSansBold }}>
          Forgot Password?
        </Text>
        
        {/* Subtitle */}
        <Text className="text-gray-400 text-base text-center mb-12 leading-6" style={{ fontFamily: fonts.SharpSansRegular }}>
          Enter the email address on which we can send you{'\n'}verification OTP
        </Text>

        {/* Email Field */}
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
      </View>

          {/* Fixed Bottom Button */}
          <View className="px-6 pb-12 pt-6">
            <ReusableButton
              title="Send Verification Code"
              variant="gradient"
              fullWidth={true}
              onPress={handleSendCode}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}