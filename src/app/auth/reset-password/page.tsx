'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { routes } from '@hca/contracts';
import { call } from '../../../lib/api';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing or invalid password reset token in the link.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await call(routes.auth.reset, {
        body: { token, newPassword },
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'The password reset token is invalid or has expired (1-hour limit). Please request a new link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-narrow" style={{ maxWidth: '440px' }}>
      <div className="card-elevated" style={{ padding: 'var(--space-8)' }}>
        <h1 className="heading-section" style={{ fontSize: 'var(--font-size-2xl)', textAlign: 'center', marginBottom: 'var(--space-4)' }}>
          Create New Password
        </h1>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div className="badge badge-success" style={{ marginBottom: 'var(--space-3)' }}>Password Updated</div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Your password has been successfully reset. All previous active sessions have been terminated. Redirecting to sign in...
            </p>
            <Link href="/auth/login" className="btn btn-primary">Sign In Now</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="state-error-banner" style={{ marginBottom: 'var(--space-4)' }}>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">New Password *</label>
              <input
                type="password"
                id="newPassword"
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={submitting}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm New Password *</label>
              <input
                type="password"
                id="confirmPassword"
                required
                minLength={8}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                className="form-input"
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-4)' }}>
              {submitting ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <main id="main-content" role="main" style={{ padding: 'var(--space-12) 0', minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
        <Suspense fallback={<div className="container-narrow">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
