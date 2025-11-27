import type { TokenStorage } from './token';
import type { AuthTokens } from './token';
import type { AuthError } from '../errors/auth-errors';

/**
 * Configuration options for Google OAuth authentication
 */
export interface AuthConfig {
  /**
   * Google OAuth client ID from Google Cloud Console
   * @example '123456789-abcdefg.apps.googleusercontent.com'
   */
  clientId: string;

  /**
   * Google OAuth client secret from Google Cloud Console
   * Note: For public SPAs, this isn't truly "secret" but Google requires it
   * @example 'GOCSPX-xxxxxxxxxxxxxxxxx'
   */
  clientSecret: string;

  /**
   * Redirect URI for OAuth callback
   * Must be registered in Google Cloud Console as authorized redirect URI
   * @example 'http://localhost:3000/callback'
   */
  redirectUri: string;

  /**
   * Redirect URI after logout
   * @default redirectUri or '/'
   */
  postLogoutRedirectUri?: string;

  /**
   * OAuth scopes to request
   * @default ['openid', 'profile', 'email']
   */
  scopes?: string[];

  /**
   * Allowed email domains for access control
   * If specified, only users with these domains can authenticate
   * @example ['vectorinstitute.ai']
   */
  allowedDomains?: string[];

  /**
   * Token storage strategy
   * @default MemoryTokenStorage
   */
  tokenStorage?: TokenStorage;

  /**
   * Enable automatic token refresh
   * @default true
   */
  autoRefresh?: boolean;

  /**
   * Buffer time in seconds before token expiry to trigger refresh
   * @default 300 (5 minutes)
   */
  refreshBufferSeconds?: number;

  /**
   * Callback invoked when tokens are successfully refreshed
   */
  onTokenRefresh?: (tokens: AuthTokens) => void;

  /**
   * Callback invoked when token refresh fails
   */
  onTokenRefreshError?: (error: AuthError) => void;

  /**
   * Callback invoked when user logs out
   */
  onLogout?: () => void;

  /**
   * Custom headers to include in OAuth requests
   */
  customHeaders?: Record<string, string>;

  /**
   * Request timeout in milliseconds
   * @default 30000 (30 seconds)
   */
  timeout?: number;
}

/**
 * PKCE (Proof Key for Code Exchange) challenge
 */
export interface PKCEChallenge {
  /**
   * Code verifier - random string
   */
  verifier: string;

  /**
   * Code challenge - SHA-256 hash of verifier
   */
  challenge: string;

  /**
   * Challenge method (always S256 for security)
   */
  method: 'S256';
}
