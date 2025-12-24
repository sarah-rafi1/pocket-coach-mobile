import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { ReusableButton } from '@/components';
import { fonts } from '@/libs/constants/typography';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();

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
        <View className="flex-1 px-6 pt-12">
          <Text className="text-white text-3xl font-bold mb-2" style={{ fontFamily: fonts.SharpSansBold }}>
            Profile
          </Text>

          <Text className="text-gray-400 text-base mb-6" style={{ fontFamily: fonts.SharpSansRegular }}>
            {user?.primaryEmailAddress?.emailAddress || 'No email'}
          </Text>

          <View className="mt-auto pb-8">
            <ReusableButton
              title="Sign Out"
              variant="gradient"
              fullWidth={true}
              onPress={handleSignOut}
            />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
