import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto";
import * as AppleAuthentication from "expo-apple-authentication";
import { makeRedirectUri } from "expo-auth-session";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import config from "../config.json";
import { storeCognitoTokens, retrieveCognitoTokens, removeCognitoTokens, isTokenValid, CognitoTokens } from "../utils/AsyncStorageApis";
import { cleanErrorMessage } from "../utils/errorUtils";

// Note: crypto polyfill is handled by react-native-get-random-values in index.ts

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

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: config.region,
});

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

  // Store tokens using new Cognito token storage
  await storeCognitoTokens(mockTokens);

  return mockTokens;
};

export const signInWithGoogle = async (isSignUp: boolean = false): Promise<AuthTokens> => {
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
    
    console.log("🔗 Redirect URI:", redirectUri);
    
    // Always go directly to Google (not Cognito UI)
    const cognitoAuthUrl = `https://${config.cognitoDomain}/oauth2/authorize`;
    
    const params = new URLSearchParams({
      identity_provider: "Google",
      redirect_uri: redirectUri,
      response_type: "code",
      client_id: config.clientId,
      scope: "openid email phone",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });
    
    // Google will handle both new and existing users automatically
    
    const authUrl = `${cognitoAuthUrl}?${params.toString()}`;
    console.log("🚀 Opening auth URL:", authUrl);
    
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    
    console.log("📱 WebBrowser result:", result);
    
    if (result.type === "success" && result.url) {
      const url = new URL(result.url);
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");
      
      console.log("✅ Success URL:", result.url);
      console.log("🔑 Authorization code:", code);
      console.log("❌ Error in URL:", error);
      
      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }
      
      if (code) {
        return await handleOAuthCallback(code);
      }
    }
    
    console.log("❌ Authentication failed - result type:", result.type);
    throw new Error("Authentication was cancelled or failed");
  } catch (error: any) {
    console.error("Error with Google sign in:", error);
    const authError: AuthError = new Error(error.message || "Google sign in failed");
    authError.code = error.code;
    throw authError;
  }
};

export const signUpWithGoogle = async (): Promise<AuthTokens> => {
  return signInWithGoogle(true);
};

export const signInWithFacebook = async (isSignUp: boolean = false): Promise<AuthTokens> => {
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
    
    // Use different URLs for sign-in vs sign-up
    const cognitoAuthUrl = isSignUp 
      ? `https://${config.cognitoDomain}/signup`
      : `https://${config.cognitoDomain}/oauth2/authorize`;
    
    const params = new URLSearchParams({
      redirect_uri: redirectUri,
      response_type: "code",
      client_id: config.clientId,
      scope: "openid email phone",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });
    
    // For sign-up, we want to show the Cognito UI with Facebook option
    // For sign-in, we can go directly to Facebook or show Cognito UI
    if (!isSignUp) {
      // params.set("identity_provider", "Facebook"); // Uncomment for direct Facebook
    }
    
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

export const signUpWithFacebook = async (): Promise<AuthTokens> => {
  return signInWithFacebook(true);
};

export const signInWithApple = async (isSignUp: boolean = false): Promise<AuthTokens> => {
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
    
    // Use different URLs for sign-in vs sign-up
    const cognitoAuthUrl = isSignUp 
      ? `https://${config.cognitoDomain}/signup`
      : `https://${config.cognitoDomain}/oauth2/authorize`;
    
    const params = new URLSearchParams({
      redirect_uri: redirectUri,
      response_type: "code",
      client_id: config.clientId,
      scope: "openid email phone",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });
    
    // For sign-up, we want to show the Cognito UI with Apple option
    // For sign-in, we can go directly to Apple or show Cognito UI
    if (!isSignUp) {
      // params.set("identity_provider", "SignInWithApple"); // Uncomment for direct Apple
    }
    
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

export const signUpWithApple = async (): Promise<AuthTokens> => {
  return signInWithApple(true);
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

export const signIn = async (email: string, password: string): Promise<AuthTokens> => {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: config.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    console.log('🔐 [COGNITO AUTH] => InitiateAuthCommand sent');
    const response = await cognitoClient.send(command);

    if (response.AuthenticationResult) {
      console.log('✅ [COGNITO SUCCESS] => Authentication successful');
      const tokens: AuthTokens = {
        access_token: response.AuthenticationResult.AccessToken,
        id_token: response.AuthenticationResult.IdToken,
        refresh_token: response.AuthenticationResult.RefreshToken,
        token_type: "Bearer",
        expires_in: response.AuthenticationResult.ExpiresIn,
      };

      console.log('💾 [STORING TOKENS] => About to store Cognito tokens...');
      // Store tokens using new Cognito token storage
      await storeCognitoTokens(tokens);

      return tokens;
    } else {
      throw new Error("Authentication failed - no tokens received");
    }
  } catch (error: any) {
    console.error("Error signing in:", error);
    
    // Use the error cleaning utility to provide user-friendly messages
    const cleanMessage = cleanErrorMessage(error);
    throw new Error(cleanMessage);
  }
};

export const signUp = async (email: string, password: string): Promise<{ userSub: string; emailSent: boolean; tokens?: AuthTokens }> => {
  try {
    const command = new SignUpCommand({
      ClientId: config.clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
      ],
    });

    console.log('🔐 [COGNITO SIGNUP] => SignUpCommand sent');
    const response = await cognitoClient.send(command);
    
    console.log('📧 [SIGNUP RESULT] =>', {
      userSub: response.UserSub,
      userConfirmed: response.UserConfirmed,
      timestamp: new Date().toISOString()
    });
    
    // If user is auto-confirmed (no email verification needed), sign them in immediately
    if (response.UserConfirmed) {
      console.log('✅ [AUTO-CONFIRMED] => User auto-confirmed, attempting auto sign-in...');
      try {
        const tokens = await signIn(email, password);
        console.log('🎉 [AUTO SIGN-IN SUCCESS] => User signed in after signup');
        return {
          userSub: response.UserSub || "",
          emailSent: false,
          tokens: tokens,
        };
      } catch (signInError) {
        console.warn("❌ [AUTO SIGN-IN FAILED] => Auto sign-in after signup failed:", signInError);
        // Fall back to normal flow without tokens
        return {
          userSub: response.UserSub || "",
          emailSent: false,
        };
      }
    }
    
    // User needs email verification
    console.log('📧 [EMAIL VERIFICATION] => User needs to verify email');
    return {
      userSub: response.UserSub || "",
      emailSent: true, // Email verification was sent
    };
  } catch (error: any) {
    console.error("Error signing up:", error);
    
    // Use the error cleaning utility to provide user-friendly messages
    const cleanMessage = cleanErrorMessage(error);
    throw new Error(cleanMessage);
  }
};

export const confirmSignUp = async (username: string, code: string, password?: string): Promise<{ confirmed: boolean; tokens?: AuthTokens }> => {
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: config.clientId,
      Username: username,
      ConfirmationCode: code,
    });

    console.log('🔐 [COGNITO CONFIRM] => ConfirmSignUpCommand sent');
    await cognitoClient.send(command);
    console.log('✅ [EMAIL CONFIRMED] => Email verification successful');
    
    // If password is provided, automatically sign in the user after confirmation
    if (password) {
      console.log('🔑 [AUTO SIGN-IN] => Attempting auto sign-in after email confirmation...');
      try {
        const tokens = await signIn(username, password);
        console.log('🎉 [AUTO SIGN-IN SUCCESS] => User signed in after email confirmation');
        return {
          confirmed: true,
          tokens: tokens,
        };
      } catch (signInError) {
        console.warn("❌ [AUTO SIGN-IN FAILED] => Auto sign-in after confirmation failed:", signInError);
        // Confirmation was successful, but auto sign-in failed
        return {
          confirmed: true,
        };
      }
    }
    
    console.log('📧 [CONFIRMATION ONLY] => Email confirmed, no auto sign-in requested');
    return {
      confirmed: true,
    };
  } catch (error: any) {
    console.error("Error confirming sign up:", error);
    
    // Use the error cleaning utility to provide user-friendly messages
    const cleanMessage = cleanErrorMessage(error);
    throw new Error(cleanMessage);
  }
};

export const resendConfirmationCode = async (username: string): Promise<void> => {
  try {
    const command = new ResendConfirmationCodeCommand({
      ClientId: config.clientId,
      Username: username,
    });

    await cognitoClient.send(command);
  } catch (error: any) {
    console.error("Error resending confirmation code:", error);
    
    // Use the error cleaning utility to provide user-friendly messages
    const cleanMessage = cleanErrorMessage(error);
    throw new Error(cleanMessage);
  }
};

export const signOut = async (): Promise<void> => {
  // Get refresh token from both storage locations
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  const cognitoTokens = await retrieveCognitoTokens();
  const cognitoRefreshToken = cognitoTokens?.refresh_token;
  
  // Revoke Cognito refresh token if available
  const tokenToRevoke = cognitoRefreshToken || refreshToken;
  if (tokenToRevoke) {
    const cognitoRevokeUrl = `https://${config.cognitoDomain}/oauth2/revoke`;
    
    const params = new URLSearchParams({
      token: tokenToRevoke,
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
  
  // Clear Google session in WebBrowser by opening logout URL
  try {
    const logoutUrl = `https://${config.cognitoDomain}/logout?client_id=${config.clientId}&logout_uri=${encodeURIComponent('pocketcoach://logout')}`;
    console.log('🚪 [COGNITO LOGOUT URL] =>', logoutUrl);
    
    await WebBrowser.openAuthSessionAsync(logoutUrl, 'pocketcoach://logout');
    console.log('🚪 [COGNITO LOGOUT] => Opened logout URL successfully');
  } catch (error) {
    console.log('⚠️ [COGNITO LOGOUT] => Error opening logout URL:', error);
    // Continue with logout even if this fails
  }
  
  // Clear all local storage
  await AsyncStorage.clear();
  await removeCognitoTokens();
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

// New Cognito token utility functions
export const getCurrentCognitoTokens = async (): Promise<CognitoTokens | null> => {
  return await retrieveCognitoTokens();
};

export const isCognitoAuthenticated = async (): Promise<boolean> => {
  const tokens = await retrieveCognitoTokens();
  return isTokenValid(tokens);
};

export const clearAllTokens = async (): Promise<void> => {
  await removeCognitoTokens();
  await AsyncStorage.multiRemove(['idToken', 'accessToken', 'refreshToken']);
};

export const getAccessTokenForApi = async (): Promise<string | null> => {
  const tokens = await retrieveCognitoTokens();
  if (tokens && isTokenValid(tokens)) {
    return tokens.access_token || null;
  }
  return null;
};