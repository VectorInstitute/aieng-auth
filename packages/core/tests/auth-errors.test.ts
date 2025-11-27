import { AuthError, AuthErrorCode, createAuthError } from '../src/errors/auth-errors';

describe('AuthError', () => {
  describe('constructor', () => {
    it('should create error with code and message', () => {
      const error = new AuthError(AuthErrorCode.AUTH_FAILED, 'Authentication failed');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AuthError);
      expect(error.name).toBe('AuthError');
      expect(error.code).toBe(AuthErrorCode.AUTH_FAILED);
      expect(error.message).toBe('Authentication failed');
    });

    it('should include details when provided', () => {
      const details = { reason: 'invalid credentials' };
      const error = new AuthError(AuthErrorCode.AUTH_FAILED, 'Auth failed', details);
      expect(error.details).toEqual(details);
    });

    it('should include cause when provided', () => {
      const cause = new Error('Network error');
      const error = new AuthError(
        AuthErrorCode.NETWORK_ERROR,
        'Failed to connect',
        undefined,
        cause
      );
      expect(error.cause).toBe(cause);
    });

    it('should have stack trace', () => {
      const error = new AuthError(AuthErrorCode.AUTH_FAILED, 'Test error');
      expect(error.stack).toBeDefined();
    });
  });

  describe('toJSON', () => {
    it('should serialize error to JSON', () => {
      const error = new AuthError(AuthErrorCode.AUTH_FAILED, 'Auth failed', { detail: 'test' });
      const json = error.toJSON();

      expect(json).toEqual({
        name: 'AuthError',
        code: AuthErrorCode.AUTH_FAILED,
        message: 'Auth failed',
        details: { detail: 'test' },
        stack: error.stack,
      });
    });
  });

  describe('AuthError.from', () => {
    it('should return same error if already AuthError', () => {
      const originalError = new AuthError(AuthErrorCode.AUTH_FAILED, 'Test error');
      const error = AuthError.from(originalError);
      expect(error).toBe(originalError);
    });

    it('should wrap Error instance', () => {
      const originalError = new Error('Network failed');
      const error = AuthError.from(originalError, AuthErrorCode.NETWORK_ERROR);
      expect(error).toBeInstanceOf(AuthError);
      expect(error.code).toBe(AuthErrorCode.NETWORK_ERROR);
      expect(error.message).toBe('Network failed');
      expect(error.cause).toBe(originalError);
    });

    it('should convert string to AuthError', () => {
      const error = AuthError.from('Something went wrong', AuthErrorCode.UNKNOWN_ERROR);
      expect(error).toBeInstanceOf(AuthError);
      expect(error.code).toBe(AuthErrorCode.UNKNOWN_ERROR);
      expect(error.message).toBe('Something went wrong');
    });

    it('should handle unknown error types', () => {
      const error = AuthError.from({ unexpected: 'data' }, AuthErrorCode.UNKNOWN_ERROR);
      expect(error).toBeInstanceOf(AuthError);
      expect(error.code).toBe(AuthErrorCode.UNKNOWN_ERROR);
      expect(error.message).toBe('An unknown error occurred');
      expect(error.details).toEqual({ unexpected: 'data' });
    });

    it('should use UNKNOWN_ERROR as default code', () => {
      const error = AuthError.from(new Error('Test'));
      expect(error.code).toBe(AuthErrorCode.UNKNOWN_ERROR);
    });
  });

  describe('createAuthError helpers', () => {
    it('should create invalidConfig error', () => {
      const details = { field: 'clientId' };
      const error = createAuthError.invalidConfig('Missing client ID', details);
      expect(error.code).toBe(AuthErrorCode.INVALID_CONFIG);
      expect(error.message).toBe('Missing client ID');
      expect(error.details).toEqual(details);
    });

    it('should create authFailed error', () => {
      const error = createAuthError.authFailed('Login failed');
      expect(error.code).toBe(AuthErrorCode.AUTH_FAILED);
      expect(error.message).toBe('Login failed');
    });

    it('should create tokenExpired error with default message', () => {
      const error = createAuthError.tokenExpired();
      expect(error.code).toBe(AuthErrorCode.TOKEN_EXPIRED);
      expect(error.message).toBe('Token has expired');
    });

    it('should create tokenExpired error with custom message', () => {
      const error = createAuthError.tokenExpired('Access token expired');
      expect(error.code).toBe(AuthErrorCode.TOKEN_EXPIRED);
      expect(error.message).toBe('Access token expired');
    });

    it('should create tokenRefreshFailed error', () => {
      const cause = new Error('Refresh failed');
      const error = createAuthError.tokenRefreshFailed('Cannot refresh token', cause);
      expect(error.code).toBe(AuthErrorCode.TOKEN_REFRESH_FAILED);
      expect(error.message).toBe('Cannot refresh token');
      expect(error.cause).toBe(cause);
    });

    it('should create invalidToken error', () => {
      const error = createAuthError.invalidToken('Malformed token');
      expect(error.code).toBe(AuthErrorCode.INVALID_TOKEN);
      expect(error.message).toBe('Malformed token');
    });

    it('should create networkError', () => {
      const cause = new Error('Connection timeout');
      const error = createAuthError.networkError('Network request failed', cause);
      expect(error.code).toBe(AuthErrorCode.NETWORK_ERROR);
      expect(error.message).toBe('Network request failed');
      expect(error.cause).toBe(cause);
    });

    it('should create pkceError', () => {
      const error = createAuthError.pkceError('Invalid verifier');
      expect(error.code).toBe(AuthErrorCode.PKCE_ERROR);
      expect(error.message).toBe('Invalid verifier');
    });

    it('should create userFetchError', () => {
      const cause = new Error('API error');
      const error = createAuthError.userFetchError('Failed to get user', cause);
      expect(error.code).toBe(AuthErrorCode.USER_FETCH_ERROR);
      expect(error.message).toBe('Failed to get user');
      expect(error.cause).toBe(cause);
    });

    it('should create storageError', () => {
      const cause = new Error('Storage unavailable');
      const error = createAuthError.storageError('Cannot save tokens', cause);
      expect(error.code).toBe(AuthErrorCode.STORAGE_ERROR);
      expect(error.message).toBe('Cannot save tokens');
      expect(error.cause).toBe(cause);
    });

    it('should create invalidState error', () => {
      const error = createAuthError.invalidState('State mismatch');
      expect(error.code).toBe(AuthErrorCode.INVALID_STATE);
      expect(error.message).toBe('State mismatch');
    });

    it('should create callbackError', () => {
      const error = createAuthError.callbackError('Callback failed');
      expect(error.code).toBe(AuthErrorCode.CALLBACK_ERROR);
      expect(error.message).toBe('Callback failed');
    });
  });

  describe('AuthErrorCode enum', () => {
    it('should have all expected error codes', () => {
      expect(AuthErrorCode.INVALID_CONFIG).toBe('INVALID_CONFIG');
      expect(AuthErrorCode.AUTH_FAILED).toBe('AUTH_FAILED');
      expect(AuthErrorCode.TOKEN_EXPIRED).toBe('TOKEN_EXPIRED');
      expect(AuthErrorCode.TOKEN_REFRESH_FAILED).toBe('TOKEN_REFRESH_FAILED');
      expect(AuthErrorCode.INVALID_TOKEN).toBe('INVALID_TOKEN');
      expect(AuthErrorCode.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(AuthErrorCode.PKCE_ERROR).toBe('PKCE_ERROR');
      expect(AuthErrorCode.USER_FETCH_ERROR).toBe('USER_FETCH_ERROR');
      expect(AuthErrorCode.STORAGE_ERROR).toBe('STORAGE_ERROR');
      expect(AuthErrorCode.INVALID_STATE).toBe('INVALID_STATE');
      expect(AuthErrorCode.CALLBACK_ERROR).toBe('CALLBACK_ERROR');
      expect(AuthErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });
  });
});
