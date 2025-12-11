import React from 'react';
import { View, Text, Modal, Dimensions } from 'react-native';
import { ReusableButton } from '../buttons';
import { fonts } from '../../constants/typography';

const { width } = Dimensions.get('window');

interface InfoModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onButtonPress: () => void;
  icon?: React.ReactNode;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export function InfoModal({ 
  visible, 
  title, 
  message, 
  buttonText = "OK", 
  onButtonPress, 
  icon,
  showCloseButton = false,
  onClose 
}: InfoModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        {/* Modal Content */}
        <View 
          className="bg-[#0D1117] rounded-2xl py-10 px-8 items-center"
          style={{
            width: width - 48,
            maxWidth: 500,
          }}
        >
          {/* Icon */}
          {icon && (
            <View className="w-20 h-20 rounded-full justify-center items-center mb-8">
              {icon}
            </View>
          )}

          {/* Title */}
          <Text className="text-white text-2xl font-bold mb-4 text-center" style={{ fontFamily: fonts.SharpSansBold }}>
            {title}
          </Text>

          {/* Message */}
          <Text className="text-gray-400 text-base text-center mb-8 leading-6" style={{ fontFamily: fonts.SharpSansRegular }}>
            {message}
          </Text>

          {/* Buttons */}
          <View className="w-full flex-row justify-center gap-3">
            {showCloseButton && onClose && (
              <View className="flex-1">
                <ReusableButton
                  title="Cancel"
                  variant="outlined"
                  fullWidth={true}
                  onPress={onClose}
                  borderColor="rgba(255, 255, 255, 0.2)"
                  textColor="#9CA3AF"
                />
              </View>
            )}
            <View className={showCloseButton ? "flex-1" : "w-full"}>
              <ReusableButton
                title={buttonText}
                variant="gradient"
                fullWidth={true}
                onPress={onButtonPress}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}