import type { TokenStorage, AuthTokens } from '../types/token';
import { isTokenExpired, getTimeUntilExpiration } from './token-validator';
import { MemoryTokenStorage } from './token-storage';

/**
 * TokenManager handles token lifecycle and validation
 */
export class TokenManager {
  private storage: TokenStorage;

  constructor(storage?: TokenStorage) {
    this.storage = storage || new MemoryTokenStorage();
  }

  /**
   * Store authentication tokens
   * @param tokens Tokens to store
   */
  async setTokens(tokens: AuthTokens): Promise<void> {
    await this.storage.setTokens(tokens);
  }

  /**
   * Retrieve stored tokens
   * @returns Stored tokens or null if none exist
   */
  async getTokens(): Promise<AuthTokens | null> {
    return this.storage.getTokens();
  }

  /**
   * Clear all stored tokens
   */
  async clearTokens(): Promise<void> {
    await this.storage.clearTokens();
  }

  /**
   * Get the access token
   * @returns Access token or null
   */
  async getAccessToken(): Promise<string | null> {
    const tokens = await this.getTokens();
    return tokens?.accessToken || null;
  }

  /**
   * Get the refresh token
   * @returns Refresh token or null
   */
  async getRefreshToken(): Promise<string | null> {
    const tokens = await this.getTokens();
    return tokens?.refreshToken || null;
  }

  /**
   * Get the ID token
   * @returns ID token or null
   */
  async getIdToken(): Promise<string | null> {
    const tokens = await this.getTokens();
    return tokens?.idToken || null;
  }

  /**
   * Check if access token is valid (exists and not expired)
   * @param bufferSeconds Buffer time before expiry to consider invalid
   * @returns True if valid, false otherwise
   */
  async isTokenValid(bufferSeconds?: number): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) {
      return false;
    }
    return !isTokenExpired(token, bufferSeconds);
  }

  /**
   * Check if we have stored tokens
   * @returns True if tokens exist, false otherwise
   */
  async hasTokens(): Promise<boolean> {
    const tokens = await this.getTokens();
    return tokens !== null && !!tokens.accessToken;
  }

  /**
   * Get time until access token expiration
   * @returns Seconds until expiration, or 0 if expired/invalid
   */
  async getTimeUntilExpiration(): Promise<number> {
    const token = await this.getAccessToken();
    if (!token) {
      return 0;
    }
    return getTimeUntilExpiration(token);
  }

  /**
   * Check if token should be refreshed based on buffer time
   * @param bufferSeconds Time before expiry to trigger refresh
   * @returns True if should refresh, false otherwise
   */
  async shouldRefresh(bufferSeconds: number = 300): Promise<boolean> {
    const timeRemaining = await this.getTimeUntilExpiration();
    return timeRemaining > 0 && timeRemaining <= bufferSeconds;
  }
}
