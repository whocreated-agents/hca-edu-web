'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { routes, type IssuedActivationCode } from '@hca/contracts';
import { call } from '../../../lib/api';
import { AdminHeader } from '../../../components/AdminHeader';
import { Footer } from '../../../components/Footer';

export default function AdminParentsActivationPage() {
  const [userId, setUserId] = useState('');
  const [issuedSlip, setIssuedSlip] = useState<IssuedActivationCode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick generation or reissue
  const handleGenerateSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!userId.trim()) {
      setError('Please enter the parent User UUID (from student directory).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await call(routes.auth.reissueCode, {
        params: { id: userId.trim() },
      });
      setIssuedSlip(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to issue activation code. Please check that the user ID exists and belongs to a Parent.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminHeader />
      <main id="main-content" role="main" style={{ padding: 'var(--space-8) 0', backgroundColor: 'var(--surface-subtle)', minHeight: '85vh' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div style={{ marginBottom: 'var(--space-4)' }} className="no-print">
            <Link href="/admin" style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--hca-brand-primary-700)' }}>
              ← Back to Admin Dashboard
            </Link>
          </div>

          <div className="card-elevated no-print" style={{ marginBottom: 'var(--space-6)' }}>
            <span className="badge badge-warning" style={{ marginBottom: 'var(--space-1)' }}>Office Credential Desk</span>
            <h1 className="heading-section">Generate Parent Activation Slip</h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
              Creates a single-use 10-character code printed on physical paper. Replaces SMS vendor costs entirely per board policy.
            </p>

            {error && (
              <div className="state-error-banner" style={{ marginTop: 'var(--space-4)' }}>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleGenerateSlip} style={{ marginTop: 'var(--space-4)' }}>
              <div className="form-group">
                <label htmlFor="userId" className="form-label">Parent User UUID *</label>
                <input
                  type="text"
                  id="userId"
                  required
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-sm)' }}
                />
                <span className="form-hint">Find this on the student's guardian record in the Student Directory.</span>
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: 'var(--space-2)' }}>
                {submitting ? 'Generating Secure Code...' : 'Generate New Activation Slip'}
              </button>
            </form>
          </div>

          {/* Printable Slip Preview */}
          {issuedSlip && (
            <div className="card-elevated printable-slip" style={{ border: '2px solid var(--hca-brand-primary-800)', padding: 'var(--space-8)', backgroundColor: '#FFFFFF' }}>
              <div className="flex-between" style={{ borderBottom: '2px solid var(--border-subtle)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Image src="/brand/logo-mark.svg" alt="HCA" width={48} height={48} />
                  <div>
                    <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', color: 'var(--hca-brand-primary-900)' }}>
                      HAPPY CHILDREN ACADEMY, PILANI
                    </h2>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      Affiliated to RBSE · Reg. No. 103 JJN 2003-04 · Office Copy / Parent Handover
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-success">CONFIDENTIAL SLIP</span>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Valid 30 Days
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'center', margin: 'var(--space-6) 0' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  Single-Use Parent Portal Activation Code
                </span>
                <div
                  style={{
                    backgroundColor: 'var(--surface-subtle)',
                    border: '2px dashed var(--hca-brand-primary-600)',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    maxWidth: '360px',
                    margin: 'var(--space-2) auto',
                  }}
                >
                  <strong
                    style={{
                      fontFamily: 'var(--font-family-mono)',
                      fontSize: 'var(--font-size-4xl)',
                      letterSpacing: '4px',
                      color: 'var(--hca-brand-primary-800)',
                    }}
                  >
                    {issuedSlip.code}
                  </strong>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--status-error-text)', fontWeight: '600' }}>
                  Code burns immediately upon first use. Expires on: {new Date(issuedSlip.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--surface-subtle)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', lineHeight: 'var(--line-height-relaxed)', marginBottom: 'var(--space-6)' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: 'var(--space-1)', color: 'var(--text-primary)' }}>
                  How to Activate (Takes 1 minute):
                </h4>
                <ol style={{ paddingLeft: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <li>Open <strong>https://hca.edu.in</strong> on your phone and tap <strong>"Portal Login"</strong>.</li>
                  <li>Click <strong>"Activate New Office Slip"</strong> at the bottom of the login screen.</li>
                  <li>Enter your mobile number: <strong>{issuedSlip.identifier}</strong> and the 10-character code above.</li>
                  <li>Choose your own permanent password. You are immediately logged in to view attendance and fees.</li>
                </ol>
              </div>

              <div className="flex-between no-print" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
                <button type="button" onClick={() => setIssuedSlip(null)} className="btn btn-secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
                  Dismiss
                </button>
                <button type="button" onClick={() => window.print()} className="btn btn-primary btn-lg">
                  🖨️ Print Slip for Parent
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
