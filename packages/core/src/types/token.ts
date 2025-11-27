/**
 * OAuth tokens returned by CyberArk
 */
export interface AuthTokens {
  /**
   * Access token for API requests
   */
  accessToken: string;

  /**
   * Refresh token to obtain new access tokens
   */
  refreshToken?: string;

  /**
   * ID token containing user identity claims (OIDC)
   */
  idToken?: string;

  /**
   * Token type (typically 'Bearer')
   */
  tokenType: string;

  /**
   * Token expiration time in seconds
   */
  expiresIn: number;

  /**
   * Scopes granted with the token
   */
  scope?: string;

  /**
   * Timestamp when tokens were issued
   */
  issuedAt?: number;
}

/**
 * Interface for token storage implementations
 */
export interface TokenStorage {
  /**
   * Store authentication tokens
   */
  setTokens(tokens: AuthTokens): Promise<void>;

  /**
   * Retrieve stored tokens
   */
  getTokens(): Promise<AuthTokens | null>;

  /**
   * Clear all stored tokens
   */
  clearTokens(): Promise<void>;
}

/**
 * Decoded JWT token payload
 */
export interface DecodedToken {
  /**
   * Issuer
   */
  iss: string;

  /**
   * Subject (user ID)
   */
  sub: string;

  /**
   * Audience
   */
  aud: string | string[];

  /**
   * Expiration time (Unix timestamp)
   */
  exp: number;

  /**
   * Issued at (Unix timestamp)
   */
  iat: number;

  /**
   * Not before (Unix timestamp)
   */
  nbf?: number;

  /**
   * JWT ID
   */
  jti?: string;

  /**
   * Additional claims
   */
  [key: string]: unknown;
}
