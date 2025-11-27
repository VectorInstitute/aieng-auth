/**
 * Error codes for authentication errors
 */
export enum AuthErrorCode {
  /** Invalid configuration provided */
  INVALID_CONFIG = 'INVALID_CONFIG',

  /** Authentication failed */
  AUTH_FAILED = 'AUTH_FAILED',

  /** Token has expired */
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  /** Token refresh failed */
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',

  /** Invalid token format */
  INVALID_TOKEN = 'INVALID_TOKEN',

  /** Network request failed */
  NETWORK_ERROR = 'NETWORK_ERROR',

  /** PKCE verification error */
  PKCE_ERROR = 'PKCE_ERROR',

  /** User information fetch failed */
  USER_FETCH_ERROR = 'USER_FETCH_ERROR',

  /** Storage operation failed */
  STORAGE_ERROR = 'STORAGE_ERROR',

  /** Invalid state parameter */
  INVALID_STATE = 'INVALID_STATE',

  /** OAuth callback error */
  CALLBACK_ERROR = 'CALLBACK_ERROR',

  /** Unknown error */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom error class for authentication errors
 */
export class AuthError extends Error {
  /**
   * Error code for programmatic handling
   */
  public readonly code: AuthErrorCode;

  /**
   * Additional error details
   */
  public readonly details?: unknown;

  /**
   * Original error if wrapped
   */
  public readonly cause?: Error;

  constructor(code: AuthErrorCode, message: string, details?: unknown, cause?: Error) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.details = details;
    this.cause = cause;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      stack: this.stack,
    };
  }

  /**
   * Create AuthError from unknown error
   */
  static from(error: unknown, code: AuthErrorCode = AuthErrorCode.UNKNOWN_ERROR): AuthError {
    if (error instanceof AuthError) {
      return error;
    }

    if (error instanceof Error) {
      return new AuthError(code, error.message, undefined, error);
    }

    return new AuthError(
      code,
      typeof error === 'string' ? error : 'An unknown error occurred',
      error
    );
  }
}

/**
 * Helper function to create specific auth errors
 */
export const createAuthError = {
  invalidConfig: (message: string, details?: unknown) =>
    new AuthError(AuthErrorCode.INVALID_CONFIG, message, details),

  authFailed: (message: string, details?: unknown) =>
    new AuthError(AuthErrorCode.AUTH_FAILED, message, details),

  tokenExpired: (message: string = 'Token has expired') =>
    new AuthError(AuthErrorCode.TOKEN_EXPIRED, message),

  tokenRefreshFailed: (message: string, cause?: Error) =>
    new AuthError(AuthErrorCode.TOKEN_REFRESH_FAILED, message, undefined, cause),

  invalidToken: (message: string, details?: unknown) =>
    new AuthError(AuthErrorCode.INVALID_TOKEN, message, details),

  networkError: (message: string, cause?: Error) =>
    new AuthError(AuthErrorCode.NETWORK_ERROR, message, undefined, cause),

  pkceError: (message: string, details?: unknown) =>
    new AuthError(AuthErrorCode.PKCE_ERROR, message, details),

  userFetchError: (message: string, cause?: Error) =>
    new AuthError(AuthErrorCode.USER_FETCH_ERROR, message, undefined, cause),

  storageError: (message: string, cause?: Error) =>
    new AuthError(AuthErrorCode.STORAGE_ERROR, message, undefined, cause),

  invalidState: (message: string) => new AuthError(AuthErrorCode.INVALID_STATE, message),

  callbackError: (message: string, details?: unknown) =>
    new AuthError(AuthErrorCode.CALLBACK_ERROR, message, details),
};
