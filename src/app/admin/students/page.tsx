'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { routes, type StudentDto } from '@hca/contracts';
import { call } from '../../../lib/api';
import { AdminHeader } from '../../../components/AdminHeader';
import { Footer } from '../../../components/Footer';
import { Skeleton, EmptyState, ErrorBanner } from '../../../components/FiveStateView';

export default function AdminStudentsDirectoryPage() {
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await call(routes.adminStudents.students, {
        query: {
          q: searchQuery || undefined,
          cursor,
          limit: 25,
        },
      });
      setStudents(res.items);
      setNextCursor(res.nextCursor);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load student directory.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, cursor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadStudents]);

  return (
    <>
      <AdminHeader />
      <main id="main-content" role="main" style={{ padding: 'var(--space-8) 0', backgroundColor: 'var(--surface-subtle)', minHeight: '85vh' }}>
        <div className="container">
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: 'var(--space-1)' }}>Institutional Registry</span>
              <h1 className="heading-section">Student Directory</h1>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                Active Enrolments, Guardian Associations &amp; Roll Number Registry
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Link href="/admin/parents" className="btn btn-secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
                Reissue Activation Code →
              </Link>
            </div>
          </div>

          {/* Search Box */}
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <input
                type="search"
                placeholder="Search by student full name or admission number..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCursor(undefined);
                }}
                className="form-input"
                style={{ flexGrow: 1 }}
                aria-label="Search student records"
              />
            </div>
          </div>

          {error && <ErrorBanner message={error} onRetry={loadStudents} />}

          {loading ? (
            <div className="card">
              <Skeleton height="60px" count={8} />
            </div>
          ) : students.length === 0 ? (
            <EmptyState
              title="No Students Found"
              description="No student records matched your search query. Check spelling or clear filters."
              action={searchQuery ? { label: 'Clear Search', onClick: () => { setSearchQuery(''); setCursor(undefined); } } : undefined}
            />
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Adm. No.</th>
                      <th>Student Full Name</th>
                      <th>Class &amp; Section</th>
                      <th>Roll #</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <strong style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--hca-brand-primary-800)' }}>
                            {student.admissionNo}
                          </strong>
                        </td>
                        <td>
                          <strong>{student.fullName}</strong>
                        </td>
                        <td>
                          {student.currentEnrollment ? (
                            <span className="badge badge-info">
                              {student.currentEnrollment.className} - {student.currentEnrollment.sectionName}
                            </span>
                          ) : (
                            <span className="badge badge-neutral">Not Enrolled</span>
                          )}
                        </td>
                        <td>
                          {student.currentEnrollment ? (
                            <span style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 'bold' }}>
                              #{String(student.currentEnrollment.rollNo).padStart(2, '0')}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <span className={`badge ${student.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}>
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Keyset Pagination */}
              {(cursor || nextCursor) && (
                <div className="flex-between" style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    Showing {students.length} students
                  </span>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {cursor && (
                      <button
                        type="button"
                        onClick={() => setCursor(undefined)}
                        className="btn btn-secondary"
                        style={{ minHeight: '32px', fontSize: '11px' }}
                      >
                        First Page
                      </button>
                    )}
                    {nextCursor && (
                      <button
                        type="button"
                        onClick={() => setCursor(nextCursor)}
                        className="btn btn-secondary"
                        style={{ minHeight: '32px', fontSize: '11px' }}
                      >
                        Next Page →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
