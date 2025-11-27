import {
  MemoryTokenStorage,
  SessionStorageAdapter,
  LocalStorageAdapter,
} from '../src/token/token-storage';
import type { AuthTokens } from '../src/types/token';

describe('Token Storage', () => {
  const mockTokens: AuthTokens = {
    accessToken: 'access_token_123',
    refreshToken: 'refresh_token_456',
    idToken: 'id_token_789',
    tokenType: 'Bearer',
    expiresIn: 3600,
    scope: 'openid profile email',
  };

  beforeEach(() => {
    // Clear storage before each test
    sessionStorage.clear();
    localStorage.clear();
  });

  describe('MemoryTokenStorage', () => {
    let storage: MemoryTokenStorage;

    beforeEach(() => {
      storage = new MemoryTokenStorage();
    });

    it('should store and retrieve tokens', async () => {
      await storage.setTokens(mockTokens);
      const retrieved = await storage.getTokens();

      expect(retrieved).not.toBeNull();
      expect(retrieved?.accessToken).toBe(mockTokens.accessToken);
      expect(retrieved?.refreshToken).toBe(mockTokens.refreshToken);
    });

    it('should add issuedAt timestamp when storing', async () => {
      const beforeTime = Date.now();
      await storage.setTokens(mockTokens);
      const afterTime = Date.now();

      const retrieved = await storage.getTokens();
      expect(retrieved?.issuedAt).toBeDefined();
      expect(retrieved?.issuedAt).toBeGreaterThanOrEqual(beforeTime);
      expect(retrieved?.issuedAt).toBeLessThanOrEqual(afterTime);
    });

    it('should return null when no tokens stored', async () => {
      const retrieved = await storage.getTokens();
      expect(retrieved).toBeNull();
    });

    it('should clear tokens', async () => {
      await storage.setTokens(mockTokens);
      await storage.clearTokens();

      const retrieved = await storage.getTokens();
      expect(retrieved).toBeNull();
    });

    it('should return a copy of tokens (not reference)', async () => {
      await storage.setTokens(mockTokens);
      const retrieved1 = await storage.getTokens();
      const retrieved2 = await storage.getTokens();

      expect(retrieved1).not.toBe(retrieved2);
      expect(retrieved1).toEqual(retrieved2);
    });

    it('should overwrite existing tokens', async () => {
      await storage.setTokens(mockTokens);

      const newTokens: AuthTokens = {
        ...mockTokens,
        accessToken: 'new_access_token',
      };
      await storage.setTokens(newTokens);

      const retrieved = await storage.getTokens();
      expect(retrieved?.accessToken).toBe('new_access_token');
    });
  });

  describe('SessionStorageAdapter', () => {
    let storage: SessionStorageAdapter;

    beforeEach(() => {
      storage = new SessionStorageAdapter();
    });

    it('should store and retrieve tokens from sessionStorage', async () => {
      await storage.setTokens(mockTokens);
      const retrieved = await storage.getTokens();

      expect(retrieved).not.toBeNull();
      expect(retrieved?.accessToken).toBe(mockTokens.accessToken);
    });

    it('should persist tokens in sessionStorage', async () => {
      await storage.setTokens(mockTokens);

      // Create new instance to simulate page refresh
      const newStorage = new SessionStorageAdapter();
      const retrieved = await newStorage.getTokens();

      expect(retrieved?.accessToken).toBe(mockTokens.accessToken);
    });

    it('should add issuedAt timestamp', async () => {
      await storage.setTokens(mockTokens);
      const retrieved = await storage.getTokens();

      expect(retrieved?.issuedAt).toBeDefined();
      expect(typeof retrieved?.issuedAt).toBe('number');
    });

    it('should return null when no tokens stored', async () => {
      const retrieved = await storage.getTokens();
      expect(retrieved).toBeNull();
    });

    it('should clear tokens from sessionStorage', async () => {
      await storage.setTokens(mockTokens);
      await storage.clearTokens();

      const retrieved = await storage.getTokens();
      expect(retrieved).toBeNull();

      // Verify actually removed from storage
      expect(sessionStorage.getItem('cyberark_auth_tokens')).toBeNull();
    });

    it('should support custom storage key', async () => {
      const customStorage = new SessionStorageAdapter('custom_key');
      await customStorage.setTokens(mockTokens);

      expect(sessionStorage.getItem('custom_key')).not.toBeNull();
      expect(sessionStorage.getItem('cyberark_auth_tokens')).toBeNull();
    });

    it('should handle corrupted data gracefully', async () => {
      // Manually set corrupted data
      sessionStorage.setItem('cyberark_auth_tokens', 'invalid json');

      const retrieved = await storage.getTokens();
      expect(retrieved).toBeNull();

      // Should clear corrupted data
      expect(sessionStorage.getItem('cyberark_auth_tokens')).toBeNull();
    });

    it('should serialize and deserialize tokens correctly', async () => {
      await storage.setTokens(mockTokens);
      const retrieved = await storage.getTokens();

      expect(retrieved).toEqual(expect.objectContaining(mockTokens));
    });

    it('should throw error when setTokens fails', async () => {
      // Mock sessionStorage.setItem to throw
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = jest.fn(() => {
        throw new Error('Storage full');
      });

      try {
        await storage.setTokens(mockTokens);
        fail('Expected setTokens to throw');
      } catch (error: any) {
        expect(error.message).toContain('Failed to store tokens');
      } finally {
        sessionStorage.setItem = originalSetItem;
      }
    });

    it('should throw error when clearTokens fails', async () => {
      // Mock sessionStorage.removeItem to throw
      const originalRemoveItem = sessionStorage.removeItem;
      sessionStorage.removeItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      try {
        await storage.clearTokens();
        fail('Expected clearTokens to throw');
      } catch (error: any) {
        expect(error.message).toContain('Failed to clear tokens');
      } finally {
        sessionStorage.removeItem = originalRemoveItem;
      }
    });
  });

  describe('LocalStorageAdapter', () => {
    let storage: LocalStorageAdapter;

    beforeEach(() => {
      storage = new LocalStorageAdapter();
    });

    it('should store and retrieve tokens from localStorage', async () => {
      await storage.setTokens(mockTokens);
      const retrieved = await storage.getTokens();

      expect(retrieved).not.toBeNull();
      expect(retrieved?.accessToken).toBe(mockTokens.accessToken);
    });

    it('should persist tokens in localStorage', async () => {
      await storage.setTokens(mockTokens);

      // Create new instance to simulate browser restart
      const newStorage = new LocalStorageAdapter();
      const retrieved = await newStorage.getTokens();

      expect(retrieved?.accessToken).toBe(mockTokens.accessToken);
    });

    it('should add issuedAt timestamp', async () => {
      await storage.setTokens(mockTokens);
      const retrieved = await storage.getTokens();

      expect(retrieved?.issuedAt).toBeDefined();
      expect(typeof retrieved?.issuedAt).toBe('number');
    });

    it('should return null when no tokens stored', async () => {
      const retrieved = await storage.getTokens();
      expect(retrieved).toBeNull();
    });

    it('should clear tokens from localStorage', async () => {
      await storage.setTokens(mockTokens);
      await storage.clearTokens();

      const retrieved = await storage.getTokens();
      expect(retrieved).toBeNull();

      // Verify actually removed from storage
      expect(localStorage.getItem('cyberark_auth_tokens')).toBeNull();
    });

    it('should support custom storage key', async () => {
      const customStorage = new LocalStorageAdapter('custom_key');
      await customStorage.setTokens(mockTokens);

      expect(localStorage.getItem('custom_key')).not.toBeNull();
      expect(localStorage.getItem('cyberark_auth_tokens')).toBeNull();
    });

    it('should handle corrupted data gracefully', async () => {
      // Manually set corrupted data
      localStorage.setItem('cyberark_auth_tokens', 'invalid json');

      const retrieved = await storage.getTokens();
      expect(retrieved).toBeNull();

      // Should clear corrupted data
      expect(localStorage.getItem('cyberark_auth_tokens')).toBeNull();
    });

    it('should serialize and deserialize tokens correctly', async () => {
      await storage.setTokens(mockTokens);
      const retrieved = await storage.getTokens();

      expect(retrieved).toEqual(expect.objectContaining(mockTokens));
    });

    it('should throw error when setTokens fails', async () => {
      // Mock localStorage.setItem to throw
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage full');
      });

      try {
        await storage.setTokens(mockTokens);
        fail('Expected setTokens to throw');
      } catch (error: any) {
        expect(error.message).toContain('Failed to store tokens');
      } finally {
        localStorage.setItem = originalSetItem;
      }
    });

    it('should throw error when clearTokens fails', async () => {
      // Mock localStorage.removeItem to throw
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      try {
        await storage.clearTokens();
        fail('Expected clearTokens to throw');
      } catch (error: any) {
        expect(error.message).toContain('Failed to clear tokens');
      } finally {
        localStorage.removeItem = originalRemoveItem;
      }
    });
  });

  describe('Storage Comparison', () => {
    it('memory storage should not persist across instances', async () => {
      const storage1 = new MemoryTokenStorage();
      await storage1.setTokens(mockTokens);

      const storage2 = new MemoryTokenStorage();
      const retrieved = await storage2.getTokens();

      expect(retrieved).toBeNull();
    });

    it('sessionStorage should persist across instances', async () => {
      const storage1 = new SessionStorageAdapter();
      await storage1.setTokens(mockTokens);

      const storage2 = new SessionStorageAdapter();
      const retrieved = await storage2.getTokens();

      expect(retrieved?.accessToken).toBe(mockTokens.accessToken);
    });

    it('localStorage should persist across instances', async () => {
      const storage1 = new LocalStorageAdapter();
      await storage1.setTokens(mockTokens);

      const storage2 = new LocalStorageAdapter();
      const retrieved = await storage2.getTokens();

      expect(retrieved?.accessToken).toBe(mockTokens.accessToken);
    });

    it('different storage types should not interfere', async () => {
      const memoryStorage = new MemoryTokenStorage();
      const sessionStorage = new SessionStorageAdapter();
      const localStorage = new LocalStorageAdapter();

      const tokens1 = { ...mockTokens, accessToken: 'memory_token' };
      const tokens2 = { ...mockTokens, accessToken: 'session_token' };
      const tokens3 = { ...mockTokens, accessToken: 'local_token' };

      await memoryStorage.setTokens(tokens1);
      await sessionStorage.setTokens(tokens2);
      await localStorage.setTokens(tokens3);

      expect((await memoryStorage.getTokens())?.accessToken).toBe('memory_token');
      expect((await sessionStorage.getTokens())?.accessToken).toBe('session_token');
      expect((await localStorage.getTokens())?.accessToken).toBe('local_token');
    });
  });
});
