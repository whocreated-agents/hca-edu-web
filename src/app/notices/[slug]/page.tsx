import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { routes, type PublicNotice } from '@hca/contracts';
import { call } from '../../../lib/api';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';

export const dynamic = 'force-dynamic';

async function getNotice(slug: string): Promise<PublicNotice | null> {
  try {
    return await call(routes.public.notice, { params: { slug } });
  } catch {
    return null;
  }
}

export default async function NoticeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolved = await params;
  const notice = await getNotice(resolved.slug);

  if (!notice) {
    notFound();
  }

  return (
    <>
      <Header />
      <main id="main-content" role="main" style={{ padding: 'var(--space-10) 0' }}>
        <div className="container-narrow">
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Link href="/notices" style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--hca-brand-primary-700)' }}>
              ← Back to Notice Board
            </Link>
          </div>

          <article className="card-elevated" style={{ padding: 'var(--space-8)' }}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className="badge badge-info">{notice.tag}</span>
                {notice.isPinned && <span className="badge badge-warning">★ Pinned Official Notice</span>}
              </div>
              <time dateTime={notice.publishFrom} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Issued: {new Date(notice.publishFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
            </div>

            <h1 className="heading-section" style={{ marginBottom: 'var(--space-6)', color: 'var(--text-primary)' }}>
              {notice.title}
            </h1>

            <div
              style={{
                fontSize: 'var(--font-size-base)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--line-height-relaxed)',
                whiteSpace: 'pre-wrap',
                marginBottom: 'var(--space-8)',
              }}
            >
              {notice.body}
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 'var(--space-4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-muted)',
              }}
            >
              <div>
                <strong>Authority:</strong> Office of the Headmaster · Happy Children Academy, Pilani
              </div>
              <Link
                href="/notices"
                className="btn btn-secondary"
                style={{ fontSize: 'var(--font-size-xs)', minHeight: '36px' }}
              >
                All Notices
              </Link>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
