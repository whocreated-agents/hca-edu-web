import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Providers } from './providers';
import { brandTokens } from '../lib/tokens';

export const metadata: Metadata = {
  title: 'Hemant Children Academy | RBSE Affiliated School Pilani',
  description: 'Hemant Children Academy (HCA) — Co-educational English & Hindi medium school in Pilani, Rajasthan. RBSE Reg. 103 JJN 2003-04.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/brand/logo-mark.svg',
    apple: '/brand/logo-mark.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: brandTokens.primary900,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
