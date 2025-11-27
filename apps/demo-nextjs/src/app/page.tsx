import Link from 'next/link';
import Image from 'next/image';
import { getSession } from '@/lib/session';
import { LoginButton } from '@/components/login-button';
import { LogoutButton } from '@/components/logout-button';

export default async function HomePage() {
  const session = await getSession();
  const isAuthenticated = session.isAuthenticated || false;
  const user = session.user;

  return (
    <div className="container">
      <div className="header">
        <h1>Google OAuth SSO Demo (Next.js)</h1>
        <p>Server-side authentication with App Router</p>
      </div>

      {!isAuthenticated ? (
        <>
          <div className="card">
            <h2>Welcome</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Server-side OAuth with HTTP-only cookies for secure token storage.
            </p>

            <div className="info-box">
              <strong>Features:</strong>
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li>Server-side session management</li>
                <li>HTTP-only cookies (XSS protection)</li>
                <li>API routes for OAuth flow</li>
                <li>Middleware for protected routes</li>
              </ul>
            </div>

            <LoginButton />
          </div>

          <div className="grid">
            <div className="feature-card">
              <h3>Secure Storage</h3>
              <p>Tokens stored in HTTP-only cookies, never exposed to browser.</p>
            </div>

            <div className="feature-card">
              <h3>Server Components</h3>
              <p>Authentication integrated with Next.js Server Components.</p>
            </div>

            <div className="feature-card">
              <h3>Auto Refresh</h3>
              <p>Session management with automatic token refresh.</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="card">
            <h2>Authenticated</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>Server-side session active.</p>

            <div className="user-info">
              {user?.picture && (
                <Image
                  src={user.picture}
                  alt={user.name || 'User'}
                  width={64}
                  height={64}
                  style={{
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
              <Link href="/dashboard">
                <button className="button">Dashboard</button>
              </Link>
              <LogoutButton />
            </div>
          </div>

          <div className="card">
            <h3>Authentication Flow</h3>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8', color: '#666' }}>
              <li>Server initiates OAuth with PKCE</li>
              <li>Redirect to Google for authorization</li>
              <li>Exchange code for tokens at callback</li>
              <li>Store tokens in encrypted session cookie</li>
              <li>Server components access session directly</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
