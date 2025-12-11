import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, LoginPayload, SignUpPayload, ForgotPasswordPayload, ResetPasswordPayload } from "../apis/AuthApis";
import { useAuthStore, useApiStore } from "../../store";
import { storeTokenSecurely, removeTokenSecurely } from "../../utils";
import { showToast } from "../../utils/showToast";

export const useLoginMutation = () => {
  const { setUser } = useAuthStore();
  const { setLoading, setError } = useApiStore();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: async (data) => {
      const { user, accessToken, refreshToken } = data;
      await storeTokenSecurely({ accessToken, refreshToken });
      setUser(user);
      showToast('success', 'Login Successful', 'Welcome back!');
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      const message = error?.userMessage || 'Login failed. Please try again.';
      setError(message);
      showToast('error', 'Login Failed', message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useSignUpMutation = () => {
  const { setUser } = useAuthStore();
  const { setLoading, setError } = useApiStore();

  return useMutation({
    mutationFn: (payload: SignUpPayload) => authApi.signUp(payload),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: async (data) => {
      const { user, accessToken, refreshToken } = data;
      await storeTokenSecurely({ accessToken, refreshToken });
      setUser(user);
      showToast('success', 'Account Created', 'Welcome to Pocket Coach!');
    },
    onError: (error: any) => {
      console.error('Sign up failed:', error);
      const message = error?.userMessage || 'Sign up failed. Please try again.';
      setError(message);
      showToast('error', 'Sign Up Failed', message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const { removeUser } = useAuthStore();
  const { setLoading } = useApiStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async () => {
      await removeTokenSecurely();
      removeUser();
      queryClient.clear();
      showToast('success', 'Logged Out', 'See you soon!');
    },
    onError: (error: any) => {
      console.error('Logout failed:', error);
      // Still clear local state even if server logout fails
      removeTokenSecurely();
      removeUser();
      queryClient.clear();
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useForgotPasswordMutation = () => {
  const { setLoading, setError } = useApiStore();

  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      showToast('success', 'Email Sent', 'Check your email for reset instructions.');
    },
    onError: (error: any) => {
      console.error('Forgot password failed:', error);
      const message = error?.userMessage || 'Failed to send reset email. Please try again.';
      setError(message);
      showToast('error', 'Reset Failed', message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useResetPasswordMutation = () => {
  const { setLoading, setError } = useApiStore();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      showToast('success', 'Password Reset', 'Your password has been successfully reset.');
    },
    onError: (error: any) => {
      console.error('Reset password failed:', error);
      const message = error?.userMessage || 'Failed to reset password. Please try again.';
      setError(message);
      showToast('error', 'Reset Failed', message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};