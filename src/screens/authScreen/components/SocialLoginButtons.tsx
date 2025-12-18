import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { fonts } from '../../../constants/typography';
import { GoogleIcon, FacebookLogo, AppleIcon } from '../../../../assets/icons';

interface SocialLoginButtonsProps {
  isLogin: boolean;
  socialLoading: string | null;
  onGoogleAuth: () => void;
  onFacebookAuth: () => void;
  onAppleAuth: () => void;
  disabled?: boolean;
}

export function SocialLoginButtons({
  isLogin,
  socialLoading,
  onGoogleAuth,
  onFacebookAuth,
  onAppleAuth,
  disabled = false
}: SocialLoginButtonsProps) {
  return (
    <View style={{ 
      alignItems: 'center', 
      marginBottom: Platform.OS === 'android' ? 16 : 32,
      marginTop: Platform.OS === 'android' ? 8 : 16
    }}>
      <Text style={{ 
        color: '#9CA3AF', 
        fontSize: 14, 
        marginBottom: Platform.OS === 'android' ? 16 : 24,
        fontFamily: fonts.SharpSansRegular 
      }}>
        Or {isLogin ? 'Sign In' : 'Sign Up'} With
      </Text>
      
      <View className="gap-2"style={{ 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}>
        {/* Google */}
        <TouchableOpacity 
          onPress={onGoogleAuth}
          disabled={disabled || socialLoading !== null}
          style={{ 
            width: Platform.OS === 'android' ? 48 : 56, 
            height: Platform.OS === 'android' ? 48 : 56, 
            borderRadius: 28, 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          {socialLoading === "google" ? (
            <ActivityIndicator size="small" color="#4285F4" />
          ) : (
            <GoogleIcon />
          )}
        </TouchableOpacity>

        {/* Facebook */}
        <TouchableOpacity 
          onPress={onFacebookAuth}
          disabled={disabled || socialLoading !== null}
          style={{ 
            width: Platform.OS === 'android' ? 48 : 56, 
            height: Platform.OS === 'android' ? 48 : 56, 
            borderRadius: 28, 
            alignItems: 'center', 
            justifyContent: 'center',
            marginHorizontal: Platform.OS === 'android' ? 12 : 16
          }}
        >
          {socialLoading === "facebook" ? (
            <ActivityIndicator size="small" color="#1877F2" />
          ) : (
            <FacebookLogo />
          )}
        </TouchableOpacity>

        {/* Apple */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity 
            onPress={onAppleAuth}
            disabled={disabled || socialLoading !== null}
            style={{ 
              width: 56, 
              height: 56, 
              borderRadius: 28, 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            {socialLoading === "apple" ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <AppleIcon />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}