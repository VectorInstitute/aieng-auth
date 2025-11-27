# @cyberark-auth/core

Framework-agnostic CyberArk OAuth authentication core library with PKCE support.

## Features

- 🔒 Secure OAuth 2.0 Authorization Code + PKCE flow
- 🎯 Framework-agnostic - works with any JavaScript framework
- 💾 Pluggable token storage (Memory, SessionStorage, LocalStorage)
- ⚡ Automatic token refresh management
- 🛡️ TypeScript strict mode with full type definitions
- ✅ Comprehensive test coverage (90%+)

## Installation

```bash
npm install @cyberark-auth/core
# or
pnpm add @cyberark-auth/core
# or
yarn add @cyberark-auth/core
```

## Quick Start

```typescript
import {
  generatePKCE,
  TokenManager,
  MemoryTokenStorage,
  type AuthConfig,
} from '@cyberark-auth/core';

// Configure authentication
const config: AuthConfig = {
  tenantUrl: 'https://your-tenant.cyberark.cloud',
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:3000/callback',
  scopes: ['openid', 'profile', 'email'],
};

// Initialize token manager
const tokenManager = new TokenManager(new MemoryTokenStorage());

// Generate PKCE challenge for login
const pkce = await generatePKCE();
console.log(pkce.challenge); // Send to authorization endpoint
```

## API Reference

### PKCE Utilities

```typescript
// Generate PKCE challenge
const pkce = await generatePKCE();
// { verifier: '...', challenge: '...', method: 'S256' }

// Verify PKCE (for testing)
const isValid = await verifyPKCE(pkce.verifier, pkce.challenge);
```

### Token Storage

```typescript
import {
  MemoryTokenStorage,
  SessionStorageAdapter,
  LocalStorageAdapter,
} from '@cyberark-auth/core';

// Memory storage (most secure, lost on refresh)
const memoryStorage = new MemoryTokenStorage();

// Session storage (survives refresh, XSS vulnerable)
const sessionStorage = new SessionStorageAdapter();

// Local storage (persists across sessions, least secure)
const localStorage = new LocalStorageAdapter();
```

### Token Manager

```typescript
import { TokenManager } from '@cyberark-auth/core';

const manager = new TokenManager(storage);

// Store tokens
await manager.setTokens({
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  tokenType: 'Bearer',
  expiresIn: 3600,
});

// Get tokens
const tokens = await manager.getTokens();
const accessToken = await manager.getAccessToken();

// Validate tokens
const isValid = await manager.isTokenValid();
const shouldRefresh = await manager.shouldRefresh(300); // 5 min buffer

// Clear tokens
await manager.clearTokens();
```

### Token Validation

```typescript
import {
  decodeToken,
  isTokenExpired,
  validateToken,
} from '@cyberark-auth/core';

// Decode JWT
const decoded = decodeToken(accessToken);

// Check expiration
const expired = isTokenExpired(accessToken);
const expiringSoon = isTokenExpired(accessToken, 300); // 5 min buffer

// Validate token
const valid = validateToken(accessToken, {
  checkExpiration: true,
  requiredClaims: ['sub', 'email'],
  issuer: 'https://your-tenant.cyberark.cloud',
});
```

## Security

- Always use PKCE for public clients (SPAs)
- Prefer `MemoryTokenStorage` for maximum security
- Use `SessionStorageAdapter` only when UX requires persistence
- Avoid `LocalStorageAdapter` unless absolutely necessary
- Never store tokens in URLs or query parameters
- Implement proper HTTPS in production

## License

MIT
