import React from 'react';
import { View, ImageBackground } from 'react-native';
import { SplashScreenLogo as SplashScreenLogoSvg } from '../../../assets/icons';

export function SplashScreen() {
  return (
    <ImageBackground 
      source={require('../../../assets/images/Background.png')} 
      className="flex-1"
      resizeMode="cover"
    >
      {/* Content */}
      <View className="flex-1 justify-center items-center px-8 pt-15">
        {/* Logo */}
        <View className="mb-6">
          <SplashScreenLogoSvg />
        </View>
        
      </View>
    </ImageBackground>
  );
}