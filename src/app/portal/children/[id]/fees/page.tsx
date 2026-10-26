'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { routes, type ChildFees, type PaymentDto } from '@hca/contracts';
import { call } from '../../../../../lib/api';
import { PortalHeader } from '../../../../../components/PortalHeader';
import { Footer } from '../../../../../components/Footer';
import { Skeleton, ErrorBanner } from '../../../../../components/FiveStateView';

function fmt(m: string | number | undefined | null): string {
  if (m === undefined || m === null) return '0';
  return Number(m).toLocaleString('en-IN');
}

export default function ChildFeeLedgerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = use(params);
  const childId = resolved.id;

  const [ledger, setLedger] = useState<ChildFees | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentDto | null>(null);

  const loadLedger = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await call(routes.parent.childFees, { params: { id: childId } });
      setLedger(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to retrieve fee records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLedger();
  }, [childId]);

  const allReceipts = ledger ? ledger.invoices.flatMap((inv) => inv.payments) : [];

  return (
    <>
      <PortalHeader />
      <main id="main-content" role="main" style={{ padding: 'var(--space-8) 0', minHeight: '80vh', backgroundColor: 'var(--surface-subtle)' }}>
        <div className="container">
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Link href="/portal" style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--hca-brand-primary-700)' }}>
              ← Back to Portal Home
            </Link>
          </div>

          {/* Banner: Online Payment Under Integration */}
          <div
            className="card"
            style={{
              backgroundColor: 'var(--hca-brand-accent-50)',
              border: '1px solid var(--hca-brand-accent-100)',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
            }}
          >
            <div>
              <span className="badge badge-warning" style={{ marginBottom: 'var(--space-1)' }}>Board Update</span>
              <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700' }}>
                Online fee payment — coming soon
              </h2>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                Term fees are collected via Cash or Cheque at the school office. Every payment receives an official serialized receipt.
              </p>
            </div>
            <Link href="/contact" className="btn btn-secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
              Office Hours &amp; Location
            </Link>
          </div>

          {error && <ErrorBanner message={error} onRetry={loadLedger} />}

          {loading ? (
            <div className="card">
              <Skeleton height="100px" />
              <div style={{ marginTop: 'var(--space-6)' }}>
                <Skeleton height="200px" />
              </div>
            </div>
          ) : ledger ? (
            <div>
              {/* Account Summary Banner */}
              <div className="card-elevated" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <div>
                    <span className="badge badge-info" style={{ marginBottom: 'var(--space-1)' }}>Fee Ledger</span>
                    <h1 className="heading-section">Student Fee Statement</h1>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                      Total Invoiced: ₹{fmt(ledger.totals.due)} · Total Paid: ₹{fmt(ledger.totals.paid)}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      Current Balance Due
                    </span>
                    <strong style={{ fontSize: 'var(--font-size-3xl)', color: Number(ledger.totals.balance) > 0 ? 'var(--status-warning-base)' : 'var(--status-success-base)' }}>
                      ₹{fmt(ledger.totals.balance)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Invoices List */}
              <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', marginBottom: 'var(--space-4)' }}>
                  Itemized Term Invoices
                </h3>

                {ledger.invoices.length === 0 ? (
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>No invoices issued yet for this student.</p>
                ) : (
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Period / Description</th>
                          <th>Due Date</th>
                          <th style={{ textAlign: 'right' }}>Total (₹)</th>
                          <th style={{ textAlign: 'right' }}>Paid (₹)</th>
                          <th style={{ textAlign: 'right' }}>Balance (₹)</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledger.invoices.map((inv) => (
                          <tr key={inv.id}>
                            <td>
                              <strong>{inv.periodLabel}</strong>
                              <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                                {inv.lines.map((i) => i.feeHeadName).join(', ')}
                              </span>
                            </td>
                            <td>{new Date(inv.dueOn).toLocaleDateString('en-IN')}</td>
                            <td style={{ textAlign: 'right', fontWeight: '600' }}>₹{fmt(inv.amountDue)}</td>
                            <td style={{ textAlign: 'right', color: 'var(--status-success-base)' }}>₹{fmt(inv.amountPaid)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                              ₹{fmt(inv.balance)}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  inv.isOverdue
                                    ? 'badge-error'
                                    : inv.status === 'PAID'
                                    ? 'badge-success'
                                    : inv.status === 'PARTIAL'
                                    ? 'badge-warning'
                                    : 'badge-neutral'
                                }`}
                              >
                                {inv.isOverdue ? 'OVERDUE' : inv.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Payment Receipts History */}
              <div className="card">
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', marginBottom: 'var(--space-4)' }}>
                  Official Payment Receipts History
                </h3>

                {allReceipts.length === 0 ? (
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>No payment receipts recorded yet.</p>
                ) : (
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Receipt No.</th>
                          <th>Date</th>
                          <th>Mode</th>
                          <th>Reference / Notes</th>
                          <th style={{ textAlign: 'right' }}>Amount Paid</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allReceipts.map((rcp) => (
                          <tr key={rcp.id} style={rcp.voided ? { opacity: 0.5, textDecoration: 'line-through' } : undefined}>
                            <td>
                              <strong style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--hca-brand-primary-800)' }}>
                                {rcp.receiptNo}
                              </strong>
                              {rcp.voided && <span className="badge badge-error" style={{ marginLeft: 'var(--space-2)' }}>VOIDED</span>}
                            </td>
                            <td>{new Date(rcp.paidOn).toLocaleDateString('en-IN')}</td>
                            <td><span className="badge badge-neutral">{rcp.mode}</span></td>
                            <td>{rcp.reference ?? '—'}</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--status-success-base)' }}>
                              ₹{fmt(rcp.amount)}
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => setSelectedReceipt(rcp)}
                                className="btn btn-secondary"
                                style={{ minHeight: '32px', padding: '0 var(--space-2)', fontSize: 'var(--font-size-xs)' }}
                              >
                                View Receipt Slip
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Receipt Modal / Slip View */}
              {selectedReceipt && (
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
                  onClick={() => setSelectedReceipt(null)}
                >
                  <div
                    className="card-elevated printable-slip"
                    style={{ maxWidth: '480px', width: '100%', backgroundColor: '#fff', color: '#0F172A', padding: 'var(--space-6)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex-between" style={{ borderBottom: '2px solid var(--border-subtle)', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                      <div>
                        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: 'var(--hca-brand-primary-800)' }}>
                          HEMANT CHILDREN ACADEMY
                        </h2>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                          Pilani, Rajasthan · Reg. 103 JJN 2003-04
                        </span>
                      </div>
                      <span className={`badge ${selectedReceipt.voided ? 'badge-error' : 'badge-success'}`}>
                        {selectedReceipt.voided ? 'VOIDED RECEIPT' : 'OFFICIAL RECEIPT'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-4)' }}>
                      <div><strong>Receipt No:</strong> {selectedReceipt.receiptNo}</div>
                      <div><strong>Date:</strong> {new Date(selectedReceipt.paidOn).toLocaleDateString('en-IN')}</div>
                      <div><strong>Payment Mode:</strong> {selectedReceipt.mode}</div>
                      <div><strong>Reference:</strong> {selectedReceipt.reference ?? 'Cash Desk'}</div>
                    </div>

                    <div style={{ backgroundColor: 'var(--surface-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block' }}>Total Settled Amount</span>
                      <strong style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--hca-brand-primary-800)' }}>
                        ₹{fmt(selectedReceipt.amount)}
                      </strong>
                    </div>

                    <div className="flex-between no-print" style={{ gap: 'var(--space-2)' }}>
                      <button type="button" onClick={() => setSelectedReceipt(null)} className="btn btn-secondary" style={{ flex: 1, fontSize: 'var(--font-size-xs)' }}>
                        Close
                      </button>
                      <button type="button" onClick={() => window.print()} className="btn btn-primary" style={{ flex: 1, fontSize: 'var(--font-size-xs)' }}>
                        Print Receipt
                      </button>
                    </div>
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
