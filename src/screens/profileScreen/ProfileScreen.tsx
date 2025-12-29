import React from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { fonts } from '../../constants/typography';
import { ReusableButton } from '../../components';
import { removeTokenSecurely, removeCognitoTokens } from '../../utils/AsyncStorageApis';
import { signOut } from '../../services/authService';
import useAuthStore from '../../store/useAuthStore';

export function ProfileScreen() {
  const { removeUser } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Sign out from Cognito/revoke tokens and clear browser sessions
              try {
                await signOut();
                console.log('🚪 [COGNITO SIGNOUT] => Signed out from Cognito successfully');
              } catch (cognitoError) {
                console.log('⚠️ [COGNITO SIGNOUT] => Error signing out from Cognito:', cognitoError);
              }
              
              // Clear all tokens locally
              await removeTokenSecurely();
              await removeCognitoTokens();
              
              // Clear user from store - this will automatically switch to AuthStack
              removeUser();
              
              console.log('🚪 [LOGOUT] => User logged out successfully');
            } catch (error) {
              console.error('❌ [LOGOUT ERROR] =>', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

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
          textAlign: 'center',
          marginBottom: 40
        }}>
          Manage your account and preferences
        </Text>
        
        <ReusableButton
          title="Logout"
          variant="outlined"
          borderColor="#DC2626"
          textColor="#DC2626"
          fullWidth
          onPress={handleLogout}
          buttonStyle={{ marginTop: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}