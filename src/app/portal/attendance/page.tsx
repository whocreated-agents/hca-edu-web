'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  routes,
  type MySections,
  type SectionAttendanceSheet,
  type AttendanceStatus,
  type AttendanceSubmission,
} from '@hca/contracts';
import { call, ApiError } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import {
  queueSubmission,
  getQueuedSubmission,
  removeQueuedSubmission,
} from '../../../lib/offline-outbox';
import { PortalHeader } from '../../../components/PortalHeader';
import { Footer } from '../../../components/Footer';
import { Skeleton, EmptyState } from '../../../components/FiveStateView';

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function TeacherAttendancePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [sectionsData, setSectionsData] = useState<MySections | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [sheet, setSheet] = useState<SectionAttendanceSheet | null>(null);

  // Attendance Marks State: studentId -> { status, note }
  const [marks, setMarks] = useState<Record<string, { status: AttendanceStatus; note?: string }>>({});

  // Page States
  const [sheetLoading, setSheetLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
  const [isOfflineQueued, setIsOfflineQueued] = useState(false);

  // Load Teacher Sections
  const loadSections = useCallback(async () => {
    setStatusMessage(null);
    try {
      const data = await call(routes.attendance.mySections, {});
      setSectionsData(data);
      setSelectedDate(data.today);
      if (data.sections.length > 0) {
        if (data.sections[0]) setSelectedSectionId(data.sections[0].section.id);
      }
    } catch (_err: unknown) {
      setStatusMessage({
        type: 'error',
        text: _err instanceof Error ? _err.message : 'Unable to load teacher sections. Please check your network.',
      });
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    // Only teachers or office roles should access attendance marking
    if (user.role === 'PARENT') {
      router.push('/portal');
      return;
    }
    void loadSections();
  }, [user, authLoading, router, loadSections]);

  // Load Attendance Sheet for Selected Section & Date
  const loadSheet = useCallback(async (sectionId: string, date: string) => {
    if (!sectionId || !date) return;
    setSheetLoading(true);
    setStatusMessage(null);
    setIsOfflineQueued(false);

    // Check if we have an offline queued entry locally first
    const queued = getQueuedSubmission(sectionId, date);

    try {
      const data = await call(routes.attendance.getDay, {
        params: { id: sectionId, date },
      });
      setSheet(data);

      const markMap: Record<string, { status: AttendanceStatus; note?: string }> = {};

      if (queued) {
        // Hydrate from offline queue
        queued.submission.entries.forEach((e) => {
          markMap[e.studentId] = { status: e.status, note: e.note };
        });
        setIsOfflineQueued(true);
        setStatusMessage({
          type: 'warning',
          text: 'Notice: This register has local offline marks pending sync.',
        });
      } else if (data.marked && data.day) {
        // Hydrate from saved server register
        data.day.entries.forEach((e) => {
          markMap[e.studentId] = { status: e.status, note: e.note ?? undefined };
        });
      } else {
        // Default blank sheet: All default to PRESENT for fast classroom ergonomics
        data.roster.forEach((s) => {
          markMap[s.studentId] = { status: 'PRESENT' };
        });
      }
      setMarks(markMap);
    } catch (_err: unknown) {
      if (queued) {
        // Offline mode with saved local sheet
        setIsOfflineQueued(true);
        const markMap: Record<string, { status: AttendanceStatus; note?: string }> = {};
        queued.submission.entries.forEach((e) => {
          markMap[e.studentId] = { status: e.status, note: e.note };
        });
        setMarks(markMap);
        setStatusMessage({
          type: 'warning',
          text: 'Offline mode active: Working from local device queue.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: _err instanceof Error ? _err.message : 'Failed to load register for this section.',
        });
      }
    } finally {
      setSheetLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSectionId && selectedDate) {
      void loadSheet(selectedSectionId, selectedDate);
    }
  }, [selectedSectionId, selectedDate, loadSheet]);

  // One-Tap: Mark All Present
  const handleMarkAllPresent = () => {
    if (!sheet) return;
    const updated: Record<string, { status: AttendanceStatus; note?: string }> = {};
    sheet.roster.forEach((s) => {
      updated[s.studentId] = { status: 'PRESENT', note: marks[s.studentId]?.note };
    });
    setMarks(updated);
  };

  // Toggle individual status
  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  // Submit Attendance Register (Idempotent submission with offline fallback)
  const handleSubmitRegister = async () => {
    if (!sheet || !selectedSectionId || !selectedDate) return;

    const entries: AttendanceSubmission["entries"] = sheet.roster.map((s) => ({
      studentId: s.studentId,
      status: marks[s.studentId]?.status ?? 'PRESENT',
      note: marks[s.studentId]?.note,
    }));

    // Reuse existing mutationId if previously queued, or generate fresh
    const existingQueued = getQueuedSubmission(selectedSectionId, selectedDate);
    const mutationId = existingQueued?.submission.mutationId ?? generateUuid();

    const submission: AttendanceSubmission = {
      mutationId,
      capturedAt: new Date().toISOString(),
      entries,
    };

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await call(routes.attendance.putDay, {
        params: { id: selectedSectionId, date: selectedDate },
        body: submission,
      });

      removeQueuedSubmission(selectedSectionId, selectedDate);
      setIsOfflineQueued(false);

      const outcomeText =
        res.outcome === 'CREATED'
          ? 'Attendance register marked and recorded successfully!'
          : res.outcome === 'UPDATED'
          ? 'Attendance register updated successfully.'
          : 'Attendance register verified (already synced).';

      setStatusMessage({ type: 'success', text: outcomeText });
      void loadSheet(selectedSectionId, selectedDate);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        // Business / Auth / Conflict / Validation errors (401, 403, 409, 422, etc.)
        // Must NOT be queued offline; surface immediate error alerts to the user.
        const detail = err.problem?.detail ?? err.problem?.title ?? `Server rejected submission (HTTP ${err.status})`;
        setStatusMessage({
          type: 'error',
          text: `Submission rejected by server (${err.status}): ${detail}`,
        });
        return;
      }

      // Offline / Network Failure Fallback
      queueSubmission(selectedSectionId, selectedDate, submission);
      setIsOfflineQueued(true);
      setStatusMessage({
        type: 'warning',
        text: 'Network offline: 1 register safely queued in local device Outbox. Will auto-sync when connection restores.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate live counters
  const totalStudents = sheet?.roster.length ?? 0;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let leaveCount = 0;

  if (sheet) {
    sheet.roster.forEach((s) => {
      const st = marks[s.studentId]?.status;
      if (st === 'PRESENT') presentCount++;
      else if (st === 'ABSENT') absentCount++;
      else if (st === 'LATE') lateCount++;
      else if (st === 'LEAVE') leaveCount++;
    });
  }


  return (
    <>
      <PortalHeader />
      <main id="main-content" role="main" style={{ padding: 'var(--space-6) 0 var(--space-20)', backgroundColor: 'var(--surface-subtle)', minHeight: '85vh' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          {/* Header Controls */}
          <div className="card-elevated" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <div>
                <span className="badge badge-success">Daily Attendance Register</span>
                <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginTop: 'var(--space-1)' }}>
                  Classroom Register
                </h1>
              </div>

              {/* Roster Link */}
              {selectedSectionId && (
                <Link href={`/portal/roster/${selectedSectionId}`} className="btn btn-secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
                  View Emergency Contacts →
                </Link>
              )}
            </div>

            {/* Selectors */}
            <div className="grid-cols-2" style={{ gap: 'var(--space-3)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="sectionSelect" className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>Class &amp; Section</label>
                <select
                  id="sectionSelect"
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  disabled={sheetLoading}
                  className="form-select"
                  style={{ minHeight: '40px' }}
                >
                  {sectionsData?.sections.map((sec) => (
                    <option key={sec.section.id} value={sec.section.id}>
                      {sec.section.className} - {sec.section.name} ({sec.relationship.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="dateSelect" className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>Register Date</label>
                <input
                  type="date"
                  id="dateSelect"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={sheetLoading}
                  className="form-input"
                  style={{ minHeight: '40px' }}
                />
              </div>
            </div>
          </div>

          {/* Offline / Outbox Alert Banner */}
          {isOfflineQueued && (
            <div className="state-offline-banner" style={{ marginBottom: 'var(--space-4)' }}>
              <span>⚠️ <strong>Offline Outbox:</strong> This register is queued locally on your phone. It will automatically submit once internet is available.</span>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`card ${
                statusMessage.type === 'success'
                  ? 'badge-success'
                  : statusMessage.type === 'warning'
                  ? 'badge-warning'
                  : 'badge-error'
              }`}
              style={{
                marginBottom: 'var(--space-4)',
                padding: 'var(--space-3) var(--space-4)',
                fontWeight: '600',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              {statusMessage.text}
            </div>
          )}

          {sheetLoading ? (
            <div className="card">
              <Skeleton height="40px" width="50%" />
              <div style={{ marginTop: 'var(--space-4)' }}>
                <Skeleton height="56px" count={8} />
              </div>
            </div>
          ) : !sheet ? (
            <EmptyState
              title="No Section Selected"
              description="Please select an assigned class section above to take attendance."
            />
          ) : sheet.holiday ? (
            <div className="card-elevated" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <span className="badge badge-warning" style={{ marginBottom: 'var(--space-2)' }}>School Holiday</span>
              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold' }}>{sheet.holiday.label}</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                School was officially closed on {selectedDate}. No attendance registers are taken on scheduled holidays.
              </p>
            </div>
          ) : (
            <div>
              {/* Ergonomic Quick Action Strip: 1-Tap Mark All Present */}
              <div
                className="card"
                style={{
                  backgroundColor: 'var(--hca-brand-primary-50)',
                  border: '1px solid var(--hca-brand-primary-100)',
                  marginBottom: 'var(--space-4)',
                  padding: 'var(--space-3) var(--space-4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--space-2)',
                }}
              >
                <div>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--hca-brand-primary-800)', display: 'block' }}>
                    Classroom Speed Action
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Sets all {totalStudents} students to Present
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  disabled={!sheet.canSubmit || submitting}
                  className="btn btn-primary"
                  style={{ minHeight: '44px', padding: '0 var(--space-4)', fontSize: 'var(--font-size-xs)' }}
                >
                  ⚡ Mark All Present (1-Tap)
                </button>
              </div>

              {/* Classroom Student Roster List (High contrast, tactile 48px touch targets) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {sheet.roster.map((student) => {
                  const currentStatus = marks[student.studentId]?.status ?? 'PRESENT';
                  const note = marks[student.studentId]?.note;

                  return (
                    <div
                      key={student.studentId}
                      className="card"
                      style={{
                        padding: 'var(--space-3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 'var(--space-2)',
                        borderLeft:
                          currentStatus === 'PRESENT'
                            ? '4px solid var(--attendance-present-active)'
                            : currentStatus === 'ABSENT'
                            ? '4px solid var(--attendance-absent-active)'
                            : currentStatus === 'LATE'
                            ? '4px solid var(--attendance-late-active)'
                            : '4px solid var(--attendance-leave-active)',
                      }}
                    >
                      {/* Student Info */}
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-family-mono)',
                              fontWeight: 'bold',
                              fontSize: 'var(--font-size-xs)',
                              backgroundColor: 'var(--surface-muted)',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            #{String(student.rollNo).padStart(2, '0')}
                          </span>
                          <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {student.fullName}
                          </strong>
                        </div>
                        {note && (
                          <span style={{ display: 'block', fontSize: '11px', color: 'var(--hca-brand-accent-700)', marginTop: '2px' }}>
                            Note: {note}
                          </span>
                        )}
                      </div>

                      {/* 48px Tactile Toggle Pills */}
                      <div className="attendance-pills" role="group" aria-label={`Attendance for ${student.fullName}`}>
                        <button
                          type="button"
                          className="attendance-pill-btn"
                          data-status="PRESENT"
                          data-active={currentStatus === 'PRESENT'}
                          disabled={!sheet.canSubmit || submitting}
                          onClick={() => handleSetStatus(student.studentId, 'PRESENT')}
                          aria-label={`${student.fullName} Present`}
                        >
                          P
                        </button>
                        <button
                          type="button"
                          className="attendance-pill-btn"
                          data-status="ABSENT"
                          data-active={currentStatus === 'ABSENT'}
                          disabled={!sheet.canSubmit || submitting}
                          onClick={() => handleSetStatus(student.studentId, 'ABSENT')}
                          aria-label={`${student.fullName} Absent`}
                        >
                          A
                        </button>
                        <button
                          type="button"
                          className="attendance-pill-btn"
                          data-status="LATE"
                          data-active={currentStatus === 'LATE'}
                          disabled={!sheet.canSubmit || submitting}
                          onClick={() => handleSetStatus(student.studentId, 'LATE')}
                          aria-label={`${student.fullName} Late`}
                        >
                          L
                        </button>
                        <button
                          type="button"
                          className="attendance-pill-btn"
                          data-status="LEAVE"
                          data-active={currentStatus === 'LEAVE'}
                          disabled={!sheet.canSubmit || submitting}
                          onClick={() => handleSetStatus(student.studentId, 'LEAVE')}
                          aria-label={`${student.fullName} Leave`}
                        >
                          LV
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sticky Bottom Action Tray in Single-Handed Thumb Zone */}
              <div className="sticky-bottom-tray">
                <div className="container" style={{ maxWidth: '720px' }}>
                  <div className="flex-between" style={{ marginBottom: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', fontWeight: 'bold' }} aria-live="polite">
                      <span>Total: {totalStudents}</span>
                      <span style={{ color: 'var(--attendance-present-text)' }}>P: {presentCount}</span>
                      <span style={{ color: 'var(--attendance-absent-text)' }}>A: {absentCount}</span>
                      <span style={{ color: 'var(--attendance-late-text)' }}>L: {lateCount}</span>
                      <span style={{ color: 'var(--attendance-leave-text)' }}>LV: {leaveCount}</span>
                    </div>

                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {sheet.marked ? 'Register saved' : 'Unsubmitted'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitRegister}
                    disabled={!sheet.canSubmit || submitting}
                    className="btn btn-accent btn-lg"
                    style={{ width: '100%', minHeight: '48px', fontSize: 'var(--font-size-base)', fontWeight: 'bold' }}
                  >
                    {submitting
                      ? 'Submitting Attendance...'
                      : sheet.marked
                      ? '✓ Update Attendance Register'
                      : '✓ Submit Attendance Register'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
