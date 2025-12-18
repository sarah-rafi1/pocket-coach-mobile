import React from 'react';
import { View, Text, ScrollView, ImageBackground, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fonts } from '../../constants/typography';
import { AppRoutes } from '../../types';
import { useAuthStore } from '../../store';

type FeedNavigationProp = StackNavigationProp<AppRoutes, 'feed-screen'>;

export function FeedScreen() {
  const navigation = useNavigation<FeedNavigationProp>();
  const { user } = useAuthStore();

  return (
    <ImageBackground 
      source={require('../../../assets/images/Background.png')} 
      className="flex-1"
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1">
        <ScrollView 
          className="flex-1 px-6" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 20 }}
        >
          {/* Header */}
          <View className="mb-8">
            <Text className="text-white text-2xl font-bold mb-2" style={{ fontFamily: fonts.SharpSansBold }}>
              Welcome to Your Feed
            </Text>
            <Text className="text-gray-400 text-base" style={{ fontFamily: fonts.SharpSansRegular }}>
              {user?.display_name ? `Hello, ${user.display_name}!` : 'Hello there!'}
            </Text>
          </View>

          {/* Feed Content Placeholder */}
          <View className="flex-1">
            <View className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <Text className="text-white text-lg font-bold mb-4" style={{ fontFamily: fonts.SharpSansBold }}>
                Your Journey Starts Here
              </Text>
              <Text className="text-gray-300 text-base leading-6" style={{ fontFamily: fonts.SharpSansRegular }}>
                Welcome to PocketCoach! Your personalized feed will show content based on your interests and activity. 
                Start exploring and connecting with the community.
              </Text>
            </View>

            <View className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <Text className="text-white text-lg font-bold mb-4" style={{ fontFamily: fonts.SharpSansBold }}>
                Getting Started
              </Text>
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Text className="text-blue-400 text-lg mr-3">✓</Text>
                  <Text className="text-gray-300 text-base flex-1" style={{ fontFamily: fonts.SharpSansRegular }}>
                    Complete your profile
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-blue-400 text-lg mr-3">•</Text>
                  <Text className="text-gray-300 text-base flex-1" style={{ fontFamily: fonts.SharpSansRegular }}>
                    Follow your favorite coaches
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-blue-400 text-lg mr-3">•</Text>
                  <Text className="text-gray-300 text-base flex-1" style={{ fontFamily: fonts.SharpSansRegular }}>
                    Start your first workout
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-blue-400 text-lg mr-3">•</Text>
                  <Text className="text-gray-300 text-base flex-1" style={{ fontFamily: fonts.SharpSansRegular }}>
                    Connect with the community
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-gray-800/50 rounded-xl p-6 mb-6">
              <Text className="text-white text-lg font-bold mb-4" style={{ fontFamily: fonts.SharpSansBold }}>
                Recommended for You
              </Text>
              <Text className="text-gray-300 text-base" style={{ fontFamily: fonts.SharpSansRegular }}>
                Based on your interests, we'll curate personalized content just for you. 
                Check back soon for workout recommendations and tips!
              </Text>
            </View>

            {/* Account Status Display for Debug */}
            {user && (
              <View className="bg-gray-800/30 rounded-xl p-4 mb-6">
                <Text className="text-gray-400 text-sm mb-2" style={{ fontFamily: fonts.SharpSansRegular }}>
                  Account Status
                </Text>
                <Text className="text-green-400 text-base" style={{ fontFamily: fonts.SharpSansMedium }}>
                  ✅ Onboarding Complete
                </Text>
                <Text className="text-gray-300 text-sm mt-1" style={{ fontFamily: fonts.SharpSansRegular }}>
                  Username: @{user.username || 'N/A'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}