'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { routes, type PublicNotice, type NoticeTag } from '@hca/contracts';
import { call } from '../../lib/api';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Skeleton, EmptyState, ErrorBanner } from '../../components/FiveStateView';

const TAGS: { label: string; value?: NoticeTag }[] = [
  { label: 'All Notices' },
  { label: 'Admissions', value: 'ADMISSION' },
  { label: 'Examinations', value: 'EXAM' },
  { label: 'Holidays', value: 'HOLIDAY' },
  { label: 'Events', value: 'EVENT' },
  { label: 'Fees', value: 'FEE' },
];

export default function NoticesPage() {
  const [selectedTag, setSelectedTag] = useState<NoticeTag | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [notices, setNotices] = useState<PublicNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchNotices = useCallback(async (cursor?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await call(routes.public.notices, {
        query: {
          tag: selectedTag,
          limit: 20,
          cursor,
        },
      });
      setNotices((prev) => (cursor ? [...prev, ...res.items] : res.items));
      setNextCursor(res.nextCursor);
    } catch {
      setError('Unable to load official notices at this time. Please check your connection or retry.');
    } finally {
      setLoading(false);
    }
  }, [selectedTag]);

  useEffect(() => {
    void fetchNotices();
  }, [fetchNotices]);

  const filteredNotices = notices.filter((n) =>
    searchQuery ? n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.body.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <>
      <Header />
      <main id="main-content" role="main" style={{ padding: 'var(--space-10) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <span className="badge badge-info" style={{ marginBottom: 'var(--space-2)' }}>Official Announcements</span>
            <h1 className="heading-hero" style={{ marginBottom: 'var(--space-2)' }}>
              School Notice Board
            </h1>
            <p className="subheading" style={{ maxWidth: '640px', margin: '0 auto' }}>
              Academic dates, holiday schedules, examination notices, and regulatory updates from the Hemant Children Academy office.
            </p>
          </div>

          {/* Search Bar & Tag Filters */}
          <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              <input
                type="search"
                placeholder="Search notices by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ flexGrow: 1, minWidth: '240px' }}
                aria-label="Search notice titles and content"
              />
            </div>

            {/* Tag Pills */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {TAGS.map((t, idx) => {
                const isActive = selectedTag === t.value;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedTag(t.value);
                    }}
                    className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ minHeight: '36px', padding: '0 var(--space-3)', fontSize: 'var(--font-size-xs)' }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error State */}
          {error && <ErrorBanner message={error} onRetry={() => fetchNotices()} />}

          {/* Loading Skeleton State (4 shimmer cards with reserved 120px height, zero CLS) */}
          {loading && notices.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Skeleton height="120px" count={4} />
            </div>
          ) : filteredNotices.length === 0 ? (
            /* Empty State */
            <EmptyState
              title="No Active Notices in this Category"
              description="There are currently no active announcements matching your selection. All notices expire automatically according to board publication rules."
              action={selectedTag ? { label: 'View All Announcements', onClick: () => setSelectedTag(undefined) } : undefined}
            />
          ) : (
            /* Ideal & Overflow State */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {filteredNotices.map((notice) => (
                <article key={notice.id} className="card" style={{ borderLeft: notice.isPinned ? '4px solid var(--hca-brand-accent-600)' : '1px solid var(--border-subtle)' }}>
                  <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span className={`badge ${notice.tag === 'HOLIDAY' ? 'badge-warning' : notice.tag === 'EXAM' ? 'badge-error' : 'badge-info'}`}>
                        {notice.tag}
                      </span>
                      {notice.isPinned && (
                        <span className="badge badge-warning">★ Pinned</span>
                      )}
                    </div>
                    <time dateTime={notice.publishFrom} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      Published: {new Date(notice.publishFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </time>
                  </div>

                  <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                    <Link href={`/notices/${notice.slug}`} style={{ color: 'var(--text-primary)' }}>
                      {notice.title}
                    </Link>
                  </h2>

                  <p
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--text-secondary)',
                      lineHeight: 'var(--line-height-relaxed)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: 'var(--space-3)',
                    }}
                  >
                    {notice.body}
                  </p>

                  <Link href={`/notices/${notice.slug}`} style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600' }}>
                    Read Complete Notice →
                  </Link>
                </article>
              ))}

              {/* Cursor Load More */}
              {nextCursor && (
                <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => fetchNotices(nextCursor)}
                    className="btn btn-secondary btn-lg"
                  >
                    {loading ? 'Loading...' : 'Load More Notices'}
                  </button>
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
