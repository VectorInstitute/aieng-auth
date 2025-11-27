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
        <h1>🔐 Google OAuth SSO Demo (Next.js)</h1>
        <p>Server-side sessions with App Router</p>
      </div>

      {!isAuthenticated ? (
        <>
          <div className="card">
            <h2>Welcome!</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              This demo shows server-side OAuth with Next.js App Router. Unlike the React SPA,
              tokens are stored securely in HTTP-only cookies.
            </p>

            <div className="info-box">
              <strong>✨ Next.js Integration:</strong>
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li>Server-side session management</li>
                <li>HTTP-only cookies (XSS immune)</li>
                <li>API routes for OAuth flow</li>
                <li>Middleware for protected routes</li>
              </ul>
            </div>

            <LoginButton />
          </div>

          <div className="grid">
            <div className="feature-card">
              <h3>🔒 More Secure</h3>
              <p>Tokens never touch the browser. Stored in HTTP-only cookies on the server.</p>
            </div>

            <div className="feature-card">
              <h3>⚡ SSR Ready</h3>
              <p>
                Authentication works with Server Components. No client-side JavaScript required.
              </p>
            </div>

            <div className="feature-card">
              <h3>🎯 Production Ready</h3>
              <p>Built for production with session management and automatic token refresh.</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="card">
            <h2>✅ Authenticated</h2>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              You&apos;re signed in with server-side session management!
            </p>

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
                <button className="button">Go to Dashboard →</button>
              </Link>
              <LogoutButton />
            </div>
          </div>

          <div className="card">
            <h3>🎨 How This Works</h3>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8', color: '#666' }}>
              <li>User clicks &quot;Sign in with Google&quot;</li>
              <li>Server initiates OAuth flow with PKCE</li>
              <li>
                Google redirects to <code>/api/auth/callback</code>
              </li>
              <li>Server exchanges code for tokens</li>
              <li>Tokens stored in encrypted session cookie</li>
              <li>Server components can access session directly</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
