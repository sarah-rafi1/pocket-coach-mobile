export interface UserProfile {
  id: string;
  username?: string;
  display_name?: string;
  email: string;
  email_verified?: boolean;
  bio?: string;
  interest_slugs?: string[];
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface Interest {
  label: string;
  value: string;
}
