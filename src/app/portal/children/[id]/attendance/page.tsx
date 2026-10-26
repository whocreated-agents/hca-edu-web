'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { routes, type AttendanceMonth } from '@hca/contracts';
import { call } from '../../../../../lib/api';
import { PortalHeader } from '../../../../../components/PortalHeader';
import { Footer } from '../../../../../components/Footer';
import { Skeleton, ErrorBanner } from '../../../../../components/FiveStateView';

type AttendanceMonthDayType = AttendanceMonth['days'][number];

export default function ChildAttendanceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = use(params);
  const childId = resolved.id;

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [data, setData] = useState<AttendanceMonth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<AttendanceMonthDayType | null>(null);

  const loadAttendance = async (m: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await call(routes.parent.childAttendance, {
        params: { id: childId },
        query: { month: m },
      });
      setData(res);
      setSelectedDay(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load attendance register for this month.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAttendance(selectedMonth);
  }, [childId, selectedMonth]);

  const handlePrevMonth = () => {
    const parts = selectedMonth.split('-');
    const currentDate = new Date();
    const y = Number(parts[0]) || currentDate.getFullYear();
    const m = Number(parts[1]) || (currentDate.getMonth() + 1);
    const prev = new Date(y, m - 2, 1);
    setSelectedMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const parts = selectedMonth.split('-');
    const currentDate = new Date();
    const y = Number(parts[0]) || currentDate.getFullYear();
    const m = Number(parts[1]) || (currentDate.getMonth() + 1);
    const next = new Date(y, m, 1);
    setSelectedMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  const attendanceRate = data && data.summary.workingDays > 0
    ? ((data.summary.present / data.summary.workingDays) * 100).toFixed(1)
    : '0.0';

  return (
    <>
      <PortalHeader />
      <main id="main-content" role="main" style={{ padding: 'var(--space-8) 0', backgroundColor: 'var(--surface-subtle)', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* Breadcrumb / Back Navigation */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Link href="/portal" className="btn btn-ghost" style={{ paddingLeft: 0, fontSize: 'var(--font-size-sm)' }}>
              ← Back to Parent Home
            </Link>
          </div>

          {/* Month Selector Bar */}
          <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <h1 className="heading-section" style={{ fontSize: 'var(--font-size-xl)' }}>
                  Attendance Register
                </h1>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  Child ID: {childId} · Official RBSE Academic Record
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="btn btn-secondary"
                  aria-label="Previous Month"
                  style={{ minWidth: '40px', padding: '0 var(--space-2)' }}
                >
                  ◀
                </button>
                <span style={{ fontWeight: 'bold', fontSize: 'var(--font-size-base)', minWidth: '100px', textAlign: 'center' }}>
                  {selectedMonth}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="btn btn-secondary"
                  aria-label="Next Month"
                  style={{ minWidth: '40px', padding: '0 var(--space-2)' }}
                >
                  ▶
                </button>
              </div>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="card">
              <Skeleton height="32px" width="30%" />
              <div style={{ marginTop: 'var(--space-4)' }}>
                <Skeleton height="200px" />
              </div>
            </div>
          ) : error ? (
            <ErrorBanner
              title="Attendance Record Unavailable"
              message={error}
              onRetry={() => void loadAttendance(selectedMonth)}
            />
          ) : data ? (
            <div>
              {/* Summary Metrics Bar */}
              <div className="grid-cols-4" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)', borderLeft: '4px solid var(--attendance-present-active)' }}>
                  <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--attendance-present-text)', display: 'block' }}>
                    {data.summary.present}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--text-secondary)' }}>Days Present</span>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)', borderLeft: '4px solid var(--attendance-absent-active)' }}>
                  <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--attendance-absent-text)', display: 'block' }}>
                    {data.summary.absent}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--text-secondary)' }}>Days Absent</span>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)', borderLeft: '4px solid var(--attendance-late-active)' }}>
                  <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--attendance-late-text)', display: 'block' }}>
                    {data.summary.late}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--text-secondary)' }}>Late Arrivals</span>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)', borderLeft: '4px solid var(--hca-brand-primary-800)' }}>
                  <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--hca-brand-primary-800)', display: 'block' }}>
                    {attendanceRate}%
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--text-secondary)' }}>Monthly Rate ({data.summary.present}/{data.summary.workingDays})</span>
                </div>
              </div>

              {/* Monthly Interactive Calendar Grid */}
              <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', marginBottom: 'var(--space-4)' }}>
                  Daily Attendance Log (Tap any date for remarks)
                </h3>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
                    gap: 'var(--space-2)',
                  }}
                >
                  {data.days.map((day) => {
                    const dayNum = parseInt(day.date.split('-')[2] ?? '1', 10);
                    const isSelected = selectedDay?.date === day.date;
                    const status = day.status;

                    let bg = 'var(--surface-subtle)';
                    let color = 'var(--text-muted)';
                    let border = 'var(--border-subtle)';

                    if (day.holiday) {
                      bg = 'var(--surface-muted)';
                      color = 'var(--text-muted)';
                    } else if (status === 'PRESENT') {
                      bg = 'var(--attendance-present-bg)';
                      color = 'var(--attendance-present-text)';
                      border = 'var(--attendance-present-border)';
                    } else if (status === 'ABSENT') {
                      bg = 'var(--attendance-absent-bg)';
                      color = 'var(--attendance-absent-text)';
                      border = 'var(--attendance-absent-border)';
                    } else if (status === 'LATE') {
                      bg = 'var(--attendance-late-bg)';
                      color = 'var(--attendance-late-text)';
                      border = 'var(--attendance-late-border)';
                    } else if (status === 'LEAVE') {
                      bg = 'var(--attendance-leave-bg)';
                      color = 'var(--attendance-leave-text)';
                      border = 'var(--attendance-leave-border)';
                    }

                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        style={{
                          backgroundColor: bg,
                          color,
                          border: isSelected ? '2px solid var(--border-focus)' : `1px solid ${border}`,
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--space-2)',
                          minHeight: '64px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'transform 0.1s ease',
                          transform: isSelected ? 'scale(1.05)' : 'none',
                        }}
                        aria-label={`Date: ${day.date}, Status: ${day.holiday ?? status ?? 'No Register'}`}
                      >
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>{dayNum}</span>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '600' }}>
                          {day.holiday ? 'Holiday' : status ? status.slice(0, 4) : '—'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Inspection Drawer / Detail Card */}
              {selectedDay && (
                <div className="card-elevated" style={{ backgroundColor: 'var(--surface-card)', border: '2px solid var(--hca-brand-primary-600)', marginBottom: 'var(--space-6)' }}>
                  <div className="flex-between" style={{ marginBottom: 'var(--space-2)' }}>
                    <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700' }}>
                      Date: {new Date(selectedDay.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h4>
                    <button type="button" onClick={() => setSelectedDay(null)} className="btn btn-ghost" style={{ fontSize: 'var(--font-size-xs)' }}>
                      ✕ Close Details
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                    <span
                      className={`badge ${
                        selectedDay.holiday
                          ? 'badge-neutral'
                          : selectedDay.status === 'PRESENT'
                          ? 'badge-present'
                          : selectedDay.status === 'ABSENT'
                          ? 'badge-absent'
                          : selectedDay.status === 'LATE'
                          ? 'badge-late'
                          : selectedDay.status === 'LEAVE'
                          ? 'badge-leave'
                          : 'badge-neutral'
                      }`}
                    >
                      {selectedDay.holiday ? `Holiday: ${selectedDay.holiday}` : selectedDay.status ?? 'No Register Marked'}
                    </span>

                    {selectedDay.note && (
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        Teacher Note: <em>"{selectedDay.note}"</em>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
