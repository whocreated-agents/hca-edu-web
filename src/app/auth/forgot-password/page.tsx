'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { routes } from '@hca/contracts';
import { call } from '../../../lib/api';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setSubmitting(true);
    try {
      await call(routes.auth.forgot, {
        body: { identifier: identifier.trim() },
      });
    } catch {
      // Endpoint always yields 202 to prevent account enumeration
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <>
      <Header />
      <main id="main-content" role="main" style={{ padding: 'var(--space-12) 0', minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
        <div className="container-narrow" style={{ maxWidth: '440px' }}>
          <div className="card-elevated" style={{ padding: 'var(--space-8)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'inline-block', marginBottom: 'var(--space-2)' }}>
                <Image src="/brand/logo-mark.svg" alt="HCA" width={48} height={48} />
              </div>
              <h1 className="heading-section" style={{ fontSize: 'var(--font-size-2xl)' }}>
                Reset Your Password
              </h1>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                Self-service password recovery for registered accounts
              </p>
            </div>

            {submitted ? (
              <div>
                <div className="card" style={{ backgroundColor: 'var(--hca-brand-primary-50)', borderColor: 'var(--hca-brand-primary-100)', marginBottom: 'var(--space-6)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', color: 'var(--hca-brand-primary-900)', marginBottom: 'var(--space-2)' }}>
                    Instructions Dispatched
                  </h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                    If an account with a verified email matches <strong>{identifier}</strong>, a secure single-use 1-hour password reset link has been dispatched to that inbox.
                  </p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                    If you never registered an email address or do not receive the email, please contact the school office to reissue a printed activation slip.
                  </p>
                </div>

                <Link href="/auth/login" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                  Return to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="identifier" className="form-label">
                    Mobile Number or Email
                  </label>
                  <input
                    type="text"
                    id="identifier"
                    required
                    placeholder="Enter 10-digit mobile or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={submitting}
                    className="form-input"
                  />
                  <span className="form-hint">
                    For parents, password reset links are delivered to the verified email address on record.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', margin: 'var(--space-4) 0' }}
                >
                  {submitting ? 'Sending Link...' : 'Send Password Reset Link'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                  <Link href="/auth/login" style={{ fontSize: 'var(--font-size-xs)' }}>
                    ← Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
