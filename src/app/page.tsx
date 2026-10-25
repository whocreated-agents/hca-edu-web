import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { routes, yearsSince, type PublicProfile, type PublicNotice } from '@hca/contracts';
import { call } from '../lib/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const dynamic = 'force-dynamic';

async function loadData() {
  const [profileRes, noticesRes, contentRes] = await Promise.allSettled([
    call(routes.public.profile, {}),
    call(routes.public.notices, { query: { limit: 3 } }),
    call(routes.public.content, {}),
  ]);

  const profile: PublicProfile = profileRes.status === 'fulfilled' ? profileRes.value : {
    name: 'Happy Children Academy',
    foundedOn: '2003-04-15',
    registrationNo: '103 JJN 2003-04',
    board: 'Rajasthan Board of Secondary Education (RBSE)',
    addressLines: ['Near BITS Pilani Campus', 'Pilani, Dist. Jhunjhunu', 'Rajasthan 333031'],
    phones: ['+91 94605 40956'],
    email: 'info@hca.edu.in',
    hours: 'Mon-Sat 8:00 AM - 2:00 PM',
    socials: {},
  };

  const notices: PublicNotice[] = noticesRes.status === 'fulfilled' ? noticesRes.value.items : [];
  const content = contentRes.status === 'fulfilled' ? contentRes.value : null;

  return { profile, notices, content };
}

export default async function HomePage() {
  const { profile, notices } = await loadData();
  const serviceYears = yearsSince(profile.foundedOn);

  return (
    <>
      <Header />
      <main id="main-content" role="main">
        {/* Hero Section */}
        <section
          style={{
            backgroundColor: 'var(--hca-brand-primary-900)',
            color: 'var(--text-inverse)',
            padding: 'var(--space-12) 0 var(--space-16)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 'var(--space-8)',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-1) var(--space-3)',
                    backgroundColor: 'rgba(217, 119, 6, 0.2)',
                    border: '1px solid var(--hca-brand-accent-600)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '600',
                    color: 'var(--hca-brand-accent-100)',
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  <span>★</span>
                  <span>{serviceYears} Years of Educational Service · RBSE Reg. {profile.registrationNo}</span>
                </div>

                <h1 className="heading-hero" style={{ color: 'var(--text-inverse)', marginBottom: 'var(--space-4)' }}>
                  Nurturing Curious Minds in Pilani Since 2003
                </h1>

                <p
                  className="subheading"
                  style={{ color: '#E2E8F0', marginBottom: 'var(--space-6)', maxWidth: '540px' }}
                >
                  Happy Children Academy delivers rigorous RBSE curriculum balanced with scientific inquiry, character formation, and inclusive care from Nursery to Class X.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <Link href="/admissions/enquiry" className="btn btn-accent btn-lg">
                    Admission Enquiry
                  </Link>
                  <a
                    href="tel:+919460540956"
                    className="btn btn-secondary btn-lg"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.3)' }}
                  >
                    Quick Call: +91 94605 40956
                  </a>
                </div>
              </div>

              {/* Reserved Hero Image Slot (16:9 ratio, zero CLS) */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-lg)',
                  border: '2px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <Image
                  src="/brand/placeholder-hero.svg"
                  alt="Happy Children Academy Campus Facility"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Key Statistics Strip */}
        <section
          style={{
            backgroundColor: 'var(--surface-card)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: 'var(--space-6) 0',
          }}
        >
          <div className="container">
            <div className="grid-cols-4">
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                <span style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--hca-brand-primary-800)', display: 'block' }}>
                  {serviceYears}
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Years of Service
                </span>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                <span style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--hca-brand-primary-800)', display: 'block' }}>
                  500+
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Students Enrolled
                </span>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                <span style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--hca-brand-primary-800)', display: 'block' }}>
                  30+
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Dedicated Faculty
                </span>
              </div>

              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                <span style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--hca-brand-accent-600)', display: 'block' }}>
                  95%
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Board Pass Rate
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Admissions Announcement Strip */}
        <section style={{ backgroundColor: 'var(--hca-brand-accent-50)', borderBottom: '1px solid var(--hca-brand-accent-100)', padding: 'var(--space-4) 0' }}>
          <div className="container flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="badge badge-warning">Admissions Open</span>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--text-primary)' }}>
                Academic Session Intake Open for Nursery to Class X. Seats allocated by verification order.
              </span>
            </div>
            <Link href="/admissions/enquiry" className="btn btn-accent" style={{ fontSize: 'var(--font-size-xs)' }}>
              Apply in 2 Minutes →
            </Link>
          </div>
        </section>

        {/* Academic Stages Overview */}
        <section style={{ padding: 'var(--space-12) 0', backgroundColor: 'var(--surface-subtle)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              <h2 className="heading-section">Academic Pathways from Early Childhood to Class X</h2>
              <p className="subheading" style={{ maxWidth: '640px', margin: 'var(--space-2) auto 0' }}>
                Affiliated with the Rajasthan Board of Secondary Education (RBSE), providing sequential foundational learning and high school board preparation.
              </p>
            </div>

            <div className="grid-cols-3">
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <span className="badge badge-info">Ages 3 – 5</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>3 Class Levels</span>
                </div>
                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                  Pre-Primary Stage
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                  Nursery, LKG, and HKG. Play-based sensory learning, early numeracy, bilingual phonics, and socialization in a warm environment.
                </p>
                <Link href="/academics" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                  Explore Pre-Primary →
                </Link>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <span className="badge badge-success">Ages 6 – 10</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Class I to V</span>
                </div>
                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                  Primary School
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                  Classes I through V. Core mastery of Mathematics, Environmental Studies, Hindi, English, and hands-on computer literacy.
                </p>
                <Link href="/academics" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                  Explore Primary Curriculum →
                </Link>
              </div>

              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <span className="badge badge-warning">Ages 11 – 15</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Class VI to X</span>
                </div>
                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                  Middle &amp; Secondary
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                  Classes VI to X. Comprehensive science practicals, social science, Sanskrit, and disciplined RBSE Secondary Board examination training.
                </p>
                <Link href="/academics" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                  Explore Secondary Program →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Welcome */}
        <section style={{ padding: 'var(--space-12) 0', backgroundColor: 'var(--surface-card)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-8)',
                alignItems: 'center',
              }}
            >
              <div style={{ maxWidth: '320px', margin: '0 auto', textAlign: 'center' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '240px',
                    height: '240px',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    margin: '0 auto var(--space-4)',
                    border: '3px solid var(--hca-brand-primary-800)',
                  }}
                >
                  <Image
                    src="/images/leadership/hm-sharmila.svg"
                    alt="Headmaster Mrs. Sharmila"
                    fill
                    sizes="240px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Mrs. Sharmila
                </h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--hca-brand-primary-600)', fontWeight: '600' }}>
                  Headmaster, Happy Children Academy
                </p>
              </div>

              <div>
                <span className="badge badge-info" style={{ marginBottom: 'var(--space-2)' }}>Leadership Message</span>
                <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
                  "At HCA, education extends beyond textbooks. We build character, discipline, and scientific inquiry rooted in our cultural heritage."
                </h2>
                <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)', marginBottom: 'var(--space-4)' }}>
                  Founded on 15 April 2003, Happy Children Academy has served the families of Pilani and the Shekhawati region for over two decades. Our commitment is simple: rigorous academics under the Rajasthan Board curriculum, individualized attention in manageable class sizes, and an atmosphere where every child is known, encouraged, and held to high moral standards.
                </p>
                <Link href="/about" className="btn btn-secondary">
                  Read About Our Leadership &amp; History →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Campus Facilities Preview */}
        <section style={{ padding: 'var(--space-12) 0', backgroundColor: 'var(--surface-subtle)' }}>
          <div className="container">
            <div className="flex-between" style={{ marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <h2 className="heading-section">Verified Campus Facilities</h2>
                <p className="subheading">Infrastructure supporting hands-on practical inquiry and active physical development.</p>
              </div>
              <Link href="/facilities" className="btn btn-secondary">
                View All 6 Facilities →
              </Link>
            </div>

            <div className="grid-cols-3">
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 2' }}>
                  <Image src="/images/facilities/science-lab.svg" alt="Science Laboratory" fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>Science Laboratories</h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Physics, Chemistry &amp; Biology demonstration benches with verified apparatus.</p>
                </div>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 2' }}>
                  <Image src="/images/facilities/computer-lab.svg" alt="Computer Technology Lab" fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>Computer Technology Lab</h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Dedicated PC terminals, broadband access, and fundamental digital literacy.</p>
                </div>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 2' }}>
                  <Image src="/images/facilities/library.svg" alt="Curated Library" fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ padding: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>Curated Library</h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Extensive academic reference books, Hindi &amp; English periodicals, and quiet reading hall.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Notices Section */}
        {notices.length > 0 && (
          <section style={{ padding: 'var(--space-10) 0', backgroundColor: 'var(--surface-card)', borderTop: '1px solid var(--border-subtle)' }}>
            <div className="container">
              <div className="flex-between" style={{ marginBottom: 'var(--space-4)' }}>
                <h2 className="heading-section">Latest School Notices</h2>
                <Link href="/notices" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                  All Announcements →
                </Link>
              </div>

              <div className="grid-cols-3">
                {notices.map((n) => (
                  <div key={n.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                      <span className="badge badge-info">{n.tag}</span>
                      {n.isPinned && <span className="badge badge-warning">Pinned</span>}
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                      <Link href={`/notices/${n.slug}`}>{n.title}</Link>
                    </h3>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {n.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
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
