import React from 'react';
import { View, Text, Modal } from 'react-native';
import { ReusableButton } from '@/components';
import { fonts } from '@/libs/constants/typography';

interface ImagePickerModalProps {
  visible: boolean;
  onCamera: () => void;
  onGallery: () => void;
  onClose: () => void;
}

export function ImagePickerModal({ visible, onCamera, onGallery, onClose }: ImagePickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View
          className="bg-[#0D1117] rounded-2xl py-8 px-6 items-center"
          style={{ width: '100%', maxWidth: 300 }}
        >
          <Text className="text-white text-xl font-bold text-center mb-2" style={{ fontFamily: fonts.SharpSansBold }}>
            Select Image
          </Text>

          <Text className="text-gray-400 text-base text-center mb-6" style={{ fontFamily: fonts.SharpSansRegular }}>
            Choose how you want to add your profile image
          </Text>

          <View className="w-full gap-y-3">
            <ReusableButton
              title="📷 Take Photo"
              variant="gradient"
              fullWidth={true}
              onPress={onCamera}
            />

            <ReusableButton
              title="🖼️ Choose from Gallery"
              variant="outlined"
              fullWidth={true}
              gradientText={true}
              onPress={onGallery}
            />

            <ReusableButton
              title="Cancel"
              variant="text"
              fullWidth={true}
              gradientText={true}
              textStyle={{ fontSize: 14 }}
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
