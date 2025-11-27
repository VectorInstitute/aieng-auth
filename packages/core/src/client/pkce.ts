import type { PKCEChallenge } from '../types/config';
import { createAuthError } from '../errors/auth-errors';

/**
 * Generate a cryptographically secure random string
 * @param length Length of the string to generate
 * @returns Base64 URL-encoded random string
 */
export function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Base64 URL encode a buffer
 * Converts to URL-safe base64 by replacing +, /, and removing =
 * @param buffer Buffer to encode
 * @returns URL-safe base64 encoded string
 */
export function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;

  // Base64 encode - use Buffer in Node.js environment if available
  let base64: string;
  if (typeof Buffer !== 'undefined') {
    // In Node.js, use Buffer directly from Uint8Array
    base64 = Buffer.from(bytes).toString('base64');
  } else {
    // In browser, convert to binary string first
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i] as number);
    }
    base64 = btoa(binary);
  }

  // Make URL-safe
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Create SHA-256 hash of a string
 * @param value String to hash
 * @returns Promise resolving to hash buffer
 */
async function sha256(value: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  return crypto.subtle.digest('SHA-256', data);
}

/**
 * Generate PKCE challenge pair (code verifier and code challenge)
 * Uses S256 method (SHA-256) for maximum security
 *
 * @returns Promise resolving to PKCE challenge object
 * @throws {AuthError} If PKCE generation fails
 *
 * @example
 * ```typescript
 * const pkce = await generatePKCE();
 * // Store pkce.verifier securely (sessionStorage)
 * // Send pkce.challenge to authorization endpoint
 * ```
 */
export async function generatePKCE(): Promise<PKCEChallenge> {
  try {
    // Generate a random 128-byte code verifier
    // RFC 7636 recommends 43-128 characters
    const verifier = generateRandomString(128);

    // Create SHA-256 hash of the verifier
    const challengeBuffer = await sha256(verifier);

    // Base64 URL encode the hash
    const challenge = base64UrlEncode(challengeBuffer);

    return {
      verifier,
      challenge,
      method: 'S256',
    };
  } catch (error) {
    throw createAuthError.pkceError(
      'Failed to generate PKCE challenge',
      error
    );
  }
}

/**
 * Verify that a code verifier matches a previously generated challenge
 * Used for testing purposes
 *
 * @param verifier The code verifier
 * @param challenge The code challenge to verify against
 * @returns Promise resolving to true if valid, false otherwise
 */
export async function verifyPKCE(
  verifier: string,
  challenge: string
): Promise<boolean> {
  try {
    const challengeBuffer = await sha256(verifier);
    const computedChallenge = base64UrlEncode(challengeBuffer);
    return computedChallenge === challenge;
  } catch {
    return false;
  }
}
