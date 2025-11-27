import { useAuth } from '@aieng-auth/react';
import { Link, Navigate } from 'react-router-dom';

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="container">
        <div className="card">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Dashboard</h1>
        <p>Protected page</p>
      </div>

      <div className="nav">
        <Link to="/">
          <button className="button secondary">← Back to Home</button>
        </Link>
        <button className="button danger" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="card">
        <h2>Welcome, {user?.name}</h2>

        <div className="status success">Authentication active</div>

        <div style={{ marginTop: '1.5rem' }}>
          <h3>User Information</h3>
          <div className="code-block">
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
