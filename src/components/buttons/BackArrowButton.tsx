import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { BackArrow } from '../../../assets/icons';

interface BackArrowButtonProps extends TouchableOpacityProps {
  onPress: () => void;
  size?: number;
}

export function BackArrowButton({ onPress, size = 30, style, ...props }: BackArrowButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          padding: 8,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style
      ]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      {...props}
    >
      <BackArrow />
    </TouchableOpacity>
  );
}