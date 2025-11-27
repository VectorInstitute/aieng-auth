// Export types
export type { AuthConfig, PKCEChallenge } from './types/config';
export type { AuthTokens, TokenStorage, DecodedToken } from './types/token';
export type { User } from './types/user';

// Export errors
export { AuthError, AuthErrorCode, createAuthError } from './errors/auth-errors';

// Export Google OAuth client
export { GoogleOAuthClient } from './client/google-oauth-client';

// Export PKCE utilities
export { generatePKCE, verifyPKCE, generateRandomString, base64UrlEncode } from './client/pkce';

// Export token storage
export {
  MemoryTokenStorage,
  SessionStorageAdapter,
  LocalStorageAdapter,
} from './token/token-storage';

// Export token manager
export { TokenManager } from './token/token-manager';

// Export token validation utilities
export {
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  getTimeUntilExpiration,
  validateToken,
} from './token/token-validator';
