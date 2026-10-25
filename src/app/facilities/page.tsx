import React from 'react';
import Image from 'next/image';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

interface FacilityItem {
  name: string;
  title: string;
  category: string;
  image: string;
  description: string;
  equipment: string[];
}

const FACILITIES: FacilityItem[] = [
  {
    name: 'science-lab',
    title: 'Science Laboratories',
    category: 'Practical Inquiry',
    image: '/images/facilities/science-lab.svg',
    description: 'Fully equipped experimental workspaces for Physics, Chemistry, and Biology. Built to RBSE secondary board practical examination specifications with child-safe apparatus.',
    equipment: [
      'Optical benches, prisms, and lens arrays for Physics practicals',
      'Dedicated chemical reagent racks with eye-wash safety station',
      'Biological compound microscopes and preserved specimen slides',
      'Demonstration podium with fire-resistant non-reactive work surfaces',
    ],
  },
  {
    name: 'computer-lab',
    title: 'Computer Technology Lab',
    category: 'Digital Literacy',
    image: '/images/facilities/computer-lab.svg',
    description: 'A dedicated IT environment where students from Class III through Class X gain foundational digital competencies, touch typing, office applications, and computational logic.',
    equipment: [
      'Modern desktop terminals arranged in supervised workstations',
      'Broadband internet filtered for student-safe learning resources',
      'Uninterruptible Power Supply (UPS) backup ensuring zero disruption',
      'Instructional projector system for collective interactive coding demonstrations',
    ],
  },
  {
    name: 'library',
    title: 'Curated Academic Library',
    category: 'Literature & Reference',
    image: '/images/facilities/library.svg',
    description: 'A peaceful, naturally ventilated reading hall housing over 3,000 catalogued volumes across standard curriculum textbooks, Hindi classics, English literature, and regional history.',
    equipment: [
      'Comprehensive reference volumes for RBSE Class VIII and X Board examinations',
      'Weekly Hindi and English periodicals, science journals, and newspapers',
      'Spacious reading desks with seating capacity for full class cohorts',
      'Dedicated circulation desk with digital book issue and return registry',
    ],
  },
  {
    name: 'smart-class',
    title: 'Smart Classrooms',
    category: 'Audio-Visual Pedagogy',
    image: '/images/facilities/smart-class.svg',
    description: 'Classrooms upgraded with audio-visual instructional hardware enabling teachers to explain abstract mathematical, geographic, and scientific concepts with dynamic multimedia.',
    equipment: [
      'High-definition wall-mounted digital display panels',
      'Acoustically balanced classroom speaker units for clear voice clarity',
      'Standardized dual-bench wooden seating with ergonomic back support',
      'Extensive window ventilation ensuring constant natural daylight and airflow',
    ],
  },
  {
    name: 'sports-ground',
    title: 'Sports & Athletics Grounds',
    category: 'Physical Discipline',
    image: '/images/facilities/sports-ground.svg',
    description: 'Dedicated outdoor athletic grounds supporting daily morning PT drills, team sports, physical education periods, and the school’s annual sports day championships.',
    equipment: [
      'Standardized clay cricket practice nets and match pitch',
      'Volleyball court and badminton court with regulation nets',
      'Athletic running track and long jump sand pit',
      'Dedicated sports storage for footballs, cricket gear, and gymnastic mats',
    ],
  },
  {
    name: 'arts-studio',
    title: 'Arts & Creative Studio',
    category: 'Cultural Expression',
    image: '/images/facilities/arts-studio.svg',
    description: 'An open creative workshop where students develop drawing, painting, traditional Shekhawati craftwork, and rehearse cultural performances for national day celebrations.',
    equipment: [
      'Adjustable wooden art easels and heavy sketching tables',
      'Ceramic craft tools, watercolor palettes, and fabric painting supplies',
      'Acoustic practice floor for Republic Day and Independence Day dance rehearsals',
      'Wall exhibition display rails showcasing student fine art each term',
    ],
  },
];

export default function FacilitiesPage() {
  return (
    <>
      <Header />
      <main id="main-content" role="main" style={{ padding: 'var(--space-10) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
            <span className="badge badge-info" style={{ marginBottom: 'var(--space-2)' }}>Campus Infrastructure</span>
            <h1 className="heading-hero" style={{ marginBottom: 'var(--space-3)' }}>
              Verified Campus Facilities
            </h1>
            <p className="subheading" style={{ maxWidth: '720px', margin: '0 auto' }}>
              Built to foster disciplined academic inquiry, physical vigor, and creative expression. All facilities meet state regulatory standards in Pilani, Rajasthan.
            </p>
          </div>

          {/* 6 Facilities Grid (Strict 3:2 aspect ratio, zero CLS) */}
          <div className="grid-cols-2" style={{ gap: 'var(--space-8)', marginBottom: 'var(--space-12)' }}>
            {FACILITIES.map((fac) => (
              <article key={fac.name} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 2', backgroundColor: 'var(--surface-muted)' }}>
                  <Image
                    src={fac.image}
                    alt={fac.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 'var(--space-3)',
                      left: 'var(--space-3)',
                    }}
                  >
                    <span className="badge badge-warning">{fac.category}</span>
                  </div>
                </div>

                <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                    {fac.title}
                  </h2>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)', marginBottom: 'var(--space-4)' }}>
                    {fac.description}
                  </p>

                  <div style={{ marginTop: 'auto', backgroundColor: 'var(--surface-subtle)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', textTransform: 'uppercase', color: 'var(--hca-brand-primary-800)', marginBottom: 'var(--space-2)' }}>
                      Key Equipment &amp; Features:
                    </h3>
                    <ul style={{ paddingLeft: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)' }}>
                      {fac.equipment.map((eq, idx) => (
                        <li key={idx}>{eq}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Privacy Note */}
          <div className="card" style={{ backgroundColor: 'var(--surface-muted)', border: '1px solid var(--border-subtle)', textAlign: 'center', padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
              Photographic Privacy &amp; Statutory Compliance Notice
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', maxWidth: '680px', margin: '0 auto' }}>
              In accordance with Section 9 of the Digital Personal Data Protection (DPDP) Act 2023, public campus imagery focuses exclusively on facility architecture and educational equipment. Photographs of identifiable children require active, verified parental consent on file.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
