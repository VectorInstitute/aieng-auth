# Google OAuth React Demo

Interactive demo application showcasing the `@aieng-auth/core` package.

## Features

✅ **PKCE Generation** - See cryptographically secure challenge generation in action
✅ **Token Management** - Test different storage strategies (Memory, SessionStorage, LocalStorage)
✅ **Token Validation** - Decode and validate JWT tokens
✅ **Interactive UI** - Clean, modern interface to explore all features

## Quick Start

```bash
# Install dependencies (from monorepo root)
pnpm install

# Run demo
cd apps/demo-react
pnpm dev
```

Then open http://localhost:3000

## Configuration (Optional)

See [SETUP.md](./SETUP.md) for detailed Google OAuth configuration instructions.

**TL;DR:**
1. Create OAuth 2.0 client in Google Cloud Console
2. Add `http://localhost:3000/callback` as authorized redirect URI
3. Copy Client ID to `.env`

## What You Can Test

### 1. PKCE Generation
- Click "Generate New PKCE" to create secure challenges
- See verifier and SHA-256 challenge output
- Verify URL-safe encoding

### 2. Token Storage
- Switch between storage types
- Create mock tokens
- See how different strategies work
- Test token persistence across page refreshes

### 3. Token Validation
- Decode JWT tokens
- Check expiration status
- View token claims

## Current Limitations

- Mock tokens only (React integration in progress)
- No actual Google OAuth flow yet (requires React package completion)
- Protected routes coming soon

## Next Steps

Once React package is complete, this demo will include:
- Full Google OAuth login/logout flow
- AuthProvider integration
- Protected routes
- User profile display from Google
- Automatic token refresh
