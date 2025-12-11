import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { fonts } from '../../constants/typography';

export type ButtonVariant = 'gradient' | 'outlined' | 'text';

interface ReusableButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  gradientColors?: readonly [string, string, ...string[]];
  textColor?: string;
  borderColor?: string;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  gradientText?: boolean;
}

export function ReusableButton({ 
  title, 
  variant = 'gradient',
  gradientColors = ['#00C6FF', '#0072FF'],
  textColor,
  borderColor = '#0080FF',
  buttonStyle,
  textStyle,
  fullWidth = false,
  gradientText = false,
  ...props 
}: ReusableButtonProps) {
  const baseButtonStyle: ViewStyle = {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullWidth && { width: '100%' }),
    ...buttonStyle,
  };

  const baseTextStyle: TextStyle = {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: fonts.SharpSansSemiBold,
    ...textStyle,
  };

  const renderText = (color?: string) => {
    if (gradientText) {
      return (
        <MaskedView
          maskElement={
            <Text
              style={[
                baseTextStyle,
                { backgroundColor: 'transparent' }
              ]}
            >
              {title}
            </Text>
          }
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text
              style={[
                baseTextStyle,
                { opacity: 0 }
              ]}
            >
              {title}
            </Text>
          </LinearGradient>
        </MaskedView>
      );
    }

    return (
      <Text 
        style={[
          baseTextStyle,
          { color: color }
        ]}
      >
        {title}
      </Text>
    );
  };

  if (variant === 'gradient') {
    return (
      <TouchableOpacity 
        style={[
          {
            borderRadius: 16,
            overflow: 'hidden'
          },
          fullWidth && { width: '100%' },
          buttonStyle
        ]} 
        {...props}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 24,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
          }}
        >
          {renderText(textColor || '#FFFFFF')}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outlined') {
    return (
      <TouchableOpacity 
        style={[
          baseButtonStyle,
          { 
            borderWidth: 1, 
            borderColor: borderColor,
            backgroundColor: 'transparent' 
          }
        ]} 
        {...props}
      >
        {renderText(textColor || borderColor)}
      </TouchableOpacity>
    );
  }

  // text variant
  return (
    <TouchableOpacity style={baseButtonStyle} {...props}>
      {gradientText ? (
        <MaskedView
          maskElement={
            <Text
              style={[
                baseTextStyle,
                { 
                  backgroundColor: 'transparent',
                  textDecorationLine: 'underline' 
                }
              ]}
            >
              {title}
            </Text>
          }
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text
              style={[
                baseTextStyle,
                { 
                  opacity: 0,
                  textDecorationLine: 'underline' 
                }
              ]}
            >
              {title}
            </Text>
          </LinearGradient>
        </MaskedView>
      ) : (
        <Text 
          style={[
            baseTextStyle,
            { 
              color: textColor || '#0080FF',
              textDecorationLine: 'underline' 
            }
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}