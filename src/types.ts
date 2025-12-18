export interface User {
  id: string;
  firstName: string;
  email: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  is_onboarding_complete?: boolean;
}

// Routes
export type AppRoutes = {
  // Tabs
  'home': any;
  // ...

  // Root Stack
  'splash-screen': any;

  // Home Stack
  'home-screen': any;
  'auth-screen': { mode?: 'login' | 'signup' };
  'password-recovery-screen': { mode?: 'forgot-password' | 'email-verification' | 'reset-password'; email?: string; fromLogin?: boolean; password?: string };
  'profile-completion-screen': any;
  'profile-success-screen': any;
  'feed-screen': any;

};
