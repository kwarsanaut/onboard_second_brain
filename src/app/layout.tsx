import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OnboardKit — Onboarding Checklist',
  description: 'Generate onboarding checklist berbasis AI untuk karyawan baru per departemen',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50">{children}</body>
    </html>
  );
}
