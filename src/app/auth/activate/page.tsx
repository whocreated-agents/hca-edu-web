'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';

export default function ActivateSlipPage() {
  const router = useRouter();
  const { activate } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-format activation code with dash e.g. ABCDE-FGHJK
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let clean = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length > 10) clean = clean.slice(0, 10);
    if (clean.length > 5) {
      setCode(`${clean.slice(0, 5)}-${clean.slice(5)}`);
    } else {
      setCode(clean);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = code.replace(/[^A-Z0-9]/g, '');
    if (cleanCode.length !== 10) {
      setErrorMessage('Please enter the complete 10-character activation code from your office slip.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Your new password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('The passwords entered do not match. Please re-enter carefully.');
      return;
    }

    setSubmitting(true);
    try {
      await activate({
        identifier: identifier.trim(),
        code: cleanCode,
        newPassword: password,
        rememberDevice,
      });

      router.push('/portal');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Activation failed';
      if (msg.includes('ACTIVATION_CODE_INVALID') || msg.includes('401') || msg.includes('404')) {
        setErrorMessage('This activation code is invalid, already used, or has expired (30-day limit). Please contact the school office to reissue a fresh slip.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main id="main-content" role="main" style={{ padding: 'var(--space-12) 0', minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
        <div className="container-narrow" style={{ maxWidth: '460px' }}>
          <div className="card-elevated" style={{ padding: 'var(--space-8)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'inline-block', marginBottom: 'var(--space-2)' }}>
                <Image src="/brand/logo-mark.svg" alt="HCA" width={48} height={48} />
              </div>
              <span className="badge badge-warning" style={{ marginBottom: 'var(--space-1)' }}>
                Printed Office Slip Activation
              </span>
              <h1 className="heading-section" style={{ fontSize: 'var(--font-size-2xl)' }}>
                Activate Parent Account
              </h1>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                Enter the details printed on your physical school admission slip to create your permanent password.
              </p>
            </div>

            {errorMessage && (
              <div className="state-error-banner" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
                <span style={{ fontSize: 'var(--font-size-xs)' }}>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="identifier" className="form-label">
                  1. Mobile Number (Printed on slip) *
                </label>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 var(--space-3)',
                      backgroundColor: 'var(--surface-muted)',
                      border: '1px solid var(--border-standard)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    +91
                  </span>
                  <input
                    type="tel"
                    id="identifier"
                    required
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="94605 40956"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ''))}
                    disabled={submitting}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="code" className="form-label">
                  2. 10-Character Activation Code (from slip) *
                </label>
                <input
                  type="text"
                  id="code"
                  required
                  autoCapitalize="characters"
                  autoComplete="off"
                  placeholder="e.g. 7K9P2-4M8WX"
                  value={code}
                  onChange={handleCodeChange}
                  disabled={submitting}
                  className="form-input"
                  style={{
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: 'var(--font-size-lg)',
                    letterSpacing: '2px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                />
                <span className="form-hint">Codes are single-use and expire 30 days after office issue.</span>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  3. Create Your Permanent Password *
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  4. Confirm New Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  minLength={8}
                  placeholder="Re-enter same password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 'var(--space-4) 0' }}>
                <input
                  type="checkbox"
                  id="rememberDevice"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  disabled={submitting}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="rememberDevice" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Keep me signed in on this phone (90 days)
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-accent btn-lg"
                style={{ width: '100%', marginBottom: 'var(--space-4)' }}
              >
                {submitting ? 'Burning Code &amp; Activating...' : 'Complete Activation &amp; Enter Portal'}
              </button>
            </form>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)', textAlign: 'center' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                Already set your password previously?{' '}
                <Link href="/auth/login" style={{ fontWeight: '600' }}>
                  Sign in here →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
