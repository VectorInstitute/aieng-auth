# @vector-institute/aieng-auth

[![Code Checks](https://github.com/VectorInstitute/aieng-auth/actions/workflows/code_checks.yml/badge.svg)](https://github.com/VectorInstitute/aieng-auth/actions/workflows/code_checks.yml)
[![Unit Tests](https://github.com/VectorInstitute/aieng-auth/actions/workflows/unit_tests.yml/badge.svg)](https://github.com/VectorInstitute/aieng-auth/actions/workflows/unit_tests.yml)
[![Publish](https://github.com/VectorInstitute/aieng-auth/actions/workflows/publish.yml/badge.svg)](https://github.com/VectorInstitute/aieng-auth/actions/workflows/publish.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

[![npm version - core](https://img.shields.io/npm/v/@vector-institute/aieng-auth-core?label=core&color=cb3837)](https://www.npmjs.com/package/@vector-institute/aieng-auth-core)
[![npm version - react](https://img.shields.io/npm/v/@vector-institute/aieng-auth-react?label=react&color=cb3837)](https://www.npmjs.com/package/@vector-institute/aieng-auth-react)
[![npm downloads - core](https://img.shields.io/npm/dm/@vector-institute/aieng-auth-core?label=core%20downloads)](https://www.npmjs.com/package/@vector-institute/aieng-auth-core)
[![npm downloads - react](https://img.shields.io/npm/dm/@vector-institute/aieng-auth-react?label=react%20downloads)](https://www.npmjs.com/package/@vector-institute/aieng-auth-react)

Production-ready Google OAuth SSO for Vector internal web applications.

## Key Features

- Share one Google OAuth client across multiple apps for seamless SSO
- Client-side OAuth with PKCE security (no backend required)
- Domain restriction by email (e.g., @vectorinstitute.ai)
- React hooks and components with full TypeScript support

## Packages

- `@vector-institute/aieng-auth-core` - Framework-agnostic OAuth client with PKCE
- `@vector-institute/aieng-auth-react` - React hooks and components (AuthProvider, useAuth, ProtectedRoute)
- `demo-react` - Client-side OAuth demo with React SPA
- `demo-nextjs` - Server-side OAuth demo with Next.js App Router

## Quick Start

### 1. Install

```bash
pnpm add @vector-institute/aieng-auth-react
```

### 2. Wrap Your App

```tsx
import { AuthProvider } from '@vector-institute/aieng-auth-react';

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
import { useAuth } from '@vector-institute/aieng-auth-react';

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

### React SPA (Client-Side)

```bash
cd apps/demo-react
cp .env.example .env  # Add your Google OAuth Client ID
pnpm dev              # Runs on http://localhost:3000
```

### Next.js (Server-Side)

```bash
cd apps/demo-nextjs
cp .env.example .env  # Add Google OAuth credentials and session secret
pnpm dev              # Runs on http://localhost:3001
```

The Next.js demo uses server-side sessions with HTTP-only cookies for enhanced security, while the React demo uses client-side PKCE flow.

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

## Publishing

This project uses [Changesets](https://github.com/changesets/changesets) for version management and publishing, with [npm Trusted Publishers](https://docs.npmjs.com/trusted-publishers) for secure authentication.

### Setup (One-Time)

Configure npm Trusted Publishers to allow GitHub Actions to publish without tokens:

1. **Log in to npm**: Go to [npmjs.com](https://www.npmjs.com) and sign in

2. **Navigate to Publishing Access**:
   - For each package (`@vector-institute/aieng-auth-core` and `@vector-institute/aieng-auth-react`):
     - Go to the package page (create if it doesn't exist yet)
     - Click "Settings" → "Publishing Access"
     - Or go directly to: `https://www.npmjs.com/package/@vector-institute/PACKAGE_NAME/access`

3. **Add GitHub Actions as Trusted Publisher**:
   - Click "Add Trusted Publisher"
   - Select "GitHub Actions"
   - Fill in:
     - **Repository owner**: `VectorInstitute`
     - **Repository name**: `aieng-auth`
     - **Workflow name**: `publish.yml`
     - **Environment name**: (leave empty)
   - Click "Add"

4. **Repeat for all packages**: Do steps 2-3 for both `@vector-institute/aieng-auth-core` and `@vector-institute/aieng-auth-react`

**Note**: If packages don't exist yet on npm, you can either:
- Create them manually first (recommended)
- Or publish the first version using a temporary automation token, then configure trusted publishing

### Release Workflow

1. **Make your changes** and commit them to a branch

2. **Create a changeset** describing your changes:
   ```bash
   pnpm changeset
   ```
   - Select the packages that changed (core, react, or both)
   - Select the version bump type (major, minor, or patch)
   - Provide a description of the changes

3. **Commit the changeset** along with your code changes:
   ```bash
   git add .changeset
   git commit -m "feat: your feature description"
   ```

4. **Create a pull request** - the changeset file will be included

5. **Merge to main** - the publish workflow will:
   - Create a "Version Packages" PR that updates versions and changelogs
   - When you merge the "Version Packages" PR, packages are automatically published to npm

### Manual Publishing (if needed)

```bash
pnpm build              # Build all packages
pnpm changeset version  # Update versions and changelogs
pnpm changeset publish  # Publish to npm
git push --follow-tags  # Push version commits and tags
```
