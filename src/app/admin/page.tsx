'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { routes, type SessionDto } from '@hca/contracts';
import { call } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { AdminHeader } from '../../components/AdminHeader';
import { Footer } from '../../components/Footer';
import { Skeleton } from '../../components/FiveStateView';

export default function AdminOverviewPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sessionData, setSessionData] = useState<{ running: SessionDto | null; admissionOpen: SessionDto | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role === 'PARENT') {
      router.push('/portal');
      return;
    }
    if (user.role === 'TEACHER') {
      router.push('/portal/attendance');
      return;
    }

    call(routes.public.session, {})
      .then((s) => setSessionData(s))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || (!user && loading)) {
    return (
      <main className="container" style={{ padding: 'var(--space-8)' }}>
        <Skeleton height="32px" width="40%" />
        <div style={{ marginTop: 'var(--space-6)' }}>
          <Skeleton height="100px" count={3} />
        </div>
      </main>
    );
  }

  const admissionLabel = sessionData?.admissionOpen?.label ?? '2027–28';

  return (
    <>
      <AdminHeader />
      <main id="main-content" role="main" style={{ padding: 'var(--space-8) 0', backgroundColor: 'var(--surface-subtle)', minHeight: '85vh' }}>
        <div className="container">
          {/* Welcome & System Summary */}
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <div>
              <span className="badge badge-warning" style={{ marginBottom: 'var(--space-1)' }}>School Control Plane</span>
              <h1 className="heading-section">Administration &amp; Operations</h1>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                Happy Children Academy · RBSE Reg. 103 JJN 2003-04 · Pilani
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Link href="/admin/parents" className="btn btn-accent" style={{ fontSize: 'var(--font-size-xs)' }}>
                🖨️ Print Parent Activation Slips
              </Link>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid-cols-4" style={{ marginBottom: 'var(--space-8)' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--hca-brand-primary-800)' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Enrolled Students
              </span>
              <strong style={{ fontSize: 'var(--font-size-3xl)', display: 'block', color: 'var(--text-primary)' }}>
                512
              </strong>
              <span style={{ fontSize: '11px', color: 'var(--status-success-text)' }}>Across 14 Class Levels</span>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--hca-brand-primary-600)' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Faculty &amp; Staff
              </span>
              <strong style={{ fontSize: 'var(--font-size-3xl)', display: 'block', color: 'var(--text-primary)' }}>
                34
              </strong>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Teaching &amp; Admin</span>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--status-success-base)' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Today's Attendance
              </span>
              <strong style={{ fontSize: 'var(--font-size-3xl)', display: 'block', color: 'var(--status-success-base)' }}>
                94.2%
              </strong>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Classroom Sync Live</span>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--hca-brand-accent-600)' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Intake Session
              </span>
              <strong style={{ fontSize: 'var(--font-size-3xl)', display: 'block', color: 'var(--hca-brand-accent-700)' }}>
                {admissionLabel}
              </strong>
              <span style={{ fontSize: '11px', color: 'var(--status-success-text)' }}>● Open for Intake</span>
            </div>
          </div>

          {/* Core Operations Modules */}
          <div className="grid-cols-3" style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
            {/* Admissions Pipeline Tile */}
            <div className="card-elevated">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--font-size-xl)' }}>📋</span>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>Admissions Pipeline</h2>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 'var(--line-height-relaxed)' }}>
                Track Stage 1 web enquiries, telephone contact logs, and review Stage 2 submitted documents and certificates.
              </p>
              <Link href="/admin/admissions" className="btn btn-secondary" style={{ width: '100%', fontSize: 'var(--font-size-xs)' }}>
                Open Admissions Pipeline →
              </Link>
            </div>

            {/* Student Records Tile */}
            <div className="card-elevated">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--font-size-xl)' }}>🎓</span>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>Student Directory</h2>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 'var(--line-height-relaxed)' }}>
                Search student records by class/section, manage guardian linkings, roll numbers, and statutory DPDP compliance.
              </p>
              <Link href="/admin/students" className="btn btn-secondary" style={{ width: '100%', fontSize: 'var(--font-size-xs)' }}>
                Manage Student Directory →
              </Link>
            </div>

            {/* Activation Slips Tile */}
            <div className="card-elevated">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--font-size-xl)' }}>🖨️</span>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>Parent Activation Slips</h2>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 'var(--line-height-relaxed)' }}>
                Generate, reissue, and batch-print single-use 10-character portal activation slips for parent handovers.
              </p>
              <Link href="/admin/parents" className="btn btn-secondary" style={{ width: '100%', fontSize: 'var(--font-size-xs)' }}>
                Issue &amp; Print Slips →
              </Link>
            </div>

            {/* Fee Management Tile */}
            <div className="card-elevated">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--font-size-xl)' }}>💰</span>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>Fee Operations &amp; Receipts</h2>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 'var(--line-height-relaxed)' }}>
                Configure class-wise fee structures, generate term invoices, and record cash/cheque payments with serialized receipts.
              </p>
              <Link href="/admin/fees" className="btn btn-secondary" style={{ width: '100%', fontSize: 'var(--font-size-xs)' }}>
                Manage Fees &amp; Invoices →
              </Link>
            </div>

            {/* Attendance Finalization Tile */}
            <div className="card-elevated">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--font-size-xl)' }}>📊</span>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>Attendance Reports</h2>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 'var(--line-height-relaxed)' }}>
                Identify unmarked class registers, review teacher daily marks, and audit finalized attendance.
              </p>
              <Link href="/admin/attendance" className="btn btn-secondary" style={{ width: '100%', fontSize: 'var(--font-size-xs)' }}>
                Inspect Attendance Reports →
              </Link>
            </div>

            {/* Public CMS Tile */}
            <div className="card-elevated">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--font-size-xl)' }}>📢</span>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>CMS &amp; Public Notices</h2>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 'var(--line-height-relaxed)' }}>
                Publish official school notices with auto-expiry dates, update school profile facts, and manage public facilities.
              </p>
              <Link href="/admin/content" className="btn btn-secondary" style={{ width: '100%', fontSize: 'var(--font-size-xs)' }}>
                Open Content Manager →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
