import React from 'react';
import { View, Text, ImageBackground, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ReusableButton } from '@/components';
import { fonts } from '@/libs/constants/typography';
import { HomeLogo } from '@/assets/icons';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleLoginPress = () => {
    router.push('/(auth)/login');
  };

  const handleSignUpPress = () => {
    router.push('/(auth)/signup');
  };

  const handleGuestPress = () => {
    // TODO: Implement guest mode
    console.log('Explore as guest');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ImageBackground
        source={require('@/assets/images/HomeBackground.png')}
        className="flex-1"
        resizeMode="cover"
      >
      {/* Header with Logo */}
      <View className={`flex-row items-center justify-center ${Platform.OS === 'ios' ? 'pt-28' : 'pt-24'} pb-8`}>
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
          Learn something new, or monetize what you already know
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
            onPress={handleGuestPress}
          />
        </View>
      </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
