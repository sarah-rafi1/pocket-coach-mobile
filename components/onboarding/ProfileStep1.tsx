import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Image, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ReusableButton, ReusableInput, BackArrowButton } from '@/components';
import { fonts } from '@/libs/constants/typography';
import { User } from '@/assets/icons';

interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  profileImage: string | null;
}

interface ProfileStep1Props {
  profileData: ProfileData;
  usernameError: string;
  displayNameError: string;
  isKeyboardVisible: boolean;
  onUsernameChange: (text: string) => void;
  onDisplayNameChange: (text: string) => void;
  onBioChange: (text: string) => void;
  onImageSelect: (uri: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onShowImagePicker: () => void;
}

export function ProfileStep1({
  profileData,
  usernameError,
  displayNameError,
  isKeyboardVisible,
  onUsernameChange,
  onDisplayNameChange,
  onBioChange,
  onContinue,
  onBack,
  onShowImagePicker
}: ProfileStep1Props) {
  const scrollViewRef = useRef<ScrollView>(null);

  const handleInputFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <>
      {/* Header with Back Button */}
      <View className="flex-row items-center justify-between px-6 pt-12 pb-3">
        <BackArrowButton onPress={onBack} />

        {/* Progress Indicators */}
        <View className="flex-row items-center">
          <View className="w-6 h-1 bg-blue-500 rounded-full mr-2" />
          <View className="w-6 h-1 bg-gray-600 rounded-full" />
        </View>
        <View />
      </View>

      {/* Main Content */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: Platform.OS === 'ios' ? 20 : 0,
          paddingBottom: isKeyboardVisible ? 200 : 0
        }}
        scrollEnabled={isKeyboardVisible}
        nestedScrollEnabled={true}
      >
        {/* Title */}
        <Text className="text-white text-2xl font-bold text-center mb-1" style={{ fontFamily: fonts.SharpSansBold }}>
          Complete Your Profile
        </Text>

        <Text className="text-gray-400 text-sm text-center mb-6" style={{ fontFamily: fonts.SharpSansRegular }}>
          The info will be displayed publically
        </Text>

        {/* Profile Image Section */}
        <View className="items-center mb-6">
          <TouchableOpacity onPress={onShowImagePicker} className="relative">
            {profileData.profileImage ? (
              <View className="w-24 h-24 rounded-full overflow-hidden">
                <ImageBackground
                  source={{ uri: profileData.profileImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View className="w-24 h-24 rounded-full overflow-hidden items-center justify-center">
                <Image
                  source={require('@/assets/images/User.png')}
                  style={{ width: 70, height: 70 }}
                  resizeMode="contain"
                />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Username Field */}
        <View className="mb-4">
          <Text className="text-white text-sm font-medium mb-2" style={{ fontFamily: fonts.SharpSansMedium }}>
            Username
          </Text>
          <ReusableInput
            placeholder="example123"
            value={profileData.username}
            onChangeText={onUsernameChange}
            leftIcon={<User />}
            error={usernameError}
            hasError={!!usernameError}
            autoCapitalize="none"
          />
        </View>

        {/* Display Name Field */}
        <View className="mb-4">
          <Text className="text-white text-sm font-medium mb-2" style={{ fontFamily: fonts.SharpSansMedium }}>
            Display Name
          </Text>
          <ReusableInput
            placeholder="example123"
            value={profileData.displayName}
            onChangeText={onDisplayNameChange}
            onFocus={handleInputFocus}
            leftIcon={<User />}
            error={displayNameError}
            hasError={!!displayNameError}
          />
        </View>

        {/* Bio Field */}
        <View className="mb-6">
          <Text className="text-white text-sm font-medium mb-2" style={{ fontFamily: fonts.SharpSansMedium }}>
            Bio <Text className="text-gray-400 text-xs">(Optional)</Text>
          </Text>
          <ReusableInput
            placeholder="Enter Bio"
            value={profileData.bio}
            onChangeText={onBioChange}
            onFocus={handleInputFocus}
            multiline
            numberOfLines={3}
            style={{ height: 80, textAlignVertical: 'top' }}
          />
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="px-6 pb-8 pt-3">
        <ReusableButton
          title="Continue"
          variant="gradient"
          fullWidth={true}
          onPress={onContinue}
        />
      </View>
    </>
  );
}
