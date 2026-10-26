'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { routes, type SectionDto, type RosterStudent } from '@hca/contracts';
import { call } from '../../../../lib/api';
import { PortalHeader } from '../../../../components/PortalHeader';
import { Footer } from '../../../../components/Footer';
import { Skeleton, EmptyState, ErrorBanner } from '../../../../components/FiveStateView';

interface SectionRosterData {
  section: SectionDto;
  students: RosterStudent[];
}

export default function SectionRosterPage({ params }: { params: Promise<{ sectionId: string }> }) {
  const resolved = use(params);
  const sectionId = resolved.sectionId;

  const [roster, setRoster] = useState<SectionRosterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadRoster = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await call(routes.attendance.roster, {
        params: { id: sectionId },
      });
      setRoster(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load class roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRoster();
  }, [sectionId]);

  const filteredStudents = roster?.students.filter((s: RosterStudent) =>
    searchTerm
      ? s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(s.rollNo).includes(searchTerm)
      : true
  );

  return (
    <>
      <PortalHeader />
      <main id="main-content" role="main" style={{ padding: 'var(--space-8) 0', backgroundColor: 'var(--surface-subtle)', minHeight: '85vh' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Link href="/portal/attendance" style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--hca-brand-primary-700)' }}>
              ← Back to Daily Attendance Register
            </Link>
          </div>

          <div className="card-elevated" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
            <span className="badge badge-info" style={{ marginBottom: 'var(--space-1)' }}>Classroom Directory</span>
            <h1 className="heading-section">
              {roster ? `${roster.section.className} - Section ${roster.section.name}` : 'Class Student Roster'}
            </h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
              Total Students: {roster?.students.length ?? 0} · Tap phone numbers to call directly
            </p>

            <div style={{ marginTop: 'var(--space-3)' }}>
              <input
                type="search"
                placeholder="Search student by name, roll no, or admission no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ minHeight: '38px', fontSize: 'var(--font-size-sm)' }}
              />
            </div>
          </div>

          {error && <ErrorBanner message={error} onRetry={loadRoster} />}

          {loading ? (
            <div className="card">
              <Skeleton height="60px" count={6} />
            </div>
          ) : !roster || filteredStudents?.length === 0 ? (
            <EmptyState
              title="No Students in Roster"
              description="No active students are currently enrolled in this class section."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {filteredStudents?.map((student: RosterStudent) => (
                <div key={student.studentId} className="card" style={{ padding: 'var(--space-3)' }}>
                  <div className="flex-between">
                    <div>
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
                        <strong style={{ fontSize: 'var(--font-size-sm)' }}>{student.fullName}</strong>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                        Admission No: {student.admissionNo}
                      </span>
                    </div>

                    <a
                      href="tel:+919460540956"
                      className="btn btn-secondary"
                      style={{ minHeight: '36px', padding: '0 var(--space-3)', fontSize: 'var(--font-size-xs)' }}
                    >
                      📞 Call Office / Guardian
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
