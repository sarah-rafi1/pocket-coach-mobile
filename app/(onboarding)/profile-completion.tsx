import React, { useState, useEffect } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { InfoModal, ProfileStep1, ProfileStep2, ImagePickerModal } from '@/components';
import { TickIcon } from '@/assets/icons';
import { useOnboardingMutation } from '@/libs/queries/onboarding.query';
import { useInterestsQuery } from '@/libs/queries/interests.query';
import { Interest } from '@/libs/interfaces/user.types';
import { OnboardingPayload } from '@/libs/interfaces/onboarding.types';
import {
  validateForm,
  validateUsernameField,
  validateDisplayNameField,
  validateBioField,
  profileStep1Schema,
  profileStep2Schema,
  onboardingSchema
} from '@/libs/utils/validationSchemas';

interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  profileImage: string | null;
}

export default function ProfileCompletionScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  const onboardingMutation = useOnboardingMutation();
  const { data: interests, isLoading: interestsLoading, error: interestsError } = useInterestsQuery();

  const [currentStep, setCurrentStep] = useState(1);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
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
  const [usernameError, setUsernameError] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');

  // Get available interests from API
  const getInterestsArray = (): Interest[] => {
    if (!interests) return [];
    if (Array.isArray(interests)) return interests;
    if (typeof interests === 'object' && Array.isArray((interests as any).data)) {
      return (interests as any).data;
    }
    return [];
  };

  const availableInterests = getInterestsArray();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleUsernameChange = (text: string) => {
    setProfileData(prev => ({ ...prev, username: text }));
    const validation = validateUsernameField(text);
    setUsernameError(validation.isValid ? '' : validation.error || '');
  };

  const handleDisplayNameChange = (text: string) => {
    setProfileData(prev => ({ ...prev, displayName: text }));
    const validation = validateDisplayNameField(text);
    setDisplayNameError(validation.isValid ? '' : validation.error || '');
  };

  const handleBioChange = (text: string) => {
    setProfileData(prev => ({ ...prev, bio: text }));
  };

  const handleImageSelection = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      setModalContent({
        title: 'Permission Required',
        message: 'Permission to access camera roll is required!',
        action: () => setShowErrorModal(false)
      });
      setShowErrorModal(true);
      return;
    }
    setShowImagePickerModal(true);
  };

  const openCamera = async () => {
    setShowImagePickerModal(false);
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
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
      setProfileData(prev => ({ ...prev, profileImage: result.assets[0].uri }));
    }
  };

  const openGallery = async () => {
    setShowImagePickerModal(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileData(prev => ({ ...prev, profileImage: result.assets[0].uri }));
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
      if (validation.errors.username) setUsernameError(validation.errors.username);
      if (validation.errors.displayName) setDisplayNameError(validation.errors.displayName);
      return false;
    }

    setUsernameError('');
    setDisplayNameError('');
    return true;
  };

  const handleContinueStep1 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleInterestToggle = (interestValue: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestValue)
        ? prev.filter(value => value !== interestValue)
        : [...prev, interestValue]
    );
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
      // Get Clerk token
      const token = await getToken();
      if (!token) {
        setModalContent({
          title: 'Authentication Error',
          message: 'Session expired. Please log in again.',
          action: () => {
            setShowErrorModal(false);
            router.push('/(auth)/login');
          }
        });
        setShowErrorModal(true);
        return;
      }

      const interestSlugs = selectedInterests.filter(interest => typeof interest === 'string' && interest.trim() !== '');

      // Validate step 2
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
        return;
      }

      // Prepare onboarding payload
      const onboardingPayload: OnboardingPayload = {
        username: profileData.username,
        display_name: profileData.displayName,
        bio: profileData.bio || undefined,
        interest_slugs: interestSlugs
      };

      if (profileData.profileImage) {
        onboardingPayload.profile_image = profileData.profileImage;
      }

      // Final validation
      const finalValidation = validateForm(onboardingSchema, onboardingPayload);

      if (!finalValidation.success && finalValidation.errors) {
        const errorMessages = Object.entries(finalValidation.errors || {})
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

      // Call onboarding API with Clerk token
      await onboardingMutation.mutateAsync({
        payload: onboardingPayload,
        accessToken: token
      });

      // Update Clerk user metadata to mark onboarding as completed
      await fetch(`https://api.clerk.com/v1/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_metadata: {
            onboardingCompleted: true,
          },
        }),
      });

      // Show success modal and navigate
      setModalContent({
        title: 'Profile Completed!',
        message: 'Your profile has been successfully created.',
        action: () => {
          setShowSuccessModal(false);
          router.push('/(onboarding)/success');
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
      router.back();
    } else {
      setCurrentStep(1);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ImageBackground
        source={require('@/assets/images/Background.png')}
        className="flex-1"
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -100}
        >
          {currentStep === 1 ? (
            <ProfileStep1
              profileData={profileData}
              usernameError={usernameError}
              displayNameError={displayNameError}
              isKeyboardVisible={isKeyboardVisible}
              onUsernameChange={handleUsernameChange}
              onDisplayNameChange={handleDisplayNameChange}
              onBioChange={handleBioChange}
              onImageSelect={(uri) => setProfileData(prev => ({ ...prev, profileImage: uri }))}
              onContinue={handleContinueStep1}
              onBack={handleBackPress}
              onShowImagePicker={handleImageSelection}
            />
          ) : (
            <ProfileStep2
              availableInterests={availableInterests}
              selectedInterests={selectedInterests}
              interestsLoading={interestsLoading}
              interestsError={interestsError}
              isKeyboardVisible={isKeyboardVisible}
              isSubmitting={onboardingMutation.isPending}
              onInterestToggle={handleInterestToggle}
              onComplete={handleCompleteProfile}
              onBack={handleBackPress}
            />
          )}
        </KeyboardAvoidingView>

        <InfoModal
          visible={showSuccessModal}
          title={modalContent.title}
          message={modalContent.message}
          buttonText="Continue"
          onButtonPress={modalContent.action}
          icon={<TickIcon />}
        />

        <InfoModal
          visible={showErrorModal}
          title={modalContent.title}
          message={modalContent.message}
          buttonText="Try Again"
          onButtonPress={modalContent.action}
        />

        <ImagePickerModal
          visible={showImagePickerModal}
          onCamera={openCamera}
          onGallery={openGallery}
          onClose={() => setShowImagePickerModal(false)}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}
