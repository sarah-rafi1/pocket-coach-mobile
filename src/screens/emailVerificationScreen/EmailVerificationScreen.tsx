import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ReusableButton, GradientText } from '../../components';
import { fonts } from '../../constants/typography';
import { confirmSignUp, resendConfirmationCode } from '../../services/authService';
import EmailVerificationLogo from '../../../assets/icons/EmailVerificationLogo';
import { AppRoutes } from '../../types';

type EmailVerificationNavigationProp = StackNavigationProp<AppRoutes, 'email-verification-screen'>;

interface EmailVerificationScreenProps {
  route?: {
    params?: {
      email?: string;
    };
  };
}

export function EmailVerificationScreen({ route }: EmailVerificationScreenProps) {
  const navigation = useNavigation<EmailVerificationNavigationProp>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const email = route?.params?.email || 'ahmadalfi23@gmail.com';

  const handleOtpChange = (value: string, index: number) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      const newOtp = [...otp];
      if (newOtp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      setLoading(true);
      try {
        await confirmSignUp(email, otpCode);
        Alert.alert("Success", "Email verified successfully!", [
          {
            text: "OK",
            onPress: () => navigation.navigate('profile-completion-screen')
          }
        ]);
      } catch (error: any) {
        Alert.alert("Verification Failed", error.message || "Invalid verification code");
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert("Error", "Please enter the complete verification code");
    }
  };

  const handleResendCode = async () => {
    try {
      await resendConfirmationCode(email);
      Alert.alert("Success", "Verification code sent to your email");
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to resend verification code");
    }
  };

  return (
    <ImageBackground 
      source={require('../../../assets/images/Background.png')} 
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
      {/* Header with Back Button */}
      <View className="flex-row items-center px-5 pt-20">
        <TouchableOpacity onPress={handleBackPress}>
          <Text className="text-cyan-400 text-4xl" style={{ fontFamily: fonts.SharpSansMedium }}>‹</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6 items-center pt-16">
        {/* Logo */}
        <View className="mb-12">
          <EmailVerificationLogo />
        </View>

        {/* Title */}
        <Text className="text-white text-3xl font-bold mb-4" style={{ fontFamily: fonts.SharpSansBold }}>
          Email Verification
        </Text>
        
        {/* Subtitle */}
        <View className="mb-12">
          <Text style={{ color: 'rgb(156, 163, 175)', fontSize: 16, textAlign: 'center', fontFamily: fonts.SharpSansRegular, lineHeight: 24 }}>
            Enter the OTP that we have sent you on your given
          </Text>
          <Text style={{ color: 'rgb(156, 163, 175)', fontSize: 16, textAlign: 'center', fontFamily: fonts.SharpSansRegular, lineHeight: 24 }}>
            email <Text style={{ color: 'white' }}>{email}</Text>
          </Text>
        </View>

        {/* OTP Input Boxes */}
        <View className="flex-row justify-center gap-3 mb-8">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={{
                width: 48,
                height: 48,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                borderWidth: 2,
                borderColor: focusedIndex === index ? '#00C6FF' : 'rgba(255, 255, 255, 0.2)',
                textAlign: 'center',
                color: 'white',
                fontSize: 20,
                fontWeight: 'bold',
                fontFamily: fonts.SharpSansBold,
              }}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>
      </View>

          {/* Fixed Bottom Elements */}
          <View className="px-6 pb-12">
            {/* Resend Code */}
            <TouchableOpacity onPress={handleResendCode} className="mb-6 self-center">
              <GradientText style={{ fontSize: 16, fontWeight: '500' }}>
                Resend Code
              </GradientText>
            </TouchableOpacity>

            {/* Verify Button */}
            <ReusableButton
              title={loading ? "Verifying..." : "Verify"}
              variant="gradient"
              fullWidth={true}
              onPress={handleVerify}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}