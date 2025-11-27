import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { LogoutButton } from '@/components/logout-button';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session.isAuthenticated) {
    redirect('/');
  }

  const user = session.user;

  return (
    <div className="container">
      <div className="header">
        <h1>📊 Dashboard</h1>
        <p>Protected page - server-side authentication</p>
      </div>

      <div className="nav">
        <Link href="/">
          <button className="button secondary">← Back to Home</button>
        </Link>
        <LogoutButton />
      </div>

      <div className="card">
        <h2>Welcome, {user?.name}!</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          This page is protected by server-side middleware. You can only see it because you're authenticated.
        </p>

        <div className="status success">✅ Server-Side Authentication Active</div>

        <div style={{ marginTop: '1.5rem' }}>
          <h3>Session Information</h3>
          <div className="code-block">
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>💡 Next.js Benefits</h3>
        <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8', color: '#666' }}>
          <li>✅ Tokens never exposed to browser JavaScript</li>
          <li>✅ HTTP-only cookies prevent XSS attacks</li>
          <li>✅ Server Components can check auth without client JS</li>
          <li>✅ Middleware can protect entire route groups</li>
          <li>✅ Automatic session refresh on the server</li>
        </ul>
      </div>
    </div>
  );
}
