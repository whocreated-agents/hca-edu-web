import React from 'react';
import Link from 'next/link';
import { routes, type PublicProfile } from '@hca/contracts';
import { call } from '../../lib/api';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export const dynamic = 'force-dynamic';

async function getProfile(): Promise<PublicProfile> {
  try {
    return await call(routes.public.profile, {});
  } catch {
    return {
      name: 'Hemant Children Academy',
      foundedOn: '2003-04-15',
      registrationNo: '103 JJN 2003-04',
      board: 'Rajasthan Board of Secondary Education (RBSE)',
      addressLines: ['Near BITS Pilani Campus', 'Pilani, Dist. Jhunjhunu', 'Rajasthan 333031'],
      phones: ['+91 94605 40956'],
      email: 'info@hca.edu.in',
      hours: 'Mon-Sat 8:00 AM - 2:00 PM',
      socials: {},
    };
  }
}

export default async function ContactPage() {
  const profile = await getProfile();

  return (
    <>
      <Header />
      <main id="main-content" role="main" style={{ padding: 'var(--space-10) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <span className="badge badge-info" style={{ marginBottom: 'var(--space-2)' }}>Direct Communication</span>
            <h1 className="heading-hero" style={{ marginBottom: 'var(--space-2)' }}>
              Contact Hemant Children Academy
            </h1>
            <p className="subheading" style={{ maxWidth: '640px', margin: '0 auto' }}>
              We welcome prospective parents, alumni, and community members to visit our campus or contact our administration desk.
            </p>
          </div>

          <div className="grid-cols-2" style={{ gap: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
            {/* Campus Info & Contacts */}
            <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div>
                <span className="badge badge-warning" style={{ marginBottom: 'var(--space-2)' }}>Campus Location</span>
                <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                  School Campus &amp; Office
                </h2>
                <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                  {profile.addressLines.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                  <p>Jhunjhunu District, Rajasthan 333031</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                  Telephone &amp; Desk Inquiries
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {profile.phones.map((phone, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span style={{ fontSize: 'var(--font-size-lg)' }}>📞</span>
                      <a href={`tel:${phone.replace(/\s+/g, '')}`} style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', color: 'var(--hca-brand-primary-800)' }}>
                        {phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                  Electronic Correspondence
                </h3>
                <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)' }}>
                  ✉️ <a href={`mailto:${profile.email}`} style={{ fontWeight: '600' }}>{profile.email}</a>
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>
                  Office Working Hours
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  {profile.hours} (Closed on Sundays &amp; Gazette Holidays)
                </p>
              </div>
            </div>

            {/* Quick Action Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div className="card" style={{ backgroundColor: 'var(--hca-brand-primary-50)', borderColor: 'var(--hca-brand-primary-100)', padding: 'var(--space-6)' }}>
                <span className="badge badge-warning" style={{ marginBottom: 'var(--space-2)' }}>Admission Assistance</span>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', color: 'var(--hca-brand-primary-900)', marginBottom: 'var(--space-2)' }}>
                  Seeking Admission for Academic Session?
                </h2>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)', marginBottom: 'var(--space-4)' }}>
                  Rather than visiting during busy morning assembly hours, submit your enquiry online. Our headmaster and admissions counselor will review class eligibility and call you directly with reserved appointment slots.
                </p>
                <Link href="/admissions/enquiry" className="btn btn-accent btn-lg" style={{ width: '100%' }}>
                  Submit 2-Minute Admission Enquiry →
                </Link>
              </div>

              <div className="card" style={{ padding: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                  Parent Portal Credentials Support
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)', marginBottom: 'var(--space-3)' }}>
                  If you have lost your printed 10-character portal activation slip or need your child's single-family login reissued, please visit the administrative desk with your student admission number.
                </p>
                <Link href="/auth/activate" className="btn btn-secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
                  Activate Existing Slip →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer
        foundedOn={profile.foundedOn}
        registrationNo={profile.registrationNo}
        board={profile.board}
        phones={profile.phones}
        email={profile.email}
        addressLines={profile.addressLines}
      />
    </>
  );
}
