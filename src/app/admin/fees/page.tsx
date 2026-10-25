'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  routes,
  FeeHeadDto,
  type InvoiceDto,
  type PaymentDetail,
} from "@hca/contracts";
import { z } from "zod";
type FeeHeadType = z.infer<typeof FeeHeadDto>;
import { call } from '../../../lib/api';
import { AdminHeader } from '../../../components/AdminHeader';
import { Footer } from '../../../components/Footer';
import { Skeleton, EmptyState, ErrorBanner } from '../../../components/FiveStateView';

type InvoiceItem = InvoiceDto & {
  studentName: string;
  admissionNo: string;
  className: string | null;
  sectionName: string | null;
};

function fmt(m: string | number | undefined | null): string {
  if (m === undefined || m === null) return '0';
  return Number(m).toLocaleString('en-IN');
}

export default function AdminFeesPage() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'heads'>('invoices');

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [payments, setPayments] = useState<PaymentDetail[]>([]);
  const [heads, setHeads] = useState<FeeHeadType[]>([]);;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'invoices') {
        const res = await call(routes.adminFees.invoices, { query: { limit: 50 } });
        setInvoices(res.items);
      } else if (activeTab === 'payments') {
        const res = await call(routes.adminFees.payments, { query: { limit: 50 } });
        setPayments(res.items);
      } else {
        const res = await call(routes.adminFees.feeHeads, {});
        setHeads(res);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load fee operational data.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <>
      <AdminHeader />
      <main id="main-content" role="main" style={{ padding: 'var(--space-8) 0', backgroundColor: 'var(--surface-subtle)', minHeight: '85vh' }}>
        <div className="container">
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <div>
              <span className="badge badge-warning" style={{ marginBottom: 'var(--space-1)' }}>Bursar / Cash Desk</span>
              <h1 className="heading-section">Fee Operations &amp; Receipts</h1>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                Term Invoices, Serialized Receipts &amp; Structure Management
              </p>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setActiveTab('invoices')}
                className={`btn ${activeTab === 'invoices' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 'var(--font-size-xs)' }}
              >
                Invoices
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('payments')}
                className={`btn ${activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 'var(--font-size-xs)' }}
              >
                Receipts Log
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('heads')}
                className={`btn ${activeTab === 'heads' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 'var(--font-size-xs)' }}
              >
                Fee Heads
              </button>
            </div>
          </div>

          {error && <ErrorBanner message={error} onRetry={loadData} />}

          {loading ? (
            <div className="card">
              <Skeleton height="60px" count={6} />
            </div>
          ) : activeTab === 'invoices' ? (
            invoices.length === 0 ? (
              <EmptyState
                title="No Invoices Found"
                description="Invoices generated for the current session will appear here with dues status and payment links."
              />
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Student Name</th>
                        <th>Class</th>
                        <th>Due Date</th>
                        <th style={{ textAlign: 'right' }}>Total (₹)</th>
                        <th style={{ textAlign: 'right' }}>Paid (₹)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td><strong>{inv.periodLabel}</strong></td>
                          <td><strong>{inv.studentName}</strong></td>
                          <td><span className="badge badge-info">{inv.className ?? '—'}</span></td>
                          <td>{new Date(inv.dueOn).toLocaleDateString('en-IN')}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{fmt(inv.amountDue)}</td>
                          <td style={{ textAlign: 'right', color: 'var(--status-success-base)' }}>₹{fmt(inv.amountPaid)}</td>
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
              </div>
            )
          ) : activeTab === 'payments' ? (
            payments.length === 0 ? (
              <EmptyState
                title="No Payment Receipts Logged"
                description="Cash and cheque receipts accepted at the office desk are logged into this immutable ledger."
              />
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Receipt No.</th>
                        <th>Date</th>
                        <th>Student Name</th>
                        <th>Mode</th>
                        <th>Reference</th>
                        <th style={{ textAlign: 'right' }}>Amount Paid (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <strong style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--hca-brand-primary-800)' }}>
                              {p.receiptNo}
                            </strong>
                          </td>
                          <td>{new Date(p.paidOn).toLocaleDateString('en-IN')}</td>
                          <td><strong>{p.studentName}</strong></td>
                          <td><span className="badge badge-neutral">{p.mode}</span></td>
                          <td>{p.reference ?? 'Cash Desk'}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--status-success-base)' }}>
                            ₹{fmt(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fee Head Title</th>
                      <th>Billing Pattern</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heads.map((h) => (
                      <tr key={h.id}>
                        <td><strong>{h.name}</strong></td>
                        <td>
                          <span className={`badge ${h.isRecurring ? 'badge-info' : 'badge-neutral'}`}>
                            {h.isRecurring ? 'Recurring' : 'One Time'}
                          </span>
                        </td>
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
