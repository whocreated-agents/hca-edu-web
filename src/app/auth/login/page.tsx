'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your 10-digit mobile number or staff email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      const session = await login({
        identifier: trimmed,
        password,
        rememberDevice,
      });

      // Role-based routing
      if (session.user.role === 'PARENT') {
        router.push('/portal');
      } else if (session.user.role === 'TEACHER') {
        router.push('/portal/attendance');
      } else {
        router.push('/admin');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg.includes('ACCOUNT_LOCKED') || msg.includes('423')) {
        setErrorMessage('This account is temporarily locked due to 10 consecutive failed attempts. Please try again in 15 minutes or contact the school office.');
      } else if (msg.includes('INVALID_CREDENTIALS') || msg.includes('401')) {
        setErrorMessage('Invalid mobile number/email or password. If you received a printed slip, please click "Activate New Office Slip" below.');
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
        <div className="container-narrow" style={{ maxWidth: '440px' }}>
          <div className="card-elevated" style={{ padding: 'var(--space-8)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'inline-block', marginBottom: 'var(--space-2)' }}>
                <Image src="/brand/logo-mark.svg" alt="HCA" width={48} height={48} />
              </div>
              <h1 className="heading-section" style={{ fontSize: 'var(--font-size-2xl)' }}>
                Sign In to HCA Portal
              </h1>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                For Parents, Teachers &amp; Administrative Staff
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
                  Mobile Number or Email
                </label>
                <input
                  type="text"
                  id="identifier"
                  required
                  autoComplete="username"
                  placeholder="Parents: 10-digit mobile · Staff: email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={submitting}
                  className="form-input"
                />
                <span className="form-hint">Parents sign in with their registered 10-digit mobile number.</span>
              </div>

              <div className="form-group">
                <div className="flex-between">
                  <label htmlFor="password" className="form-label">Password</label>
                  <Link href="/auth/forgot-password" style={{ fontSize: 'var(--font-size-xs)' }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    required
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    className="form-input"
                    style={{ paddingRight: 'var(--space-10)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 'var(--space-3)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-muted)',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
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
                  Keep me signed in on this device (90 days)
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: 'var(--space-4)' }}
              >
                {submitting ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)', textAlign: 'center' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                Have an office admission slip with an activation code?
              </p>
              <Link href="/auth/activate" className="btn btn-secondary" style={{ width: '100%', fontSize: 'var(--font-size-xs)' }}>
                Activate New Office Slip →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
