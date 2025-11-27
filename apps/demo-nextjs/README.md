# Google OAuth Next.js Demo

Server-side OAuth authentication with Next.js App Router.

## Features

- ✅ Server-side session management with `iron-session`
- ✅ HTTP-only cookies (XSS immune)
- ✅ OAuth 2.0 + PKCE flow
- ✅ Domain restriction (@vectorinstitute.ai)
- ✅ Protected routes with Server Components

## Setup

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Update `.env` with your Google OAuth credentials:**
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
   SESSION_SECRET=generate-a-random-32-character-string
   ```

3. **Generate a session secret:**
   ```bash
   openssl rand -base64 32
   ```

4. **Add redirect URI to Google Cloud Console:**
   - Go to https://console.cloud.google.com/apis/credentials?project=coderd
   - Edit your OAuth client
   - Add: `http://localhost:3001/api/auth/callback`

## Run

```bash
pnpm install
pnpm dev
```

Open http://localhost:3001

## Architecture

### Server-Side Sessions

Unlike the React SPA demo, this uses server-side sessions:

```
┌─────────────────────────────────────┐
│ Browser                             │
│ - Only has encrypted session cookie │
│ - No access to tokens               │
└─────────────────────────────────────┘
              │
              │ HTTP-only cookie
              ▼
┌─────────────────────────────────────┐
│ Next.js Server                      │
│ - Decrypts session                  │
│ - Has access to tokens              │
│ - Can refresh tokens automatically  │
└─────────────────────────────────────┘
```

### Benefits vs Client-Side

| Feature | React SPA | Next.js SSR |
|---------|-----------|-------------|
| Token Storage | Browser (memory/localStorage) | Server (encrypted session) |
| XSS Protection | Memory storage only | HTTP-only cookies |
| Token Refresh | Client-side | Server-side |
| SEO | Limited | Full SSR |
| Initial Load | Auth check required | Server renders with auth |

## API Routes

- `GET /api/auth/login` - Initiates OAuth flow
- `GET /api/auth/callback` - Handles OAuth callback
- `POST /api/auth/logout` - Destroys session
- `GET /api/auth/session` - Gets current session

## Protected Routes

Use Server Components to check authentication:

```typescript
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await getSession();

  if (!session.isAuthenticated) {
    redirect('/');
  }

  return <div>Protected content</div>;
}
```

## Production Deployment

1. Set environment variables in your deployment platform
2. Update `NEXT_PUBLIC_APP_URL` and `REDIRECT_URI` for production URLs
3. Register production redirect URI in Google Cloud Console
4. Use a strong `SESSION_SECRET` (32+ characters)
5. Ensure `NODE_ENV=production` for secure cookies
