import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { routes, yearsSince, type PublicProfile } from '@hca/contracts';
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

export default async function AboutPage() {
  const profile = await getProfile();
  const serviceYears = yearsSince(profile.foundedOn);

  return (
    <>
      <Header />
      <main id="main-content" role="main" style={{ padding: 'var(--space-10) 0' }}>
        <div className="container">
          {/* Hero Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <span className="badge badge-warning" style={{ marginBottom: 'var(--space-2)' }}>
              Founded 15 April 2003
            </span>
            <h1 className="heading-hero" style={{ marginBottom: 'var(--space-3)' }}>
              {serviceYears} Years of Educational Commitment in Pilani
            </h1>
            <p className="subheading" style={{ maxWidth: '720px', margin: '0 auto' }}>
              Rooted in the educational culture of Pilani, Rajasthan. Affiliated with the Rajasthan Board of Secondary Education (RBSE) under Registration No. 103 JJN 2003-04.
            </p>
          </div>

          {/* Story & Statutory Card Grid */}
          <div className="grid-cols-2" style={{ marginBottom: 'var(--space-12)' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <h2 className="heading-section">Our Founding Story &amp; Purpose</h2>
              <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                Hemant Children Academy was established on 15 April 2003 with a singular mission: to provide high-quality, disciplined, and accessible schooling to children across Pilani, Surajgarh, and the rural Shekhawati region.
              </p>
              <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                While Pilani is internationally renowned for higher university education, foundational school education requires compassionate local institutions where moral values, vernacular fluency in Hindi, and professional proficiency in English are fostered together.
              </p>
              <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                Over the past {serviceYears} years, more than 500 students each year have walked through our gates, achieving a consistent 95% pass rate in the RBSE Secondary Examination and advancing into higher academic careers.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Statutory Card */}
              <div className="card" style={{ backgroundColor: 'var(--hca-brand-primary-50)', borderColor: 'var(--hca-brand-primary-100)' }}>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', color: 'var(--hca-brand-primary-900)', marginBottom: 'var(--space-3)' }}>
                  Statutory Accreditations
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                  <li><strong>Statutory Registration No:</strong> 103 JJN 2003-04</li>
                  <li><strong>Curriculum &amp; Examination Board:</strong> Rajasthan Board of Secondary Education (RBSE)</li>
                  <li><strong>Medium of Instruction:</strong> Dual stream (English &amp; Hindi)</li>
                  <li><strong>Student Body:</strong> Co-educational (Boys &amp; Girls)</li>
                  <li><strong>Levels Recognized:</strong> Nursery through Class X (Secondary)</li>
                  <li><strong>Campus Location:</strong> Pilani, Dist. Jhunjhunu, Rajasthan 333031</li>
                </ul>
              </div>

              {/* Core Educational Values */}
              <div className="card">
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                  Core Institutional Pillars
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--font-size-xs)' }}>
                  <div>
                    <strong style={{ color: 'var(--hca-brand-primary-700)' }}>Academic Discipline:</strong> Daily classroom attendance and systematic syllabus progression.
                  </div>
                  <div>
                    <strong style={{ color: 'var(--hca-brand-primary-700)' }}>Scientific Curiosity:</strong> Regular experiments in dedicated science &amp; computer labs.
                  </div>
                  <div>
                    <strong style={{ color: 'var(--hca-brand-primary-700)' }}>Character &amp; Heritage:</strong> Daily morning assemblies, patriotic devotion, and ethical conduct.
                  </div>
                  <div>
                    <strong style={{ color: 'var(--hca-brand-primary-700)' }}>Guardian Transparency:</strong> Single-family parent portal with instant attendance and fee records.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Governing Leadership Grid */}
          <section style={{ marginBottom: 'var(--space-12)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              <h2 className="heading-section">Governing Leadership</h2>
              <p className="subheading">Direct stewardship by educationists rooted in the Pilani community.</p>
            </div>

            <div className="grid-cols-3">
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <div style={{ position: 'relative', width: '160px', height: '160px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', margin: '0 auto var(--space-4)', border: '2px solid var(--border-subtle)' }}>
                  <Image src="/images/leadership/ed-kapoor-singh.svg" alt="Mr. Kapoor Singh" fill sizes="160px" style={{ objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>Mr. Kapoor Singh</h3>
                <span className="badge badge-info" style={{ marginTop: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>Executive Director</span>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  Founding trustee and institutional director guiding strategic campus expansion and community relations since 2003.
                </p>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <div style={{ position: 'relative', width: '160px', height: '160px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', margin: '0 auto var(--space-4)', border: '2px solid var(--border-subtle)' }}>
                  <Image src="/images/leadership/md-mahendra-chahar.svg" alt="Mr. Mahendra S. Chahar" fill sizes="160px" style={{ objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>Mr. Mahendra S. Chahar</h3>
                <span className="badge badge-info" style={{ marginTop: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>Managing Director</span>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  Overseeing operational compliance, financial administration, board audits, and infrastructure modernization.
                </p>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <div style={{ position: 'relative', width: '160px', height: '160px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', margin: '0 auto var(--space-4)', border: '2px solid var(--border-subtle)' }}>
                  <Image src="/images/leadership/hm-sharmila.svg" alt="Mrs. Sharmila" fill sizes="160px" style={{ objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700' }}>Mrs. Sharmila</h3>
                <span className="badge badge-success" style={{ marginTop: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>Headmaster</span>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  Leading faculty development, daily classroom instruction, syllabus milestones, and holistic student welfare.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Banner */}
          <div className="card-elevated" style={{ backgroundColor: 'var(--hca-brand-primary-900)', color: 'var(--text-inverse)', textAlign: 'center', padding: 'var(--space-8)' }}>
            <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', marginBottom: 'var(--space-2)', color: 'var(--text-inverse)' }}>
              Looking to Enroll Your Child at HCA?
            </h3>
            <p style={{ color: 'var(--hca-neutral-200)', maxWidth: '540px', margin: '0 auto var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
              Our admission desk is ready to answer questions regarding class eligibility, documents, and school transport routes.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
              <Link href="/admissions/enquiry" className="btn btn-accent btn-lg">
                Submit Online Enquiry
              </Link>
              <Link href="/contact" className="btn btn-secondary btn-lg">
                Visit Campus
              </Link>
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
