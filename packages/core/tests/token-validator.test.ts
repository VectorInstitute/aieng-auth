import {
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  getTimeUntilExpiration,
  validateToken,
} from '../src/token/token-validator';

// Helper to create a mock JWT
function createMockJWT(payload: Record<string, unknown>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const signature = 'mock_signature';
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

describe('Token Validator', () => {
  describe('decodeToken', () => {
    it('should decode a valid JWT token', () => {
      const payload = {
        sub: '12345',
        name: 'John Doe',
        iat: 1516239022,
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const token = createMockJWT(payload);
      const decoded = decodeToken(token);

      expect(decoded.sub).toBe('12345');
      expect(decoded.name).toBe('John Doe');
    });

    it('should throw error for invalid JWT format', () => {
      expect(() => decodeToken('invalid.token')).toThrow();
      expect(() => decodeToken('not-a-jwt')).toThrow();
    });

    it('should throw error for empty token', () => {
      expect(() => decodeToken('')).toThrow();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid non-expired token', () => {
      const payload = {
        sub: '12345',
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      };
      const token = createMockJWT(payload);

      expect(isTokenExpired(token)).toBe(false);
    });

    it('should return true for expired token', () => {
      const payload = {
        sub: '12345',
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      };
      const token = createMockJWT(payload);

      expect(isTokenExpired(token)).toBe(true);
    });

    it('should respect buffer seconds', () => {
      const payload = {
        sub: '12345',
        exp: Math.floor(Date.now() / 1000) + 120, // Expires in 2 minutes
      };
      const token = createMockJWT(payload);

      // Without buffer, not expired
      expect(isTokenExpired(token, 0)).toBe(false);

      // With 5 minute buffer, considered expired
      expect(isTokenExpired(token, 300)).toBe(true);
    });

    it('should return true for token without exp claim', () => {
      const payload = {
        sub: '12345',
        // No exp claim
      };
      const token = createMockJWT(payload);

      expect(isTokenExpired(token)).toBe(true);
    });

    it('should accept decoded token object', () => {
      const decoded = {
        sub: '12345',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iss: 'test',
        aud: 'test',
        iat: Math.floor(Date.now() / 1000),
      };

      expect(isTokenExpired(decoded)).toBe(false);
    });

    it('should return true for invalid token', () => {
      expect(isTokenExpired('invalid-token')).toBe(true);
    });
  });

  describe('getTokenExpiration', () => {
    it('should return expiration timestamp', () => {
      const expTime = Math.floor(Date.now() / 1000) + 3600;
      const payload = {
        sub: '12345',
        exp: expTime,
      };
      const token = createMockJWT(payload);

      expect(getTokenExpiration(token)).toBe(expTime);
    });

    it('should return null for token without exp', () => {
      const payload = {
        sub: '12345',
      };
      const token = createMockJWT(payload);

      expect(getTokenExpiration(token)).toBeNull();
    });

    it('should return null for invalid token', () => {
      expect(getTokenExpiration('invalid-token')).toBeNull();
    });
  });

  describe('getTimeUntilExpiration', () => {
    it('should return correct time until expiration', () => {
      const expiresIn = 3600;
      const payload = {
        sub: '12345',
        exp: Math.floor(Date.now() / 1000) + expiresIn,
      };
      const token = createMockJWT(payload);
      const remaining = getTimeUntilExpiration(token);

      // Allow small variance due to test execution time
      expect(remaining).toBeGreaterThan(expiresIn - 5);
      expect(remaining).toBeLessThanOrEqual(expiresIn);
    });

    it('should return 0 for expired token', () => {
      const payload = {
        sub: '12345',
        exp: Math.floor(Date.now() / 1000) - 3600,
      };
      const token = createMockJWT(payload);

      expect(getTimeUntilExpiration(token)).toBe(0);
    });

    it('should return 0 for token without exp', () => {
      const payload = {
        sub: '12345',
      };
      const token = createMockJWT(payload);

      expect(getTimeUntilExpiration(token)).toBe(0);
    });

    it('should return 0 for invalid token', () => {
      expect(getTimeUntilExpiration('invalid-token')).toBe(0);
    });
  });

  describe('validateToken', () => {
    it('should validate a properly formatted token', () => {
      const payload = {
        sub: '12345',
        iss: 'https://cyberark.example.com',
        aud: 'my-app',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };
      const token = createMockJWT(payload);

      expect(validateToken(token)).toBe(true);
    });

    it('should check expiration when requested', () => {
      const expiredPayload = {
        sub: '12345',
        exp: Math.floor(Date.now() / 1000) - 3600,
      };
      const expiredToken = createMockJWT(expiredPayload);

      expect(validateToken(expiredToken, { checkExpiration: false })).toBe(true);
      expect(validateToken(expiredToken, { checkExpiration: true })).toBe(false);
    });

    it('should verify required claims', () => {
      const payload = {
        sub: '12345',
        email: 'user@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const token = createMockJWT(payload);

      expect(validateToken(token, { requiredClaims: ['sub', 'email'] })).toBe(true);
      expect(validateToken(token, { requiredClaims: ['sub', 'name'] })).toBe(false);
    });

    it('should verify issuer', () => {
      const payload = {
        sub: '12345',
        iss: 'https://cyberark.example.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const token = createMockJWT(payload);

      expect(validateToken(token, { issuer: 'https://cyberark.example.com' })).toBe(true);
      expect(validateToken(token, { issuer: 'https://wrong.com' })).toBe(false);
    });

    it('should verify audience', () => {
      const payload = {
        sub: '12345',
        aud: 'my-app',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const token = createMockJWT(payload);

      expect(validateToken(token, { audience: 'my-app' })).toBe(true);
      expect(validateToken(token, { audience: 'other-app' })).toBe(false);
    });

    it('should verify audience array', () => {
      const payload = {
        sub: '12345',
        aud: ['my-app', 'another-app'],
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const token = createMockJWT(payload);

      expect(validateToken(token, { audience: 'my-app' })).toBe(true);
      expect(validateToken(token, { audience: 'another-app' })).toBe(true);
      expect(validateToken(token, { audience: 'wrong-app' })).toBe(false);
    });

    it('should return false for invalid token', () => {
      expect(validateToken('invalid-token')).toBe(false);
    });

    it('should validate with multiple options', () => {
      const payload = {
        sub: '12345',
        iss: 'https://cyberark.example.com',
        aud: 'my-app',
        email: 'user@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const token = createMockJWT(payload);

      expect(
        validateToken(token, {
          checkExpiration: true,
          issuer: 'https://cyberark.example.com',
          audience: 'my-app',
          requiredClaims: ['sub', 'email'],
        })
      ).toBe(true);
    });
  });
});
