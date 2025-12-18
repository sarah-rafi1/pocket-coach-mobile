import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { signIn, signUp } from '../../../services/authService';
import { userApi } from '../../../services/apis/UserApis';
import useAuthStore from '../../../store/useAuthStore';
import { AppRoutes } from '../../../types';

type AuthScreenNavigationProp = StackNavigationProp<AppRoutes, 'auth-screen'>;

interface ModalContent {
  title: string;
  message: string;
  action: () => void;
}

interface UseAuthProps {
  setModalContent: (content: ModalContent) => void;
  setShowSuccessModal: (show: boolean) => void;
  setShowErrorModal: (show: boolean) => void;
  setShowConfirmationModal: (show: boolean) => void;
}

export function useAuth({
  setModalContent,
  setShowSuccessModal,
  setShowErrorModal,
  setShowConfirmationModal
}: UseAuthProps) {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      setModalContent({
        title: "Error",
        message: "Please enter email and password",
        action: () => setShowErrorModal(false)
      });
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    try {
      const tokens = await signIn(email, password);

      try {
        const userProfile = await userApi.getUserProfile(tokens.access_token || '');
        
        // Set user data in store
        setUser({ 
          id: userProfile.data.id,
          email: userProfile.data.email, 
          firstName: userProfile.data.display_name || userProfile.data.email.split('@')[0],
          username: userProfile.data.username,
          display_name: userProfile.data.display_name,
          bio: userProfile.data.bio,
          avatar_url: userProfile.data.avatar_url,
          is_onboarding_complete: userProfile.data.is_onboarding_complete
        });
        
        // Check if onboarding is complete using the API response
        if (userProfile.data?.is_onboarding_complete === true) {
          // User has completed onboarding - navigate to feed screen
          setModalContent({
            title: "Welcome Back!",
            message: "Signed in successfully!",
            action: () => {
              setShowSuccessModal(false);
              navigation.navigate('feed-screen');
            }
          });
          setShowSuccessModal(true);
        } else if (!userProfile.data?.username || !userProfile.data?.display_name || !userProfile.data?.interest_slugs || userProfile.data?.interest_slugs.length === 0) {
          // User needs to complete profile
          setModalContent({
            title: "Complete Your Profile",
            message: "Please complete your profile to continue.",
            action: () => {
              setShowSuccessModal(false);
              navigation.navigate('profile-completion-screen');
            }
          });
          setShowSuccessModal(true);
        } else {
          // Fallback - show success message
          setModalContent({
            title: "Success",
            message: "Signed in successfully!",
            action: () => setShowSuccessModal(false)
          });
          setShowSuccessModal(true);
        }
      } catch (profileError: any) {
        console.error('Error checking user profile:', profileError);
        
        if (profileError.message?.includes('404') || profileError.message?.includes('not found')) {
          setModalContent({
            title: "Complete Your Profile",
            message: "Please complete your profile to continue.",
            action: () => {
              setShowSuccessModal(false);
              navigation.navigate('profile-completion-screen');
            }
          });
          setShowSuccessModal(true);
        } else {
          setModalContent({
            title: "Success",
            message: "Signed in successfully!",
            action: () => setShowSuccessModal(false)
          });
          setShowSuccessModal(true);
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.name === "UserNotConfirmedException" || 
          error.message?.includes("User is not confirmed") ||
          error.code === "UserNotConfirmedException") {
        setModalContent({
          title: "Email Not Verified",
          message: "Your email address is not verified. Please verify your email to continue.",
          action: () => {
            setShowConfirmationModal(false);
            navigation.navigate('password-recovery-screen', { mode: 'email-verification', email, fromLogin: true });
          }
        });
        setShowConfirmationModal(true);
      } else {
        setModalContent({
          title: "Login Failed",
          message: error.message || "An error occurred",
          action: () => setShowErrorModal(false)
        });
        setShowErrorModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signUp(email, password);
      
      if (result.emailSent) {
        navigation.navigate('password-recovery-screen', { mode: 'email-verification', email, password });
      } else {
        if (result.tokens) {
          setUser({ 
            id: email, 
            email: email, 
            firstName: email.split('@')[0] 
          });
          navigation.navigate('profile-completion-screen');
        } else {
          navigation.navigate('auth-screen', { mode: 'login' });
        }
      }
    } catch (error: any) {
      setModalContent({
        title: "Sign Up Failed",
        message: error.message || "An error occurred",
        action: () => setShowErrorModal(false)
      });
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleLogin,
    handleSignUp
  };
}