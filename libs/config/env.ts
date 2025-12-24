// Environment configuration for the app

interface Config {
  API_BASE_URL: string;
  CLERK_PUBLISHABLE_KEY: string;
  NODE_ENV: string;
}

// Get environment variables
const getEnvVars = (): Config => {
  // Expo uses EXPO_PUBLIC_ prefix for environment variables
  // These are statically embedded at build time
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const NODE_ENV = process.env.NODE_ENV || 'development';

  // Validate required environment variables
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is not defined in .env file');
  }

  if (!CLERK_PUBLISHABLE_KEY) {
    throw new Error('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not defined in .env file');
  }

  return {
    API_BASE_URL,
    CLERK_PUBLISHABLE_KEY,
    NODE_ENV,
  };
};

export const config = getEnvVars();
export const { API_BASE_URL, CLERK_PUBLISHABLE_KEY, NODE_ENV } = config;