import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useSignIn, useSignUp as useClerkSignUp } from '@clerk/clerk-expo';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
}

export function useLogin() {
  const router = useRouter();
  const { signIn } = useSignIn();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      await signIn?.create({
        identifier: credentials.email,
        password: credentials.password,
      });
      await signIn?.attemptFirstFactor({
        strategy: 'password',
        password: credentials.password,
      });
    },
    onSuccess: () => {
      console.log('Login successful');
      router.replace('/(app)');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
}

export function useSignUp() {
  const router = useRouter();
  const { signUp } = useClerkSignUp();

  return useMutation({
    mutationFn: async (credentials: SignUpCredentials) => {
      await signUp?.create({
        emailAddress: credentials.email,
        password: credentials.password,
      });
      // Prepare email verification
      await signUp?.prepareEmailAddressVerification({ strategy: 'email_code' });
    },
    onSuccess: () => {
      console.log('Sign up successful');
      router.push('/(onboarding)/profile-completion');
    },
    onError: (error) => {
      console.error('Sign up failed:', error);
    },
  });
}
