import { z } from 'zod';

// ============================================================================
// Re-export All Schemas
// ============================================================================

// Auth schemas
export {
  // Field schemas
  emailSchema,
  passwordSchema,
  // Form schemas
  loginSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  emailVerificationSchema,
  // Type exports
  type LoginFormData,
  type SignUpFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
  type EmailVerificationFormData,
} from './auth.schemas';

// Onboarding schemas
export {
  // Field schemas
  usernameSchema,
  displayNameSchema,
  bioSchema,
  interestSlugsSchema,
  profileImageSchema,
  // Form schemas
  profileStep1Schema,
  profileStep2Schema,
  onboardingSchema,
  // Type exports
  type ProfileStep1FormData,
  type ProfileStep2FormData,
  type OnboardingFormData,
} from './onboarding.schemas';

// User schemas
export {
  // Re-exports from onboarding (for now)
  // usernameSchema, displayNameSchema, bioSchema, profileImageSchema
  // are already exported from onboarding.schemas above
} from './user.schemas';

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validates form data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Form data to validate
 * @returns Object with success flag, validated data (if successful), and field errors (if failed)
 */
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const fieldName = err.path.join('.');
        fieldErrors[fieldName] = err.message;
      });
      return { success: false, data: null, errors: fieldErrors };
    }
    return { success: false, data: null, errors: { general: 'Validation failed' } };
  }
};

/**
 * Validates a single field against a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Field data to validate
 * @returns Object with isValid flag and error message (if invalid)
 */
export const validateField = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  try {
    schema.parse(data);
    return { isValid: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message || 'Invalid value' };
    }
    return { isValid: false, error: 'Validation failed' };
  }
};

/**
 * Creates a field validator function from a Zod schema
 * Useful for creating reusable validators for real-time validation
 * @param schema - Zod schema to create validator from
 * @returns Validator function that accepts data and returns validation result
 */
export const createFieldValidator = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown) => validateField(schema, data);
};

// ============================================================================
// Common Field Validators (for real-time validation)
// ============================================================================

// Import schemas for field validators
import {
  emailSchema,
  passwordSchema,
} from './auth.schemas';

import {
  usernameSchema,
  displayNameSchema,
  bioSchema,
} from './onboarding.schemas';

// Auth field validators
export const validateEmailField = createFieldValidator(emailSchema);
export const validatePasswordField = createFieldValidator(passwordSchema);

// Onboarding field validators
export const validateUsernameField = createFieldValidator(usernameSchema);
export const validateDisplayNameField = createFieldValidator(displayNameSchema);

// Special validator for optional bio field
export const validateBioField = (data: unknown) => {
  // If bio is empty, undefined, or null, it's valid (since it's optional)
  if (!data || (typeof data === 'string' && data.trim() === '')) {
    return { isValid: true, error: null };
  }
  return validateField(bioSchema, data);
};
