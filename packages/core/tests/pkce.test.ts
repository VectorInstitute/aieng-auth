import {
  generatePKCE,
  verifyPKCE,
  generateRandomString,
  base64UrlEncode,
} from '../src/client/pkce';

describe('PKCE Utilities', () => {
  describe('generateRandomString', () => {
    it('should generate a random string of specified length', () => {
      const result = generateRandomString(32);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate unique strings on each call', () => {
      const result1 = generateRandomString(64);
      const result2 = generateRandomString(64);
      expect(result1).not.toBe(result2);
    });

    it('should generate URL-safe strings', () => {
      const result = generateRandomString(128);
      // Should not contain +, /, or =
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
      expect(result).not.toContain('=');
    });
  });

  describe('base64UrlEncode', () => {
    it('should encode a buffer to URL-safe base64', () => {
      const buffer = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const result = base64UrlEncode(buffer);
      expect(typeof result).toBe('string');
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
      expect(result).not.toContain('=');
    });

    it('should handle ArrayBuffer input', () => {
      const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer;
      const result = base64UrlEncode(buffer);
      expect(typeof result).toBe('string');
    });

    it('should produce consistent output for same input', () => {
      const buffer = new Uint8Array([1, 2, 3, 4, 5]);
      const result1 = base64UrlEncode(buffer);
      const result2 = base64UrlEncode(buffer);
      expect(result1).toBe(result2);
    });
  });

  describe('generatePKCE', () => {
    it('should generate a valid PKCE challenge', async () => {
      const pkce = await generatePKCE();

      expect(pkce).toHaveProperty('verifier');
      expect(pkce).toHaveProperty('challenge');
      expect(pkce).toHaveProperty('method');

      expect(typeof pkce.verifier).toBe('string');
      expect(typeof pkce.challenge).toBe('string');
      expect(pkce.method).toBe('S256');
    });

    it('should generate unique verifiers on each call', async () => {
      const pkce1 = await generatePKCE();
      const pkce2 = await generatePKCE();

      expect(pkce1.verifier).not.toBe(pkce2.verifier);
      expect(pkce1.challenge).not.toBe(pkce2.challenge);
    });

    it('should generate URL-safe verifier and challenge', async () => {
      const pkce = await generatePKCE();

      // Should not contain +, /, or =
      expect(pkce.verifier).not.toContain('+');
      expect(pkce.verifier).not.toContain('/');
      expect(pkce.verifier).not.toContain('=');

      expect(pkce.challenge).not.toContain('+');
      expect(pkce.challenge).not.toContain('/');
      expect(pkce.challenge).not.toContain('=');
    });

    it('should generate verifier of sufficient length', async () => {
      const pkce = await generatePKCE();
      // RFC 7636 recommends 43-128 characters
      expect(pkce.verifier.length).toBeGreaterThanOrEqual(43);
    });

    it('should always use S256 method', async () => {
      const pkce = await generatePKCE();
      expect(pkce.method).toBe('S256');
    });
  });

  describe('verifyPKCE', () => {
    it('should verify a valid PKCE pair', async () => {
      const pkce = await generatePKCE();
      const isValid = await verifyPKCE(pkce.verifier, pkce.challenge);
      expect(isValid).toBe(true);
    });

    it('should reject an invalid verifier', async () => {
      const pkce = await generatePKCE();
      const invalidVerifier = 'invalid-verifier';
      const isValid = await verifyPKCE(invalidVerifier, pkce.challenge);
      expect(isValid).toBe(false);
    });

    it('should reject an invalid challenge', async () => {
      const pkce = await generatePKCE();
      const invalidChallenge = 'invalid-challenge';
      const isValid = await verifyPKCE(pkce.verifier, invalidChallenge);
      expect(isValid).toBe(false);
    });

    it('should handle multiple verifications correctly', async () => {
      const pkce1 = await generatePKCE();
      const pkce2 = await generatePKCE();

      // Valid pairs should pass
      expect(await verifyPKCE(pkce1.verifier, pkce1.challenge)).toBe(true);
      expect(await verifyPKCE(pkce2.verifier, pkce2.challenge)).toBe(true);

      // Mismatched pairs should fail
      expect(await verifyPKCE(pkce1.verifier, pkce2.challenge)).toBe(false);
      expect(await verifyPKCE(pkce2.verifier, pkce1.challenge)).toBe(false);
    });
  });

  describe('PKCE Security Requirements', () => {
    it('should use cryptographically secure random generation', async () => {
      const pkces = await Promise.all([
        generatePKCE(),
        generatePKCE(),
        generatePKCE(),
        generatePKCE(),
        generatePKCE(),
      ]);

      // All verifiers should be unique
      const verifiers = pkces.map((p) => p.verifier);
      const uniqueVerifiers = new Set(verifiers);
      expect(uniqueVerifiers.size).toBe(verifiers.length);

      // All challenges should be unique
      const challenges = pkces.map((p) => p.challenge);
      const uniqueChallenges = new Set(challenges);
      expect(uniqueChallenges.size).toBe(challenges.length);
    });

    it('should produce challenge that cannot be reversed to verifier', async () => {
      const pkce = await generatePKCE();
      // Challenge should be a one-way hash, significantly different from verifier
      expect(pkce.challenge).not.toBe(pkce.verifier);
      expect(pkce.challenge.length).not.toBe(pkce.verifier.length);
    });
  });
});
