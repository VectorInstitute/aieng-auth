import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@aieng-auth/react';

export default function CallbackPage() {
  const navigate = useNavigate();
  const { isAuthenticated, error } = useAuth();

  useEffect(() => {
    // AuthProvider automatically handles the callback
    // Once authenticated or if there's an error, redirect
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else if (error) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, error, navigate]);

  return (
    <div className="container">
      <div className="card">
        <h2>🔄 Processing Login...</h2>
        <p style={{ color: '#666' }}>
          Please wait while we complete your authentication with Google.
        </p>
        <div style={{ marginTop: '1rem' }}>
          <div className="status info">ℹ️ Exchanging authorization code for tokens...</div>
        </div>
      </div>
    </div>
  );
}
