import { useState, useCallback } from 'react';
import { z } from 'zod';
import { validateForm, validateField } from '../utils/validationSchemas';

export interface ValidationErrors {
  [field: string]: string;
}

export interface UseValidationReturn<T> {
  errors: ValidationErrors;
  isValid: boolean;
  validate: (data: unknown) => boolean;
  validateField: (fieldName: string, value: unknown) => boolean;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
  setFieldError: (fieldName: string, error: string) => void;
}

export function useValidation<T>(schema: z.ZodSchema<T>): UseValidationReturn<T> {
  const [errors, setErrors] = useState<ValidationErrors>({});
  
  const validate = useCallback((data: unknown): boolean => {
    const result = validateForm(schema, data);
    
    if (result.success) {
      setErrors({});
      return true;
    } else {
      setErrors(result.errors || {});
      return false;
    }
  }, [schema]);

  const validateSingleField = useCallback((fieldName: string, value: unknown): boolean => {
    try {
      // Try to validate just this field by creating a partial schema
      const fieldSchema = schema.pick({ [fieldName]: true } as any);
      const result = validateField(fieldSchema, { [fieldName]: value });
      
      if (result.isValid) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
        return true;
      } else {
        setErrors(prev => ({
          ...prev,
          [fieldName]: result.error || 'Validation failed'
        }));
        return false;
      }
    } catch (error) {
      // Fallback: validate the whole object
      return validate({ [fieldName]: value });
    }
  }, [schema, validate]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    isValid,
    validate,
    validateField: validateSingleField,
    clearErrors,
    clearFieldError,
    setFieldError
  };
}

// Specific validation hooks for common use cases
export function useLoginValidation() {
  return useValidation(loginSchema);
}

export function useSignUpValidation() {
  return useValidation(signUpSchema);
}

export function useProfileValidation() {
  return useValidation(profileStep1Schema);
}

export function useInterestsValidation() {
  return useValidation(profileStep2Schema);
}

// Import schemas for the hooks
import { 
  loginSchema, 
  signUpSchema, 
  profileStep1Schema, 
  profileStep2Schema 
} from '../utils/validationSchemas';