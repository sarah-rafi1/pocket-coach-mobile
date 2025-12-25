import { z } from 'zod';

// Re-export relevant schemas from onboarding for user profile operations
export {
  usernameSchema,
  displayNameSchema,
  bioSchema,
  profileImageSchema,
} from './onboarding.schemas';

// ============================================================================
// User-Specific Validation Schemas
// ============================================================================

// TODO: Add user profile update schemas
// TODO: Add user settings schemas
// TODO: Add user preferences schemas

// Placeholder for future user profile schemas
// Example:
// export const updateProfileSchema = z.object({
//   displayName: displayNameSchema,
//   bio: bioSchema,
//   profileImage: profileImageSchema
// });
