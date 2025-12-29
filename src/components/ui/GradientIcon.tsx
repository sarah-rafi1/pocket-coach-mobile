import React from 'react';
import { View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientIconProps {
  children: React.ReactNode;
  colors?: readonly [string, string, ...string[]];
  size?: number;
}

export function GradientIcon({ 
  children, 
  colors = ['#00C6FF', '#0072FF'],
  size = 24 
}: GradientIconProps) {
  return (
    <View style={{ 
      width: size, 
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible'
    }}>
      <MaskedView
        maskElement={
          <View style={{ 
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            width: size,
            height: size
          }}>
            {children}
          </View>
        }
        style={{
          width: size,
          height: size
        }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ 
            width: size, 
            height: size,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <View style={{ 
            width: size, 
            height: size, 
            opacity: 0,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {children}
          </View>
        </LinearGradient>
      </MaskedView>
    </View>
  );
}