import type { DecodedToken } from '../types/token';
import { createAuthError } from '../errors/auth-errors';

/**
 * Decode a JWT token without verification
 * Note: This only decodes the payload, does not verify signature
 *
 * @param token JWT token to decode
 * @returns Decoded token payload
 * @throws {AuthError} If token format is invalid
 */
export function decodeToken(token: string): DecodedToken {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = parts[1];
    if (!payload) {
      throw new Error('Missing JWT payload');
    }

    // Decode base64url
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    const decoded = JSON.parse(jsonPayload) as DecodedToken;

    return decoded;
  } catch (error) {
    throw createAuthError.invalidToken(
      'Failed to decode JWT token',
      error
    );
  }
}

/**
 * Check if a token is expired
 *
 * @param token JWT token or decoded token payload
 * @param bufferSeconds Buffer time in seconds (tokens expiring within buffer are considered expired)
 * @returns True if token is expired or expiring soon
 */
export function isTokenExpired(
  token: string | DecodedToken,
  bufferSeconds: number = 0
): boolean {
  try {
    const decoded = typeof token === 'string' ? decodeToken(token) : token;

    if (!decoded.exp) {
      // No expiration claim - treat as expired for safety
      return true;
    }

    const now = Math.floor(Date.now() / 1000); // Convert to Unix timestamp
    const expiresAt = decoded.exp - bufferSeconds;

    return now >= expiresAt;
  } catch {
    // If we can't decode, treat as expired
    return true;
  }
}

/**
 * Get the expiration time of a token
 *
 * @param token JWT token or decoded token payload
 * @returns Expiration timestamp (Unix seconds) or null if not found
 */
export function getTokenExpiration(token: string | DecodedToken): number | null {
  try {
    const decoded = typeof token === 'string' ? decodeToken(token) : token;
    return decoded.exp || null;
  } catch {
    return null;
  }
}

/**
 * Get the time remaining until token expiration
 *
 * @param token JWT token or decoded token payload
 * @returns Seconds until expiration, or 0 if expired/invalid
 */
export function getTimeUntilExpiration(token: string | DecodedToken): number {
  try {
    const decoded = typeof token === 'string' ? decodeToken(token) : token;

    if (!decoded.exp) {
      return 0;
    }

    const now = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - now;

    return Math.max(0, remaining);
  } catch {
    return 0;
  }
}

/**
 * Validate basic token structure and claims
 *
 * @param token JWT token to validate
 * @param options Validation options
 * @returns True if valid, false otherwise
 */
export function validateToken(
  token: string,
  options: {
    checkExpiration?: boolean;
    requiredClaims?: string[];
    issuer?: string;
    audience?: string;
  } = {}
): boolean {
  try {
    const decoded = decodeToken(token);

    // Check expiration if requested
    if (options.checkExpiration && isTokenExpired(decoded)) {
      return false;
    }

    // Check required claims
    if (options.requiredClaims) {
      for (const claim of options.requiredClaims) {
        if (!(claim in decoded)) {
          return false;
        }
      }
    }

    // Check issuer
    if (options.issuer && decoded.iss !== options.issuer) {
      return false;
    }

    // Check audience
    if (options.audience) {
      const aud = Array.isArray(decoded.aud) ? decoded.aud : [decoded.aud];
      if (!aud.includes(options.audience)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}
