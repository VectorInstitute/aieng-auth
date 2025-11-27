# Setup Guide

## Quick Setup (5 minutes)

### Step 1: Google Cloud Console Configuration

1. **Create/Access Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Navigate to **APIs & Services** → **Library**
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Demo App` (or any name)

4. **Configure OAuth Settings**
   - **Authorized JavaScript origins:** Add `http://localhost:3000`
   - **Authorized redirect URIs:** Add `http://localhost:3000/callback`
   - Click **Create**

5. **Copy Credentials**
   - Copy the **Client ID** (looks like: `123456789-xxx.apps.googleusercontent.com`)
   - Copy the **Client Secret** (looks like: `GOCSPX-xxxxxxxxxxxxx`)
   - Note: Google requires the client secret even for PKCE flows in web apps

### Step 2: Local Configuration

```bash
# In apps/demo-react directory
cp .env.example .env
```

Edit `.env` and add your values:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret-here
VITE_REDIRECT_URI=http://localhost:3000/callback
VITE_POST_LOGOUT_REDIRECT_URI=http://localhost:3000
```

### Step 3: Run Demo

```bash
pnpm dev
```

Open http://localhost:3000

## Current Demo Features

**Without Google setup:**

- ✅ PKCE generation
- ✅ Token storage testing
- ✅ Mock token validation

**With Google setup (coming soon):**

- Login/logout flow
- Real Google OAuth tokens
- Protected routes
- User profile from Google

## Troubleshooting

**"redirect_uri_mismatch"** → Check redirect URI is registered in Google Cloud Console exactly as `http://localhost:3000/callback`

**"invalid_client"** → Verify Client ID is correct in `.env`

**"access_denied"** → User cancelled login or doesn't have access

## Email Domain Restriction

To restrict access to specific email domains (e.g., @vectorinstitute.ai):

1. **Option A: Google Workspace** (Recommended)
   - If your organization uses Google Workspace
   - Set OAuth consent screen to "Internal"
   - Only users in your workspace can sign in

2. **Option B: Client-side validation**
   - Allow any Google user to sign in
   - Validate email domain after authentication
   - Reject users with unauthorized domains

Example validation:

```typescript
const allowedDomains = ['vectorinstitute.ai'];
const email = user.email;
const domain = email.split('@')[1];

if (!allowedDomains.includes(domain)) {
  // Reject user
}
```

## Production Deployment

When deploying to production:

1. Add production redirect URI to Google Cloud Console
2. Update environment variables with production values
3. Use HTTPS (required by Google)
4. Consider using Google Workspace for better access control
