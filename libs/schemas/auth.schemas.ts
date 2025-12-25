import { z } from 'zod';

// ============================================================================
// Field-Level Validation Schemas
// ============================================================================

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

// ============================================================================
// Form-Level Validation Schemas
// ============================================================================

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

// ============================================================================
// Type Exports (Inferred from Schemas)
// ============================================================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>;
