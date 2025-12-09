import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto";
import * as AppleAuthentication from "expo-apple-authentication";
import { makeRedirectUri } from "expo-auth-session";
import config from "../config.json";

export interface AuthTokens {
  id_token?: string;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

export interface AuthError extends Error {
  code?: string;
  details?: string;
}

WebBrowser.maybeCompleteAuthSession();

const generatePKCE = async () => {
  const codeVerifier = Crypto.getRandomBytes(32).toString();
  const codeChallenge = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    codeVerifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  const codeChallengeFormatted = codeChallenge
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  
  return { codeVerifier, codeChallenge: codeChallengeFormatted };
};

let pkceVerifier: string | null = null;

// Mock authentication for development
const createMockTokens = async (provider: string): Promise<AuthTokens> => {
  const mockTokens: AuthTokens = {
    access_token: `mock_access_token_${provider}_${Date.now()}`,
    id_token: `mock_id_token_${provider}_${Date.now()}`,
    refresh_token: `mock_refresh_token_${provider}_${Date.now()}`,
    token_type: "Bearer",
    expires_in: 3600
  };

  // Store mock tokens
  await AsyncStorage.setItem("idToken", mockTokens.id_token || "");
  await AsyncStorage.setItem("accessToken", mockTokens.access_token || "");
  await AsyncStorage.setItem("refreshToken", mockTokens.refresh_token || "");

  return mockTokens;
};

export const signInWithGoogle = async (): Promise<AuthTokens> => {
  // Check if in mock mode for local testing
  if (config.mockMode) {
    console.log("🚀 Mock Google Sign In - simulating successful authentication");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return createMockTokens("google");
  }

  try {
    const { codeVerifier, codeChallenge } = await generatePKCE();
    pkceVerifier = codeVerifier;
    
    const redirectUri = makeRedirectUri({
      scheme: 'pocketcoach',
      path: 'callback'
    });
    
    const cognitoAuthUrl = `https://${config.cognitoDomain}/oauth2/authorize`;
    const params = new URLSearchParams({
      identity_provider: "Google",
      redirect_uri: redirectUri,
      response_type: "code",
      client_id: config.clientId,
      scope: "openid email profile",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });
    
    const authUrl = `${cognitoAuthUrl}?${params.toString()}`;
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    
    if (result.type === "success" && result.url) {
      const url = new URL(result.url);
      const code = url.searchParams.get("code");
      
      if (code) {
        return await handleOAuthCallback(code);
      }
    }
    
    throw new Error("Authentication was cancelled or failed");
  } catch (error: any) {
    console.error("Error with Google sign in:", error);
    const authError: AuthError = new Error(error.message || "Google sign in failed");
    authError.code = error.code;
    throw authError;
  }
};

export const signInWithFacebook = async (): Promise<AuthTokens> => {
  // Check if in mock mode for local testing
  if (config.mockMode) {
    console.log("🚀 Mock Facebook Sign In - simulating successful authentication");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return createMockTokens("facebook");
  }

  try {
    const { codeVerifier, codeChallenge } = await generatePKCE();
    pkceVerifier = codeVerifier;
    
    const redirectUri = makeRedirectUri({
      scheme: 'pocketcoach',
      path: 'callback'
    });
    
    const cognitoAuthUrl = `https://${config.cognitoDomain}/oauth2/authorize`;
    const params = new URLSearchParams({
      identity_provider: "Facebook",
      redirect_uri: redirectUri,
      response_type: "code",
      client_id: config.clientId,
      scope: "openid email profile",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });
    
    const authUrl = `${cognitoAuthUrl}?${params.toString()}`;
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    
    if (result.type === "success" && result.url) {
      const url = new URL(result.url);
      const code = url.searchParams.get("code");
      
      if (code) {
        return await handleOAuthCallback(code);
      }
    }
    
    throw new Error("Authentication was cancelled or failed");
  } catch (error: any) {
    console.error("Error with Facebook sign in:", error);
    const authError: AuthError = new Error(error.message || "Facebook sign in failed");
    authError.code = error.code;
    throw authError;
  }
};

export const signInWithApple = async (): Promise<AuthTokens> => {
  // Check if in mock mode for local testing
  if (config.mockMode) {
    console.log("🚀 Mock Apple Sign In - simulating successful authentication");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return createMockTokens("apple");
  }

  try {
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    
    if (!isAvailable) {
      throw new Error("Apple Authentication is not available on this device");
    }
    
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    
    const { codeVerifier, codeChallenge } = await generatePKCE();
    pkceVerifier = codeVerifier;
    
    const redirectUri = makeRedirectUri({
      scheme: 'pocketcoach',
      path: 'callback'
    });
    
    const cognitoAuthUrl = `https://${config.cognitoDomain}/oauth2/authorize`;
    const params = new URLSearchParams({
      identity_provider: "SignInWithApple",
      redirect_uri: redirectUri,
      response_type: "code",
      client_id: config.clientId,
      scope: "openid email profile",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });
    
    const authUrl = `${cognitoAuthUrl}?${params.toString()}`;
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    
    if (result.type === "success" && result.url) {
      const url = new URL(result.url);
      const code = url.searchParams.get("code");
      
      if (code) {
        return await handleOAuthCallback(code);
      }
    }
    
    throw new Error("Authentication was cancelled or failed");
  } catch (error: any) {
    if (error.code === "ERR_REQUEST_CANCELED") {
      throw new Error("Apple sign in was cancelled");
    }
    console.error("Error with Apple sign in:", error);
    const authError: AuthError = new Error(error.message || "Apple sign in failed");
    authError.code = error.code;
    throw authError;
  }
};

export const handleOAuthCallback = async (code: string): Promise<AuthTokens> => {
  const cognitoTokenUrl = `https://${config.cognitoDomain}/oauth2/token`;
  
  const redirectUri = makeRedirectUri({
    scheme: 'pocketcoach',
    path: 'callback'
  });
  
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    code: code,
    redirect_uri: redirectUri,
    code_verifier: pkceVerifier || "",
  });
  
  try {
    const response = await fetch(cognitoTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Token exchange failed:", errorData);
      throw new Error(errorData.error || "Failed to exchange code for tokens");
    }
    
    const tokens: AuthTokens = await response.json();
    
    await AsyncStorage.setItem("idToken", tokens.id_token || "");
    await AsyncStorage.setItem("accessToken", tokens.access_token || "");
    await AsyncStorage.setItem("refreshToken", tokens.refresh_token || "");
    
    pkceVerifier = null;
    
    return tokens;
  } catch (error: any) {
    console.error("Error exchanging code for tokens: ", error);
    throw new Error(error.message || "Failed to complete authentication");
  }
};

export const signIn = async (email: string, password: string): Promise<void> => {
  // TODO: Implement traditional email/password sign in with AWS Cognito
  // This would use AWS SDK's InitiateAuthCommand with USER_PASSWORD_AUTH flow
  throw new Error("Traditional sign in not yet implemented - please use social sign in");
};

export const signUp = async (email: string, password: string): Promise<void> => {
  // TODO: Implement traditional email/password sign up with AWS Cognito
  // This would use AWS SDK's SignUpCommand
  throw new Error("Traditional sign up not yet implemented - please use social sign in");
};

export const confirmSignUp = async (username: string, code: string): Promise<boolean> => {
  // TODO: Implement email confirmation with AWS Cognito
  // This would use AWS SDK's ConfirmSignUpCommand
  throw new Error("Email confirmation not yet implemented");
};

export const signOut = async (): Promise<void> => {
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  
  if (refreshToken) {
    const cognitoRevokeUrl = `https://${config.cognitoDomain}/oauth2/revoke`;
    
    const params = new URLSearchParams({
      token: refreshToken,
      client_id: config.clientId,
    });
    
    try {
      const response = await fetch(cognitoRevokeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
      
      if (!response.ok) {
        console.error("Token revocation failed, but continuing with local logout");
      }
    } catch (error) {
      console.error("Error revoking token:", error);
    }
  }
  
  await AsyncStorage.clear();
};

export const getStoredTokens = async (): Promise<{
  idToken: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}> => {
  const idToken = await AsyncStorage.getItem("idToken");
  const accessToken = await AsyncStorage.getItem("accessToken");
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  
  return { idToken, accessToken, refreshToken };
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    const currentTime = Math.floor(Date.now() / 1000);
    
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const refreshAccessToken = async (): Promise<AuthTokens> => {
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }
  
  const cognitoTokenUrl = `https://${config.cognitoDomain}/oauth2/token`;
  
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: config.clientId,
    refresh_token: refreshToken,
  });
  
  try {
    const response = await fetch(cognitoTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to refresh token");
    }
    
    const tokens: AuthTokens = await response.json();
    
    await AsyncStorage.setItem("accessToken", tokens.access_token || "");
    if (tokens.id_token) {
      await AsyncStorage.setItem("idToken", tokens.id_token);
    }
    
    return tokens;
  } catch (error: any) {
    console.error("Error refreshing token:", error);
    await AsyncStorage.clear();
    throw error;
  }
};

export const getValidAccessToken = async (): Promise<string> => {
  const accessToken = await AsyncStorage.getItem("accessToken");
  
  if (!accessToken) {
    throw new Error("No access token available");
  }
  
  if (isTokenExpired(accessToken)) {
    const refreshedTokens = await refreshAccessToken();
    return refreshedTokens.access_token || "";
  }
  
  return accessToken;
};