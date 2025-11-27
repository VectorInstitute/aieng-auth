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
        <h1>📊 Dashboard</h1>
        <p>Protected page - only accessible when authenticated</p>
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
        <h2>Welcome, {user?.name}!</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          This is a protected route. You can only see this page because you're authenticated.
        </p>

        <div className="status success">✅ Authentication Active</div>

        <div style={{ marginTop: '1.5rem' }}>
          <h3>User Information</h3>
          <div className="code-block">
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>💡 In Your Real App</h3>
        <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8', color: '#666' }}>
          <li>
            Use <code>useAuth()</code> hook to access user and auth state
          </li>
          <li>
            Use <code>useToken()</code> hook to get access token for API calls
          </li>
          <li>
            Wrap protected routes with <code>&lt;ProtectedRoute&gt;</code> component
          </li>
          <li>Tokens automatically refresh before expiry</li>
          <li>User stays logged in across page refreshes (if using persistent storage)</li>
        </ul>
      </div>
    </div>
  );
}
