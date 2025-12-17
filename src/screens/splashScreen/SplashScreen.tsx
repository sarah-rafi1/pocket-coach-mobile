import React from 'react';
import { View, ImageBackground, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SplashScreenLogo as SplashScreenLogoSvg } from '../../../assets/icons';

export function SplashScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ImageBackground 
        source={require('../../../assets/images/Background.png')} 
        className="flex-1"
        resizeMode="cover"
      >
      {/* Content */}
      <View className={`flex-1 justify-center items-center px-8 ${Platform.OS === 'ios' ? 'pt-20' : 'pt-15'}`}>
        {/* Logo */}
        <View className="mb-6">
          <SplashScreenLogoSvg />
        </View>
        
      </View>
      </ImageBackground>
    </SafeAreaView>
  );
}