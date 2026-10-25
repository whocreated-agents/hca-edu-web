'use client';

import { useEffect, type ReactNode } from 'react';
import { AuthProvider } from '../lib/auth-context';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          // SW registration failed, gracefully ignored
        });
      });
    }
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}
