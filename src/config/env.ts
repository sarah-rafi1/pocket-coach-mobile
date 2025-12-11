// Environment configuration for the app

interface Config {
  API_BASE_URL: string;
}

// Get environment variables
const getEnvVars = (): Config => {
  // For now, we'll use environment variable or fallback to the ngrok URL
  // In production, this should come from your build process or app config
  const API_BASE_URL = process.env.API_BASE_URL || 'https://70787c67a511.ngrok-free.app';

  return {
    API_BASE_URL,
  };
};

export const config = getEnvVars();
export const { API_BASE_URL } = config;