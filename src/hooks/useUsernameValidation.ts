import { useState, useEffect } from 'react';
import { useCheckUsernameQuery } from '../services/queries/UserQueries';

export interface UsernameValidationState {
  isValidating: boolean;
  isAvailable: boolean | null;
  error: string;
  message: string;
}

export const useUsernameValidation = (username: string, debounceMs: number = 500) => {
  const [debouncedUsername, setDebouncedUsername] = useState('');
  const [validationState, setValidationState] = useState<UsernameValidationState>({
    isValidating: false,
    isAvailable: null,
    error: '',
    message: ''
  });

  // Debounce the username input
  useEffect(() => {
    if (username.length < 3) {
      setDebouncedUsername('');
      setValidationState({
        isValidating: false,
        isAvailable: null,
        error: username.length > 0 && username.length < 3 ? 'Username must be at least 3 characters' : '',
        message: ''
      });
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedUsername(username);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [username, debounceMs]);

  // Use the query with debounced username
  const { data, isLoading, error, isFetching } = useCheckUsernameQuery(
    debouncedUsername,
    !!debouncedUsername && debouncedUsername.length >= 3
  );

  // Update validation state based on query results
  useEffect(() => {
    if (username.length === 0) {
      setValidationState({
        isValidating: false,
        isAvailable: null,
        error: '',
        message: ''
      });
      return;
    }

    if (username.length < 3) {
      setValidationState({
        isValidating: false,
        isAvailable: null,
        error: 'Username must be at least 3 characters',
        message: ''
      });
      return;
    }

    if (isLoading || isFetching) {
      setValidationState({
        isValidating: true,
        isAvailable: null,
        error: '',
        message: 'Checking username availability...'
      });
      return;
    }

    if (error) {
      console.log('🔍 [USERNAME VALIDATION ERROR]:', error);
      // If we get a 401 "User not found" error, assume username validation isn't available yet
      // This happens during profile completion when user doesn't exist in DB yet
      const isUserNotFoundError = error?.message?.includes('User not found') || 
                                  (error as any)?.response?.status === 401;
      
      if (isUserNotFoundError) {
        setValidationState({
          isValidating: false,
          isAvailable: null,
          error: '',
          message: 'Username validation unavailable during profile setup'
        });
      } else {
        setValidationState({
          isValidating: false,
          isAvailable: null,
          error: 'Unable to check username availability',
          message: ''
        });
      }
      return;
    }

    if (data) {
      const available = data.data?.available ?? false;
      setValidationState({
        isValidating: false,
        isAvailable: available,
        error: available ? '' : 'Username is already taken',
        message: available ? 'Username is available' : data.data?.message || 'Username is already taken'
      });
    }
  }, [username, isLoading, isFetching, error, data]);

  return validationState;
};