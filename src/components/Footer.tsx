import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { yearsSince } from '@hca/contracts';

interface FooterProps {
  foundedOn?: string;
  registrationNo?: string;
  board?: string;
  phones?: string[];
  email?: string;
  addressLines?: string[];
}

export function Footer({
  foundedOn = '2003-04-15',
  registrationNo = '103 JJN 2003-04',
  board = 'Rajasthan Board of Secondary Education (RBSE)',
  phones = ['+91 94605 40956'],
  email = 'info@hca.edu.in',
  addressLines = ['Near BITS Pilani Campus', 'Pilani, Dist. Jhunjhunu', 'Rajasthan 333031'],
}: FooterProps) {
  const serviceYears = yearsSince(foundedOn);

  return (
    <footer className="public-footer" role="contentinfo">
      <div className="container">
        <div className="grid-cols-4" style={{ marginBottom: 'var(--space-8)' }}>
          {/* Col 1: Identity & Statutory */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Image src="/brand/logo-mark.svg" alt="HCA Crest" width={36} height={36} />
              <span style={{ fontWeight: 'bold', fontSize: 'var(--font-size-lg)', color: 'var(--text-inverse)' }}>
                Hemant Children Academy
              </span>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: '#CBD5E1', lineHeight: 'var(--line-height-relaxed)' }}>
              {serviceYears} years of holistic educational service in Pilani, Rajasthan. Co-educational English &amp; Hindi medium instruction.
            </p>
            <div style={{ fontSize: 'var(--font-size-xs)', color: '#94A3B8', marginTop: 'var(--space-2)' }}>
              <p><strong>Statutory Reg:</strong> {registrationNo}</p>
              <p><strong>Curriculum:</strong> {board}</p>
              <p><strong>Founded:</strong> 15 April 2003</p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: '600', color: 'var(--text-inverse)', marginBottom: 'var(--space-2)' }}>
              Academics &amp; Life
            </h4>
            <Link href="/about" style={{ fontSize: 'var(--font-size-sm)' }}>About Our School</Link>
            <Link href="/academics" style={{ fontSize: 'var(--font-size-sm)' }}>Curriculum &amp; Stages</Link>
            <Link href="/facilities" style={{ fontSize: 'var(--font-size-sm)' }}>Campus Facilities</Link>
            <Link href="/notices" style={{ fontSize: 'var(--font-size-sm)' }}>Notice Board</Link>
            <Link href="/fees" style={{ fontSize: 'var(--font-size-sm)' }}>Fee Structure</Link>
          </div>

          {/* Col 3: Admissions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: '600', color: 'var(--text-inverse)', marginBottom: 'var(--space-2)' }}>
              Admissions
            </h4>
            <Link href="/admissions" style={{ fontSize: 'var(--font-size-sm)' }}>Admissions Overview</Link>
            <Link href="/admissions/enquiry" style={{ fontSize: 'var(--font-size-sm)' }}>Quick Enquiry Form</Link>
            <Link href="/contact" style={{ fontSize: 'var(--font-size-sm)' }}>Visit Campus</Link>
            <Link href="/auth/login" style={{ fontSize: 'var(--font-size-sm)' }}>Staff &amp; Parent Portal</Link>
            <Link href="/auth/activate" style={{ fontSize: 'var(--font-size-sm)' }}>Activate Office Slip</Link>
          </div>

          {/* Col 4: Contact & Location */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: '600', color: 'var(--text-inverse)', marginBottom: 'var(--space-2)' }}>
              School Office
            </h4>
            <div style={{ fontSize: 'var(--font-size-sm)', color: '#CBD5E1', lineHeight: 'var(--line-height-normal)' }}>
              {addressLines.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
              <strong>Phone:</strong>{' '}
              {phones.map((p, idx) => (
                <a key={idx} href={`tel:${p.replace(/\s+/g, '')}`}>{p}</a>
              ))}
            </p>
            <p style={{ fontSize: 'var(--font-size-sm)' }}>
              <strong>Email:</strong> <a href={`mailto:${email}`}>{email}</a>
            </p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: '#94A3B8', marginTop: 'var(--space-1)' }}>
              Office Hours: Mon–Sat 8:00 AM – 2:00 PM
            </p>
          </div>
        </div>

        {/* DPDP Compliance & Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid #1E293B',
            paddingTop: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            fontSize: 'var(--font-size-xs)',
            color: '#64748B',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <p>© {new Date().getFullYear()} Hemant Children Academy, Pilani. All rights reserved.</p>
            <p>
              Compliant with Section 9 of the Digital Personal Data Protection (DPDP) Act 2023. Student privacy protected.
            </p>
          </div>
          <p>
            Student attendance and marks are protected by role-based anti-IDOR authorization. Offline attendance synced via idempotent signatures.
          </p>
        </div>
      </div>
    </footer>
  );
}
