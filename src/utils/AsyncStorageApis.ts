import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'authTokens';
const COGNITO_TOKENS_KEY = 'cognitoTokens';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface CognitoTokens {
  access_token?: string;
  id_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  expires_at?: number; // Timestamp when token expires
}

export const storeTokenSecurely = async (tokens: Tokens): Promise<void> => {
  try {
    const tokenString = JSON.stringify(tokens);
    await AsyncStorage.setItem(TOKEN_KEY, tokenString);
    console.log('[OK] => Tokens stored securely');
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

export const retrieveTokenSecurely = async (): Promise<Tokens | null> => {
  try {
    const tokenString = await AsyncStorage.getItem(TOKEN_KEY);
    console.log('[OK] => Tokens retrieved securely');
    return tokenString ? JSON.parse(tokenString) : null;
  } catch (error) {
    console.error('Error retrieving tokens:', error);
    return null;
  }
};

export const removeTokenSecurely = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    console.log('[OK] => Tokens removed securely');
  } catch (error) {
    console.error('Error removing tokens:', error);
  }
};

// Cognito Token Storage Functions
export const storeCognitoTokens = async (tokens: CognitoTokens): Promise<void> => {
  try {
    // Add expiration timestamp
    const tokensWithExpiry = {
      ...tokens,
      expires_at: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : undefined
    };
    
    console.log('🔐 [STORING TOKENS] =>', {
      access_token: tokens.access_token ? `${tokens.access_token.substring(0, 20)}...` : 'none',
      id_token: tokens.id_token ? `${tokens.id_token.substring(0, 20)}...` : 'none',
      refresh_token: tokens.refresh_token ? `${tokens.refresh_token.substring(0, 20)}...` : 'none',
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      expires_at: tokensWithExpiry.expires_at,
      timestamp: new Date().toISOString()
    });
    
    const tokenString = JSON.stringify(tokensWithExpiry);
    await AsyncStorage.setItem(COGNITO_TOKENS_KEY, tokenString);
    console.log('✅ [OK] => Cognito tokens stored securely');
  } catch (error) {
    console.error('❌ [ERROR] => Error storing Cognito tokens:', error);
  }
};

export const retrieveCognitoTokens = async (): Promise<CognitoTokens | null> => {
  try {
    console.log('🔍 [RETRIEVING TOKENS] => Checking AsyncStorage...');
    const tokenString = await AsyncStorage.getItem(COGNITO_TOKENS_KEY);
    if (!tokenString) {
      console.log('❌ [NO TOKENS] => No tokens found in storage');
      return null;
    }
    
    const tokens: CognitoTokens = JSON.parse(tokenString);
    
    // Check if tokens are expired
    if (tokens.expires_at && Date.now() > tokens.expires_at) {
      console.log('⏰ [EXPIRED TOKENS] => Tokens expired, removing...', {
        expires_at: new Date(tokens.expires_at).toISOString(),
        current_time: new Date().toISOString()
      });
      await removeCognitoTokens();
      return null;
    }
    
    console.log('✅ [TOKENS RETRIEVED] =>', {
      access_token: tokens.access_token ? `${tokens.access_token.substring(0, 20)}...` : 'none',
      id_token: tokens.id_token ? `${tokens.id_token.substring(0, 20)}...` : 'none',
      refresh_token: tokens.refresh_token ? `${tokens.refresh_token.substring(0, 20)}...` : 'none',
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      expires_at: tokens.expires_at ? new Date(tokens.expires_at).toISOString() : 'none',
      timestamp: new Date().toISOString()
    });
    return tokens;
  } catch (error) {
    console.error('❌ [ERROR] => Error retrieving Cognito tokens:', error);
    return null;
  }
};

export const removeCognitoTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(COGNITO_TOKENS_KEY);
    console.log('[OK] => Cognito tokens removed securely');
  } catch (error) {
    console.error('Error removing Cognito tokens:', error);
  }
};

export const isTokenValid = (tokens: CognitoTokens | null): boolean => {
  if (!tokens || !tokens.access_token) return false;
  
  if (tokens.expires_at) {
    return Date.now() < tokens.expires_at;
  }
  
  // If no expiry info, assume valid (shouldn't happen but safe fallback)
  return true;
};