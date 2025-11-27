'use client';

export function LogoutButton() {
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <button className="button secondary" onClick={handleLogout}>
      Logout
    </button>
  );
}
