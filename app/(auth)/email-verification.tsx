import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ReusableButton, BackArrowButton, GradientText } from '@/components';
import { fonts } from '@/libs/constants/typography';
import { useVerifyEmail, useResendVerificationCode } from '@/libs/queries/auth.query';
import { HomeLogo } from '@/assets/icons';

export default function EmailVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email || '';

  // OTP states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Timer
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hooks
  const verifyEmailMutation = useVerifyEmail();
  const resendCodeMutation = useResendVerificationCode();

  // Timer logic
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length === 6) {
      verifyEmailMutation.mutate({ code });
    }
  };

  const handleResend = () => {
    if (!canResend) return;

    resendCodeMutation.mutate();
    setCanResend(false);
    setTimeLeft(60);
    setOtp(['', '', '', '', '', '']);

    // Restart timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const isLoading = verifyEmailMutation.isPending || resendCodeMutation.isPending;
  const isCodeComplete = otp.join('').length === 6;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ImageBackground
        source={require('@/assets/images/Background.png')}
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
            contentContainerStyle={{ flexGrow: 1, paddingTop: Platform.OS === 'ios' ? 20 : 0 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="pt-8 px-6">
              <BackArrowButton onPress={() => router.back()} />
            </View>

            <View className="flex-1 justify-center px-6">
              <View className="items-center mb-8">
                <HomeLogo />
              </View>

              <View className="mb-6">
                <Text className="text-white text-2xl font-bold text-center mb-3" style={{ fontFamily: fonts.SharpSansBold }}>
                  Email Verification
                </Text>
                <Text className="text-gray-400 text-sm text-center px-4" style={{ fontFamily: fonts.SharpSansRegular }}>
                  We've sent a 6-digit code to {email}
                </Text>
              </View>

              {/* OTP Input */}
              <View className="flex-row justify-between mb-6 px-4">
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    keyboardType="number-pad"
                    maxLength={1}
                    className={`w-12 h-14 rounded-lg text-center text-white text-xl ${
                      focusedIndex === index ? 'border-2 border-purple-500' : 'border border-gray-600'
                    } bg-gray-800`}
                    style={{ fontFamily: fonts.SharpSansBold }}
                    editable={!isLoading}
                  />
                ))}
              </View>

              {/* Timer / Resend */}
              <View className="mb-6">
                {canResend ? (
                  <View className="flex-row justify-center items-center">
                    <Text className="text-gray-400 text-sm mr-2" style={{ fontFamily: fonts.SharpSansRegular }}>
                      Didn't receive code?
                    </Text>
                    <GradientText
                      style={{ fontSize: 14, fontWeight: '500' }}
                      onPress={handleResend}
                      disabled={isLoading}
                    >
                      Resend
                    </GradientText>
                  </View>
                ) : (
                  <Text className="text-gray-400 text-sm text-center" style={{ fontFamily: fonts.SharpSansRegular }}>
                    Resend code in {formatTime(timeLeft)}
                  </Text>
                )}
              </View>

              {/* Verify Button */}
              <ReusableButton
                title={isLoading ? "Verifying..." : "Verify Email"}
                variant="gradient"
                fullWidth={true}
                onPress={handleVerify}
                disabled={!isCodeComplete || isLoading}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}
