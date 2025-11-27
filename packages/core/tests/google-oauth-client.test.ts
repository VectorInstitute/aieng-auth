import { GoogleOAuthClient } from '../src/client/google-oauth-client';
import { AuthError, AuthErrorCode } from '../src/errors/auth-errors';
import type { AuthConfig } from '../src/types/config';
import type { AuthTokens } from '../src/types/token';

// Mock dependencies
jest.mock('../src/client/pkce');
jest.mock('../src/token/token-validator');

import { generatePKCE } from '../src/client/pkce';
import { decodeToken, isTokenExpired } from '../src/token/token-validator';

const mockGeneratePKCE = generatePKCE as jest.MockedFunction<typeof generatePKCE>;
const mockDecodeToken = decodeToken as jest.MockedFunction<typeof decodeToken>;
const mockIsTokenExpired = isTokenExpired as jest.MockedFunction<typeof isTokenExpired>;

// Mock global fetch
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('GoogleOAuthClient', () => {
  const mockConfig: AuthConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/callback',
    scopes: ['openid', 'profile', 'email'],
  };

  const mockPKCE = {
    verifier: 'test-verifier',
    challenge: 'test-challenge',
    method: 'S256' as const,
  };

  const mockTokenResponse = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'openid profile email',
  };

  const mockUserInfo = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    given_name: 'Test',
    family_name: 'User',
    picture: 'https://example.com/avatar.jpg',
    verified_email: true,
    locale: 'en',
  };

  let sessionStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorageMock = {};

    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key: string) => sessionStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          sessionStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete sessionStorageMock[key];
        }),
        clear: jest.fn(() => {
          sessionStorageMock = {};
        }),
      },
      writable: true,
    });

    // Mock crypto.randomUUID
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: jest.fn(() => 'mock-state-123'),
      },
      writable: true,
    });

    mockGeneratePKCE.mockResolvedValue(mockPKCE);
  });

  describe('constructor', () => {
    it('should create instance with config', () => {
      const client = new GoogleOAuthClient(mockConfig);
      expect(client).toBeInstanceOf(GoogleOAuthClient);
    });
  });

  describe('login', () => {
    it('should generate PKCE and redirect to Google auth', async () => {
      const client = new GoogleOAuthClient(mockConfig);
      delete (window as any).location;
      (window as any).location = { href: '' };

      await client.login();

      // Verify PKCE generation
      expect(mockGeneratePKCE).toHaveBeenCalled();

      // Verify session storage
      expect(sessionStorage.setItem).toHaveBeenCalledWith('pkce_verifier', mockPKCE.verifier);
      expect(sessionStorage.setItem).toHaveBeenCalledWith('oauth_state', 'mock-state-123');

      // Verify redirect URL
      const redirectUrl = new URL(window.location.href);
      expect(redirectUrl.origin + redirectUrl.pathname).toBe(
        'https://accounts.google.com/o/oauth2/v2/auth'
      );
      expect(redirectUrl.searchParams.get('client_id')).toBe(mockConfig.clientId);
      expect(redirectUrl.searchParams.get('redirect_uri')).toBe(mockConfig.redirectUri);
      expect(redirectUrl.searchParams.get('response_type')).toBe('code');
      expect(redirectUrl.searchParams.get('scope')).toBe('openid profile email');
      expect(redirectUrl.searchParams.get('code_challenge')).toBe(mockPKCE.challenge);
      expect(redirectUrl.searchParams.get('code_challenge_method')).toBe(mockPKCE.method);
      expect(redirectUrl.searchParams.get('state')).toBe('mock-state-123');
      expect(redirectUrl.searchParams.get('access_type')).toBe('offline');
      expect(redirectUrl.searchParams.get('prompt')).toBe('consent');
    });

    it('should use default scopes when not provided', async () => {
      const configWithoutScopes = { ...mockConfig, scopes: undefined };
      const client = new GoogleOAuthClient(configWithoutScopes);
      delete (window as any).location;
      (window as any).location = { href: '' };

      await client.login();

      const redirectUrl = new URL(window.location.href);
      expect(redirectUrl.searchParams.get('scope')).toBe('openid profile email');
    });
  });

  describe('handleCallback', () => {
    beforeEach(() => {
      sessionStorageMock['oauth_state'] = 'mock-state-123';
      sessionStorageMock['pkce_verifier'] = mockPKCE.verifier;
    });

    it('should exchange code for tokens successfully', async () => {
      const client = new GoogleOAuthClient(mockConfig);
      const callbackUrl = `http://localhost:3000/callback?code=auth-code&state=mock-state-123`;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      const tokens = await client.handleCallback(callbackUrl);

      expect(tokens).toEqual({
        accessToken: mockTokenResponse.access_token,
        refreshToken: mockTokenResponse.refresh_token,
        tokenType: mockTokenResponse.token_type,
        expiresIn: mockTokenResponse.expires_in,
        scope: mockTokenResponse.scope,
      });

      // Verify fetch call
      expect(mockFetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );

      // Verify session cleanup
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('pkce_verifier');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('oauth_state');
    });

    it('should throw error when authorization error is present', async () => {
      const client = new GoogleOAuthClient(mockConfig);
      const callbackUrl = `http://localhost:3000/callback?error=access_denied&state=mock-state-123`;

      await expect(client.handleCallback(callbackUrl)).rejects.toThrow(AuthError);
      await expect(client.handleCallback(callbackUrl)).rejects.toMatchObject({
        code: AuthErrorCode.AUTH_FAILED,
        message: expect.stringContaining('access_denied'),
      });
    });

    it('should throw error when state is invalid', async () => {
      const client = new GoogleOAuthClient(mockConfig);
      const callbackUrl = `http://localhost:3000/callback?code=auth-code&state=wrong-state`;

      await expect(client.handleCallback(callbackUrl)).rejects.toThrow(AuthError);
      await expect(client.handleCallback(callbackUrl)).rejects.toMatchObject({
        code: AuthErrorCode.INVALID_STATE,
      });
    });

    it('should throw error when state is missing', async () => {
      const client = new GoogleOAuthClient(mockConfig);
      const callbackUrl = `http://localhost:3000/callback?code=auth-code`;

      await expect(client.handleCallback(callbackUrl)).rejects.toThrow(AuthError);
      await expect(client.handleCallback(callbackUrl)).rejects.toMatchObject({
        code: AuthErrorCode.INVALID_STATE,
      });
    });

    it('should throw error when code is missing', async () => {
      const client = new GoogleOAuthClient(mockConfig);
      const callbackUrl = `http://localhost:3000/callback?state=mock-state-123`;

      await expect(client.handleCallback(callbackUrl)).rejects.toThrow(AuthError);
      await expect(client.handleCallback(callbackUrl)).rejects.toMatchObject({
        code: AuthErrorCode.AUTH_FAILED,
        message: expect.stringContaining('No authorization code'),
      });
    });

    it('should throw error when PKCE verifier is missing', async () => {
      delete sessionStorageMock['pkce_verifier'];
      const client = new GoogleOAuthClient(mockConfig);
      const callbackUrl = `http://localhost:3000/callback?code=auth-code&state=mock-state-123`;

      await expect(client.handleCallback(callbackUrl)).rejects.toThrow(AuthError);
      await expect(client.handleCallback(callbackUrl)).rejects.toMatchObject({
        code: AuthErrorCode.PKCE_ERROR,
      });
    });

    it('should throw error when token exchange fails', async () => {
      const client = new GoogleOAuthClient(mockConfig);
      const callbackUrl = `http://localhost:3000/callback?code=auth-code&state=mock-state-123`;

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({ error: 'invalid_grant', error_description: 'Invalid code' }),
      } as Response);

      try {
        await client.handleCallback(callbackUrl);
        fail('Expected handleCallback to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe(AuthErrorCode.AUTH_FAILED);
        expect((error as AuthError).message).toContain('Invalid code');
      }
    });

    it('should handle token exchange failure when JSON parsing fails', async () => {
      const client = new GoogleOAuthClient(mockConfig);
      const callbackUrl = `http://localhost:3000/callback?code=auth-code&state=mock-state-123`;

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      try {
        await client.handleCallback(callbackUrl);
        fail('Expected handleCallback to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe(AuthErrorCode.AUTH_FAILED);
        expect((error as AuthError).message).toContain('Internal Server Error');
      }
    });

    it('should validate email domain when allowedDomains is configured', async () => {
      const configWithDomains = {
        ...mockConfig,
        allowedDomains: ['example.com'],
      };
      const client = new GoogleOAuthClient(configWithDomains);
      const callbackUrl = `http://localhost:3000/callback?code=auth-code&state=mock-state-123`;

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTokenResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUserInfo,
        } as Response);

      const tokens = await client.handleCallback(callbackUrl);
      expect(tokens).toBeDefined();

      // Verify user info was fetched for domain validation
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should throw error when email domain is not allowed', async () => {
      const configWithDomains = {
        ...mockConfig,
        allowedDomains: ['allowed-domain.com'],
      };
      const client = new GoogleOAuthClient(configWithDomains);
      const callbackUrl = `http://localhost:3000/callback?code=auth-code&state=mock-state-123`;

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTokenResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUserInfo,
        } as Response);

      try {
        await client.handleCallback(callbackUrl);
        fail('Expected handleCallback to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe(AuthErrorCode.AUTH_FAILED);
        expect((error as AuthError).message).toContain('not allowed');
      }
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const client = new GoogleOAuthClient(mockConfig);
      const refreshToken = 'old-refresh-token';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access-token',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
      } as Response);

      const tokens = await client.refreshTokens(refreshToken);

      expect(tokens).toEqual({
        accessToken: 'new-access-token',
        refreshToken: refreshToken, // Should keep old refresh token when not returned
        tokenType: 'Bearer',
        expiresIn: 3600,
        scope: undefined,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should use new refresh token when provided', async () => {
      const client = new GoogleOAuthClient(mockConfig);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
      } as Response);

      const tokens = await client.refreshTokens('old-refresh-token');

      expect(tokens.refreshToken).toBe('new-refresh-token');
    });

    it('should throw error when refresh token is empty', async () => {
      const client = new GoogleOAuthClient(mockConfig);

      try {
        await client.refreshTokens('');
        fail('Expected refreshTokens to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe(AuthErrorCode.TOKEN_REFRESH_FAILED);
      }
    });

    it('should throw error when refresh fails', async () => {
      const client = new GoogleOAuthClient(mockConfig);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'invalid_grant' }),
      } as Response);

      try {
        await client.refreshTokens('refresh-token');
        fail('Expected refreshTokens to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe(AuthErrorCode.TOKEN_REFRESH_FAILED);
      }
    });

    it('should handle refresh failure when JSON parsing fails', async () => {
      const client = new GoogleOAuthClient(mockConfig);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Service Unavailable',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      try {
        await client.refreshTokens('refresh-token');
        fail('Expected refreshTokens to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe(AuthErrorCode.TOKEN_REFRESH_FAILED);
        expect((error as AuthError).message).toContain('Service Unavailable');
      }
    });
  });

  describe('getUserInfo', () => {
    it('should fetch user info successfully', async () => {
      const client = new GoogleOAuthClient(mockConfig);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserInfo,
      } as Response);

      const user = await client.getUserInfo('access-token');

      expect(user).toEqual({
        sub: mockUserInfo.id,
        email: mockUserInfo.email,
        name: mockUserInfo.name,
        givenName: mockUserInfo.given_name,
        familyName: mockUserInfo.family_name,
        picture: mockUserInfo.picture,
        emailVerified: mockUserInfo.verified_email,
        locale: mockUserInfo.locale,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer access-token',
          },
        })
      );
    });

    it('should throw error when user info fetch fails', async () => {
      const client = new GoogleOAuthClient(mockConfig);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      } as Response);

      try {
        await client.getUserInfo('invalid-token');
        fail('Expected getUserInfo to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe(AuthErrorCode.USER_FETCH_ERROR);
      }
    });
  });

  describe('revokeToken', () => {
    it('should revoke token', async () => {
      const client = new GoogleOAuthClient(mockConfig);

      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      await client.revokeToken('token-to-revoke');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/revoke',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should not throw error even if revoke fails', async () => {
      const client = new GoogleOAuthClient(mockConfig);

      mockFetch.mockResolvedValueOnce({
        ok: false,
      } as Response);

      // Should not throw
      await expect(client.revokeToken('token')).resolves.toBeUndefined();
    });
  });

  describe('isTokenValid', () => {
    it('should return true for valid token', () => {
      const client = new GoogleOAuthClient(mockConfig);
      mockIsTokenExpired.mockReturnValue(false);

      const isValid = client.isTokenValid('valid-token');

      expect(isValid).toBe(true);
      expect(mockIsTokenExpired).toHaveBeenCalledWith('valid-token');
    });

    it('should return false for expired token', () => {
      const client = new GoogleOAuthClient(mockConfig);
      mockIsTokenExpired.mockReturnValue(true);

      const isValid = client.isTokenValid('expired-token');

      expect(isValid).toBe(false);
    });

    it('should return false when token validation throws error', () => {
      const client = new GoogleOAuthClient(mockConfig);
      mockIsTokenExpired.mockImplementation(() => {
        throw new Error('Invalid token format');
      });

      const isValid = client.isTokenValid('invalid-token');

      expect(isValid).toBe(false);
    });
  });

  describe('decodeAccessToken', () => {
    it('should decode access token', () => {
      const client = new GoogleOAuthClient(mockConfig);
      const decodedToken = { sub: 'user-123', exp: 1234567890 };
      mockDecodeToken.mockReturnValue(decodedToken);

      const result = client.decodeAccessToken('token');

      expect(result).toEqual(decodedToken);
      expect(mockDecodeToken).toHaveBeenCalledWith('token');
    });
  });

  describe('email domain validation', () => {
    beforeEach(() => {
      sessionStorageMock['oauth_state'] = 'mock-state-123';
      sessionStorageMock['pkce_verifier'] = mockPKCE.verifier;
    });

    it('should throw error when email is not available', async () => {
      const configWithDomains = {
        ...mockConfig,
        allowedDomains: ['example.com'],
      };
      const client = new GoogleOAuthClient(configWithDomains);
      const callbackUrl = `http://localhost:3000/callback?code=auth-code&state=mock-state-123`;

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTokenResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockUserInfo, email: '' }),
        } as Response);

      try {
        await client.handleCallback(callbackUrl);
        fail('Expected handleCallback to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe(AuthErrorCode.AUTH_FAILED);
        expect((error as AuthError).message).toContain('Email not available');
      }
    });

    it('should throw error when email format is invalid', async () => {
      const configWithDomains = {
        ...mockConfig,
        allowedDomains: ['example.com'],
      };
      const client = new GoogleOAuthClient(configWithDomains);
      const callbackUrl = `http://localhost:3000/callback?code=auth-code&state=mock-state-123`;

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTokenResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...mockUserInfo, email: 'invalid-email' }),
        } as Response);

      try {
        await client.handleCallback(callbackUrl);
        fail('Expected handleCallback to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe(AuthErrorCode.AUTH_FAILED);
        expect((error as AuthError).message).toContain('Invalid email format');
      }
    });
  });
});
