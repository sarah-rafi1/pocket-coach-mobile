import React from 'react';
import { Text, TextProps } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '@/libs/constants/typography';

interface GradientTextProps extends TextProps {
  colors?: readonly [string, string, ...string[]];
  children: React.ReactNode;
}

export function GradientText({ 
  colors = ['#00C6FF', '#0072FF'], 
  children, 
  style,
  ...props 
}: GradientTextProps) {
  return (
    <MaskedView
      maskElement={
        <Text
          className="bg-transparent"
          style={[
            { fontFamily: fonts.SharpSansMedium },
            style
          ]}
          {...props}
        >
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text
          className="opacity-0"
          style={[
            { fontFamily: fonts.SharpSansMedium },
            style
          ]}
          {...props}
        >
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}