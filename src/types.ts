export interface User {
  id: string;
  firstName: string;
  email: string;
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
  'login-screen': any;
  'sign-up-screen': any;
  'forgot-password-screen': any;
  'email-verification-screen': { email?: string };
  'reset-password-screen': any;

};
