'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  routes,
  type EnquiryDto,
  ApplicationListItem,
  EnquiryState,
} from '@hca/contracts';
import { z } from 'zod';
import { call } from '../../../lib/api';
import { AdminHeader } from '../../../components/AdminHeader';
import { Footer } from '../../../components/Footer';
import { Skeleton, EmptyState, ErrorBanner } from '../../../components/FiveStateView';

type ApplicationListItemType = z.infer<typeof ApplicationListItem>;
type EnquiryStateType = z.infer<typeof EnquiryState>;

export default function AdminAdmissionsPipelinePage() {
  const [activeTab, setActiveTab] = useState<'enquiries' | 'applications'>('enquiries');

  // Stage 1 Enquiries State
  const [enquiries, setEnquiries] = useState<EnquiryDto[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(true);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  // Stage 2 Applications State
  const [applications, setApplications] = useState<ApplicationListItemType[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  // Invite Link Modal
  const [inviteModalLink, setInviteModalLink] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const loadEnquiries = useCallback(async () => {
    setLoadingEnquiries(true);
    setEnquiryError(null);
    try {
      const res = await call(routes.adminAdmissions.enquiries, {
        query: { limit: 50 },
      });
      setEnquiries(res.items);
    } catch (err: unknown) {
      setEnquiryError(err instanceof Error ? err.message : 'Unable to load admission enquiries.');
    } finally {
      setLoadingEnquiries(false);
    }
  }, []);

  const loadApplications = useCallback(async () => {
    setLoadingApplications(true);
    try {
      const res = await call(routes.adminAdmissions.applications, {
        query: { limit: 50 },
      });
      setApplications(res.items);
    } catch {
      /* ignore */
    } finally {
      setLoadingApplications(false);
    }
  }, []);

  useEffect(() => {
    void loadEnquiries();
  }, [loadEnquiries]);

  useEffect(() => {
    if (activeTab === 'applications') {
      void loadApplications();
    }
  }, [activeTab, loadApplications]);

  const handleUpdateStatus = async (enquiryId: string, state: EnquiryStateType) => {
    setActionInProgress(true);
    try {
      await call(routes.adminAdmissions.updateEnquiry, {
        params: { id: enquiryId },
        body: { state },
      });
      await loadEnquiries();
    } catch {
      alert('Failed to update enquiry status.');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleGenerateInvite = async (enquiryId: string) => {
    setActionInProgress(true);
    try {
      const res = await call(routes.adminAdmissions.invite, {
        params: { id: enquiryId },
      });
      setInviteModalLink(res.link);
      await loadEnquiries();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to generate Stage 2 invite token.');
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
              <span className="badge badge-info" style={{ marginBottom: 'var(--space-1)' }}>Intake Funnel</span>
              <h1 className="heading-section">Admissions Pipeline</h1>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                Stage 1 Quick Enquiries &amp; Stage 2 Submitted Applications
              </p>
            </div>

            {/* Stage Switcher */}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setActiveTab('enquiries')}
                className={`btn ${activeTab === 'enquiries' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 'var(--font-size-xs)' }}
              >
                Stage 1 Enquiries ({enquiries.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('applications')}
                className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 'var(--font-size-xs)' }}
              >
                Stage 2 Applications ({applications.length})
              </button>
            </div>
          </div>

          {enquiryError && <ErrorBanner message={enquiryError} onRetry={loadEnquiries} />}

          {/* Invite Token Modal */}
          {inviteModalLink && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: 'var(--space-4)',
              }}
              onClick={() => setInviteModalLink(null)}
            >
              <div
                className="card-elevated"
                style={{ maxWidth: '520px', width: '100%', backgroundColor: '#fff', padding: 'var(--space-6)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="badge badge-success" style={{ marginBottom: 'var(--space-2)' }}>Link Generated</span>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', marginBottom: 'var(--space-2)' }}>
                  Stage 2 Private Application Link
                </h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                  Share this secure link with the parent via WhatsApp, SMS, or copy-paste.
                </p>

                <div style={{ backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border-standard)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', marginBottom: 'var(--space-4)', wordBreak: 'break-all', fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-xs)' }}>
                  {inviteModalLink}
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(inviteModalLink);
                      alert('Link copied to clipboard!');
                    }}
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: 'var(--font-size-xs)' }}
                  >
                    📋 Copy Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteModalLink(null)}
                    className="btn btn-secondary"
                    style={{ fontSize: 'var(--font-size-xs)' }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'enquiries' ? (
            /* Stage 1 Enquiries View */
            loadingEnquiries ? (
              <div className="card">
                <Skeleton height="60px" count={6} />
              </div>
            ) : enquiries.length === 0 ? (
              <EmptyState
                title="No Enquiries Received Yet"
                description="When prospective parents submit the 2-minute form online, their details will appear here with instant contact actions."
              />
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ref Code</th>
                        <th>Child Name</th>
                        <th>Class Seeking</th>
                        <th>Parent Name</th>
                        <th>Phone</th>
                        <th>Locality</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enquiries.map((enq) => (
                        <tr key={enq.id}>
                          <td>
                            <strong style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--hca-brand-primary-800)' }}>
                              {enq.reference}
                            </strong>
                          </td>
                          <td><strong>{enq.childName}</strong></td>
                          <td><span className="badge badge-info">{enq.className}</span></td>
                          <td>{enq.parentName}</td>
                          <td>
                            <a href={`tel:${enq.phone}`} style={{ fontWeight: '600', color: 'var(--hca-brand-primary-700)' }}>
                              +91 {enq.phone}
                            </a>
                          </td>
                          <td>{enq.locality}</td>
                          <td>{new Date(enq.createdAt).toLocaleDateString('en-IN')}</td>
                          <td>
                            <span
                              className={`badge ${
                                enq.state === 'INVITED_TO_APPLY'
                                  ? 'badge-info'
                                  : enq.state === 'CONTACTED'
                                  ? 'badge-warning'
                                  : enq.state === 'CLOSED'
                                  ? 'badge-error'
                                  : 'badge-neutral'
                              }`}
                            >
                              {enq.state.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                              {enq.state === 'NEW' && (
                                <button
                                  type="button"
                                  disabled={actionInProgress}
                                  onClick={() => handleUpdateStatus(enq.id, 'CONTACTED')}
                                  className="btn btn-secondary"
                                  style={{ minHeight: '28px', padding: '0 var(--space-2)', fontSize: '11px' }}
                                >
                                  Mark Contacted
                                </button>
                              )}
                              {enq.state !== 'INVITED_TO_APPLY' && enq.state !== 'CLOSED' && (
                                <button
                                  type="button"
                                  disabled={actionInProgress}
                                  onClick={() => handleGenerateInvite(enq.id)}
                                  className="btn btn-primary"
                                  style={{ minHeight: '28px', padding: '0 var(--space-2)', fontSize: '11px' }}
                                >
                                  Invite Stage 2
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            /* Stage 2 Applications View */
            loadingApplications ? (
              <div className="card">
                <Skeleton height="60px" count={6} />
              </div>
            ) : applications.length === 0 ? (
              <EmptyState
                title="No Stage 2 Applications Yet"
                description="Once parents access their tokenized links and submit their detailed forms and certificates, they will appear here for office review."
              />
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Application No</th>
                        <th>Child Name</th>
                        <th>Class</th>
                        <th>Parent Name</th>
                        <th>Submitted At</th>
                        <th>Status</th>
                        <th>Review</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id}>
                          <td>
                            <strong style={{ fontFamily: 'var(--font-family-mono)' }}>
                              {app.applicationNo ?? 'PENDING'}
                            </strong>
                          </td>
                          <td><strong>{app.childName}</strong></td>
                          <td><span className="badge badge-info">{app.className}</span></td>
                          <td>{app.parentName}</td>
                          <td>{new Date(app.createdAt).toLocaleDateString('en-IN')}</td>
                          <td><span className="badge badge-success">{app.status}</span></td>
                          <td>
                            <button type="button" className="btn btn-secondary" style={{ minHeight: '28px', padding: '0 var(--space-2)', fontSize: '11px' }}>
                              Review Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
