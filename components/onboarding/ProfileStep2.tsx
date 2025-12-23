import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { ReusableButton, BackArrowButton } from '@/components';
import { fonts } from '@/libs/constants/typography';
import { Interest } from '@/libs/interfaces/user.types';

interface ProfileStep2Props {
  availableInterests: Interest[];
  selectedInterests: string[];
  interestsLoading: boolean;
  interestsError: any;
  isKeyboardVisible: boolean;
  isSubmitting: boolean;
  onInterestToggle: (value: string) => void;
  onComplete: () => void;
  onBack: () => void;
}

const getInterestEmoji = (interestValue: string): string => {
  const emojiMap: Record<string, string> = {
    'basketball': '🏀',
    'cycling': '🚴',
    'fitness': '💪',
    'mind-training': '🧠',
    'running': '🏃',
    'skating': '⛸️',
    'football': '⚽',
    'soccer': '⚽',
    'tennis': '🎾',
    'swimming': '🏊',
    'yoga': '🧘',
    'boxing': '🥊',
    'baseball': '⚾',
    'golf': '⛳',
    'surfing': '🏄',
    'snowboard': '🏂',
  };
  return emojiMap[interestValue.toLowerCase()] || '🏃';
};

export function ProfileStep2({
  availableInterests,
  selectedInterests,
  interestsLoading,
  interestsError,
  isKeyboardVisible,
  isSubmitting,
  onInterestToggle,
  onComplete,
  onBack
}: ProfileStep2Props) {
  return (
    <>
      {/* Header with Back Button */}
      <View className="flex-row items-center justify-between px-6 pt-12 pb-3">
        <BackArrowButton onPress={onBack} />

        {/* Progress Indicators */}
        <View className="flex-row items-center">
          <View className="w-6 h-1 bg-blue-500 rounded-full mr-2" />
          <View className="w-6 h-1 bg-blue-500 rounded-full" />
        </View>
        <View />
      </View>

      {/* Main Content */}
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Platform.OS === 'ios' ? 20 : 0,
          paddingBottom: isKeyboardVisible ? 200 : 0
        }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={isKeyboardVisible}
        nestedScrollEnabled={true}
      >
        {/* Title */}
        <Text className="text-white text-2xl font-bold text-center mb-1" style={{ fontFamily: fonts.SharpSansBold }}>
          Choose Your Interests
        </Text>

        <Text className="text-gray-400 text-sm text-center mb-6" style={{ fontFamily: fonts.SharpSansRegular }}>
          Select your interests to personalize your experience.
        </Text>

        {/* Interests Grid */}
        <View className="flex-row flex-wrap justify-between">
          {interestsLoading ? (
            <View className="w-full items-center py-8">
              <Text className="text-gray-400 text-base" style={{ fontFamily: fonts.SharpSansRegular }}>
                Loading interests...
              </Text>
            </View>
          ) : interestsError ? (
            <View className="w-full items-center py-8">
              <Text className="text-red-400 text-base" style={{ fontFamily: fonts.SharpSansRegular }}>
                Failed to load interests. Please try again.
              </Text>
            </View>
          ) : (
            availableInterests && availableInterests.length > 0 ? availableInterests.map((interest: Interest) => {
              if (!interest?.value || !interest?.label) return null;

              const isSelected = selectedInterests.includes(interest.value);
              return (
                <TouchableOpacity
                  key={interest.value}
                  onPress={() => onInterestToggle(interest.value)}
                  className={`w-[48%] p-3 mb-3 rounded-lg border-2 ${
                    isSelected
                      ? 'border-blue-400 bg-gray-900'
                      : 'border-gray-700 bg-gray-900/50'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Text className="text-xl mr-2">{getInterestEmoji(interest.value)}</Text>
                    <Text
                      className={`font-medium flex-1 text-sm ${
                        isSelected ? 'text-white' : 'text-gray-300'
                      }`}
                      style={{ fontFamily: fonts.SharpSansMedium }}
                    >
                      {interest.label}
                    </Text>
                    <View className={`w-4 h-4 rounded border-2 ${
                      isSelected
                        ? 'border-blue-400 bg-blue-400'
                        : 'border-gray-500'
                    }`}>
                      {isSelected && (
                        <Text className="text-white text-center text-xs">✓</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }) : (
              <View className="w-full items-center py-8">
                <Text className="text-gray-400 text-base" style={{ fontFamily: fonts.SharpSansRegular }}>
                  No interests available
                </Text>
              </View>
            )
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="px-6 pb-8 pt-3">
        <ReusableButton
          title={isSubmitting ? "Creating Profile..." : "Continue"}
          variant="gradient"
          fullWidth={true}
          onPress={onComplete}
          disabled={isSubmitting}
        />
      </View>
    </>
  );
}
