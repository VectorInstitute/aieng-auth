# @aieng-auth

Production-ready Google OAuth SSO for Vector internal web applications.

## Key Features

- Share one Google OAuth client across multiple apps for seamless SSO
- Client-side OAuth with PKCE security (no backend required)
- Domain restriction by email (e.g., @vectorinstitute.ai)
- React hooks and components with full TypeScript support

## Packages

- `@aieng-auth/core` - Framework-agnostic OAuth client with PKCE
- `@aieng-auth/react` - React hooks and components (AuthProvider, useAuth, ProtectedRoute)
- `demo-react` - Demo application

## Quick Start

### 1. Install

```bash
pnpm add @aieng-auth/react
```

### 2. Wrap Your App

```tsx
import { AuthProvider } from '@aieng-auth/react';

const authConfig = {
  clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  redirectUri: 'http://localhost:3000/callback',
  allowedDomains: ['vectorinstitute.ai'], // Optional: restrict by email domain
};

function App() {
  return (
    <AuthProvider config={authConfig}>
      <YourApp />
    </AuthProvider>
  );
}
```

### 3. Use Authentication

```tsx
import { useAuth } from '@aieng-auth/react';

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={login}>Sign in with Google</button>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Architecture

```
┌─────────────────────────────────────────────┐
│   Google Cloud Console                      │
│   ┌─────────────────────────────────┐       │
│   │ ONE OAuth 2.0 Client            │       │
│   │ • Client ID: xxx.apps.google... │       │
│   │ • Redirect URIs:                │       │
│   │   - app1.com/callback           │       │
│   │   - app2.com/callback           │       │
│   │   - app3.com/callback           │       │
│   └─────────────────────────────────┘       │
└─────────────────────────────────────────────┘
            │
            │ Same Client ID
            ├──────────┬──────────┬──────────
            │          │          │
     ┌──────▼──┐ ┌─────▼────┐ ┌──▼────────┐
     │ App 1   │ │  App 2   │ │  App 3    │
     │ Admin   │ │  Dash    │ │  Tools    │
     │ Portal  │ │  board   │ │           │
     └─────────┘ └──────────┘ └───────────┘
        ▲            ▲            ▲
        └────────────┴────────────┘
         Seamless SSO across all apps
```

All apps share one OAuth client. To add auth to a new app:

1. Get the shared client ID from your admin
2. Ask admin to add your redirect URI to the OAuth client
3. Install and configure with environment variables

## Setup Google OAuth

### Admin Setup (One-Time)

1. Create OAuth 2.0 credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Set application type to Web application
3. Add all app callback URLs to Authorized redirect URIs
4. Share the Client ID with developers

### Developer Setup

```bash
# .env
VITE_GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
VITE_REDIRECT_URI=http://localhost:3000/callback
VITE_ALLOWED_DOMAINS=vectorinstitute.ai
```

## Demo

Run the demo app:

```bash
cd apps/demo-react
cp .env.example .env  # Add your Google OAuth Client ID
pnpm dev
```

## Security

- PKCE (Proof Key for Code Exchange) with SHA-256 challenge
- Memory storage (XSS-immune)
- Domain validation for email restrictions
- Automatic token refresh

## Development

```bash
pnpm install  # Install dependencies
pnpm build    # Build all packages
pnpm test     # Run tests
```
