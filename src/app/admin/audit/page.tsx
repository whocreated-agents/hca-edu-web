'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { routes, type AuditEntryDto } from '@hca/contracts';
import { call } from '../../../lib/api';
import { AdminHeader } from '../../../components/AdminHeader';
import { Footer } from '../../../components/Footer';
import { Skeleton, EmptyState, ErrorBanner } from '../../../components/FiveStateView';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await call(routes.adminAudit.audit, {
        query: { limit: 50 },
      });
      setLogs(res.items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to read append-only audit log.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAudit();
  }, [loadAudit]);

  return (
    <>
      <AdminHeader />
      <main id="main-content" role="main" style={{ padding: 'var(--space-8) 0', backgroundColor: 'var(--surface-subtle)', minHeight: '85vh' }}>
        <div className="container">
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <div>
              <span className="badge badge-warning" style={{ marginBottom: 'var(--space-1)' }}>Compliance &amp; Governance</span>
              <h1 className="heading-section">Append-Only Audit Log</h1>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                Immutable record of administrative mutations, slip issues, fee adjustments &amp; register finalizations
              </p>
            </div>
          </div>

          {error && <ErrorBanner message={error} onRetry={loadAudit} />}

          {loading ? (
            <div className="card">
              <Skeleton height="50px" count={8} />
            </div>
          ) : logs.length === 0 ? (
            <EmptyState
              title="No Audit Records"
              description="Administrative mutations and statutory actions will appear here in reverse chronological order."
            />
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Staff Actor</th>
                      <th>Action</th>
                      <th>Entity Category</th>
                      <th>Target ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <span style={{ fontSize: '11px', fontFamily: 'var(--font-family-mono)' }}>
                            {new Date(log.at).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td><strong>{log.actor?.displayName ?? 'SYSTEM'}</strong></td>
                        <td><span className="badge badge-info">{log.action}</span></td>
                        <td>{log.entity}</td>
                        <td style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-family-mono)' }}>{log.entityId ?? '—'}</td>
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
