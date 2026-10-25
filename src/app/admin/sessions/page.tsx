'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { routes, type SessionDto } from '@hca/contracts';
import { call } from '../../../lib/api';
import { AdminHeader } from '../../../components/AdminHeader';
import { Footer } from '../../../components/Footer';
import { Skeleton, ErrorBanner } from '../../../components/FiveStateView';

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await call(routes.adminAcademic.sessions, {});
      setSessions(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load academic sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const handleToggleAdmission = async (sessionId: string, isOpen: boolean) => {
    setActionInProgress(true);
    try {
      await call(routes.adminAcademic.updateSession, {
        params: { id: sessionId },
        body: { isAdmissionOpen: isOpen },
      });
      await loadSessions();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to toggle admission state.');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRunSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to activate this session as the RUNNING session? There can only be one RUNNING session at a time.')) return;
    setActionInProgress(true);
    try {
      await call(routes.adminAcademic.transitionSession, {
        params: { id: sessionId },
        body: { to: 'RUNNING' },
      });
      await loadSessions();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to switch running session.');
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <>
      <AdminHeader />
      <main id="main-content" role="main" style={{ padding: 'var(--space-8) 0', backgroundColor: 'var(--surface-subtle)', minHeight: '85vh' }}>
        <div className="container">
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: 'var(--space-1)' }}>Academic Lifecycle</span>
              <h1 className="heading-section">Academic Sessions</h1>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                Lifecycle state constraint: Exactly one RUNNING session and at most one accepting admissions
              </p>
            </div>
          </div>

          {error && <ErrorBanner message={error} onRetry={loadSessions} />}

          {loading ? (
            <div className="card">
              <Skeleton height="60px" count={3} />
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Session Label</th>
                      <th>Dates</th>
                      <th>Operational State</th>
                      <th>Public Intake</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((ses) => (
                      <tr key={ses.id}>
                        <td><strong style={{ fontSize: 'var(--font-size-base)' }}>{ses.label}</strong></td>
                        <td>{new Date(ses.startsOn).toLocaleDateString('en-IN')} – {new Date(ses.endsOn).toLocaleDateString('en-IN')}</td>
                        <td>
                          <span className={`badge ${ses.state === 'RUNNING' ? 'badge-success' : ses.state === 'UPCOMING' ? 'badge-info' : 'badge-neutral'}`}>
                            {ses.state}
                          </span>
                        </td>
                        <td>
                          {ses.isAdmissionOpen ? (
                            <span className="badge badge-warning">Admissions Open</span>
                          ) : (
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Closed</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            {ses.state !== 'RUNNING' && ses.state !== 'CLOSED' && (
                              <button
                                type="button"
                                disabled={actionInProgress}
                                onClick={() => handleRunSession(ses.id)}
                                className="btn btn-secondary"
                                style={{ minHeight: '32px', fontSize: '11px' }}
                              >
                                Activate Running
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={actionInProgress}
                              onClick={() => handleToggleAdmission(ses.id, !ses.isAdmissionOpen)}
                              className={`btn ${ses.isAdmissionOpen ? 'btn-secondary' : 'btn-accent'}`}
                              style={{ minHeight: '32px', fontSize: '11px' }}
                            >
                              {ses.isAdmissionOpen ? 'Close Intake' : 'Open Intake'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
