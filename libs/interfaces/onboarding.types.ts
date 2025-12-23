export interface OnboardingPayload {
  username: string;
  display_name: string;
  bio?: string;
  interest_slugs: string[];
  profile_image?: string;
}

export interface OnboardingResponse {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  interest_slugs: string[];
  profile_image?: string;
  created_at: string;
  updated_at: string;
}
