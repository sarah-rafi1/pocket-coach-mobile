import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, TextInputProps, ViewStyle, Platform } from 'react-native';
import { fonts } from '../../constants/typography';

interface ReusableInputProps extends TextInputProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  error?: string;
  hasError?: boolean;
}

export function ReusableInput({
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPassword = false,
  error,
  hasError = false,
  ...props
}: ReusableInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
    if (onRightIconPress) {
      onRightIconPress();
    }
  };

  const getBorderColor = () => {
    if (hasError || error) return '#FF5050'; // Red for error
    if (isFocused) return '#00C6FF'; // Blue for focus
    return 'rgba(255, 255, 255, 0.2)'; // Default
  };

  const isAndroid = Platform.OS === 'android';
  const paddingVertical = isAndroid ? 8 : 12;

  return (
    <View>
      <View 
        className="flex-row items-center bg-white/10 rounded-xl px-4 border"
        style={[
          {
            paddingVertical: paddingVertical,
            borderColor: getBorderColor(),
          },
          containerStyle
        ]}
      >
        {leftIcon && (
          <View className="mr-3">
            {leftIcon}
          </View>
        )}
        
        <TextInput
          {...props}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          className="flex-1 text-white text-base"
          style={[
            {
              fontFamily: fonts.SharpSansRegular,
            },
            props.style
          ]}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
        />
        
        {rightIcon && (
          <TouchableOpacity 
            onPress={isPassword ? togglePasswordVisibility : onRightIconPress}
            className="ml-3"
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {/* Error Message */}
      {(hasError || error) && (
        <View className="flex-row items-center mt-2">
          <View className="w-4 h-4 rounded-full bg-red-500 justify-center items-center mr-2">
            <Text className="text-white text-xs font-bold" style={{ fontFamily: fonts.SharpSansBold }}>!</Text>
          </View>
          <Text className="text-red-500 text-sm font-medium" style={{ fontFamily: fonts.SharpSansMedium }}>
            {error || 'This field has an error'}
          </Text>
        </View>
      )}
    </View>
  );
}