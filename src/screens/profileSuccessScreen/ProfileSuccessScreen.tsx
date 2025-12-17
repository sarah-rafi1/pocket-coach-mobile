import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ReusableButton } from '../../components';
import { fonts } from '../../constants/typography';
import { AppRoutes } from '../../types';

type ProfileSuccessNavigationProp = StackNavigationProp<AppRoutes, 'profile-success-screen'>;

export function ProfileSuccessScreen() {
  const navigation = useNavigation<ProfileSuccessNavigationProp>();

  const handleGoToHome = () => {
    navigation.navigate('home-screen');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ImageBackground 
        source={require('../../../assets/images/Background.png')} 
        className="flex-1"
        resizeMode="cover"
      >
      {/* Main Content */}
      <View className={`flex-1 px-6 justify-center items-center ${Platform.OS === 'ios' ? 'pt-5' : ''}`}>
        {/* Complete Profile Image */}
        <View className="mb-8">
          <Image 
            source={require('../../../assets/images/SnowBoard.png')} 
            style={{ width: 320, height: 320 }}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text className="text-white text-3xl font-bold text-center mb-4" style={{ fontFamily: fonts.SharpSansBold }}>
          You are All In
        </Text>
        
        <Text className="text-gray-400 text-base text-center mb-12 px-4 leading-6" style={{ fontFamily: fonts.SharpSansRegular }}>
          We have generated your personalized profile now you can continue the app with your coaches and groups
        </Text>
      </View>

      {/* Fixed Bottom Button */}
      <View className="px-6 pb-12 pt-4">
        <ReusableButton
          title="Go To Home Page"
          variant="gradient"
          fullWidth={true}
          onPress={handleGoToHome}
        />
      </View>
      </ImageBackground>
    </SafeAreaView>
  );
}