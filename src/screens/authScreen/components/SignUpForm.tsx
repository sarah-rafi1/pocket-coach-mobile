import React from 'react';
import { View, Platform } from 'react-native';
import { ReusableButton, PasswordRequirements } from '../../../components';
import { AuthFormField } from './AuthFormField';
import { Letter, LockPassword, EyeIcon, CloseEyeIcon } from '../../../../assets/icons';

interface SignUpFormProps {
  email: string;
  password: string;
  confirmPassword: string;
  emailError: string;
  passwordError: string;
  confirmPasswordError: string;
  isPasswordVisible: boolean;
  isConfirmPasswordVisible: boolean;
  loading: boolean;
  socialLoading: string | null;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onConfirmPasswordChange: (text: string) => void;
  onEmailBlur: () => void;
  onPasswordBlur: () => void;
  onConfirmPasswordBlur: () => void;
  onTogglePasswordVisibility: () => void;
  onToggleConfirmPasswordVisibility: () => void;
  onSubmit: () => void;
}

export function SignUpForm({
  email,
  password,
  confirmPassword,
  emailError,
  passwordError,
  confirmPasswordError,
  isPasswordVisible,
  isConfirmPasswordVisible,
  loading,
  socialLoading,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onEmailBlur,
  onPasswordBlur,
  onConfirmPasswordBlur,
  onTogglePasswordVisibility,
  onToggleConfirmPasswordVisibility,
  onSubmit
}: SignUpFormProps) {
  return (
    <View style={{ paddingHorizontal: 24 }}>
      <AuthFormField
        label="Email Address"
        placeholder="Enter your email"
        value={email}
        onChangeText={onEmailChange}
        onBlur={onEmailBlur}
        leftIcon={<Letter color={emailError ? '#FF5050' : 'white'} />}
        error={emailError}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={{ marginBottom: Platform.OS === 'android' ? 8 : 16 }}>
        <AuthFormField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={onPasswordChange}
          onBlur={onPasswordBlur}
          leftIcon={<LockPassword color="white" />}
          rightIcon={isPasswordVisible ? <CloseEyeIcon /> : <EyeIcon />}
          onRightIconPress={onTogglePasswordVisibility}
          isPassword={!isPasswordVisible}
        />
        
        {Platform.OS === 'android' && password.length > 0 ? null : (
          <PasswordRequirements 
            password={password} 
            visible={password.length > 0} 
            showOnlyErrors={true} 
          />
        )}
      </View>

      <View style={{ marginBottom: Platform.OS === 'android' ? 16 : 24 }}>
        <AuthFormField
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={onConfirmPasswordChange}
          onBlur={onConfirmPasswordBlur}
          leftIcon={<LockPassword color={confirmPasswordError ? '#FF5050' : 'white'} />}
          rightIcon={isConfirmPasswordVisible ? <CloseEyeIcon /> : <EyeIcon />}
          onRightIconPress={onToggleConfirmPasswordVisibility}
          error={confirmPasswordError}
          isPassword={!isConfirmPasswordVisible}
        />
      </View>

      <View style={{ marginBottom: Platform.OS === 'android' ? 20 : 32 }}>
        <ReusableButton
          title={loading ? "Creating Account..." : "Sign Up"}
          variant="gradient"
          fullWidth={true}
          onPress={onSubmit}
          disabled={loading || socialLoading !== null}
        />
      </View>
    </View>
  );
}