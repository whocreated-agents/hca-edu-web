'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { routes } from '@hca/contracts';
import { call } from '../../../lib/api';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Verification token is missing from the link.');
      setLoading(false);
      return;
    }

    call(routes.auth.verifyEmail, { body: { token } })
      .then(() => {
        setSuccess(true);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'This verification link is invalid or has expired.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="container-narrow" style={{ maxWidth: '440px' }}>
      <div className="card-elevated" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <h1 className="heading-section" style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-4)' }}>
          Email Verification
        </h1>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Verifying your email address...</p>
        ) : success ? (
          <div>
            <span className="badge badge-success" style={{ marginBottom: 'var(--space-3)' }}>Verified</span>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
              Your email address has been verified. You can now use self-service password reset whenever needed.
            </p>
            <Link href="/portal" className="btn btn-primary">Go to Parent Portal</Link>
          </div>
        ) : (
          <div>
            <span className="badge badge-error" style={{ marginBottom: 'var(--space-3)' }}>Verification Failed</span>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
              {error}
            </p>
            <Link href="/auth/login" className="btn btn-secondary">Sign In</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <>
      <Header />
      <main id="main-content" role="main" style={{ padding: 'var(--space-12) 0', minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
        <Suspense fallback={<div className="container-narrow">Verifying...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
