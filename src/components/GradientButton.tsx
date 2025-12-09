import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps extends TouchableOpacityProps {
  title: string;
  colors?: readonly [string, string, ...string[]];
  textStyle?: object;
  gradientStyle?: object;
}

export function GradientButton({ 
  title, 
  colors = ['#00C6FF', '#0072FF'], 
  textStyle, 
  gradientStyle,
  ...props 
}: GradientButtonProps) {
  return (
    <TouchableOpacity {...props}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="rounded-xl py-4 px-6"
        style={gradientStyle}
      >
        <Text 
          className="text-white text-center font-semibold text-base"
          style={textStyle}
        >
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}