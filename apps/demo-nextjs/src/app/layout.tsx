import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Google OAuth Demo - Next.js',
  description: 'Server-side OAuth with Next.js App Router',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
