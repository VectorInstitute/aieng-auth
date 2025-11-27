import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@aieng-auth/react';
import HomePage from './pages/home-page';
import DashboardPage from './pages/dashboard-page';
import CallbackPage from './pages/callback-page';

// Load config from environment variables
const authConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  redirectUri: import.meta.env.VITE_REDIRECT_URI || 'http://localhost:3000/callback',
  postLogoutRedirectUri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI || 'http://localhost:3000',
  allowedDomains: import.meta.env.VITE_ALLOWED_DOMAINS
    ? import.meta.env.VITE_ALLOWED_DOMAINS.split(',')
    : undefined,
};

function App() {
  return (
    <AuthProvider config={authConfig}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/callback" element={<CallbackPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
