import React, { useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { ReusableButton, ReusableInput } from '../../components';
import { fonts } from '../../constants/typography';
import { AppRoutes } from '../../types';
import User from '../../../assets/icons/User';

type ProfileCompletionNavigationProp = StackNavigationProp<AppRoutes, 'profile-completion-screen'>;

interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  profileImage: string | null;
}

interface Interest {
  id: string;
  name: string;
  emoji: string;
}

export function ProfileCompletionScreen() {
  const navigation = useNavigation<ProfileCompletionNavigationProp>();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    displayName: '',
    bio: '',
    profileImage: null,
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Step 1: Profile Form
  const [usernameError, setUsernameError] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');

  // Sample interests data with emojis
  const availableInterests: Interest[] = [
    { id: '1', name: 'Snowboard', emoji: '🏂' },
    { id: '2', name: 'Skating', emoji: '⛸️' },
    { id: '3', name: 'Surfing', emoji: '🏄' },
    { id: '4', name: 'Cycling', emoji: '🚴' },
    { id: '5', name: 'Soccer', emoji: '⚽' },
    { id: '6', name: 'Basketball', emoji: '🏀' },
    { id: '7', name: 'Tennis', emoji: '🎾' },
    { id: '8', name: 'Running', emoji: '🏃' },
    { id: '9', name: 'Fitness', emoji: '💪' },
    { id: '10', name: 'Mind Training', emoji: '🧠' },
  ];

  const handleImageSelection = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    
    if (cameraPermission.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileData(prev => ({ ...prev, profileImage: result.assets[0].uri }));
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileData(prev => ({ ...prev, profileImage: result.assets[0].uri }));
    }
  };

  const handleUsernameChange = (text: string) => {
    setProfileData(prev => ({ ...prev, username: text }));
    if (usernameError) {
      setUsernameError('');
    }
  };

  const handleDisplayNameChange = (text: string) => {
    setProfileData(prev => ({ ...prev, displayName: text }));
    if (displayNameError) {
      setDisplayNameError('');
    }
  };

  const handleBioChange = (text: string) => {
    setProfileData(prev => ({ ...prev, bio: text }));
  };

  const validateStep1 = () => {
    let hasError = false;

    if (!profileData.username.trim()) {
      setUsernameError('Username is required');
      hasError = true;
    } else if (profileData.username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      hasError = true;
    }

    if (!profileData.displayName.trim()) {
      setDisplayNameError('Display name is required');
      hasError = true;
    }

    return !hasError;
  };

  const handleContinueStep1 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      } else {
        return [...prev, interestId];
      }
    });
  };

  const handleCompleteProfile = () => {
    if (selectedInterests.length === 0) {
      Alert.alert('Select Interests', 'Please select at least one interest to continue.');
      return;
    }
    
    // Here you would typically save the profile data
    console.log('Profile completed:', { profileData, selectedInterests });
    navigation.navigate('profile-success-screen');
  };

  const handleBackPress = () => {
    if (currentStep === 1) {
      navigation.goBack();
    } else {
      setCurrentStep(1);
    }
  };

  const renderStep1 = () => (
    <>
      {/* Header with Back Button */}
      <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
        <TouchableOpacity onPress={handleBackPress}>
          <Text className="text-cyan-400 text-4xl" style={{ fontFamily: fonts.SharpSansMedium }}>‹</Text>
        </TouchableOpacity>
        
        {/* Progress Indicators */}
        <View className="flex-row items-center">
          <View className="w-6 h-1 bg-blue-500 rounded-full mr-2" />
          <View className="w-6 h-1 bg-gray-600 rounded-full" />
        </View>
        <View />
      </View>

      {/* Main Content */}
      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <Text className="text-white text-3xl font-bold text-center mb-2" style={{ fontFamily: fonts.SharpSansBold }}>
          Complete Your Profile
        </Text>
        
        <Text className="text-gray-400 text-base text-center mb-8" style={{ fontFamily: fonts.SharpSansRegular }}>
          The info will be displayed publically
        </Text>

        {/* Profile Image Section */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={handleImageSelection} className="relative">
            {profileData.profileImage ? (
              <View className="w-32 h-32 rounded-full overflow-hidden">
                <ImageBackground 
                  source={{ uri: profileData.profileImage }} 
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View className="w-32 h-32 rounded-full overflow-hidden items-center justify-center">
                <Image 
                  source={require('../../../assets/images/User.png')} 
                  style={{ width: 90, height: 90 }}
                  resizeMode="contain"
                />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Username Field */}
        <View className="mb-6">
          <Text className="text-white text-base font-medium mb-3" style={{ fontFamily: fonts.SharpSansMedium }}>
            Username
          </Text>
          <ReusableInput
            placeholder="example123"
            value={profileData.username}
            onChangeText={handleUsernameChange}
            leftIcon={<User />}
            error={usernameError}
            hasError={!!usernameError}
            autoCapitalize="none"
          />
        </View>

        {/* Display Name Field */}
        <View className="mb-6">
          <Text className="text-white text-base font-medium mb-3" style={{ fontFamily: fonts.SharpSansMedium }}>
            Display Name
          </Text>
          <ReusableInput
            placeholder="example123"
            value={profileData.displayName}
            onChangeText={handleDisplayNameChange}
            leftIcon={<User />}
            error={displayNameError}
            hasError={!!displayNameError}
          />
        </View>

        {/* Bio Field */}
        <View className="mb-8">
          <Text className="text-white text-base font-medium mb-3" style={{ fontFamily: fonts.SharpSansMedium }}>
            Bio <Text className="text-gray-400 text-sm">(Optional)</Text>
          </Text>
          <ReusableInput
            placeholder="Enter Bio"
            value={profileData.bio}
            onChangeText={handleBioChange}
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="px-6 pb-12 pt-4">
        <ReusableButton
          title="Continue"
          variant="gradient"
          fullWidth={true}
          onPress={handleContinueStep1}
        />
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      {/* Header with Back Button */}
      <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
        <TouchableOpacity onPress={handleBackPress}>
          <Text className="text-cyan-400 text-4xl" style={{ fontFamily: fonts.SharpSansMedium }}>‹</Text>
        </TouchableOpacity>
        
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
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Title */}
        <Text className="text-white text-3xl font-bold text-center mb-2" style={{ fontFamily: fonts.SharpSansBold }}>
          Choose Your Interests
        </Text>
        
        <Text className="text-gray-400 text-base text-center mb-8" style={{ fontFamily: fonts.SharpSansRegular }}>
          Select your interests to personalize your experience.
        </Text>

        {/* Interests Grid */}
        <View className="flex-row flex-wrap justify-between">
          {availableInterests.map((interest) => {
            const isSelected = selectedInterests.includes(interest.id);
            return (
              <TouchableOpacity
                key={interest.id}
                onPress={() => handleInterestToggle(interest.id)}
                className={`w-[48%] p-4 mb-4 rounded-xl border-2 ${
                  isSelected 
                    ? 'border-blue-400 bg-gray-900' 
                    : 'border-gray-700 bg-gray-900/50'
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-2">{interest.emoji}</Text>
                  <Text 
                    className={`font-medium flex-1 ${
                      isSelected ? 'text-white' : 'text-gray-300'
                    }`}
                    style={{ fontFamily: fonts.SharpSansMedium }}
                  >
                    {interest.name}
                  </Text>
                  <View className={`w-5 h-5 rounded border-2 ${
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
          })}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="px-6 pb-12 pt-4">
        <ReusableButton
          title="Continue"
          variant="gradient"
          fullWidth={true}
          onPress={handleCompleteProfile}
        />
      </View>
    </>
  );


  return (
    <ImageBackground 
      source={require('../../../assets/images/Background.png')} 
      className="flex-1"
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {currentStep === 1 ? renderStep1() : renderStep2()}
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}