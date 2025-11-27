import type { AuthConfig } from '@aieng-auth/core';

if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
  throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is required');
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_SECRET is required');
}

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required');
}

export const authConfig: AuthConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI || 'http://localhost:3001/api/auth/callback',
  postLogoutRedirectUri: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  allowedDomains: process.env.ALLOWED_DOMAINS?.split(','),
};
