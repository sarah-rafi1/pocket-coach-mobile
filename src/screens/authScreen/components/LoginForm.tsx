import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { ReusableButton, GradientText } from '../../../components';
import { AuthFormField } from './AuthFormField';
import { Letter, LockPassword, EyeIcon, CloseEyeIcon } from '../../../../assets/icons';

interface LoginFormProps {
  email: string;
  password: string;
  emailError: string;
  passwordError: string;
  isPasswordVisible: boolean;
  loading: boolean;
  socialLoading: string | null;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onEmailBlur: () => void;
  onPasswordBlur: () => void;
  onTogglePasswordVisibility: () => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
}

export function LoginForm({
  email,
  password,
  emailError,
  passwordError,
  isPasswordVisible,
  loading,
  socialLoading,
  onEmailChange,
  onPasswordChange,
  onEmailBlur,
  onPasswordBlur,
  onTogglePasswordVisibility,
  onSubmit,
  onForgotPassword
}: LoginFormProps) {
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

      <View style={{ marginBottom: Platform.OS === 'android' ? 12 : 16 }}>
        <AuthFormField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={onPasswordChange}
          onBlur={onPasswordBlur}
          leftIcon={<LockPassword color={passwordError ? '#FF5050' : 'white'} />}
          rightIcon={isPasswordVisible ? <CloseEyeIcon /> : <EyeIcon />}
          onRightIconPress={onTogglePasswordVisibility}
          error={passwordError}
          isPassword={!isPasswordVisible}
        />
      </View>

      <View style={{ 
        marginBottom: Platform.OS === 'android' ? 16 : 24, 
        flexDirection: 'row', 
        justifyContent: 'flex-end' 
      }}>
        <TouchableOpacity onPress={onForgotPassword}>
          <GradientText style={{ fontSize: 14, fontWeight: '500' }}>
            Forgot Password?
          </GradientText>
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: Platform.OS === 'android' ? 20 : 32 }}>
        <ReusableButton
          title={loading ? "Signing In..." : "Sign In"}
          variant="gradient"
          fullWidth={true}
          onPress={onSubmit}
          disabled={loading || socialLoading !== null}
        />
      </View>
    </View>
  );
}