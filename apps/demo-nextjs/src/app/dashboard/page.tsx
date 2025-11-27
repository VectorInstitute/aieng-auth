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
        <h1>Dashboard</h1>
        <p>Protected page with server-side authentication</p>
      </div>

      <div className="nav">
        <Link href="/">
          <button className="button secondary">← Back to Home</button>
        </Link>
        <LogoutButton />
      </div>

      <div className="card">
        <h2>Welcome, {user?.name}</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          This page is protected by server-side middleware.
        </p>

        <div className="status success">Server-side authentication active</div>

        <div style={{ marginTop: '1.5rem' }}>
          <h3>Session Information</h3>
          <div className="code-block">
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
