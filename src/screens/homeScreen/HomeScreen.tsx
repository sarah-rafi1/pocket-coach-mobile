import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ReusableButton, GradientText } from '../../components';
import { fonts } from '../../constants/typography';
import HomeLogo from '../../../assets/icons/HomeLogo';
import { AppRoutes } from '../../types';

type HomeScreenNavigationProp = StackNavigationProp<AppRoutes, 'home-screen'>;


export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleLoginPress = () => {
    navigation.navigate('login-screen');
  };

  const handleSignUpPress = () => {
    navigation.navigate('sign-up-screen');
  };

  return (
    <ImageBackground 
      source={require('../../../assets/images/HomeBackground.png')} 
      className="flex-1"
      resizeMode="cover"
    >
      {/* Header with Logo */}
      <View className="flex-row items-center justify-center pt-24 pb-8">
        <HomeLogo />
      </View>

      {/* Main Content */}
      <View className="flex-1 text-white justify-end px-6 pb-16">
        {/* Title */}
        <Text className="text-white text-3xl font-bold" style={{ fontFamily: fonts.SharpSansBold }}>
          Pocket Coach —
        </Text>
        <Text className="text-white text-3xl font-bold" style={{ fontFamily: fonts.SharpSansBold }}>
          Where Coaching Meets Community
        </Text>
        
        {/* Subtitle */}
        <Text className="text-gray-300 text-sm mb-12" style={{ fontFamily: fonts.SharpSansRegular }}>
          Learn something new, or monazte what you already know
        </Text>

        {/* Buttons */}
        <View className="gap-y-4">
          <ReusableButton
            title="Login"
            variant="gradient"
            fullWidth={true}
            onPress={handleLoginPress}
          />
          
          <ReusableButton
            title="Sign Up"
            variant="outlined"
            fullWidth={true}
            gradientText={true}
            onPress={handleSignUpPress}
          />

          <ReusableButton
            title="Explore as a Guest"
            variant="text"
            fullWidth={false}
            gradientText={true}
            textStyle={{ fontSize: 14 }}
          />
        </View>
      </View>
    </ImageBackground>
  );
}