import React from 'react';
import { View, Text, Modal, Dimensions } from 'react-native';
import { ReusableButton } from '../buttons';
import { fonts } from '@/libs/constants/typography';
import { TickIcon } from '@/assets/icons';

const { width } = Dimensions.get('window');

interface PasswordUpdatedModalProps {
  visible: boolean;
  onLoginNow: () => void;
}

export function PasswordUpdatedModal({ visible, onLoginNow }: PasswordUpdatedModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-transparent justify-center items-center px-6">
        {/* Modal Content */}
        <View 
          className="bg-[#0D1117] rounded-2xl py-10 px-8 items-center"
          style={{
            width: width - 48,
            maxWidth: 500,
          }}
        >
          {/* Success Icon */}
          <View className="w-20 h-20 rounded-full justify-center items-center mb-8">
            <TickIcon />
          </View>

          {/* Title */}
          <Text className="text-white text-2xl font-bold mb-4 text-center" style={{ fontFamily: fonts.SharpSansBold }}>
            Password Updated!
          </Text>

          {/* Subtitle */}
          <Text className="text-gray-400 text-base text-center mb-8 leading-6" style={{ fontFamily: fonts.SharpSansRegular }}>
            You have updated your password now you can login to your account
          </Text>

          {/* Login Button */}
          <ReusableButton
            title="Login Now"
            variant="gradient"
            fullWidth={true}
            onPress={onLoginNow}
            buttonStyle={{ width: '100%' }}
          />
        </View>
      </View>
    </Modal>
  );
}