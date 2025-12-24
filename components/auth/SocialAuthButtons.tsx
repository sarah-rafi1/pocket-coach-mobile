import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { fonts } from '@/libs/constants/typography';
import { FacebookLogo, GoogleIcon, AppleIcon } from '@/assets/icons';

interface SocialAuthButtonsProps {
  mode: 'login' | 'signup';
  socialLoading: string | null;
  onGooglePress: () => void;
  onFacebookPress: () => void;
  onApplePress: () => void;
  disabled?: boolean;
}

export function SocialAuthButtons({
  mode,
  socialLoading,
  onGooglePress,
  onFacebookPress,
  onApplePress,
  disabled = false
}: SocialAuthButtonsProps) {
  return (
    <View className="items-center mb-6">
      <Text className="text-gray-400 text-sm mb-4" style={{ fontFamily: fonts.SharpSansRegular }}>
        Or {mode === 'login' ? 'Sign In' : 'Sign Up'} With
      </Text>

      <View className="flex-row justify-center gap-x-4">
        {/* Google */}
        <View
          className="w-14 h-14 rounded-full items-center justify-center"
          onTouchEnd={disabled ? undefined : onGooglePress}
        >
          {socialLoading === "google" ? (
            <ActivityIndicator size="small" color="#4285F4" />
          ) : (
            <GoogleIcon />
          )}
        </View>

        {/* Facebook */}
        <View
          className="w-14 h-14 rounded-full items-center justify-center mx-4"
          onTouchEnd={disabled ? undefined : onFacebookPress}
        >
          {socialLoading === "facebook" ? (
            <ActivityIndicator size="small" color="#1877F2" />
          ) : (
            <FacebookLogo />
          )}
        </View>

        {/* Apple */}
        <View
          className="w-14 h-14 rounded-full items-center justify-center"
          onTouchEnd={disabled ? undefined : onApplePress}
        >
          {socialLoading === "apple" ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <AppleIcon />
          )}
        </View>
      </View>
    </View>
  );
}
