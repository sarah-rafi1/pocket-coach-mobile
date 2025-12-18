import { useState } from 'react';
import { loginSchema, signUpSchema, emailSchema, passwordSchema } from '../schemas';

export function useAuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (confirmPasswordError && text === confirmPassword) {
      setConfirmPasswordError('');
    }
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) {
      setConfirmPasswordError('');
    }
  };

  const handleEmailBlur = () => {
    if (email) {
      const result = emailSchema.safeParse(email);
      if (!result.success) {
        setEmailError(result.error.issues[0].message);
      }
    }
  };

  const handlePasswordBlur = (isLogin: boolean) => {
    if (isLogin && password && password.length < 6) {
      setPasswordError('Incorrect password');
    } else if (!isLogin && password) {
      const result = passwordSchema.safeParse(password);
      if (!result.success) {
        setPasswordError(result.error.issues[0].message);
      }
    }
  };

  const handleConfirmPasswordBlur = () => {
    if (confirmPassword && confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
    }
  };

  const validateForm = (isLogin: boolean) => {
    clearErrors();
    
    const formData = isLogin 
      ? { email, password }
      : { email, password, confirmPassword };
    
    const schema = isLogin ? loginSchema : signUpSchema;
    const result = schema.safeParse(formData);
    
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        switch (field) {
          case 'email':
            setEmailError(issue.message);
            break;
          case 'password':
            setPasswordError(issue.message);
            break;
          case 'confirmPassword':
            setConfirmPasswordError(issue.message);
            break;
        }
      });
      return false;
    }
    
    return true;
  };

  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    clearErrors();
  };

  return {
    // Form state
    email,
    password,
    confirmPassword,
    emailError,
    passwordError,
    confirmPasswordError,
    isPasswordVisible,
    isConfirmPasswordVisible,
    
    // Form handlers
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleEmailBlur,
    handlePasswordBlur,
    handleConfirmPasswordBlur,
    
    // Utilities
    validateForm,
    clearErrors,
    resetForm,
    setIsPasswordVisible,
    setIsConfirmPasswordVisible
  };
}