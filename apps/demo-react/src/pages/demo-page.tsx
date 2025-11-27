import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  generatePKCE,
  TokenManager,
  MemoryTokenStorage,
  SessionStorageAdapter,
  LocalStorageAdapter,
  isTokenExpired,
  decodeToken,
  type PKCEChallenge,
  type AuthTokens,
} from '@aieng-auth/core';

export default function DemoPage() {
  const [pkce, setPkce] = useState<PKCEChallenge | null>(null);
  const [tokenManager] = useState(() => new TokenManager(new MemoryTokenStorage()));
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [storageType, setStorageType] = useState<'memory' | 'session' | 'local'>('memory');

  // Generate PKCE on mount
  useEffect(() => {
    generatePKCE().then(setPkce);
  }, []);

  const handleGeneratePKCE = async () => {
    const newPkce = await generatePKCE();
    setPkce(newPkce);
  };

  const handleChangeStorage = (type: 'memory' | 'session' | 'local') => {
    setStorageType(type);
    let storage;
    switch (type) {
      case 'session':
        storage = new SessionStorageAdapter();
        break;
      case 'local':
        storage = new LocalStorageAdapter();
        break;
      default:
        storage = new MemoryTokenStorage();
    }
    // Update token manager with new storage
    Object.assign(tokenManager, { storage });
  };

  const handleMockTokens = async () => {
    const mockTokens: AuthTokens = {
      accessToken: await generateMockJWT({
        sub: '12345',
        email: 'demo@example.com',
        name: 'Demo User',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
      refreshToken: 'mock_refresh_token_' + Math.random().toString(36),
      tokenType: 'Bearer',
      expiresIn: 3600,
      scope: 'openid profile email',
    };
    await tokenManager.setTokens(mockTokens);
    setTokens(mockTokens);
  };

  const handleClearTokens = async () => {
    await tokenManager.clearTokens();
    setTokens(null);
  };

  const handleCheckTokens = async () => {
    const storedTokens = await tokenManager.getTokens();
    setTokens(storedTokens);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🔐 Interactive Demo</h1>
        <p>Test the CyberArk Auth core package</p>
      </div>

      <div className="nav">
        <Link to="/">
          <button className="button secondary">← Back to Home</button>
        </Link>
      </div>

      {/* PKCE Demo */}
      <div className="card demo-section">
        <h2>1. PKCE Generation (SHA-256)</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Generate cryptographically secure PKCE challenge for OAuth 2.0 flow
        </p>

        <button className="button" onClick={handleGeneratePKCE}>
          Generate New PKCE
        </button>

        {pkce && (
          <div style={{ marginTop: '1rem' }}>
            <div className="status success">✅ PKCE Generated</div>
            <div className="code-block">
              <pre>
                {JSON.stringify(
                  {
                    verifier: pkce.verifier.substring(0, 60) + '...',
                    challenge: pkce.challenge.substring(0, 60) + '...',
                    method: pkce.method,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
              <strong>Verifier:</strong> Random 128-byte string (stored securely)
              <br />
              <strong>Challenge:</strong> SHA-256 hash of verifier (sent to authorization server)
              <br />
              <strong>Method:</strong> S256 (most secure)
            </p>
          </div>
        )}
      </div>

      {/* Token Storage Demo */}
      <div className="card demo-section">
        <h2>2. Token Management</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Test different storage strategies and token operations
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <strong>Storage Type:</strong>
          <div style={{ marginTop: '0.5rem' }}>
            <button
              className={`button ${storageType === 'memory' ? '' : 'secondary'}`}
              onClick={() => handleChangeStorage('memory')}
            >
              Memory (Secure)
            </button>
            <button
              className={`button ${storageType === 'session' ? '' : 'secondary'}`}
              onClick={() => handleChangeStorage('session')}
            >
              SessionStorage
            </button>
            <button
              className={`button ${storageType === 'local' ? '' : 'secondary'}`}
              onClick={() => handleChangeStorage('local')}
            >
              LocalStorage
            </button>
          </div>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#666' }}>
            {storageType === 'memory' && '🔒 Most secure - tokens lost on refresh'}
            {storageType === 'session' && '⚠️ Persists during session - XSS vulnerable'}
            {storageType === 'local' && '⚠️ Persists across sessions - least secure'}
          </p>
        </div>

        <div>
          <button className="button" onClick={handleMockTokens}>
            Create Mock Tokens
          </button>
          <button className="button secondary" onClick={handleCheckTokens}>
            Check Stored Tokens
          </button>
          <button className="button danger" onClick={handleClearTokens}>
            Clear Tokens
          </button>
        </div>

        {tokens && (
          <div style={{ marginTop: '1rem' }}>
            <div className="status success">✅ Tokens Available</div>
            <div className="code-block">
              <pre>
                {JSON.stringify(
                  {
                    accessToken: tokens.accessToken.substring(0, 50) + '...',
                    refreshToken: tokens.refreshToken?.substring(0, 30) + '...',
                    tokenType: tokens.tokenType,
                    expiresIn: tokens.expiresIn + ' seconds',
                    scope: tokens.scope,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            {/* Token Validation */}
            <div style={{ marginTop: '1rem' }}>
              <strong>Token Validation:</strong>
              <div className="user-info" style={{ marginTop: '0.5rem' }}>
                <p>
                  <strong>Expired:</strong>{' '}
                  {isTokenExpired(tokens.accessToken) ? '❌ Yes' : '✅ No'}
                </p>
                <p>
                  <strong>Decoded Claims:</strong>
                </p>
                <div className="code-block" style={{ marginTop: '0.5rem' }}>
                  <pre>{JSON.stringify(decodeToken(tokens.accessToken), null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {!tokens && (
          <div style={{ marginTop: '1rem' }}>
            <div className="status info">ℹ️ No tokens stored</div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="card">
        <h2>📚 Next Steps</h2>
        <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8', color: '#666' }}>
          <li>
            <strong>For Real OAuth:</strong> Configure .env with your Google OAuth credentials
          </li>
          <li>
            <strong>React Integration:</strong> Use AuthProvider and useAuth hook (coming soon)
          </li>
          <li>
            <strong>Protected Routes:</strong> Wrap components with ProtectedRoute (coming soon)
          </li>
          <li>
            <strong>Production:</strong> Use HTTPS and secure token storage
          </li>
        </ul>
      </div>
    </div>
  );
}

// Helper function to generate mock JWT (for demo only)
async function generateMockJWT(payload: Record<string, unknown>): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
  return `${encodedHeader}.${encodedPayload}.mock_signature`;
}
