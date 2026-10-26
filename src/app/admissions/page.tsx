import React from 'react';
import Link from 'next/link';
import { routes, type SessionDto } from '@hca/contracts';
import { call } from '../../lib/api';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export const dynamic = 'force-dynamic';

interface PublicSessionData {
  running: SessionDto | null;
  admissionOpen: SessionDto | null;
}

async function getSessionData(): Promise<PublicSessionData> {
  try {
    return await call(routes.public.session, {});
  } catch {
    const curYear = new Date().getFullYear();
    const nextYear = curYear + 1;
    const yearAfter = curYear + 2;
    const curLabel = `${curYear}-${String(nextYear).slice(-2)}`;
    const nextLabel = `${nextYear}-${String(yearAfter).slice(-2)}`;
    return {
      running: { id: 'default', label: curLabel, isAdmissionOpen: false, startsOn: `${curYear}-04-01`, endsOn: `${nextYear}-03-31`, state: 'RUNNING' },
      admissionOpen: { id: 'next', label: nextLabel, isAdmissionOpen: true, startsOn: `${nextYear}-04-01`, endsOn: `${yearAfter}-03-31`, state: 'UPCOMING' },
    };
  }
}

export default async function AdmissionsPage() {
  const session = await getSessionData();
  const activeIntake = session.admissionOpen?.label ?? session.running?.label ?? 'Current Session';
  const isOpen = !!session.admissionOpen;

  return (
    <>
      <Header />
      <main id="main-content" role="main" style={{ padding: 'var(--space-10) 0' }}>
        <div className="container">
          {/* Hero Section */}
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto var(--space-10)' }}>
            <span className="badge badge-accent" style={{ marginBottom: 'var(--space-2)' }}>
              Session {activeIntake}
            </span>
            <h1 className="heading-hero" style={{ marginBottom: 'var(--space-3)' }}>
              Admissions at Hemant Children Academy
            </h1>
            <p className="subheading">
              Transparent, child-centered admission from Nursery to Class X. Guided by RBSE standards and verified child protection standards under the DPDP Act 2023.
            </p>
          </div>

          {/* Admission Status Banner */}
          <div
            className={`card ${isOpen ? 'status-banner-open' : 'status-banner-closed'}`}
            style={{
              padding: 'var(--space-6)',
              marginBottom: 'var(--space-10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
              borderLeft: `4px solid ${isOpen ? 'var(--status-success-base)' : 'var(--status-warning-base)'}`,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className={`status-indicator ${isOpen ? 'status-indicator-success' : 'status-indicator-warning'}`} />
                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold' }}>
                  {isOpen ? `Admissions Now Open for Session ${activeIntake}` : `Admissions For Session ${activeIntake} Commencing Soon`}
                </h2>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                {isOpen
                  ? 'Accepting inquiries for Pre-Primary (Nursery, LKG, UKG) and Primary/Upper-Primary/Secondary grades.'
                  : 'Pre-registration inquiries are currently being recorded by the school admissions office.'}
              </p>
            </div>

            {isOpen && (
              <Link href="/admissions/enquiry" className="btn btn-primary btn-lg">
                Start 2-Minute Enquiry →
              </Link>
            )}
          </div>

          {/* 3-Stage Admission Process Accordion/Grid */}
          <section style={{ marginBottom: 'var(--space-12)' }}>
            <h2 className="heading-section" style={{ textAlign: 'center', marginBottom: 'var(--space-2)' }}>
              Structured, Transparent 3-Stage Process
            </h2>
            <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
              Designed strictly under DPDP Act principles: zero sensitive data collected until after seat confirmation.
            </p>

            <div className="grid-cols-3">
              <div className="card-elevated">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--hca-brand-primary-800)',
                      color: 'var(--text-inverse)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: 'var(--font-size-xs)',
                    }}
                  >
                    1
                  </span>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700' }}>Stage 1: Public Enquiry</h3>
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Quick 6-field phone inquiry. Takes under two minutes on any mobile device. Generates an instant tracking reference number for your family.
                </p>
              </div>

              <div className="card-elevated">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--hca-brand-primary-800)',
                      color: 'var(--text-inverse)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: 'var(--font-size-xs)',
                    }}
                  >
                    2
                  </span>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700' }}>Stage 2: Detailed Form</h3>
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Invited families receive a secure tokenized link via SMS or email to complete student history, previous schooling, and upload birth certificate copies.
                </p>
              </div>

              <div className="card-elevated">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--hca-brand-primary-800)',
                      color: 'var(--text-inverse)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: 'var(--font-size-xs)',
                    }}
                  >
                    3
                  </span>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700' }}>Stage 3: Enrolment</h3>
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Following an in-person interaction and seat offer, the office records official guardian records, issues a serialized admission number, and prints your parent portal activation slip.
                </p>
              </div>
            </div>
          </section>

          {/* Age Criteria Matrix */}
          <section className="card" style={{ marginBottom: 'var(--space-12)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
              Age Criteria for Admission (As of 31 March)
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              In accordance with Rajasthan State Education Department norms:
            </p>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Class Level</th>
                    <th>Academic Stage</th>
                    <th>Minimum Age</th>
                    <th>Maximum Age</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Nursery</strong></td>
                    <td>Foundational</td>
                    <td>3 Years</td>
                    <td>4 Years</td>
                  </tr>
                  <tr>
                    <td><strong>LKG</strong></td>
                    <td>Foundational</td>
                    <td>4 Years</td>
                    <td>5 Years</td>
                  </tr>
                  <tr>
                    <td><strong>UKG</strong></td>
                    <td>Foundational</td>
                    <td>5 Years</td>
                    <td>6 Years</td>
                  </tr>
                  <tr>
                    <td><strong>Class I</strong></td>
                    <td>Preparatory</td>
                    <td>6 Years</td>
                    <td>7 Years</td>
                  </tr>
                  <tr>
                    <td><strong>Class VI</strong></td>
                    <td>Middle</td>
                    <td>11 Years</td>
                    <td>12 Years</td>
                  </tr>
                  <tr>
                    <td><strong>Class IX</strong></td>
                    <td>Secondary</td>
                    <td>14 Years</td>
                    <td>15 Years</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Action Callout */}
          <div style={{ textAlign: 'center', padding: 'var(--space-6)', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
              Ready to begin your child&apos;s educational journey?
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Call our admissions office directly at +91 94605 40956 or fill out our online form.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <Link href="/admissions/enquiry" className="btn btn-primary">
                Online Enquiry Form (2 Minutes)
              </Link>
              <Link href="/fees" className="btn btn-secondary">
                View Fee Structure
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
