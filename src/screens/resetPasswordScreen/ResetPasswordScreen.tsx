import React, { useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ReusableButton, ReusableInput, PasswordUpdatedModal } from '../../components';
import { fonts } from '../../constants/typography';
import ResetPasswordLogo from '../../../assets/icons/ResetPasswordLogo';
import LockPassword from '../../../assets/icons/LockPassword';
import EyeIcon from '../../../assets/icons/EyeIcon';
import { AppRoutes } from '../../types';

type ResetPasswordNavigationProp = StackNavigationProp<AppRoutes, 'reset-password-screen'>;

export function ResetPasswordScreen() {
  const navigation = useNavigation<ResetPasswordNavigationProp>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    if (newPasswordError) {
      setNewPasswordError('');
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

  const handleNewPasswordBlur = () => {
    if (newPassword && !validatePassword(newPassword)) {
      setNewPasswordError('Password must be at least 6 characters');
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword && confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleLoginNow = () => {
    setShowSuccessModal(false);
    // Navigate to login screen
    navigation.navigate('login-screen');
  };

  const handleContinue = () => {
    let hasError = false;

    if (!newPassword) {
      setNewPasswordError('New password is required');
      hasError = true;
    } else if (!validatePassword(newPassword)) {
      setNewPasswordError('Password must be at least 6 characters');
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
      // Handle password reset logic here
      console.log('Password reset successful');
      // Show success modal
      setShowSuccessModal(true);
    }
  };

  return (
    <ImageBackground 
      source={require('../../../assets/images/Background.png')} 
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          nestedScrollEnabled={true}
        >
      {/* Header with Back Button */}
      <View className="flex-row items-center px-5 pt-20">
        <TouchableOpacity onPress={handleBackPress}>
          <Text className="text-cyan-400 text-4xl" style={{ fontFamily: fonts.SharpSansMedium }}>‹</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6 items-center justify-center">
        {/* Logo */}
        <View className="mb-12">
          <ResetPasswordLogo />
        </View>

        {/* Title */}
        <Text className="text-white text-3xl font-bold mb-4" style={{ fontFamily: fonts.SharpSansBold }}>
          Reset Password
        </Text>
        
        {/* Subtitle */}
        <Text className="text-gray-400 text-base text-center mb-12 leading-6" style={{ fontFamily: fonts.SharpSansRegular }}>
          Enter your new password to access your account
        </Text>

        {/* Password Fields */}
        <View className="w-full gap-6">
          {/* New Password Field */}
          <View>
            <Text className="text-white text-base font-medium mb-3" style={{ fontFamily: fonts.SharpSansMedium }}>
              New Password
            </Text>
            <ReusableInput
              placeholder="••••••••"
              value={newPassword}
              onChangeText={handleNewPasswordChange}
              onBlur={handleNewPasswordBlur}
              isPassword={true}
              leftIcon={<LockPassword color={newPasswordError ? '#FF5050' : 'white'} />}
              rightIcon={<EyeIcon />}
              onRightIconPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
              error={newPasswordError}
              hasError={!!newPasswordError}
            />
          </View>

          {/* Confirm Password Field */}
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
              rightIcon={<EyeIcon />}
              onRightIconPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
              error={confirmPasswordError}
              hasError={!!confirmPasswordError}
            />
          </View>
        </View>
      </View>

        </ScrollView>
        
        {/* Fixed Bottom Button */}
        <View className="px-6 pb-12 pt-6" style={{ backgroundColor: 'transparent' }}>
          <ReusableButton
            title="Continue"
            variant="gradient"
            fullWidth={true}
            onPress={handleContinue}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <PasswordUpdatedModal
        visible={showSuccessModal}
        onLoginNow={handleLoginNow}
      />
    </ImageBackground>
  );
}