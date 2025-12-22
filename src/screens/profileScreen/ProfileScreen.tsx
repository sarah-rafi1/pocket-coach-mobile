import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { fonts } from '../../constants/typography';

export function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        paddingHorizontal: 24
      }}>
        <Text style={{ 
          fontSize: 24, 
          fontFamily: fonts.SharpSansRegular, 
          color: '#1F2937',
          textAlign: 'center',
          marginBottom: 8
        }}>
          Profile
        </Text>
        <Text style={{ 
          fontSize: 16, 
          fontFamily: fonts.SharpSansRegular, 
          color: '#6B7280',
          textAlign: 'center'
        }}>
          Manage your account and preferences
        </Text>
      </View>
    </SafeAreaView>
  );
}