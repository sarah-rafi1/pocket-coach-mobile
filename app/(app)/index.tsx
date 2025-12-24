import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { ReusableButton } from '@/components';
import { fonts } from '@/libs/constants/typography';

export default function HomeScreen() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ImageBackground
        source={require('@/assets/images/Background.png')}
        className="flex-1"
        resizeMode="cover"
      >
        <View className="flex-1 px-6 justify-center items-center">
          <Text className="text-white text-3xl font-bold text-center mb-4" style={{ fontFamily: fonts.SharpSansBold }}>
            Welcome to Pocket Coach!
          </Text>

          <Text className="text-gray-400 text-base text-center mb-8 px-4" style={{ fontFamily: fonts.SharpSansRegular }}>
            Your home screen is ready. Start building your features here.
          </Text>

          <ReusableButton
            title="Sign Out"
            variant="outlined"
            fullWidth={true}
            gradientText={true}
            onPress={handleSignOut}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
