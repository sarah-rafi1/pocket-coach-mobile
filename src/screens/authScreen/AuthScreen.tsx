import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { GradientText } from '../../components';
import { fonts } from '../../constants/typography';
import { AppRoutes } from '../../types';
import { 
  AuthHeader,
  LoginForm,
  SignUpForm,
  SocialLoginButtons,
  AuthModals
} from './components';
import { useAuthForm, useSocialAuth, useAuth } from './hooks';

type AuthScreenNavigationProp = StackNavigationProp<AppRoutes, 'auth-screen'>;
type AuthScreenRouteProp = RouteProp<AppRoutes, 'auth-screen'>;

export function AuthScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const route = useRoute<AuthScreenRouteProp>();
  
  // Initialize mode based on route params
  const [isLogin, setIsLogin] = useState(true);
  
  useEffect(() => {
    if (route.params?.mode) {
      setIsLogin(route.params.mode === 'login');
    }
  }, [route.params?.mode]);
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', action: () => {} });

  // Custom hooks for form management and authentication
  const authForm = useAuthForm();
  
  const auth = useAuth({
    setModalContent,
    setShowSuccessModal,
    setShowErrorModal,
    setShowConfirmationModal
  });

  const socialAuth = useSocialAuth({
    isLogin,
    setModalContent,
    setShowSuccessModal,
    setShowErrorModal
  });

  const switchMode = () => {
    setIsLogin(!isLogin);
    authForm.clearErrors();
  };

  const handleSubmit = () => {
    if (authForm.validateForm(isLogin)) {
      if (isLogin) {
        auth.handleLogin(authForm.email, authForm.password);
      } else {
        auth.handleSignUp(authForm.email, authForm.password);
      }
    }
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('password-recovery-screen', { mode: 'forgot-password' });
  };

  return (
    <ImageBackground 
      source={require('../../../assets/images/Background.png')} 
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            flexGrow: 1, 
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            minHeight: Platform.OS === 'android' ? undefined : '100%'
          }}
          keyboardShouldPersistTaps="handled"
          bounces={Platform.OS === 'ios'}
        >
          <AuthHeader isLogin={isLogin} />

          {isLogin ? (
            <LoginForm
              email={authForm.email}
              password={authForm.password}
              emailError={authForm.emailError}
              passwordError={authForm.passwordError}
              isPasswordVisible={authForm.isPasswordVisible}
              loading={auth.loading}
              socialLoading={socialAuth.socialLoading}
              onEmailChange={authForm.handleEmailChange}
              onPasswordChange={authForm.handlePasswordChange}
              onEmailBlur={authForm.handleEmailBlur}
              onPasswordBlur={() => authForm.handlePasswordBlur(isLogin)}
              onTogglePasswordVisibility={() => authForm.setIsPasswordVisible(!authForm.isPasswordVisible)}
              onSubmit={handleSubmit}
              onForgotPassword={navigateToForgotPassword}
            />
          ) : (
            <SignUpForm
              email={authForm.email}
              password={authForm.password}
              confirmPassword={authForm.confirmPassword}
              emailError={authForm.emailError}
              passwordError={authForm.passwordError}
              confirmPasswordError={authForm.confirmPasswordError}
              isPasswordVisible={authForm.isPasswordVisible}
              isConfirmPasswordVisible={authForm.isConfirmPasswordVisible}
              loading={auth.loading}
              socialLoading={socialAuth.socialLoading}
              onEmailChange={authForm.handleEmailChange}
              onPasswordChange={authForm.handlePasswordChange}
              onConfirmPasswordChange={authForm.handleConfirmPasswordChange}
              onEmailBlur={authForm.handleEmailBlur}
              onPasswordBlur={() => authForm.handlePasswordBlur(isLogin)}
              onConfirmPasswordBlur={authForm.handleConfirmPasswordBlur}
              onTogglePasswordVisibility={() => authForm.setIsPasswordVisible(!authForm.isPasswordVisible)}
              onToggleConfirmPasswordVisibility={() => authForm.setIsConfirmPasswordVisible(!authForm.isConfirmPasswordVisible)}
              onSubmit={handleSubmit}
            />
          )}

          <SocialLoginButtons
            isLogin={isLogin}
            socialLoading={socialAuth.socialLoading}
            onGoogleAuth={socialAuth.handleGoogleAuth}
            onFacebookAuth={socialAuth.handleFacebookAuth}
            onAppleAuth={socialAuth.handleAppleAuth}
            disabled={auth.loading}
          />

          {/* Switch Mode */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'center', 
            alignItems: 'center', 
            paddingBottom: Platform.OS === 'android' ? 10 : 20, 
            paddingHorizontal: 24,
            marginTop: Platform.OS === 'android' ? 8 : 'auto'
          }}>
            <Text style={{ 
              color: '#9CA3AF', 
              fontSize: 14, 
              fontFamily: fonts.SharpSansRegular 
            }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={switchMode}>
              <GradientText style={{ fontSize: 14, fontWeight: '500' }}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </GradientText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AuthModals
        showSuccessModal={showSuccessModal}
        showErrorModal={showErrorModal}
        showConfirmationModal={showConfirmationModal}
        modalContent={modalContent}
        onCloseConfirmationModal={() => setShowConfirmationModal(false)}
      />
    </ImageBackground>
  );
}