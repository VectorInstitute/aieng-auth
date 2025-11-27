# @aieng-auth

> Production-ready Google OAuth SSO for all your web applications

Seamless single sign-on across multiple apps using **one shared Google OAuth client**. Perfect for organizations that want to add authentication to internal tools with minimal configuration.

## 🎯 Key Features

- **Single OAuth Client, Multiple Apps** - All your apps share one Google OAuth client for seamless SSO
- **3-Step Integration** - Install, wrap, configure. That's it.
- **Domain Restriction** - Restrict access to specific email domains (e.g., @vectorinstitute.ai)
- **Zero Backend Required** - Pure client-side OAuth with PKCE security
- **Framework Support** - React hooks + components (Next.js coming soon)
- **TypeScript First** - Fully typed for excellent DX

## 📦 Packages

- **`@aieng-auth/core`** ✅ - Framework-agnostic OAuth client with PKCE
- **`@aieng-auth/react`** ✅ - React hooks and components (AuthProvider, useAuth, ProtectedRoute)
- **`demo-react`** ✅ - Live demo application

## 🚀 Quick Start

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

## 🏗️ Architecture: Single OAuth Client Model

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

**For Developers**: Adding auth to a new app is simple:

1. Get the shared client ID from your admin
2. Ask admin to register your redirect URI
3. Install package and configure (2 env vars)
4. Done!

## 🔧 Setup Google OAuth

### One-Time Admin Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: **Web application**
   - Authorized redirect URIs: Add all your app callback URLs
5. Copy the Client ID

### Per-App Setup

Each developer just needs:

```bash
# .env
VITE_GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
VITE_REDIRECT_URI=http://localhost:3000/callback
VITE_ALLOWED_DOMAINS=vectorinstitute.ai
```

## 📖 Demo

See the live demo in `apps/demo-react`:

```bash
cd apps/demo-react
cp .env.example .env
# Add your Google OAuth Client ID
pnpm dev
```

## 🔒 Security

- **PKCE (Proof Key for Code Exchange)** - Prevents authorization code interception
- **SHA-256 Challenge** - Cryptographically secure
- **Memory Storage (default)** - XSS-immune token storage
- **Domain Validation** - Restrict access by email domain
- **Automatic Token Refresh** - Seamless session management

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run demo
cd apps/demo-react && pnpm dev
```

## 📝 License

MIT
