import React, { useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { ReusableButton, ReusableInput, BackArrowButton, InfoModal } from '../../components';
import { fonts } from '../../constants/typography';
import { AppRoutes } from '../../types';
import { useOnboardingMutation, useInterestsQuery } from '../../hooks';
import { OnboardingPayload } from '../../services/apis/OnboardingApis';
import { retrieveCognitoTokens } from '../../utils/AsyncStorageApis';
import { 
  profileStep1Schema, 
  profileStep2Schema, 
  validateForm, 
  validateField,
  validateUsernameField,
  validateDisplayNameField,
  validateBioField,
  ProfileStep1FormData,
  ProfileStep2FormData 
} from '../../utils/validationSchemas';
import { User, TickIcon } from '../../../assets/icons';

type ProfileCompletionNavigationProp = StackNavigationProp<AppRoutes, 'profile-completion-screen'>;

interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  profileImage: string | null;
}

export function ProfileCompletionScreen() {
  const navigation = useNavigation<ProfileCompletionNavigationProp>();
  const onboardingMutation = useOnboardingMutation();
  const { data: interests, isLoading: interestsLoading, error: interestsError } = useInterestsQuery();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    displayName: '',
    bio: '',
    profileImage: null,
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', action: () => {} });

  // Step 1: Profile Form
  const [usernameError, setUsernameError] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');

  // Get available interests from API
  const availableInterests = interests || [];


  // Function to get emoji based on interest value
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
    return emojiMap[interestValue.toLowerCase()] || '🏃'; // Default emoji
  };

  const handleImageSelection = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      setModalContent({
        title: 'Permission Required',
        message: 'Permission to access camera roll is required!',
        action: () => setShowErrorModal(false)
      });
      setShowErrorModal(true);
      return;
    }

    setModalContent({
      title: 'Select Image',
      message: 'Choose how you want to add your profile image',
      action: () => setShowImagePickerModal(false)
    });
    setShowImagePickerModal(true);
  };

  const openCamera = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    
    if (cameraPermission.granted === false) {
      setModalContent({
        title: 'Permission Required',
        message: 'Permission to access camera is required!',
        action: () => setShowErrorModal(false)
      });
      setShowErrorModal(true);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      console.log('📸 [CAMERA] Selected image:', {
        uri: result.assets[0].uri,
        type: result.assets[0].type,
        width: result.assets[0].width,
        height: result.assets[0].height
      });
      
      setProfileData(prev => ({ 
        ...prev, 
        profileImage: result.assets[0].uri
      }));
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      console.log('🖼️ [GALLERY] Selected image:', {
        uri: result.assets[0].uri,
        type: result.assets[0].type,
        width: result.assets[0].width,
        height: result.assets[0].height
      });
      
      setProfileData(prev => ({ 
        ...prev, 
        profileImage: result.assets[0].uri
      }));
    }
  };

  const handleUsernameChange = (text: string) => {
    setProfileData(prev => ({ ...prev, username: text }));
    
    // Real-time validation with Zod
    const validation = validateUsernameField(text);
    if (!validation.isValid) {
      setUsernameError(validation.error || '');
    } else {
      setUsernameError('');
    }
  };

  const handleDisplayNameChange = (text: string) => {
    setProfileData(prev => ({ ...prev, displayName: text }));
    
    // Real-time validation with Zod
    const validation = validateDisplayNameField(text);
    if (!validation.isValid) {
      setDisplayNameError(validation.error || '');
    } else {
      setDisplayNameError('');
    }
  };

  const handleBioChange = (text: string) => {
    setProfileData(prev => ({ ...prev, bio: text }));
    
    // Optional validation for bio (only show error if text is not empty)
    if (text.trim()) {
      const validation = validateBioField(text);
      if (!validation.isValid) {
        // Could add bio error state if needed
        console.warn('Bio validation warning:', validation.error);
      }
    }
  };

  const validateStep1 = () => {
    const step1Data = {
      username: profileData.username,
      displayName: profileData.displayName,
      bio: profileData.bio,
      profileImage: profileData.profileImage
    };

    const validation = validateForm(profileStep1Schema, step1Data);
    
    if (!validation.success && validation.errors) {
      // Set individual field errors
      if (validation.errors.username) {
        setUsernameError(validation.errors.username);
      }
      if (validation.errors.displayName) {
        setDisplayNameError(validation.errors.displayName);
      }
      
      console.log('❌ [VALIDATION] Step 1 validation failed:', validation.errors);
      return false;
    }

    // Clear any existing errors
    setUsernameError('');
    setDisplayNameError('');
    
    console.log('✅ [VALIDATION] Step 1 validation passed');
    return true;
  };

  const handleContinueStep1 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleInterestToggle = (interestValue: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestValue)) {
        return prev.filter(value => value !== interestValue);
      } else {
        return [...prev, interestValue];
      }
    });
  };

  const handleCompleteProfile = async () => {
    if (selectedInterests.length === 0) {
      setModalContent({
        title: 'Select Interests',
        message: 'Please select at least one interest to continue.',
        action: () => setShowErrorModal(false)
      });
      setShowErrorModal(true);
      return;
    }

    try {
      // Get access token from storage
      const tokens = await retrieveCognitoTokens();
      if (!tokens?.access_token) {
        setModalContent({
          title: 'Authentication Error',
          message: 'Session expired. Please log in again.',
          action: () => {
            setShowErrorModal(false);
            navigation.navigate('login-screen');
          }
        });
        setShowErrorModal(true);
        return;
      }

      // Use selected interest values directly as slugs (API already provides the correct values)
      const interestSlugs = selectedInterests;
      
      console.log('🔍 [DEBUG] Selected interests before API call:', {
        selectedInterests,
        interestSlugs,
        interestCount: interestSlugs.length,
        isArray: Array.isArray(interestSlugs)
      });

      // Validate step 2 (interests) using Zod
      const step2Data = { interestSlugs };
      const step2Validation = validateForm(profileStep2Schema, step2Data);
      
      if (!step2Validation.success && step2Validation.errors) {
        const errorMessage = step2Validation.errors.interestSlugs || 'Please select at least one interest to continue.';
        setModalContent({
          title: 'Select Interests',
          message: errorMessage,
          action: () => setShowErrorModal(false)
        });
        setShowErrorModal(true);
        console.log('❌ [VALIDATION] Step 2 validation failed:', step2Validation.errors);
        return;
      }

      // Prepare onboarding payload - explicitly construct to avoid extra fields
      const onboardingPayload: OnboardingPayload = {
        username: profileData.username,
        display_name: profileData.displayName,
        bio: profileData.bio || undefined,
        interest_slugs: interestSlugs
      };
      
      // Only include profile_image if one is actually selected
      if (profileData.profileImage) {
        onboardingPayload.profile_image = profileData.profileImage;
      }

      // Final validation of the complete onboarding payload using Zod
      const finalValidation = validateForm(onboardingSchema, onboardingPayload);
      
      if (!finalValidation.success && finalValidation.errors) {
        console.log('❌ [VALIDATION] Final onboarding validation failed:', finalValidation.errors);
        
        // Create user-friendly error message
        const errorMessages = Object.entries(finalValidation.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n');
          
        setModalContent({
          title: 'Validation Error',
          message: `Please check the following:\n${errorMessages}`,
          action: () => setShowErrorModal(false)
        });
        setShowErrorModal(true);
        return;
      }

      console.log('🔍 [DEBUG] Onboarding payload info:', {
        hasProfileImage: !!profileData.profileImage,
        imageUri: profileData.profileImage || 'none',
        imageType: profileData.profileImage ? (profileData.profileImage.startsWith('file://') ? 'local file' : 'other') : 'none',
        payloadKeys: Object.keys(onboardingPayload),
        interestCount: onboardingPayload.interest_slugs?.length,
        validationPassed: true
      });

      // Call onboarding API
      await onboardingMutation.mutateAsync({
        payload: onboardingPayload,
        accessToken: tokens.access_token
      });

      // Show success modal and navigate
      setModalContent({
        title: 'Profile Completed!',
        message: 'Your profile has been successfully created.',
        action: () => {
          setShowSuccessModal(false);
          navigation.navigate('profile-success-screen');
        }
      });
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error('Onboarding failed:', error);
      setModalContent({
        title: 'Profile Creation Failed',
        message: error.message || 'Failed to complete profile setup. Please try again.',
        action: () => setShowErrorModal(false)
      });
      setShowErrorModal(true);
    }
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
        <BackArrowButton onPress={handleBackPress} />
        
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
        <BackArrowButton onPress={handleBackPress} />
        
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
            availableInterests.map((interest) => {
              const isSelected = selectedInterests.includes(interest.value);
              return (
                <TouchableOpacity
                  key={interest.value}
                  onPress={() => handleInterestToggle(interest.value)}
                  className={`w-[48%] p-4 mb-4 rounded-xl border-2 ${
                    isSelected 
                      ? 'border-blue-400 bg-gray-900' 
                      : 'border-gray-700 bg-gray-900/50'
                  }`}
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-2">{getInterestEmoji(interest.value)}</Text>
                    <Text 
                      className={`font-medium flex-1 ${
                        isSelected ? 'text-white' : 'text-gray-300'
                      }`}
                      style={{ fontFamily: fonts.SharpSansMedium }}
                    >
                      {interest.label}
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
            })
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="px-6 pb-12 pt-4">
        <ReusableButton
          title={onboardingMutation.isPending ? "Creating Profile..." : "Continue"}
          variant="gradient"
          fullWidth={true}
          onPress={handleCompleteProfile}
          disabled={onboardingMutation.isPending}
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

      {/* Success Modal */}
      <InfoModal
        visible={showSuccessModal}
        title={modalContent.title}
        message={modalContent.message}
        buttonText="Continue"
        onButtonPress={modalContent.action}
        icon={<TickIcon />}
      />

      {/* Error Modal */}
      <InfoModal
        visible={showErrorModal}
        title={modalContent.title}
        message={modalContent.message}
        buttonText="Try Again"
        onButtonPress={modalContent.action}
      />

      {/* Image Picker Modal */}
      <InfoModal
        visible={showImagePickerModal}
        title={modalContent.title}
        message={modalContent.message}
        buttonText="Gallery"
        onButtonPress={() => {
          setShowImagePickerModal(false);
          openGallery();
        }}
        showCloseButton={true}
        onClose={() => setShowImagePickerModal(false)}
      />
    </ImageBackground>
  );
}