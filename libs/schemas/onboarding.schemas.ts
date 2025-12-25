import { z } from 'zod';

// ============================================================================
// Field-Level Validation Schemas
// ============================================================================

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

// ============================================================================
// Form-Level Validation Schemas
// ============================================================================

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

// ============================================================================
// Type Exports (Inferred from Schemas)
// ============================================================================

export type ProfileStep1FormData = z.infer<typeof profileStep1Schema>;
export type ProfileStep2FormData = z.infer<typeof profileStep2Schema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
