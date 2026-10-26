'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { routes, type SectionDto } from '@hca/contracts';
import { call } from '../../../lib/api';
import { AdminHeader } from '../../../components/AdminHeader';
import { Footer } from '../../../components/Footer';
import { Skeleton, EmptyState, ErrorBanner } from '../../../components/FiveStateView';

interface AttendanceReportRow {
  studentId: string;
  admissionNo: string;
  fullName: string;
  sectionId: string;
  sectionName: string;
  className: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
  workingDays: number;
}

interface AttendanceReportData {
  rows: AttendanceReportRow[];
  unmarkedSections: SectionDto[];
}

export default function AdminAttendancePage() {
  const now = new Date();
  const todayStr: string = now.toISOString().slice(0, 10);

  const [date, setDate] = useState(todayStr);
  const [reportData, setReportData] = useState<AttendanceReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await call(routes.attendance.report, {
        query: {
          from: date || todayStr, to: date || todayStr, unmarkedOn: date || todayStr,
        },
      });
      setReportData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance report.');
    } finally {
      setLoading(false);
    }
  }, [date, todayStr]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  return (
    <>
      <AdminHeader />
      <main id="main-content" role="main" style={{ padding: 'var(--space-8) 0', backgroundColor: 'var(--surface-subtle)', minHeight: '85vh' }}>
        <div className="container">
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: 'var(--space-1)' }}>Classroom Verification</span>
              <h1 className="heading-section">Attendance Reports &amp; Finalisation</h1>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                Auditing daily teacher marks, unsubmitted registers &amp; student attendance ratios
              </p>
            </div>

            {/* Date Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <label htmlFor="reportDate" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold' }}>
                Select Register Date:
              </label>
              <input
                id="reportDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                style={{ minHeight: '38px', fontSize: 'var(--font-size-xs)' }}
              />
            </div>
          </div>

          {error && <ErrorBanner message={error} onRetry={loadReport} />}

          {loading ? (
            <div className="card">
              <Skeleton height="60px" count={5} />
            </div>
          ) : reportData ? (
            <div>
              {/* Unmarked Sections Alert */}
              {reportData.unmarkedSections?.length > 0 ? (
                <div className="card" style={{ backgroundColor: 'var(--status-warning-bg)', borderColor: 'var(--status-warning-border)', marginBottom: 'var(--space-6)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: 'var(--status-warning-text)', marginBottom: 'var(--space-2)' }}>
                    ⚠️ {reportData.unmarkedSections.length} Class Sections Unmarked for {date}
                  </h3>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {reportData.unmarkedSections.map((sec: SectionDto) => (
                      <span key={sec.id} className="badge badge-warning" style={{ fontWeight: 'bold' }}>
                        {sec.className} - Section {sec.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card" style={{ backgroundColor: 'var(--status-success-bg)', borderColor: 'var(--status-success-border)', marginBottom: 'var(--space-6)' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--status-success-text)' }}>
                    ✓ All class sections have marked and submitted their registers for {date}.
                  </span>
                </div>
              )}

              {/* Attendance Rows */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
                  Student Attendance Log ({reportData.rows?.length ?? 0} students)
                </h3>

                {reportData.rows?.length === 0 ? (
                  <div style={{ padding: 'var(--space-6)' }}>
                    <EmptyState
                      title="No Registers Recorded"
                      description="No classroom attendance has been submitted for the chosen date yet."
                    />
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Adm No.</th>
                          <th>Student Name</th>
                          <th>Class &amp; Section</th>
                          <th>Present</th>
                          <th>Absent</th>
                          <th>Late</th>
                          <th>Total Days</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.rows.map((row) => (
                          <tr key={row.studentId}>
                            <td><strong style={{ fontFamily: 'var(--font-family-mono)' }}>{row.admissionNo}</strong></td>
                            <td><strong>{row.fullName}</strong></td>
                            <td><span className="badge badge-info">{row.className} - {row.sectionName}</span></td>
                            <td style={{ color: 'var(--attendance-present-text)', fontWeight: 'bold' }}>{row.present}</td>
                            <td style={{ color: 'var(--attendance-absent-text)', fontWeight: 'bold' }}>{row.absent}</td>
                            <td style={{ color: 'var(--attendance-late-text)', fontWeight: 'bold' }}>{row.late}</td>
                            <td>{row.workingDays}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
