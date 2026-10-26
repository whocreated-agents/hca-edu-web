'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { routes, type ChildCard, type ParentNotice } from '@hca/contracts';
import { call } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { PortalHeader } from '../../components/PortalHeader';
import { Footer } from '../../components/Footer';
import { Skeleton, EmptyState, ErrorBanner } from '../../components/FiveStateView';

export default function PortalPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [children, setChildren] = useState<ChildCard[]>([]);
  const [notices, setNotices] = useState<ParentNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const loadPortalData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [childRes, noticeRes] = await Promise.all([
        call(routes.parent.children, {}),
        call(routes.parent.notices, { query: { limit: 5 } }),
      ]);
      setChildren(childRes);
      setNotices(noticeRes.items);
      if (childRes.length > 0 && childRes[0]) {
        setSelectedChildId(childRes[0].student.id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to connect to parent portal. Please check your network.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role === 'TEACHER') {
      router.push('/portal/attendance');
      return;
    }
    if (user.role !== 'PARENT') {
      router.push('/admin');
      return;
    }

    void loadPortalData();
  }, [user, authLoading, router, loadPortalData]);

  if (authLoading || (!user && loading)) {
    return (
      <>
        <PortalHeader />
        <main className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
          <Skeleton height="32px" width="300px" />
          <div style={{ marginTop: 'var(--space-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
            <Skeleton height="280px" />
            <Skeleton height="280px" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <PortalHeader />
      <main id="main-content" role="main" style={{ padding: 'var(--space-8) 0', minHeight: '80vh', backgroundColor: 'var(--surface-subtle)' }}>
        <div className="container">
          {/* Welcome Strip */}
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: 'var(--space-1)' }}>Parent Portal</span>
              <h1 className="heading-section">
                Welcome, {user?.displayName}
              </h1>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Active Session · Hemant Children Academy
              </p>
            </div>

            {/* Quick Refresh */}
            <button
              type="button"
              onClick={loadPortalData}
              className="btn btn-secondary"
              style={{ fontSize: 'var(--font-size-xs)' }}
            >
              ↺ Refresh Data
            </button>
          </div>

          {error && <ErrorBanner message={error} onRetry={loadPortalData} />}

          {/* Loading Skeletons */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
              <Skeleton height="280px" />
              <Skeleton height="280px" />
            </div>
          ) : children.length === 0 ? (
            /* Empty State */
            <EmptyState
              title="No Students Linked to This Account"
              description="No active student enrolments were found linked to your mobile number. If you recently enrolled or received an office slip, please contact the administration desk."
              action={{ label: 'Contact School Office', href: '/contact' }}
            />
          ) : (
            /* Ideal & Overflow States */
            <div>
              {/* If 4+ children: Horizontal Pill Selector */}
              {children.length >= 4 && (
                <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  {children.map((child) => (
                    <button
                      key={child.student.id}
                      type="button"
                      onClick={() => setSelectedChildId(child.student.id)}
                      className={`btn ${selectedChildId === child.student.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: 'var(--font-size-xs)', minHeight: '36px', whiteSpace: 'nowrap' }}
                    >
                      {child.student.fullName} ({child.className ?? 'Enrolled'})
                    </button>
                  ))}
                </div>
              )}

              {/* Children Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
                {children.map((child) => {
                  const feeBalance = Number(child.fees.outstanding);
                  const feeOutstanding = feeBalance > 0;
                  const initials = child.student.fullName
                    .split(' ')
                    .filter(Boolean)
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2);

                  return (
                    <div key={child.student.id} className="card-elevated" style={{ display: 'flex', flexDirection: 'column' }}>
                      <div className="flex-between" style={{ marginBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
                        <div>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                            Adm #{child.student.admissionNo} {child.rollNo ? `· Roll #${child.rollNo}` : ''}
                          </span>
                          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {child.student.fullName}
                          </h2>
                          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--hca-brand-primary-800)' }}>
                            {child.className ?? 'Class'} · Section {child.sectionName ?? '—'}
                          </span>
                        </div>

                        {/* Child Avatar initials */}
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--hca-brand-primary-100)',
                            color: 'var(--hca-brand-primary-800)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: 'var(--font-size-base)',
                          }}
                        >
                          {initials}
                        </div>
                      </div>

                      {child.classTeacher && (
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                          Class Teacher: <strong>{child.classTeacher.fullName}</strong>
                        </p>
                      )}

                      {/* Monthly Attendance Summary Strip */}
                      <div className="card" style={{ backgroundColor: 'var(--surface-subtle)', marginBottom: 'var(--space-3)', padding: 'var(--space-3)' }}>
                        <div className="flex-between">
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>This Month ({child.attendanceThisMonth.month}):</span>
                          <span className="badge badge-present">
                            {child.attendanceThisMonth.present} / {child.attendanceThisMonth.workingDays} Days Present
                          </span>
                        </div>
                      </div>

                      {/* Fee Status Strip */}
                      <div className="card" style={{ backgroundColor: 'var(--surface-subtle)', marginBottom: 'var(--space-4)', padding: 'var(--space-3)' }}>
                        <div className="flex-between">
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Fee Account:</span>
                          {feeOutstanding ? (
                            <span className="badge badge-warning" style={{ fontWeight: 'bold' }}>
                              Dues: ₹{feeBalance.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="badge badge-success">Up to Date (₹0 Due)</span>
                          )}
                        </div>
                      </div>

                      {/* Direct Minimum-CTA Actions */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginTop: 'auto' }}>
                        <Link
                          href={`/portal/children/${child.student.id}/attendance`}
                          className="btn btn-secondary"
                          style={{ fontSize: 'var(--font-size-xs)', textAlign: 'center' }}
                        >
                          View Attendance
                        </Link>
                        <Link
                          href={`/portal/children/${child.student.id}/fees`}
                          className="btn btn-primary"
                          style={{ fontSize: 'var(--font-size-xs)', textAlign: 'center' }}
                        >
                          View Fee Ledger
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Class & General Notices for Parents */}
              {notices.length > 0 && (
                <section className="card">
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', marginBottom: 'var(--space-4)' }}>
                    Announcements for Your Children&apos;s Classes
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {notices.map((n) => (
                      <div key={n.id} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
                        <div className="flex-between" style={{ marginBottom: 'var(--space-1)' }}>
                          <span className="badge badge-info">{n.tag}</span>
                          <time dateTime={n.publishFrom} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                            {new Date(n.publishFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </time>
                        </div>
                        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: '700' }}>{n.title}</h4>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                          {n.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
