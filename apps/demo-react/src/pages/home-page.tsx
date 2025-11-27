import { useAuth } from '@aieng-auth/react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const { isAuthenticated, isLoading, user, login, logout, error } = useAuth();

  if (isLoading) {
    return (
      <div className="container">
        <div className="card">
          <h2>Loading...</h2>
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🔐 Google OAuth SSO Demo</h1>
        <p>Seamless authentication across all your apps</p>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid #e53e3e' }}>
          <h3 style={{ color: '#e53e3e' }}>Authentication Error</h3>
          <p style={{ color: '#666' }}>{error.message}</p>
        </div>
      )}

      {!isAuthenticated ? (
        <>
          <div className="card">
            <h2>Welcome!</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              This demo shows how simple it is to add Google OAuth SSO to your app using{' '}
              <code>@aieng-auth/react</code>
            </p>

            <div className="info-box">
              <strong>✨ Integration is 3 steps:</strong>
              <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li>
                  Install: <code>pnpm add @aieng-auth/react</code>
                </li>
                <li>
                  Wrap app with <code>&lt;AuthProvider&gt;</code>
                </li>
                <li>
                  Set env vars: <code>CLIENT_ID</code> and <code>REDIRECT_URI</code>
                </li>
              </ol>
            </div>

            <button className="button" onClick={login}>
              Sign in with Google →
            </button>
          </div>

          <div className="grid">
            <div className="feature-card">
              <h3>🎯 Single OAuth Client</h3>
              <p>
                All your apps share one Google OAuth client. Add new apps by just registering
                their redirect URIs.
              </p>
            </div>

            <div className="feature-card">
              <h3>🔒 Domain Restriction</h3>
              <p>
                Restrict access to @vectorinstitute.ai emails. Only authorized users can sign in.
              </p>
            </div>

            <div className="feature-card">
              <h3>⚡ Zero Backend</h3>
              <p>
                Pure client-side with PKCE security. No server needed for OAuth flow. Deploy
                anywhere.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="card">
            <h2>✅ Authenticated</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              You're signed in! This authentication works across all apps using the same OAuth
              client.
            </p>

            <div className="user-info">
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    marginBottom: '1rem',
                  }}
                />
              )}
              <p>
                <strong>Name:</strong> {user?.name}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              {user?.emailVerified && (
                <p style={{ color: '#38a169' }}>
                  <strong>✓ Email Verified</strong>
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Link to="/dashboard">
                <button className="button">Go to Dashboard →</button>
              </Link>
              <button className="button secondary" onClick={logout}>
                Logout
              </button>
            </div>
          </div>

          <div className="card">
            <h3>🎨 How This Works</h3>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8', color: '#666' }}>
              <li>User clicks "Sign in with Google"</li>
              <li>Redirects to Google OAuth (with PKCE challenge)</li>
              <li>User authorizes and redirects back to /callback</li>
              <li>Exchanges code for tokens (with PKCE verifier)</li>
              <li>Validates email domain (if configured)</li>
              <li>Stores tokens and user info in context</li>
              <li>App can now make authenticated requests</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
