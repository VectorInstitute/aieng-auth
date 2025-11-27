import type { TokenStorage, AuthTokens } from '../types/token';
import { createAuthError } from '../errors/auth-errors';

const STORAGE_KEY = 'cyberark_auth_tokens';

/**
 * Memory-based token storage (default)
 * Most secure option - tokens lost on page refresh
 * Immune to XSS attacks as tokens never touch DOM storage
 *
 * @example
 * ```typescript
 * const storage = new MemoryTokenStorage();
 * await storage.setTokens(tokens);
 * ```
 */
export class MemoryTokenStorage implements TokenStorage {
  private tokens: AuthTokens | null = null;

  setTokens(tokens: AuthTokens): Promise<void> {
    this.tokens = { ...tokens, issuedAt: Date.now() };
    return Promise.resolve();
  }

  getTokens(): Promise<AuthTokens | null> {
    return Promise.resolve(this.tokens ? { ...this.tokens } : null);
  }

  clearTokens(): Promise<void> {
    this.tokens = null;
    return Promise.resolve();
  }
}

/**
 * SessionStorage-based token storage
 * Tokens persist during browser session (survives page refresh)
 * Vulnerable to XSS attacks - use only if UX requires persistence
 *
 * @example
 * ```typescript
 * const storage = new SessionStorageAdapter();
 * await storage.setTokens(tokens);
 * ```
 */
export class SessionStorageAdapter implements TokenStorage {
  private readonly storageKey: string;

  constructor(storageKey: string = STORAGE_KEY) {
    this.storageKey = storageKey;
    this.validateStorageAvailable();
  }

  private validateStorageAvailable(): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      throw createAuthError.storageError('SessionStorage is not available in this environment');
    }
  }

  setTokens(tokens: AuthTokens): Promise<void> {
    try {
      const tokensWithTimestamp = { ...tokens, issuedAt: Date.now() };
      const serialized = JSON.stringify(tokensWithTimestamp);
      sessionStorage.setItem(this.storageKey, serialized);
      return Promise.resolve();
    } catch (error) {
      throw createAuthError.storageError(
        'Failed to store tokens in sessionStorage',
        error instanceof Error ? error : undefined
      );
    }
  }

  async getTokens(): Promise<AuthTokens | null> {
    try {
      const serialized = sessionStorage.getItem(this.storageKey);
      if (!serialized) {
        return null;
      }
      return JSON.parse(serialized) as AuthTokens;
    } catch (error) {
      console.error('Failed to retrieve tokens from sessionStorage:', error);
      // Clear corrupted data
      await this.clearTokens();
      return null;
    }
  }

  clearTokens(): Promise<void> {
    try {
      sessionStorage.removeItem(this.storageKey);
      return Promise.resolve();
    } catch (error) {
      throw createAuthError.storageError(
        'Failed to clear tokens from sessionStorage',
        error instanceof Error ? error : undefined
      );
    }
  }
}

/**
 * LocalStorage-based token storage
 * Tokens persist across browser sessions (survives browser restart)
 * Least secure - vulnerable to XSS and persists indefinitely
 * Use only when absolutely necessary
 *
 * @example
 * ```typescript
 * const storage = new LocalStorageAdapter();
 * await storage.setTokens(tokens);
 * ```
 */
export class LocalStorageAdapter implements TokenStorage {
  private readonly storageKey: string;

  constructor(storageKey: string = STORAGE_KEY) {
    this.storageKey = storageKey;
    this.validateStorageAvailable();
  }

  private validateStorageAvailable(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw createAuthError.storageError('LocalStorage is not available in this environment');
    }
  }

  setTokens(tokens: AuthTokens): Promise<void> {
    try {
      const tokensWithTimestamp = { ...tokens, issuedAt: Date.now() };
      const serialized = JSON.stringify(tokensWithTimestamp);
      localStorage.setItem(this.storageKey, serialized);
      return Promise.resolve();
    } catch (error) {
      throw createAuthError.storageError(
        'Failed to store tokens in localStorage',
        error instanceof Error ? error : undefined
      );
    }
  }

  async getTokens(): Promise<AuthTokens | null> {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (!serialized) {
        return null;
      }
      return JSON.parse(serialized) as AuthTokens;
    } catch (error) {
      console.error('Failed to retrieve tokens from localStorage:', error);
      // Clear corrupted data
      await this.clearTokens();
      return null;
    }
  }

  clearTokens(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);
      return Promise.resolve();
    } catch (error) {
      throw createAuthError.storageError(
        'Failed to clear tokens from localStorage',
        error instanceof Error ? error : undefined
      );
    }
  }
}
