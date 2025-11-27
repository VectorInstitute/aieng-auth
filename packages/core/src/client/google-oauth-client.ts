import type { AuthConfig, PKCEChallenge } from '../types/config';
import type { AuthTokens } from '../types/token';
import type { User } from '../types/user';
import { generatePKCE } from './pkce';
import { AuthError, AuthErrorCode } from '../errors/auth-errors';
import { decodeToken, isTokenExpired } from '../token/token-validator';

/**
 * Google OAuth 2.0 endpoints
 */
const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_ENDPOINT = 'https://oauth2.googleapis.com/revoke';
const GOOGLE_USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v2/userinfo';

/**
 * Google OAuth client for handling authentication flow
 */
export class GoogleOAuthClient {
  private config: AuthConfig;
  private pkceChallenge: PKCEChallenge | null = null;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  /**
   * Start the OAuth login flow
   * Generates PKCE challenge and redirects to Google authorization endpoint
   */
  async login(): Promise<void> {
    // Generate PKCE challenge
    this.pkceChallenge = await generatePKCE();

    // Store PKCE verifier and state in session storage
    sessionStorage.setItem('pkce_verifier', this.pkceChallenge.verifier);
    const state = this.generateState();
    sessionStorage.setItem('oauth_state', state);

    // Build authorization URL
    const scopes = this.config.scopes || ['openid', 'profile', 'email'];
    const authUrl = new URL(GOOGLE_AUTH_ENDPOINT);
    authUrl.searchParams.set('client_id', this.config.clientId);
    authUrl.searchParams.set('redirect_uri', this.config.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes.join(' '));
    authUrl.searchParams.set('code_challenge', this.pkceChallenge.challenge);
    authUrl.searchParams.set('code_challenge_method', this.pkceChallenge.method);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline'); // Request refresh token
    authUrl.searchParams.set('prompt', 'consent'); // Force consent to get refresh token

    // Redirect to Google
    window.location.href = authUrl.toString();
  }

  /**
   * Handle OAuth callback
   * Exchanges authorization code for tokens
   */
  async handleCallback(callbackUrl: string): Promise<AuthTokens> {
    const url = new URL(callbackUrl);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // Check for authorization errors
    if (error) {
      throw new AuthError(
        AuthErrorCode.AUTH_FAILED,
        `Google authorization failed: ${error}`
      );
    }

    // Validate state
    const storedState = sessionStorage.getItem('oauth_state');
    if (!state || state !== storedState) {
      throw new AuthError(AuthErrorCode.INVALID_STATE, 'Invalid state parameter');
    }

    // Check for authorization code
    if (!code) {
      throw new AuthError(AuthErrorCode.AUTH_FAILED, 'No authorization code received');
    }

    // Get stored PKCE verifier
    const verifier = sessionStorage.getItem('pkce_verifier');
    if (!verifier) {
      throw new AuthError(AuthErrorCode.PKCE_ERROR, 'PKCE verifier not found');
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(code, verifier);

    // Validate email domain if configured
    if (this.config.allowedDomains && this.config.allowedDomains.length > 0) {
      await this.validateEmailDomain(tokens.accessToken);
    }

    // Clean up session storage
    sessionStorage.removeItem('pkce_verifier');
    sessionStorage.removeItem('oauth_state');

    return tokens;
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCodeForTokens(code: string, verifier: string): Promise<AuthTokens> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code_verifier: verifier,
    });

    const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AuthError(
        AuthErrorCode.AUTH_FAILED,
        errorData.error_description || `Token request failed: ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type || 'Bearer',
      expiresIn: data.expires_in,
      scope: data.scope,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new AuthError(AuthErrorCode.TOKEN_REFRESH_FAILED, 'No refresh token available');
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AuthError(
        AuthErrorCode.TOKEN_REFRESH_FAILED,
        errorData.error_description || `Token refresh failed: ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // Google may not return new refresh token
      tokenType: data.token_type || 'Bearer',
      expiresIn: data.expires_in,
      scope: data.scope,
    };
  }

  /**
   * Get user info from Google
   */
  async getUserInfo(accessToken: string): Promise<User> {
    const response = await fetch(GOOGLE_USERINFO_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new AuthError(
        AuthErrorCode.USER_FETCH_ERROR,
        `Failed to fetch user info: ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      sub: data.id, // Google uses 'id' but OpenID standard uses 'sub'
      email: data.email,
      name: data.name,
      givenName: data.given_name,
      familyName: data.family_name,
      picture: data.picture,
      emailVerified: data.verified_email,
      locale: data.locale,
    };
  }

  /**
   * Revoke token (logout)
   */
  async revokeToken(token: string): Promise<void> {
    const body = new URLSearchParams({
      token,
    });

    await fetch(GOOGLE_REVOKE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    // Google doesn't return error for revoke, so we don't check response
  }

  /**
   * Validate email domain against allowed domains
   */
  private async validateEmailDomain(accessToken: string): Promise<void> {
    const user = await this.getUserInfo(accessToken);
    const email = user.email;

    if (!email) {
      throw new AuthError(AuthErrorCode.AUTH_FAILED, 'Email not available');
    }

    const domain = email.split('@')[1];
    if (!domain) {
      throw new AuthError(AuthErrorCode.AUTH_FAILED, 'Invalid email format');
    }

    const allowedDomains = this.config.allowedDomains || [];
    if (!allowedDomains.includes(domain)) {
      throw new AuthError(
        AuthErrorCode.AUTH_FAILED,
        `Email domain ${domain} is not allowed. Only ${allowedDomains.join(', ')} are permitted.`
      );
    }
  }

  /**
   * Generate secure random state
   */
  private generateState(): string {
    return crypto.randomUUID();
  }

  /**
   * Check if access token is valid
   */
  isTokenValid(accessToken: string): boolean {
    try {
      return !isTokenExpired(accessToken);
    } catch {
      return false;
    }
  }

  /**
   * Decode access token
   */
  decodeAccessToken(accessToken: string) {
    return decodeToken(accessToken);
  }
}
