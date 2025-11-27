import { TokenManager } from '../src/token/token-manager';
import { MemoryTokenStorage } from '../src/token/token-storage';
import type { AuthTokens, TokenStorage } from '../src/types/token';

// Mock token validator functions
jest.mock('../src/token/token-validator', () => ({
  isTokenExpired: jest.fn(),
  getTimeUntilExpiration: jest.fn(),
}));

import { isTokenExpired, getTimeUntilExpiration } from '../src/token/token-validator';

const mockIsTokenExpired = isTokenExpired as jest.MockedFunction<typeof isTokenExpired>;
const mockGetTimeUntilExpiration = getTimeUntilExpiration as jest.MockedFunction<
  typeof getTimeUntilExpiration
>;

describe('TokenManager', () => {
  const mockTokens: AuthTokens = {
    accessToken: 'access_token_123',
    refreshToken: 'refresh_token_456',
    idToken: 'id_token_789',
    tokenType: 'Bearer',
    expiresIn: 3600,
    scope: 'openid profile email',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should use MemoryTokenStorage by default', async () => {
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      const tokens = await manager.getTokens();
      expect(tokens).toEqual(expect.objectContaining(mockTokens));
    });

    it('should use provided storage', async () => {
      const customStorage = new MemoryTokenStorage();
      const manager = new TokenManager(customStorage);
      await manager.setTokens(mockTokens);
      const tokens = await manager.getTokens();
      expect(tokens).toEqual(expect.objectContaining(mockTokens));
    });
  });

  describe('setTokens', () => {
    it('should store tokens', async () => {
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      const tokens = await manager.getTokens();
      expect(tokens).toEqual(expect.objectContaining(mockTokens));
    });
  });

  describe('getTokens', () => {
    it('should retrieve stored tokens', async () => {
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      const tokens = await manager.getTokens();
      expect(tokens).toEqual(expect.objectContaining(mockTokens));
    });

    it('should return null when no tokens exist', async () => {
      const manager = new TokenManager();
      const tokens = await manager.getTokens();
      expect(tokens).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should clear stored tokens', async () => {
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      await manager.clearTokens();
      const tokens = await manager.getTokens();
      expect(tokens).toBeNull();
    });
  });

  describe('getAccessToken', () => {
    it('should return access token', async () => {
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      const accessToken = await manager.getAccessToken();
      expect(accessToken).toBe(mockTokens.accessToken);
    });

    it('should return null when no tokens exist', async () => {
      const manager = new TokenManager();
      const accessToken = await manager.getAccessToken();
      expect(accessToken).toBeNull();
    });

    it('should return null when accessToken is undefined', async () => {
      const manager = new TokenManager();
      await manager.setTokens({ ...mockTokens, accessToken: undefined as any });
      const accessToken = await manager.getAccessToken();
      expect(accessToken).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token', async () => {
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      const refreshToken = await manager.getRefreshToken();
      expect(refreshToken).toBe(mockTokens.refreshToken);
    });

    it('should return null when no tokens exist', async () => {
      const manager = new TokenManager();
      const refreshToken = await manager.getRefreshToken();
      expect(refreshToken).toBeNull();
    });
  });

  describe('getIdToken', () => {
    it('should return ID token', async () => {
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      const idToken = await manager.getIdToken();
      expect(idToken).toBe(mockTokens.idToken);
    });

    it('should return null when no tokens exist', async () => {
      const manager = new TokenManager();
      const idToken = await manager.getIdToken();
      expect(idToken).toBeNull();
    });
  });

  describe('isTokenValid', () => {
    it('should return true when token is not expired', async () => {
      mockIsTokenExpired.mockReturnValue(false);
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      const isValid = await manager.isTokenValid();
      expect(isValid).toBe(true);
      expect(mockIsTokenExpired).toHaveBeenCalledWith(mockTokens.accessToken, undefined);
    });

    it('should return false when token is expired', async () => {
      mockIsTokenExpired.mockReturnValue(true);
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      const isValid = await manager.isTokenValid();
      expect(isValid).toBe(false);
    });

    it('should return false when no token exists', async () => {
      const manager = new TokenManager();
      const isValid = await manager.isTokenValid();
      expect(isValid).toBe(false);
    });

    it('should pass buffer seconds to isTokenExpired', async () => {
      mockIsTokenExpired.mockReturnValue(false);
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      await manager.isTokenValid(300);
      expect(mockIsTokenExpired).toHaveBeenCalledWith(mockTokens.accessToken, 300);
    });
  });

  describe('hasTokens', () => {
    it('should return true when tokens exist', async () => {
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      const hasTokens = await manager.hasTokens();
      expect(hasTokens).toBe(true);
    });

    it('should return false when no tokens exist', async () => {
      const manager = new TokenManager();
      const hasTokens = await manager.hasTokens();
      expect(hasTokens).toBe(false);
    });

    it('should return false when tokens exist but no accessToken', async () => {
      const manager = new TokenManager();
      await manager.setTokens({ ...mockTokens, accessToken: '' });
      const hasTokens = await manager.hasTokens();
      expect(hasTokens).toBe(false);
    });
  });

  describe('getTimeUntilExpiration', () => {
    it('should return time until expiration', async () => {
      mockGetTimeUntilExpiration.mockReturnValue(1800);
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      const timeRemaining = await manager.getTimeUntilExpiration();
      expect(timeRemaining).toBe(1800);
      expect(mockGetTimeUntilExpiration).toHaveBeenCalledWith(mockTokens.accessToken);
    });

    it('should return 0 when no token exists', async () => {
      const manager = new TokenManager();
      const timeRemaining = await manager.getTimeUntilExpiration();
      expect(timeRemaining).toBe(0);
    });
  });

  describe('shouldRefresh', () => {
    it('should return true when time remaining is less than buffer', async () => {
      mockGetTimeUntilExpiration.mockReturnValue(200);
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      const shouldRefresh = await manager.shouldRefresh(300);
      expect(shouldRefresh).toBe(true);
    });

    it('should return false when time remaining is greater than buffer', async () => {
      mockGetTimeUntilExpiration.mockReturnValue(400);
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      const shouldRefresh = await manager.shouldRefresh(300);
      expect(shouldRefresh).toBe(false);
    });

    it('should return false when token is already expired', async () => {
      mockGetTimeUntilExpiration.mockReturnValue(0);
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      const shouldRefresh = await manager.shouldRefresh(300);
      expect(shouldRefresh).toBe(false);
    });

    it('should use default buffer of 300 seconds', async () => {
      mockGetTimeUntilExpiration.mockReturnValue(200);
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      const shouldRefresh = await manager.shouldRefresh();
      expect(shouldRefresh).toBe(true);
    });

    it('should return true when time remaining equals buffer', async () => {
      mockGetTimeUntilExpiration.mockReturnValue(300);
      const manager = new TokenManager();
      await manager.setTokens(mockTokens);
      const shouldRefresh = await manager.shouldRefresh(300);
      expect(shouldRefresh).toBe(true);
    });
  });
});
