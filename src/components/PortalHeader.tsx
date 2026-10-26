'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../lib/auth-context';
import { getOutboxCount, flushOutbox } from '../lib/offline-outbox';

export function PortalHeader() {
  const { user, logout, updateUserEmail } = useAuth();
  const [outboxCount, setOutboxCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  useEffect(() => {
    setOutboxCount(getOutboxCount());

    const handleOutboxChange = (e: Event) => {
      const custom = e as CustomEvent<{ count: number }>;
      setOutboxCount(custom.detail?.count ?? getOutboxCount());
    };

    window.addEventListener('hca-outbox-changed', handleOutboxChange);
    return () => {
      window.removeEventListener('hca-outbox-changed', handleOutboxChange);
    };
  }, []);

  useEffect(() => {
    if (user?.needsEmail) {
      setShowEmailPrompt(true);
    }
  }, [user]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await flushOutbox();
      setOutboxCount(getOutboxCount());
    } finally {
      setSyncing(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setEmailSubmitting(true);
    try {
      await updateUserEmail(emailInput);
      setEmailSuccess(true);
      setTimeout(() => setShowEmailPrompt(false), 3000);
    } catch {
      alert('Failed to save email. Please ensure it is a valid email address.');
    } finally {
      setEmailSubmitting(false);
    }
  };

  return (
    <>
      <header
        style={{
          backgroundColor: 'var(--surface-card)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: 'var(--space-3) 0',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Link href="/portal" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Image src="/brand/logo-mark.svg" alt="HCA" width={32} height={32} />
              <div style={{ lineHeight: 1.2 }}>
                <span style={{ fontWeight: '700', fontSize: 'var(--font-size-base)', color: 'var(--text-brand)' }}>
                  HCA Portal
                </span>
                <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Pilani Operations
                </span>
              </div>
            </Link>

            {user?.role && (
              <span className={`badge ${user.role === 'PARENT' ? 'badge-info' : 'badge-neutral'}`}>
                {user.role}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {/* Offline outbox badge if anything queued */}
            {outboxCount > 0 && (
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="outbox-pill"
                title="Tap to sync queued attendance registers"
              >
                <span>{syncing ? 'Syncing...' : `${outboxCount} offline queued`}</span>
                <span style={{ textDecoration: 'underline', fontSize: 'var(--font-size-xs)' }}>Sync</span>
              </button>
            )}

            {user && (
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--text-secondary)' }} id="portal-user-name">
                {user.displayName}
              </span>
            )}

            <button type="button" onClick={logout} className="btn btn-ghost" style={{ fontSize: 'var(--font-size-xs)' }}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Optional First-login Email Prompt Banner */}
      {showEmailPrompt && (
        <div
          style={{
            backgroundColor: 'var(--hca-brand-primary-50)',
            borderBottom: '1px solid var(--hca-brand-primary-100)',
            padding: 'var(--space-3) 0',
          }}
        >
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {emailSuccess ? (
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--status-success-text)' }}>
                ✓ Verification link sent to {emailInput}. You can now use self-service password reset.
              </span>
            ) : (
              <>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                  <strong>Security Note:</strong> Add an email address for self-service password reset. (Optional)
                </div>
                <form onSubmit={handleEmailSubmit} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                  <input
                    type="email"
                    required
                    placeholder="parent@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="form-input"
                    style={{ minHeight: '36px', padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--font-size-xs)' }}
                  />
                  <button type="submit" disabled={emailSubmitting} className="btn btn-primary" style={{ minHeight: '36px', padding: '0 var(--space-3)', fontSize: 'var(--font-size-xs)' }}>
                    {emailSubmitting ? 'Saving...' : 'Save Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailPrompt(false)}
                    className="btn btn-ghost"
                    style={{ minHeight: '36px', fontSize: 'var(--font-size-xs)' }}
                  >
                    Later
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
