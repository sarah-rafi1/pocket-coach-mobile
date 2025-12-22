import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ImageBackground,
  Alert,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { fonts } from '../../constants/typography';
import { ReusableButton, ReusableInput } from '../../components';
import { useCreatePostMutation, useInterestsQuery } from '../../hooks';
import Svg, { Circle } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MAX_RECORDING_DURATION = 60; // 60 seconds
const PROGRESS_SIZE = 80;
const PROGRESS_STROKE_WIDTH = 6;
const PROGRESS_RADIUS = (PROGRESS_SIZE - PROGRESS_STROKE_WIDTH) / 2;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type CreateStep = 'initial' | 'camera' | 'edit' | 'post';

// Helper function to format seconds as MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function CreateScreen() {
  const [step, setStep] = useState<CreateStep>('initial');
  const [facing, setFacing] = useState<CameraType>('back');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();

  const cameraRef = useRef<CameraView>(null);
  const recordButtonScale = useRef(new Animated.Value(1)).current;
  const recordButtonColor = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const recordingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [recordingProgress, setRecordingProgress] = useState(0);

  // Post form state
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [fileSize, setFileSize] = useState(1000000); // Default 1MB
  const [mimeType, setMimeType] = useState('video/mp4');

  // API hooks
  const createPostMutation = useCreatePostMutation();
  const { data: interests, isLoading: interestsLoading, error: interestsError } = useInterestsQuery();
  
  // Debug interests data
  console.log('🔍 [CREATE SCREEN DEBUG] Interests state:', {
    interests: interests,
    isLoading: interestsLoading,
    error: interestsError,
    isArray: Array.isArray(interests),
    length: interests?.length
  });

  // Emoji mapping for interests (same as ProfileCompletionScreen)
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

  // Helper function to get file metadata using legacy API
  const getFileMetadata = async (fileUri: string) => {
    try {
      console.log('📋 [FILE METADATA] Attempting to get info for:', fileUri);
      const fileInfo = await FileSystem.getInfoAsync(fileUri, { size: true });
      
      console.log('📋 [FILE METADATA] Raw response:', {
        uri: fileInfo.uri,
        exists: fileInfo.exists,
        isDirectory: fileInfo.isDirectory,
        size: 'size' in fileInfo ? fileInfo.size : 'no size property'
      });
      
      let fileSize = 1000000; // Default 1MB
      if (fileInfo.exists && !fileInfo.isDirectory && 'size' in fileInfo && typeof fileInfo.size === 'number') {
        fileSize = fileInfo.size;
        console.log('✅ [FILE METADATA] Using actual file size:', fileSize);
      } else {
        console.log('⚠️ [FILE METADATA] Using default size, actual size not available');
      }
      
      // Determine MIME type from file extension
      const lowerUri = fileUri.toLowerCase();
      let mimeType = 'video/mp4'; // default
      if (lowerUri.includes('.mp4')) {
        mimeType = 'video/mp4';
      } else if (lowerUri.includes('.mov')) {
        mimeType = 'video/quicktime';
      } else if (lowerUri.includes('.avi')) {
        mimeType = 'video/x-msvideo';
      } else if (lowerUri.includes('.webm')) {
        mimeType = 'video/webm';
      }
      
      console.log('✅ [FILE METADATA] Extracted:', {
        fileSize: fileSize,
        mimeType: mimeType,
        fileSizeMB: (fileSize / 1024 / 1024).toFixed(2) + ' MB'
      });
      
      return {
        size: fileSize,
        mimeType: mimeType
      };
    } catch (error) {
      console.error('❌ [FILE METADATA ERROR]:', error);
      // Return sensible defaults
      return {
        size: 1000000, // 1MB default
        mimeType: 'video/mp4'
      };
    }
  };

  // Animated stroke dash offset for the progress circle
  const animatedStrokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [PROGRESS_CIRCUMFERENCE, 0],
  });

  // Cleanup helper function
  const cleanup = useCallback(() => {
    // Stop recording if in progress
    if (cameraRef.current) {
      try {
        cameraRef.current.stopRecording();
      } catch (e) {
        // Ignore errors if not recording
      }
    }
    // Clear interval
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
    // Reset states
    setIsRecording(false);
    setFlashEnabled(false);
    setRecordingProgress(0);
    progressAnim.setValue(0);
  }, [progressAnim]);

  // Animate record button when recording
  useEffect(() => {
    if (isRecording) {
      Animated.parallel([
        Animated.spring(recordButtonScale, {
          toValue: 0.85,
          useNativeDriver: true,
        }),
        Animated.timing(recordButtonColor, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();

      // Start progress animation
      let elapsed = 0;
      const intervalMs = 100; // Update every 100ms for smooth animation
      recordingInterval.current = setInterval(() => {
        elapsed += intervalMs / 1000;
        const progress = Math.min(elapsed / MAX_RECORDING_DURATION, 1);
        setRecordingProgress(progress);
        progressAnim.setValue(progress);

        if (elapsed >= MAX_RECORDING_DURATION) {
          // Auto-stop recording when max duration reached
          if (recordingInterval.current) {
            clearInterval(recordingInterval.current);
            recordingInterval.current = null;
          }
        }
      }, intervalMs);
    } else {
      Animated.parallel([
        Animated.spring(recordButtonScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(recordButtonColor, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();

      // Reset progress
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
      setRecordingProgress(0);
      progressAnim.setValue(0);
    }

    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
    };
  }, [isRecording, recordButtonScale, recordButtonColor, progressAnim]);

  const openCamera = async () => {
    // Request both camera and microphone permissions
    if (!cameraPermission?.granted) {
      const cameraResult = await requestCameraPermission();
      if (!cameraResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to record videos.');
        return;
      }
    }
    
    if (!microphonePermission?.granted) {
      const micResult = await requestMicrophonePermission();
      if (!micResult.granted) {
        Alert.alert('Permission Required', 'Microphone permission is required to record videos with audio.');
        return;
      }
    }
    
    if (cameraPermission?.granted && microphonePermission?.granted) {
      setStep('camera');
    }
  };

  const openGallery = async () => {
    if (isRecording) return;
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setCapturedMedia(asset.uri);
      setMediaType(asset.type === 'video' ? 'video' : 'photo');
      
      // Get actual file metadata
      console.log('📁 [GALLERY VIDEO] Getting file metadata for:', asset.uri);
      const metadata = await getFileMetadata(asset.uri);
      
      // Use asset metadata if available, otherwise use extracted metadata
      const finalFileSize = asset.fileSize || metadata.size;
      const finalMimeType = asset.mimeType || metadata.mimeType;
      
      setFileSize(finalFileSize);
      setMimeType(finalMimeType);
      
      console.log('✅ [GALLERY VIDEO] Metadata set:', {
        size: finalFileSize,
        mimeType: finalMimeType,
        assetFileSize: asset.fileSize,
        assetMimeType: asset.mimeType,
        extractedSize: metadata.size,
        extractedMimeType: metadata.mimeType
      });
      
      setStep('edit');
    }
  };

  const handleRecord = async () => {
    if (!cameraRef.current) return;

    // Check permissions before recording
    if (!cameraPermission?.granted || !microphonePermission?.granted) {
      Alert.alert(
        'Permissions Required', 
        'Camera and microphone permissions are required to record videos.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Grant Permissions', 
            onPress: async () => {
              if (!cameraPermission?.granted) await requestCameraPermission();
              if (!microphonePermission?.granted) await requestMicrophonePermission();
            }
          }
        ]
      );
      return;
    }

    if (isRecording) {
      // Stop recording
      cameraRef.current.stopRecording();
      setIsRecording(false);
      setFlashEnabled(false);
    } else {
      // Start recording
      setIsRecording(true);
      try {
        const video = await cameraRef.current.recordAsync({
          maxDuration: MAX_RECORDING_DURATION,
        });

        if (video?.uri) {
          // Clear interval before navigating
          if (recordingInterval.current) {
            clearInterval(recordingInterval.current);
            recordingInterval.current = null;
          }
          setFlashEnabled(false);
          setCapturedMedia(video.uri);
          setMediaType('video');
          
          // Get actual file metadata
          console.log('🎬 [RECORDED VIDEO] Getting file metadata for:', video.uri);
          const metadata = await getFileMetadata(video.uri);
          setFileSize(metadata.size);
          setMimeType(metadata.mimeType);
          
          console.log('✅ [RECORDED VIDEO] Metadata extracted:', {
            size: metadata.size,
            mimeType: metadata.mimeType,
            uri: video.uri
          });
          
          setStep('edit');
        }
      } catch (error) {
        console.error('Recording error:', error);
        Alert.alert(
          'Recording Error', 
          'Failed to record video. Please check permissions and try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsRecording(false);
      }
    }
  };

  const handleFlashlight = () => {
    setFlashEnabled(!flashEnabled);
  };

  const handleReverse = () => {
    if (isRecording) return;
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const proceedToPost = () => {
    setStep('post');
  };

  const publishPost = async () => {
    if (!capturedMedia) {
      Alert.alert('Error', 'No media selected');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please add a description');
      return;
    }

    try {
      // Parse hashtags from input (remove # and split by spaces)
      const hashtagsArray = hashtags
        .split(' ')
        .map(tag => tag.replace('#', '').trim())
        .filter(tag => tag.length > 0);

      const payload = {
        description: description.trim(),
        mimeType: mimeType,
        fileSize: fileSize,
        hashtags: hashtagsArray,
        interests: selectedInterests, // These are already the string values like "ball-sports", "biking"
        fileUri: capturedMedia || undefined, // Include file URI for upload
      };

      console.log('🚀 [PUBLISH POST] Submitting with extracted metadata:', {
        description: payload.description,
        hashtagsCount: payload.hashtags.length,
        interestsCount: payload.interests.length,
        mimeType: payload.mimeType,
        fileSize: payload.fileSize,
        fileSizeMB: (payload.fileSize / 1024 / 1024).toFixed(2) + ' MB',
        capturedMediaUri: capturedMedia?.substring(0, 50) + '...'
      });

      await createPostMutation.mutateAsync(payload);

      Alert.alert('Success', 'Post created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset state
            setStep('initial');
            setCapturedMedia(null);
            setMediaType(null);
            setDescription('');
            setHashtags('');
            setSelectedInterests([]);
            setFileSize(1000000);
          }
        }
      ]);
    } catch (error: any) {
      console.error('❌ [PUBLISH POST] Error:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to create post. Please try again.'
      );
    }
  };

  const renderInitialStep = () => (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        <Text style={{ 
          fontSize: 32, 
          fontFamily: fonts.SharpSansBold, 
          color: '#FFFFFF',
          textAlign: 'center',
          marginBottom: 8
        }}>
          Create
        </Text>
        <Text style={{ 
          fontSize: 18, 
          fontFamily: fonts.SharpSansRegular, 
          color: '#9CA3AF',
          textAlign: 'center',
          marginBottom: 48
        }}>
          Share your workout or coaching moment
        </Text>

        <View style={{ width: '100%', gap: 16 }}>
          <ReusableButton
            title="📹 Record Video"
            variant="gradient"
            fullWidth={true}
            onPress={openCamera}
          />
          
          <ReusableButton
            title="📷 Take Photo"
            variant="outlined"
            fullWidth={true}
            onPress={openCamera}
          />
          
          <ReusableButton
            title="📱 Choose from Gallery"
            variant="outlined"
            fullWidth={true}
            onPress={openGallery}
          />
        </View>
      </View>
    </SafeAreaView>
  );

  const renderCameraStep = () => {
    // Interpolate background color for record button
    const recordButtonBackgroundColor = recordButtonColor.interpolate({
      inputRange: [0, 1],
      outputRange: ['#3B82F6', '#EF4444'],
    });

    // Handle permission states
    if (!cameraPermission || !microphonePermission) {
      return (
        <View style={styles.container}>
          <Text style={styles.permissionText}>Requesting permissions...</Text>
        </View>
      );
    }

    if (!cameraPermission.granted || !microphonePermission.granted) {
      return (
        <View style={styles.container}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>Camera & Microphone Access Required</Text>
            <Text style={styles.permissionText}>
              We need camera and microphone permissions to record videos with audio.
            </Text>
            <TouchableOpacity 
              style={styles.permissionButton} 
              onPress={async () => {
                if (!cameraPermission.granted) await requestCameraPermission();
                if (!microphonePermission.granted) await requestMicrophonePermission();
              }}
            >
              <Text style={styles.permissionButtonText}>Grant Permissions</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        {/* Camera Preview */}
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          enableTorch={flashEnabled}
          mode="video"
        />

        {/* Bottom Control Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.controlButtonsContainer}>
            <TouchableOpacity
              style={[styles.controlButton, isRecording && styles.controlButtonDisabled]}
              onPress={() => setStep('initial')}
              disabled={isRecording}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={[styles.controlIcon, isRecording && styles.controlTextDisabled]}>✕</Text>
              </View>
              <Text style={[styles.controlText, isRecording && styles.controlTextDisabled]}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, isRecording && styles.controlButtonDisabled]}
              onPress={openGallery}
              disabled={isRecording}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={[styles.controlIcon, isRecording && styles.controlTextDisabled]}>📱</Text>
              </View>
              <Text style={[styles.controlText, isRecording && styles.controlTextDisabled]}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* Record Button - Centered */}
          <View style={styles.recordButtonContainer}>
            <TouchableOpacity
              onPress={handleRecord}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.recordButtonWrapper,
                  { transform: [{ scale: recordButtonScale }] }
                ]}
              >
                {/* Circular Progress Indicator */}
                <View style={styles.progressContainer}>
                  <Svg
                    width={PROGRESS_SIZE}
                    height={PROGRESS_SIZE}
                    style={styles.progressSvg}
                  >
                    {/* Background circle */}
                    <Circle
                      cx={PROGRESS_SIZE / 2}
                      cy={PROGRESS_SIZE / 2}
                      r={PROGRESS_RADIUS}
                      stroke="#6B7280"
                      strokeWidth={PROGRESS_STROKE_WIDTH}
                      fill="transparent"
                    />
                    {/* Progress circle */}
                    <AnimatedCircle
                      cx={PROGRESS_SIZE / 2}
                      cy={PROGRESS_SIZE / 2}
                      r={PROGRESS_RADIUS}
                      stroke="#EF4444"
                      strokeWidth={PROGRESS_STROKE_WIDTH}
                      fill="transparent"
                      strokeDasharray={PROGRESS_CIRCUMFERENCE}
                      strokeDashoffset={animatedStrokeDashoffset}
                      strokeLinecap="round"
                      rotation="-90"
                      origin={`${PROGRESS_SIZE / 2}, ${PROGRESS_SIZE / 2}`}
                    />
                  </Svg>
                </View>
                {/* Inner button */}
                <Animated.View
                  style={[
                    styles.recordButtonInner,
                    { backgroundColor: recordButtonBackgroundColor }
                  ]}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 24 }}>
                    {isRecording ? '⏹️' : '🎥'}
                  </Text>
                </Animated.View>
              </Animated.View>
            </TouchableOpacity>
            <Text style={styles.recordText}>
              {isRecording 
                ? formatTime(recordingProgress * MAX_RECORDING_DURATION)
                : 'Record'}
            </Text>
          </View>

          <View style={styles.controlButtonsContainer}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleFlashlight}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={[styles.controlIcon, flashEnabled && { color: '#F59E0B' }]}>⚡</Text>
              </View>
              <Text style={[styles.controlText, flashEnabled && { color: '#F59E0B' }]}>Flash</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, isRecording && styles.controlButtonDisabled]}
              onPress={handleReverse}
              disabled={isRecording}
            >
              <View style={styles.buttonIconContainer}>
                <Text style={[styles.controlIcon, isRecording && styles.controlTextDisabled]}>🔄</Text>
              </View>
              <Text style={[styles.controlText, isRecording && styles.controlTextDisabled]}>Flip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEditStep = () => (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12
        }}>
          <TouchableOpacity onPress={() => setStep('camera')}>
            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text style={{ 
            color: '#FFFFFF', 
            fontSize: 18, 
            fontFamily: fonts.SharpSansMedium 
          }}>
            Edit
          </Text>
          <TouchableOpacity onPress={proceedToPost}>
            <Text style={{ color: '#3B82F6', fontSize: 16 }}>Next</Text>
          </TouchableOpacity>
        </View>

        {/* Media Preview */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {capturedMedia && (
            <ImageBackground
              source={{ uri: capturedMedia }}
              style={{ 
                width: screenWidth * 0.9, 
                height: screenHeight * 0.6,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              resizeMode="contain"
            >
              {mediaType === 'video' && (
                <TouchableOpacity style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: 30,
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 24 }}>▶️</Text>
                </TouchableOpacity>
              )}
            </ImageBackground>
          )}
        </View>

        {/* Edit Controls */}
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ 
            color: '#FFFFFF', 
            fontSize: 16, 
            fontFamily: fonts.SharpSansMedium,
            textAlign: 'center'
          }}>
            Trim • Filter • Enhance
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );

  const renderPostStep = () => (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#374151'
        }}>
          <TouchableOpacity onPress={() => setStep('edit')}>
            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
          <Text style={{ 
            color: '#FFFFFF', 
            fontSize: 18, 
            fontFamily: fonts.SharpSansBold 
          }}>
            New Post
          </Text>
          <TouchableOpacity onPress={publishPost}>
            <Text style={{ color: '#3B82F6', fontSize: 16, fontFamily: fonts.SharpSansMedium }}>
              Share
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* Media Preview */}
          {capturedMedia && (
            <View style={{ marginBottom: 24 }}>
              <ImageBackground
                source={{ uri: capturedMedia }}
                style={{ 
                  width: '100%', 
                  height: 200,
                  borderRadius: 12,
                  overflow: 'hidden'
                }}
                resizeMode="cover"
              />
              {/* File Info Display */}
              <View style={{ 
                backgroundColor: '#374151', 
                padding: 8, 
                borderRadius: 8, 
                marginTop: 8 
              }}>
                <Text style={{ 
                  color: '#9CA3AF', 
                  fontSize: 12,
                  fontFamily: fonts.SharpSansRegular
                }}>
                  File: {mimeType} • Size: {(fileSize / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>
            </View>
          )}

          {/* Form Fields */}
          <View style={{ gap: 20 }}>
            <View>
              <Text style={{ 
                color: '#FFFFFF', 
                fontSize: 16, 
                fontFamily: fonts.SharpSansMedium,
                marginBottom: 8
              }}>
                Description
              </Text>
              <ReusableInput
                placeholder="Enter Post Description..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={{ 
                  backgroundColor: '#374151',
                  color: '#FFFFFF',
                  borderColor: '#4B5563',
                  minHeight: 100
                }}
              />
            </View>

            <View>
              <Text style={{ 
                color: '#FFFFFF', 
                fontSize: 16, 
                fontFamily: fonts.SharpSansMedium,
                marginBottom: 8
              }}>
                Hashtags
              </Text>
              <ReusableInput
                placeholder="Enter Hashtags..."
                value={hashtags}
                onChangeText={setHashtags}
                style={{ 
                  backgroundColor: '#374151',
                  color: '#FFFFFF',
                  borderColor: '#4B5563'
                }}
              />
              <Text style={{ 
                color: '#9CA3AF', 
                fontSize: 12, 
                marginTop: 4,
                fontFamily: fonts.SharpSansRegular
              }}>
                Separate hashtags with spaces (e.g., fitness workout health)
              </Text>
            </View>

            <View>
              <Text style={{ 
                color: '#FFFFFF', 
                fontSize: 16, 
                fontFamily: fonts.SharpSansMedium,
                marginBottom: 16
              }}>
                Interests/Tags
              </Text>
              
              {/* Interests Grid - Same layout as ProfileCompletionScreen */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {interestsLoading ? (
                  <View style={{ width: '100%', alignItems: 'center', paddingVertical: 32 }}>
                    <Text style={{ color: '#9CA3AF', fontSize: 16, fontFamily: fonts.SharpSansRegular }}>
                      Loading interests...
                    </Text>
                  </View>
                ) : interestsError ? (
                  <View style={{ width: '100%', alignItems: 'center', paddingVertical: 32 }}>
                    <Text style={{ color: '#EF4444', fontSize: 16, fontFamily: fonts.SharpSansRegular }}>
                      Failed to load interests. Please try again.
                    </Text>
                  </View>
                ) : interests && Array.isArray(interests) && interests.length > 0 ? (
                  interests.map((interest) => {
                    const isSelected = selectedInterests.includes(interest.value);
                    return (
                      <TouchableOpacity
                        key={interest.value}
                        onPress={() => {
                          if (isSelected) {
                            setSelectedInterests(prev => prev.filter(i => i !== interest.value));
                          } else {
                            setSelectedInterests(prev => [...prev, interest.value]);
                          }
                        }}
                        style={{
                          width: '48%',
                          padding: 16,
                          marginBottom: 16,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: isSelected ? '#3B82F6' : '#4B5563',
                          backgroundColor: isSelected ? '#1F2937' : 'rgba(31, 41, 55, 0.5)',
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: 24, marginRight: 8 }}>
                            {getInterestEmoji(interest.value)}
                          </Text>
                          <Text style={{ 
                            color: isSelected ? '#FFFFFF' : '#D1D5DB',
                            fontFamily: fonts.SharpSansMedium,
                            flex: 1,
                            fontSize: 14
                          }}>
                            {interest.label}
                          </Text>
                          <View style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            borderWidth: 2,
                            borderColor: isSelected ? '#3B82F6' : '#6B7280',
                            backgroundColor: isSelected ? '#3B82F6' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {isSelected && (
                              <Text style={{ color: '#FFFFFF', fontSize: 12, textAlign: 'center' }}>
                                ✓
                              </Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={{ width: '100%', alignItems: 'center', paddingVertical: 32 }}>
                    <Text style={{ color: '#9CA3AF', fontSize: 16, fontFamily: fonts.SharpSansRegular }}>
                      No interests available.
                    </Text>
                  </View>
                )}
              </View>
              
              {selectedInterests.length > 0 && (
                <Text style={{ 
                  color: '#9CA3AF', 
                  fontSize: 14, 
                  marginTop: 8,
                  fontFamily: fonts.SharpSansRegular,
                  textAlign: 'center'
                }}>
                  Selected: {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''}
                </Text>
              )}
            </View>
          </View>

          <View style={{ marginTop: 32, marginBottom: 16 }}>
            <ReusableButton
              title={createPostMutation.isPending ? "Uploading..." : "Publish Post"}
              variant="gradient"
              fullWidth={true}
              onPress={publishPost}
              disabled={createPostMutation.isPending}
            />
            {createPostMutation.isPending && (
              <Text style={{ 
                color: '#9CA3AF', 
                fontSize: 12, 
                textAlign: 'center',
                marginTop: 8,
                fontFamily: fonts.SharpSansRegular
              }}>
                Creating post and uploading video...
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );

  switch (step) {
    case 'camera':
      return renderCameraStep();
    case 'edit':
      return renderEditStep();
    case 'post':
      return renderPostStep();
    default:
      return renderInitialStep();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    width: screenWidth,
    height: screenHeight,
  },
  camera: {
    flex: 1,
  },
  recordButtonContainer: {
    alignItems: 'center',
  },
  recordButtonWrapper: {
    width: PROGRESS_SIZE,
    height: PROGRESS_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    width: PROGRESS_SIZE,
    height: PROGRESS_SIZE,
  },
  progressSvg: {
    transform: [{ rotateZ: '0deg' }],
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
    fontFamily: fonts.SharpSansRegular,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 16,
    paddingBottom: 38,
  },
  controlButtonsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    gap: 12,
  },
  buttonIconContainer: {
    height: 28,
    alignContent: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  controlText: {
    color: '#FFFFFF',
    marginTop: 6,
    fontSize: 12,
    fontFamily: fonts.SharpSansRegular,
  },
  controlTextDisabled: {
    color: '#6B7280',
  },
  controlIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    color: '#FFFFFF',
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 18,
    fontFamily: fonts.SharpSansMedium,
  },
  permissionText: {
    color: '#9CA3AF',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: fonts.SharpSansRegular,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontFamily: fonts.SharpSansMedium,
  },
});