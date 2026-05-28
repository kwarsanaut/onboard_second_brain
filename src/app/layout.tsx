import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'OnboardKit — Onboarding Checklist',
  description: 'Generate onboarding checklist berbasis AI untuk karyawan baru per departemen',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`h-full antialiased ${spaceGrotesk.variable} ${inter.variable}`}>
      <body className={`min-h-full flex flex-col bg-slate-50 ${inter.className}`}>{children}</body>
    </html>
  );
}
