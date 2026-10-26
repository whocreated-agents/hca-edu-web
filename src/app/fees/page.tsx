import React from 'react';
import Link from 'next/link';
import { routes, type PublicFees } from '@hca/contracts';
import { call } from '../../lib/api';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export const dynamic = 'force-dynamic';

async function getFees(): Promise<PublicFees | null> {
  try {
    return await call(routes.public.fees, {});
  } catch {
    return null;
  }
}

export default async function PublicFeesPage() {
  const feesData = await getFees();
  const session = feesData?.session;
  const classes = feesData?.classes ?? [];

  return (
    <>
      <Header />
      <main id="main-content" role="main" style={{ padding: 'var(--space-10) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <span className="badge badge-info" style={{ marginBottom: 'var(--space-2)' }}>Transparent Institutional Schedule</span>
            <h1 className="heading-hero" style={{ marginBottom: 'var(--space-2)' }}>
              Approved Fee Structure
            </h1>
            <p className="subheading" style={{ maxWidth: '640px', margin: '0 auto' }}>
              {session ? `Academic Session ${session.label} (Approved by School Managing Committee)` : 'Academic Session Fee Schedule'}
            </p>
          </div>

          {/* Mandatory "Online fee payment — coming soon" banner per Board Mandate */}
          <div
            className="card"
            style={{
              backgroundColor: 'var(--hca-brand-accent-50)',
              border: '1px solid var(--hca-brand-accent-100)',
              marginBottom: 'var(--space-8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
            }}
          >
            <div>
              <span className="badge badge-warning" style={{ marginBottom: 'var(--space-1)' }}>Board Notice</span>
              <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', color: 'var(--text-primary)' }}>
                Online fee payment — coming soon
              </h2>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                Digital payment gateway integration is scheduled for Phase 5. Term fees are currently settled via Cash or Bank Cheque at the school office against an official printed receipt.
              </p>
            </div>
            <Link href="/contact" className="btn btn-secondary" style={{ fontSize: 'var(--font-size-xs)', whiteSpace: 'nowrap' }}>
              Office Timings &amp; Location →
            </Link>
          </div>

          {/* Fee Tables by Class */}
          {!session || classes.length === 0 ? (
            <div className="state-empty" style={{ margin: 'var(--space-6) 0' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                Fee Schedule Pending Session Activation
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
                The fee structure for the upcoming academic session is being finalised by the managing committee. Please contact the school office at +91 94605 40956 for immediate provisional details.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', marginBottom: 'var(--space-12)' }}>
              {classes.map((cls) => {
                const totalAnnual = cls.heads.reduce((sum, h) => {
                  const multiplier = h.frequency === 'MONTHLY' ? 12 : h.frequency === 'QUARTERLY' ? 4 : h.frequency === 'ONE_TIME' ? 1 : 1;
                  return sum + Number(h.amount) * multiplier;
                }, 0);

                return (
                  <div key={cls.classLevel.id} className="card">
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                      <div>
                        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700' }}>
                          {cls.classLevel.name}
                        </h2>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                          Standard RBSE Curriculum Stream
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block' }}>Estimated Full Year</span>
                        <strong style={{ fontSize: 'var(--font-size-lg)', color: 'var(--hca-brand-primary-800)' }}>
                          ₹{totalAnnual.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Fee Category</th>
                            <th>Billing Frequency</th>
                            <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cls.heads.map((head, idx) => (
                            <tr key={idx}>
                              <td><strong>{head.name}</strong></td>
                              <td><span className="badge badge-neutral">{head.frequency}</span></td>
                              <td style={{ textAlign: 'right', fontWeight: '600' }}>₹{Number(head.amount).toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sibling & Scholarship Policy */}
          <div className="grid-cols-2">
            <div className="card">
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                Fee Concession &amp; Sibling Relief Policy
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                In accordance with school policy, families with three or more children concurrently enrolled in regular classes are eligible for a 15% concession on tuition fees for the youngest child, subject to annual verification.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                Direct Cash Desk &amp; Payment Verification
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                All fee deposits made at the school accounts counter are issued a serialized, computer-generated receipt immediately. Parents are advised to retain receipt slips for all administrative and record purposes.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
