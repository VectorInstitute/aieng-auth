# @vector-institute/aieng-auth-react

React hooks and components for CyberArk OAuth authentication with PKCE support.

## Features

- 🎣 React hooks for authentication state and token management
- 🔐 Built-in `AuthProvider` for managing authentication context
- 🛡️ `ProtectedRoute` component for route protection
- ⚡ Automatic token refresh handling
- 🎯 TypeScript support with full type definitions
- 🔄 Loading and error states handled automatically

## Installation

```bash
npm install @vector-institute/aieng-auth-react
# or
pnpm add @vector-institute/aieng-auth-react
# or
yarn add @vector-institute/aieng-auth-react
```

## Quick Start

### 1. Wrap your app with AuthProvider

```tsx
import { AuthProvider } from '@vector-institute/aieng-auth-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const authConfig = {
  clientId: 'your-google-client-id',
  clientSecret: 'your-google-client-secret',
  redirectUri: 'http://localhost:3000/callback',
  postLogoutRedirectUri: 'http://localhost:3000',
  allowedDomains: ['yourdomain.com'], // Optional: restrict by email domain
};

function App() {
  return (
    <AuthProvider config={authConfig}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/callback" element={<CallbackPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

### 2. Use the authentication hook

```tsx
import { useAuth } from '@vector-institute/aieng-auth-react';

function HomePage() {
  const { isAuthenticated, isLoading, user, login, logout, error } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={login}>Sign in with Google</button>
      ) : (
        <div>
          <p>Welcome, {user?.name}!</p>
          <p>Email: {user?.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}
```

### 3. Handle the OAuth callback

```tsx
import { useAuth } from '@vector-institute/aieng-auth-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CallbackPage() {
  const { handleCallback, isLoading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    handleCallback().then(() => {
      navigate('/dashboard');
    });
  }, [handleCallback, navigate]);

  if (error) {
    return <div>Authentication failed: {error.message}</div>;
  }

  return <div>Completing authentication...</div>;
}
```

## API Reference

### AuthProvider

Provides authentication context to your application.

```tsx
<AuthProvider config={authConfig} storage={storage}>
  {children}
</AuthProvider>
```

**Props:**

- `config` (required): Authentication configuration object
  - `clientId`: Google OAuth client ID
  - `clientSecret`: Google OAuth client secret
  - `redirectUri`: OAuth redirect URI
  - `postLogoutRedirectUri`: Where to redirect after logout
  - `allowedDomains`: Array of allowed email domains (optional)
- `storage` (optional): Token storage implementation (defaults to `MemoryTokenStorage`)
- `children`: React children

### useAuth Hook

Access authentication state and methods.

```tsx
const { isAuthenticated, isLoading, user, error, login, logout, handleCallback, refreshToken } =
  useAuth();
```

**Returns:**

- `isAuthenticated`: Boolean indicating if user is authenticated
- `isLoading`: Boolean indicating if authentication is in progress
- `user`: User object with profile information (name, email, picture, etc.)
- `error`: Error object if authentication fails
- `login()`: Function to initiate OAuth login flow
- `logout()`: Function to log out the user
- `handleCallback()`: Function to handle OAuth callback (call this on your callback page)
- `refreshToken()`: Function to manually refresh the access token

### useToken Hook

Access token information directly.

```tsx
const { accessToken, isValid, refresh } = useToken();
```

**Returns:**

- `accessToken`: Current access token (string or null)
- `isValid`: Boolean indicating if the token is valid
- `refresh()`: Function to refresh the token

### ProtectedRoute Component

Protect routes that require authentication.

```tsx
import { ProtectedRoute } from '@vector-institute/aieng-auth-react';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute redirectTo="/login">
      <DashboardPage />
    </ProtectedRoute>
  }
/>;
```

**Props:**

- `children`: React children to render if authenticated
- `redirectTo`: Path to redirect to if not authenticated (default: '/')

## Types

```typescript
import type {
  AuthState,
  AuthContextValue,
  AuthProviderProps,
  ProtectedRouteProps,
  // Re-exported from core
  AuthConfig,
  AuthTokens,
  User,
} from '@vector-institute/aieng-auth-react';
```

## Configuration

### Environment Variables

Example `.env` file for your React app:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id
VITE_GOOGLE_CLIENT_SECRET=your-client-secret
VITE_REDIRECT_URI=http://localhost:3000/callback
VITE_POST_LOGOUT_REDIRECT_URI=http://localhost:3000
VITE_ALLOWED_DOMAINS=yourdomain.com,anotherdomain.com
```

### Token Storage

By default, `AuthProvider` uses `MemoryTokenStorage` which stores tokens in memory (most secure but lost on refresh). You can provide a custom storage:

```tsx
import { SessionStorageAdapter } from '@vector-institute/aieng-auth-core';

<AuthProvider config={authConfig} storage={new SessionStorageAdapter()}>
  {children}
</AuthProvider>;
```

## Security Best Practices

- Always use PKCE flow (automatically handled by this library)
- Use `MemoryTokenStorage` for maximum security (tokens lost on refresh)
- Use `SessionStorageAdapter` if you need persistence across page refreshes
- Avoid `LocalStorageAdapter` unless absolutely necessary
- Restrict access by email domain using `allowedDomains` config
- Always use HTTPS in production
- Never commit OAuth client secrets to version control

## Example: Complete Authentication Flow

```tsx
// App.tsx
import { AuthProvider } from '@vector-institute/aieng-auth-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const config = {
  clientId: process.env.REACT_APP_CLIENT_ID,
  clientSecret: process.env.REACT_APP_CLIENT_SECRET,
  redirectUri: `${window.location.origin}/callback`,
  postLogoutRedirectUri: window.location.origin,
  allowedDomains: ['yourdomain.com'],
};

function App() {
  return (
    <AuthProvider config={config}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// LoginPage.tsx
function LoginPage() {
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <button onClick={login}>Sign in with Google</button>;
}

// CallbackPage.tsx
function CallbackPage() {
  const { handleCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    handleCallback().then(() => navigate('/dashboard'));
  }, []);

  return <div>Authenticating...</div>;
}

// DashboardPage.tsx
function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## License

MIT
