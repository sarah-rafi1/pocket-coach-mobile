import React from 'react';
import { View, Text } from 'react-native';
import { fonts } from '../../constants/typography';

interface PasswordRequirementsProps {
  password: string;
  visible?: boolean;
  showOnlyErrors?: boolean;
}

export function PasswordRequirements({ password, visible = true, showOnlyErrors = true }: PasswordRequirementsProps) {
  if (!visible) return null;

  const requirements = [
    { text: '6 characters', valid: password.length >= 6 },
    { text: 'uppercase letter', valid: /[A-Z]/.test(password) },
    { text: 'lowercase letter', valid: /[a-z]/.test(password) },
    { text: 'number', valid: /[0-9]/.test(password) },
    { text: 'special character', valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const failedRequirements = requirements.filter(req => !req.valid);
  
  // Only show if there are validation errors and showOnlyErrors is true
  if (showOnlyErrors && failedRequirements.length === 0) {
    return null;
  }

  // If showOnlyErrors is false, show the old checklist format
  if (!showOnlyErrors) {
    return (
      <View className="mt-2 mb-2">
        <Text 
          className="text-gray-400 text-xs mb-2" 
          style={{ fontFamily: fonts.SharpSansRegular }}
        >
          Password requirements:
        </Text>
        {requirements.map((req, index) => (
          <View key={index} className="flex-row items-center mb-1">
            <View 
              className={`w-4 h-4 rounded-full justify-center items-center mr-2 ${
                req.valid ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <Text 
                className={`text-xs font-bold ${req.valid ? 'text-white' : 'text-gray-400'}`}
                style={{ fontFamily: fonts.SharpSansBold }}
              >
                {req.valid ? '✓' : '○'}
              </Text>
            </View>
            <Text 
              className={`text-xs ${req.valid ? 'text-green-400' : 'text-gray-400'}`}
              style={{ fontFamily: fonts.SharpSansRegular }}
            >
              {req.text}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  // New sentence format for error message
  if (failedRequirements.length > 0) {
    const missingItems = failedRequirements.map(req => req.text);
    let errorMessage = '';
    
    if (missingItems.length === 1) {
      errorMessage = `Password must include ${missingItems[0]}.`;
    } else if (missingItems.length === 2) {
      errorMessage = `Password must include ${missingItems.join(' and ')}.`;
    } else {
      const lastItem = missingItems.pop();
      errorMessage = `Password must include ${missingItems.join(', ')} and ${lastItem}.`;
    }

    return (
      <View className="mt-1">
        <Text 
          className="text-red-400 text-sm" 
          style={{ fontFamily: fonts.SharpSansRegular }}
        >
          {errorMessage}
        </Text>
      </View>
    );
  }

  return null;
}