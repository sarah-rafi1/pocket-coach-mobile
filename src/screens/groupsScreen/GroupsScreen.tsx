import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { fonts } from '../../constants/typography';

export function GroupsScreen() {
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
          Groups
        </Text>
        <Text style={{ 
          fontSize: 16, 
          fontFamily: fonts.SharpSansRegular, 
          color: '#6B7280',
          textAlign: 'center'
        }}>
          Connect with other users in groups
        </Text>
      </View>
    </SafeAreaView>
  );
}