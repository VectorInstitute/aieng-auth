# GCP OAuth Setup for Demo App

## Quick Setup (5 minutes)

Unfortunately, `gcloud` CLI doesn't support creating OAuth 2.0 credentials directly. You need to use the Google Cloud Console.

### Step 1: Open Google Cloud Console

```bash
# Open the credentials page in your browser
open "https://console.cloud.google.com/apis/credentials?project=coderd"
```

### Step 2: Configure OAuth Consent Screen (First Time Only)

1. Click **"OAuth consent screen"** in the left sidebar
2. Select **"Internal"** (for @vectorinstitute.ai users only)
   - This restricts access to your Google Workspace organization
3. Fill in required fields:
   - **App name**: `AIEng Auth Demo`
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **"Save and Continue"**
5. Skip **Scopes** (default is fine)
6. Click **"Save and Continue"**
7. Click **"Back to Dashboard"**

### Step 3: Create OAuth Client ID

```bash
# Open credentials creation page
open "https://console.cloud.google.com/apis/credentials/oauthclient?project=coderd"
```

1. **Application type**: Select **"Web application"**
2. **Name**: `AIEng Auth Demo`
3. **Authorized JavaScript origins**:
   - Add: `http://localhost:3000`
4. **Authorized redirect URIs**:
   - Add: `http://localhost:3000/callback`
5. Click **"Create"**

### Step 4: Copy Credentials

1. A dialog will appear with your credentials
2. Copy the **Client ID** (looks like: `123456789-xxxxx.apps.googleusercontent.com`)
3. Copy the **Client Secret** (looks like: `GOCSPX-xxxxxxxxxxxxx`)
   - Note: Even though this is called a "secret", it's required by Google for web apps
   - It's not truly secret in browser apps, but Google's API requires it

### Step 5: Update .env File

```bash
cd /Users/amritkrishnan/src/aieng-template-auth/apps/demo-react

# Create .env from template
cp .env.example .env

# Edit .env and paste your credentials
nano .env
```

Update these two lines with your values:
```bash
VITE_GOOGLE_CLIENT_ID=<paste-your-client-id-here>.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=GOCSPX-<paste-your-client-secret-here>
```

### Step 6: Run Demo

```bash
cd /Users/amritkrishnan/src/aieng-template-auth/apps/demo-react
pnpm dev
```

Open http://localhost:3000 and sign in with your @vectorinstitute.ai email!

## Alternative: Quick Open All Pages

```bash
# Open all necessary pages at once
open "https://console.cloud.google.com/apis/credentials?project=coderd"
```

## Troubleshooting

**Error: "redirect_uri_mismatch"**
- Make sure `http://localhost:3000/callback` is exactly in the authorized redirect URIs
- No trailing slash, no different port

**Error: "access_denied" or "admin_policy_enforced"**
- Your organization may have restrictions
- Make sure OAuth consent screen is set to "Internal"
- Contact your Google Workspace admin

**Can't see "Internal" option in consent screen**
- You need to be in a Google Workspace organization
- If using personal Gmail, use "External" (but you'll need to add test users)
