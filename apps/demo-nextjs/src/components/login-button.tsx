'use client';

export function LoginButton() {
  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <button className="button" onClick={handleLogin}>
      Sign in with Google →
    </button>
  );
}
