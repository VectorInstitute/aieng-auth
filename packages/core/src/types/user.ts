/**
 * User information from CyberArk Identity
 */
export interface User {
  /**
   * Unique user identifier (subject)
   */
  sub: string;

  /**
   * User's email address
   */
  email?: string;

  /**
   * Whether email is verified
   */
  emailVerified?: boolean;

  /**
   * User's full name
   */
  name?: string;

  /**
   * User's given name
   */
  givenName?: string;

  /**
   * User's family name
   */
  familyName?: string;

  /**
   * User's preferred username
   */
  preferredUsername?: string;

  /**
   * URL to user's profile picture
   */
  picture?: string;

  /**
   * User's locale
   */
  locale?: string;

  /**
   * User's timezone
   */
  zoneinfo?: string;

  /**
   * Last update timestamp
   */
  updatedAt?: number;

  /**
   * Additional user claims from CyberArk
   */
  [key: string]: unknown;
}
