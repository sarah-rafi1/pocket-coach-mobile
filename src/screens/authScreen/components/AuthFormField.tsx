import React from 'react';
import { View, Text, Platform } from 'react-native';
import { ReusableInput } from '../../../components';
import { fonts } from '../../../constants/typography';

interface AuthFormFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  error?: string;
  isPassword?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function AuthFormField({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  isPassword = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences'
}: AuthFormFieldProps) {
  return (
    <View style={{ marginBottom: Platform.OS === 'android' ? 16 : 24 }}>
      <Text style={{ 
        color: 'white', 
        fontSize: 16, 
        fontWeight: '500', 
        marginBottom: Platform.OS === 'android' ? 8 : 12,
        fontFamily: fonts.SharpSansMedium 
      }}>
        {label}
      </Text>
      <ReusableInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        onRightIconPress={onRightIconPress}
        error={error}
        hasError={!!error}
        isPassword={isPassword}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}