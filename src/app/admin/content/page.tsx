'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  routes,
  type PublicNotice,
  type NoticeTag,
  type PublicProfile,
} from '@hca/contracts';
import { call, ApiError } from '../../../lib/api';
import { AdminHeader } from '../../../components/AdminHeader';
import { Footer } from '../../../components/Footer';
import { Skeleton, ErrorBanner } from '../../../components/FiveStateView';

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<'notices' | 'profile'>('notices');

  // Notices
  const [notices, setNotices] = useState<PublicNotice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [errorNotices, setErrorNotices] = useState<string | null>(null);

  // New Notice Form
  const [showCreateNotice, setShowCreateNotice] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTag, setNewTag] = useState<NoticeTag>('ADMISSION');
  const [newPinned, setNewPinned] = useState(false);
  const [creatingNotice, setCreatingNotice] = useState(false);
  const [noticeFormError, setNoticeFormError] = useState<string | null>(null);

  // Profile Facts
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);

  // Form states for profile
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hours, setHours] = useState('');

  const loadNotices = useCallback(async () => {
    setLoadingNotices(true);
    setErrorNotices(null);
    try {
      const res = await call(routes.public.notices, { query: { limit: 50 } });
      setNotices(res.items);
    } catch (err: unknown) {
      const message = err instanceof ApiError
        ? (err.problem?.detail ?? err.problem?.title ?? `HTTP ${err.status}`)
        : (err instanceof Error ? err.message : 'Unable to load school notices.');
      setErrorNotices(message);
    } finally {
      setLoadingNotices(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setErrorProfile(null);
    try {
      const data = await call(routes.adminContent.profile, {});
      setProfile(data);
      setName(data.name);
      setPhone(data.phones[0] ?? '');
      setEmail(data.email);
      setHours(data.hours);
    } catch (err: unknown) {
      const message = err instanceof ApiError
        ? (err.problem?.detail ?? err.problem?.title ?? `HTTP ${err.status}`)
        : (err instanceof Error ? err.message : 'Unable to load school profile facts.');
      setErrorProfile(message);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    void loadNotices();
  }, [loadNotices]);

  useEffect(() => {
    if (activeTab === 'profile') {
      void loadProfile();
    }
  }, [activeTab, loadProfile]);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    setCreatingNotice(true);
    setNoticeFormError(null);
    try {
      await call(routes.adminContent.createNotice, {
        body: {
          title: newTitle.trim(),
          body: newBody.trim(),
          tag: newTag,
          isPinned: newPinned,
          publishFrom: new Date().toISOString(),
          publishUntil: null,
          audience: 'PUBLIC',
          isPublished: true,
        },
      });
      setShowCreateNotice(false);
      setNewTitle('');
      setNewBody('');
      await loadNotices();
    } catch (err: unknown) {
      const message = err instanceof ApiError
        ? (err.problem?.detail ?? err.problem?.title ?? `HTTP ${err.status}`)
        : (err instanceof Error ? err.message : 'Failed to publish notice.');
      setNoticeFormError(message);
    } finally {
      setCreatingNotice(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSavingProfile(true);
    setProfileSuccess(false);
    setErrorProfile(null);
    try {
      await call(routes.adminContent.putProfile, {
        body: {
          name,
          phones: phone ? [phone] : [],
          email,
          hours,
          addressLines: profile.addressLines,
          socials: profile.socials,
          foundedOn: profile.foundedOn,
          board: profile.board,
          registrationNo: profile.registrationNo,
        },
      });
      setProfileSuccess(true);
      await loadProfile();
    } catch (err: unknown) {
      const message = err instanceof ApiError
        ? (err.problem?.detail ?? err.problem?.title ?? `HTTP ${err.status}`)
        : (err instanceof Error ? err.message : 'Failed to update school profile facts.');
      setErrorProfile(message);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <>
      <AdminHeader />
      <main id="main-content" role="main" style={{ padding: 'var(--space-8) 0', backgroundColor: 'var(--surface-subtle)', minHeight: '85vh' }}>
        <div className="container">
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <div>
              <span className="badge badge-info" style={{ marginBottom: 'var(--space-1)' }}>Content Management</span>
              <h1 className="heading-section">Notices &amp; School CMS</h1>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                Publish Official Announcements &amp; Maintain Statutory Facts Register
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setActiveTab('notices')}
                className={`btn ${activeTab === 'notices' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 'var(--font-size-xs)' }}
              >
                Notices ({notices.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 'var(--font-size-xs)' }}
              >
                School Facts Register
              </button>
            </div>
          </div>

          {activeTab === 'notices' ? (
            <div>
              <div className="flex-between" style={{ marginBottom: 'var(--space-4)' }}>
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>Active Official Notices</h2>
                <button
                  type="button"
                  onClick={() => setShowCreateNotice(!showCreateNotice)}
                  className="btn btn-accent"
                  style={{ fontSize: 'var(--font-size-xs)' }}
                >
                  {showCreateNotice ? 'Cancel' : '+ Publish New Notice'}
                </button>
              </div>

              {/* Create Notice Form Modal / Drawer */}
              {showCreateNotice && (
                <div className="card-elevated" style={{ marginBottom: 'var(--space-6)', backgroundColor: 'var(--surface-base)', border: '2px solid var(--hca-brand-primary-800)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', marginBottom: 'var(--space-3)' }}>
                    Draft &amp; Publish New School Notice
                  </h3>

                  {noticeFormError && (
                    <div className="state-offline-banner" style={{ backgroundColor: 'var(--status-error-bg)', borderColor: 'var(--status-error-border)', color: 'var(--status-error-text)', marginBottom: 'var(--space-4)' }}>
                      ⚠ {noticeFormError}
                    </div>
                  )}

                  <form onSubmit={handleCreateNotice}>
                    <div className="form-group">
                      <label htmlFor="nTitle" className="form-label">Notice Title *</label>
                      <input
                        type="text"
                        id="nTitle"
                        required
                        placeholder="e.g. Schedule for Second Term Unit Tests"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="grid-cols-2">
                      <div className="form-group">
                        <label htmlFor="nTag" className="form-label">Category Tag *</label>
                        <select id="nTag" value={newTag} onChange={(e) => setNewTag(e.target.value as NoticeTag)} className="form-select">
                          <option value="ACADEMIC">Academic</option>
                          <option value="EXAM">Examination</option>
                          <option value="HOLIDAY">Holiday</option>
                          <option value="ADMINISTRATIVE">Administrative</option>
                          <option value="SPORTS">Sports</option>
                          <option value="EVENT">Event</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: 'var(--space-6)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                          <input type="checkbox" checked={newPinned} onChange={(e) => setNewPinned(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                          <span>Pin to top of public homepage and notice board</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="nBody" className="form-label">Notice Content (Full Body) *</label>
                      <textarea
                        id="nBody"
                        required
                        rows={5}
                        placeholder="Type official announcement details here..."
                        value={newBody}
                        onChange={(e) => setNewBody(e.target.value)}
                        className="form-textarea"
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button type="submit" disabled={creatingNotice} className="btn btn-primary">
                        {creatingNotice ? 'Publishing...' : 'Publish Official Notice'}
                      </button>
                      <button type="button" onClick={() => setShowCreateNotice(false)} className="btn btn-secondary">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Error State Banner */}
              {errorNotices && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <ErrorBanner
                    title="Notice Fetch Error"
                    message={errorNotices}
                    onRetry={() => void loadNotices()}
                  />
                </div>
              )}

              {/* Notices List */}
              {loadingNotices ? (
                <div className="card">
                  <Skeleton height="60px" count={5} />
                </div>
              ) : notices.length === 0 ? (
                <div className="card">
                  <p style={{ color: 'var(--text-muted)' }}>No notices published yet.</p>
                </div>
              ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Title</th>
                          <th>Published Date</th>
                          <th>Pinned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notices.map((n) => (
                          <tr key={n.id}>
                            <td><span className="badge badge-info">{n.tag}</span></td>
                            <td><strong>{n.title}</strong></td>
                            <td>{new Date(n.publishFrom).toLocaleDateString('en-IN')}</td>
                            <td>{n.isPinned ? <span className="badge badge-warning">★ Pinned</span> : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* School Facts Register Form */
            <div className="card-elevated" style={{ maxWidth: '640px' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                School Facts Register (Singleton)
              </h2>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Authoritative school facts displayed on public header and footer. Note that Years of Service is dynamically computed from 15 April 2003 (never hardcoded).
              </p>

              {profileSuccess && (
                <div className="state-offline-banner" style={{ backgroundColor: 'var(--status-success-bg)', borderColor: 'var(--status-success-border)', color: 'var(--status-success-text)', marginBottom: 'var(--space-4)' }}>
                  ✓ School profile facts updated successfully.
                </div>
              )}

              {errorProfile && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <ErrorBanner
                    title="School Profile Fact Error"
                    message={errorProfile}
                    onRetry={() => void loadProfile()}
                  />
                </div>
              )}

              {loadingProfile ? (
                <Skeleton height="150px" />
              ) : (
                <form onSubmit={handleSaveProfile}>
                  <div className="form-group">
                    <label htmlFor="pName" className="form-label">School Name *</label>
                    <input type="text" id="pName" required value={name} onChange={(e) => setName(e.target.value)} className="form-input" />
                  </div>

                  <div className="grid-cols-2">
                    <div className="form-group">
                      <label htmlFor="pPhone" className="form-label">Primary Public Phone *</label>
                      <input type="text" id="pPhone" required value={phone} onChange={(e) => setPhone(e.target.value)} className="form-input" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="pEmail" className="form-label">Official Email *</label>
                      <input type="email" id="pEmail" required value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="pHours" className="form-label">Office Working Hours *</label>
                    <input type="text" id="pHours" required value={hours} onChange={(e) => setHours(e.target.value)} className="form-input" />
                  </div>

                  <div className="card" style={{ backgroundColor: 'var(--surface-subtle)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-xs)' }}>
                    <p><strong>Statutory Reg:</strong> {profile?.registrationNo}</p>
                    <p><strong>Board Affiliation:</strong> {profile?.board}</p>
                    <p><strong>Founding Date:</strong> {profile?.foundedOn} (15 April 2003)</p>
                  </div>

                  <button type="submit" disabled={savingProfile} className="btn btn-primary btn-lg">
                    {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
