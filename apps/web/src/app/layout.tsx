import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Student Care — Unified Multi-School Platform',
  description:
    'Enterprise Student Management and Care Platform with Multi-Tenant PostgreSQL Isolation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
