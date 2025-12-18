import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { 
  signInWithGoogle, signInWithFacebook, signInWithApple,
  signUpWithGoogle, signUpWithFacebook, signUpWithApple
} from '../../../services/authService';
import { userApi } from '../../../services/apis/UserApis';
import useAuthStore from '../../../store/useAuthStore';
import { AppRoutes } from '../../../types';

type AuthScreenNavigationProp = StackNavigationProp<AppRoutes, 'auth-screen'>;

interface ModalContent {
  title: string;
  message: string;
  action: () => void;
}

interface UseSocialAuthProps {
  isLogin: boolean;
  setModalContent: (content: ModalContent) => void;
  setShowSuccessModal: (show: boolean) => void;
  setShowErrorModal: (show: boolean) => void;
}

export function useSocialAuth({
  isLogin,
  setModalContent,
  setShowSuccessModal,
  setShowErrorModal
}: UseSocialAuthProps) {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { setUser } = useAuthStore();
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const extractEmailFromIdToken = (idToken: string): string | null => {
    try {
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
      return decoded.email || null;
    } catch (error) {
      console.error('Error extracting email from token:', error);
      return null;
    }
  };

  const handleGoogleAuth = async () => {
    setSocialLoading("google");
    try {
      const tokens = isLogin ? await signInWithGoogle() : await signUpWithGoogle();
      
      const userEmail = tokens.id_token ? extractEmailFromIdToken(tokens.id_token) : null;
      
      if (!userEmail) {
        setModalContent({
          title: "Error",
          message: "Unable to get email from Google account. Please try again.",
          action: () => setShowErrorModal(false)
        });
        setShowErrorModal(true);
        return;
      }

      if (isLogin) {
        try {
          const userProfile = await userApi.getUserProfile(tokens.access_token || '');
          
          if (!userProfile.username || !userProfile.display_name || !userProfile.interest_slugs || userProfile.interest_slugs.length === 0) {
            if (!userProfile.email_verified) {
              await userApi.sendVerificationCode(userEmail, tokens.access_token);
              setModalContent({
                title: "Email Verification Required",
                message: "Please verify your email address to continue.",
                action: () => {
                  setShowSuccessModal(false);
                  navigation.navigate('password-recovery-screen', { mode: 'email-verification', email: userEmail, fromLogin: true });
                }
              });
              setShowSuccessModal(true);
            } else {
              setUser({ id: userProfile.id || "google_user", email: userEmail, firstName: userEmail.split('@')[0] });
              setModalContent({
                title: "Complete Your Profile",
                message: "Please complete your profile to continue.",
                action: () => {
                  setShowSuccessModal(false);
                  navigation.navigate('profile-completion-screen');
                }
              });
              setShowSuccessModal(true);
            }
          } else {
            setUser({ id: userProfile.id, email: userEmail, firstName: userProfile.display_name.split(' ')[0] || userEmail.split('@')[0] });
            setModalContent({
              title: "Success",
              message: "Signed in with Google successfully!",
              action: () => setShowSuccessModal(false)
            });
            setShowSuccessModal(true);
          }
        } catch (profileError: any) {
          if (profileError.message?.includes('404') || profileError.message?.includes('not found')) {
            try {
              await userApi.sendVerificationCode(userEmail, tokens.access_token);
              setModalContent({
                title: "Welcome!",
                message: "Please verify your email address to complete your account setup.",
                action: () => {
                  setShowSuccessModal(false);
                  navigation.navigate('password-recovery-screen', { mode: 'email-verification', email: userEmail, fromLogin: false });
                }
              });
              setShowSuccessModal(true);
            } catch (verificationError: any) {
              setModalContent({
                title: "Error",
                message: "Failed to send verification code. Please try again.",
                action: () => setShowErrorModal(false)
              });
              setShowErrorModal(true);
            }
          } else {
            setModalContent({
              title: "Error",
              message: "Failed to verify account status. Please try again.",
              action: () => setShowErrorModal(false)
            });
            setShowErrorModal(true);
          }
        }
      } else {
        setUser({ id: "google_user", email: userEmail, firstName: userEmail.split('@')[0] });
        setModalContent({
          title: "Success",
          message: "Signed up with Google successfully!",
          action: () => {
            setShowSuccessModal(false);
            navigation.navigate('profile-completion-screen');
          }
        });
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      const actionType = isLogin ? "Sign In" : "Sign Up";
      setModalContent({
        title: `Google ${actionType} Failed`,
        message: error.message || "An error occurred",
        action: () => setShowErrorModal(false)
      });
      setShowErrorModal(true);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebookAuth = async () => {
    setSocialLoading("facebook");
    try {
      const tokens = isLogin ? await signInWithFacebook() : await signUpWithFacebook();
      const actionType = isLogin ? "in" : "up";
      setUser({ 
        id: "facebook_user", 
        email: "test@facebook.com", 
        firstName: "Facebook User" 
      });
      setModalContent({
        title: "Success",
        message: `Signed ${actionType} with Facebook successfully!`,
        action: () => setShowSuccessModal(false)
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      const actionType = isLogin ? "Sign In" : "Sign Up";
      setModalContent({
        title: `Facebook ${actionType} Failed`,
        message: error.message || "An error occurred",
        action: () => setShowErrorModal(false)
      });
      setShowErrorModal(true);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleAuth = async () => {
    setSocialLoading("apple");
    try {
      const tokens = isLogin ? await signInWithApple() : await signUpWithApple();
      const actionType = isLogin ? "in" : "up";
      setUser({ 
        id: "apple_user", 
        email: "test@icloud.com", 
        firstName: "Apple User" 
      });
      setModalContent({
        title: "Success",
        message: `Signed ${actionType} with Apple successfully!`,
        action: () => setShowSuccessModal(false)
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      const actionType = isLogin ? "Sign In" : "Sign Up";
      setModalContent({
        title: `Apple ${actionType} Failed`,
        message: error.message || "An error occurred",
        action: () => setShowErrorModal(false)
      });
      setShowErrorModal(true);
    } finally {
      setSocialLoading(null);
    }
  };

  return {
    socialLoading,
    handleGoogleAuth,
    handleFacebookAuth,
    handleAppleAuth
  };
}