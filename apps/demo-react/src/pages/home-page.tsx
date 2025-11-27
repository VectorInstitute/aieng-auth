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
        <h1>Google OAuth SSO Demo</h1>
        <p>Production-ready authentication for internal applications</p>
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
            <h2>Welcome</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Add Google OAuth SSO using <code>@aieng-auth/react</code>
            </p>

            <div className="info-box">
              <strong>Quick Start:</strong>
              <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li>
                  Install: <code>pnpm add @aieng-auth/react</code>
                </li>
                <li>
                  Wrap app with <code>&lt;AuthProvider&gt;</code>
                </li>
                <li>Configure CLIENT_ID and REDIRECT_URI</li>
              </ol>
            </div>

            <button className="button" onClick={login}>
              Sign in with Google
            </button>
          </div>

          <div className="grid">
            <div className="feature-card">
              <h3>Single OAuth Client</h3>
              <p>Share one Google OAuth client across multiple apps for seamless SSO.</p>
            </div>

            <div className="feature-card">
              <h3>Domain Restriction</h3>
              <p>Restrict access by email domain for authorized users only.</p>
            </div>

            <div className="feature-card">
              <h3>Client-side OAuth</h3>
              <p>PKCE security with no backend required.</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="card">
            <h2>Authenticated</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>Signed in successfully.</p>

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
                <button className="button">Dashboard</button>
              </Link>
              <button className="button secondary" onClick={logout}>
                Logout
              </button>
            </div>
          </div>

          <div className="card">
            <h3>Authentication Flow</h3>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8', color: '#666' }}>
              <li>Initiate OAuth with PKCE challenge</li>
              <li>Redirect to Google for authorization</li>
              <li>Exchange authorization code for tokens</li>
              <li>Validate email domain</li>
              <li>Store session and user info</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
