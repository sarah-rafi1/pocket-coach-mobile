import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  useSignIn,
  useSignUp as useClerkSignUp,
  useSSO,
  useClerk
} from '@clerk/clerk-expo';
import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { showToast } from '@/libs/utils';
import { ROUTES } from '@/libs/constants/routes';
import * as AuthSession from 'expo-auth-session';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface VerifyEmailCredentials {
  code: string;
}

export type OAuthStrategy = 'oauth_google' | 'oauth_facebook' | 'oauth_apple';

// ============= LOGIN =============
export function useLogin() {
  const { signIn, setActive } = useSignIn();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      if (!signIn) throw new Error('SignIn not available');

      const result = await signIn.create({
        identifier: credentials.email,
        password: credentials.password,
      });

      return result;
    },
    onSuccess: async (result) => {
      console.log('Login successful - setting active session',result.status,result.createdSessionId);

      if (result.status === 'complete' && result.createdSessionId && setActive) {
        await setActive({ session: result.createdSessionId });
        console.log('Session activated');
      }
      showToast('success', 'Welcome back!');
      console.log('Triggering app reload');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      let errorMessage = 'Login failed. Please try again.';

      if (isClerkAPIResponseError(error)) {
        const firstError = error.errors?.[0];
        if (firstError?.code === 'form_identifier_not_found') {
          errorMessage = 'No account found with this email.';
        } else if (firstError?.code === 'form_password_incorrect') {
          errorMessage = 'Incorrect password.';
        } else if (firstError?.code === 'strategy_for_user_invalid') {
          errorMessage = 'This account was created with Google, Facebook, or Apple. Please use the same sign-in method.';
        } else if (firstError?.code === 'form_password_not_set') {
          errorMessage = 'No password set for this account. Please use social sign-in or reset your password.';
        } else if (firstError?.message) {
          errorMessage = firstError.message;
        }
      }

      showToast('error', 'Login Failed', errorMessage);
    },
  });
}

// ============= SIGNUP =============
export function useSignUp() {
  const router = useRouter();
  const { signUp, setActive } = useClerkSignUp();

  return useMutation({
    mutationFn: async (credentials: SignUpCredentials) => {
      if (!signUp) throw new Error('SignUp not available');

      const result = await signUp.create({
        emailAddress: credentials.email,
        password: credentials.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      return result;
    },
    onSuccess: (result, variables) => {
      console.log('Sign up successful, email verification required');
      router.push({
        pathname: ROUTES.AUTH.EMAIL_VERIFICATION,
        params: { email: variables.email }
      });
    },
    onError: (error) => {
      console.error('Sign up failed:', error);
      let errorMessage = 'Sign up failed. Please try again.';

      if (isClerkAPIResponseError(error)) {
        const firstError = error.errors?.[0];
        if (firstError?.code === 'form_identifier_exists') {
          errorMessage = 'An account with this email already exists.';
        } else if (firstError?.code === 'form_password_pwned') {
          errorMessage = 'This password has been compromised. Please choose another.';
        } else if (firstError?.message) {
          errorMessage = firstError.message;
        }
      }

      showToast('error', 'Sign Up Failed', errorMessage);
    },
  });
}

// ============= EMAIL VERIFICATION =============
export function useVerifyEmail() {
  const { signUp, setActive } = useClerkSignUp();

  return useMutation({
    mutationFn: async ({ code }: VerifyEmailCredentials) => {
      if (!signUp) throw new Error('SignUp not available');

      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
      }

      return result;
    },
    onSuccess: () => {
      console.log('Email verified successfully - triggering navigation');
      showToast('success', 'Email Verified!', 'Your account has been created.');
    },
    onError: (error) => {
      console.error('Email verification failed:', error);
      let errorMessage = 'Verification failed. Please try again.';

      if (isClerkAPIResponseError(error)) {
        const firstError = error.errors?.[0];
        if (firstError?.code === 'verification_expired') {
          errorMessage = 'Verification code expired. Request a new one.';
        } else if (firstError?.code === 'verification_failed') {
          errorMessage = 'Invalid verification code.';
        } else if (firstError?.message) {
          errorMessage = firstError.message;
        }
      }

      showToast('error', 'Verification Failed', errorMessage);
    },
  });
}

export function useResendVerificationCode() {
  const { signUp } = useClerkSignUp();

  return useMutation({
    mutationFn: async () => {
      if (!signUp) throw new Error('SignUp not available');
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    },
    onSuccess: () => {
      showToast('success', 'Code Resent', 'Check your email for the new code.');
    },
    onError: (error) => {
      console.error('Resend verification failed:', error);
      showToast('error', 'Failed to Resend', 'Please try again later.');
    },
  });
}

// ============= SSO / OAUTH =============
export function useSSOSignIn(strategy: OAuthStrategy) {
  const { startSSOFlow } = useSSO();
  const clerk = useClerk();

  // Get provider name for display
  const providerName = strategy.replace('oauth_', '');
  const formattedName = providerName.charAt(0).toUpperCase() + providerName.slice(1);

  return useMutation({
    mutationFn: async () => {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        // await new Promise(resolve => setTimeout(resolve, 100));
      }

      return { createdSessionId, user: clerk.user };
    },
    onSuccess: (data) => {
      console.log(`${formattedName} authentication successful - triggering navigation`);
      const onboardingComplete = data.user?.publicMetadata?.onboardingCompleted === true;

      if (!onboardingComplete) {
        showToast('info', 'Complete Your Profile', 'Please complete your profile setup');
      } else {
        showToast('success', 'Welcome back!', `Successfully signed in with ${formattedName}`);
      }
    },
    onError: (error) => {
      console.error(`${formattedName} authentication failed:`, error);
      showToast('error', `${formattedName} Sign In Failed`, 'Please try again.');
    },
  });
}
