import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long')
  .regex(/[0-9]/, 'Password must contain at least one digit')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character');

export const usernameSchema = z
  .string()
  .min(1, 'Username is required')
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be less than 50 characters')
  .regex(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, dots, and underscores');

export const displayNameSchema = z
  .string()
  .min(1, 'Display name is required')
  .max(100, 'Display name must be less than 100 characters')
  .trim();

export const bioSchema = z
  .string()
  .max(500, 'Bio must be less than 500 characters')
  .optional();

export const interestSlugsSchema = z
  .array(z.string())
  .min(1, 'Please select at least one interest')
  .max(10, 'You can select up to 10 interests');

export const profileImageSchema = z
  .string()
  .optional();

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const emailVerificationSchema = z.object({
  otp: z.string().length(6, 'Please enter the complete 6-digit code')
});

// Profile completion schemas
export const profileStep1Schema = z.object({
  username: usernameSchema,
  displayName: displayNameSchema,
  bio: bioSchema,
  profileImage: profileImageSchema
});

export const profileStep2Schema = z.object({
  interestSlugs: interestSlugsSchema
});

export const onboardingSchema = z.object({
  username: usernameSchema,
  display_name: displayNameSchema,
  bio: bioSchema,
  interest_slugs: interestSlugsSchema,
  profile_image: profileImageSchema
});

// Helper type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>;
export type ProfileStep1FormData = z.infer<typeof profileStep1Schema>;
export type ProfileStep2FormData = z.infer<typeof profileStep2Schema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;

// Validation helper functions
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

// Real-time validation helper
export const createFieldValidator = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown) => validateField(schema, data);
};

// Common field validators for real-time validation
export const validateEmailField = createFieldValidator(emailSchema);
export const validatePasswordField = createFieldValidator(passwordSchema);
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