import React from 'react';
import { View, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../../../constants/typography';
import { HomeLogo, WavingHand } from '../../../../assets/icons';

interface AuthHeaderProps {
  isLogin: boolean;
}

export function AuthHeader({ isLogin }: AuthHeaderProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <>
      {/* Logo Header with Safe Area - Compact for Android */}
      <View style={{ 
        alignItems: 'center', 
        paddingTop: Math.max(insets.top + (Platform.OS === 'android' ? 8 : 16), Platform.OS === 'android' ? 40 : 60),
        paddingBottom: Platform.OS === 'android' ? 16 : 32
      }}>
        <HomeLogo />
      </View>

      {/* Welcome Section - Compressed for Android */}
      <View style={{ 
        paddingHorizontal: 24, 
        marginBottom: Platform.OS === 'android' ? 16 : 32 
      }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: Platform.OS === 'android' ? 8 : 16 
        }}>
          <Text style={{ 
            color: 'white', 
            fontSize: Platform.OS === 'android' ? 24 : 28, 
            fontWeight: 'bold', 
            marginRight: 12,
            fontFamily: fonts.SharpSansBold 
          }}>
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </Text>
          {isLogin && <WavingHand />}
        </View>
        <Text style={{ 
          color: '#9CA3AF', 
          fontSize: Platform.OS === 'android' ? 14 : 16, 
          lineHeight: Platform.OS === 'android' ? 20 : 24,
          fontFamily: fonts.SharpSansRegular 
        }}>
          {isLogin 
            ? 'Sign in to your account to continue your fitness journey'
            : 'Create your account by adding your account basic details'
          }
        </Text>
      </View>
    </>
  );
}