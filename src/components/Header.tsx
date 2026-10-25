'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../lib/auth-context';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="public-header" role="banner">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        <Link href="/" aria-label="Happy Children Academy Home" style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/brand/logo-header.svg"
            alt="Happy Children Academy Logo"
            width={240}
            height={60}
            priority
            style={{ height: '52px', width: 'auto' }}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav role="navigation" aria-label="Main Navigation">
          <ul className="public-nav-list">
            <li><Link href="/" className="nav-link">Home</Link></li>
            <li><Link href="/about" className="nav-link">About Us</Link></li>
            <li><Link href="/academics" className="nav-link">Academics</Link></li>
            <li><Link href="/facilities" className="nav-link">Facilities</Link></li>
            <li><Link href="/notices" className="nav-link">Notices</Link></li>
            <li><Link href="/admissions" className="nav-link">Admissions</Link></li>
            <li><Link href="/fees" className="nav-link">Fee Structure</Link></li>
            <li><Link href="/contact" className="nav-link">Contact</Link></li>
          </ul>
        </nav>

        {/* Action CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {user ? (
            <Link
              href={user.role === 'PARENT' ? '/portal' : user.role === 'TEACHER' ? '/portal/attendance' : '/admin'}
              className="btn btn-secondary"
            >
              Dashboard ({user.displayName.split(' ')[0]})
            </Link>
          ) : (
            <Link href="/auth/login" className="btn btn-secondary">
              Portal Login
            </Link>
          )}

          <Link href="/admissions/enquiry" className="btn btn-accent" style={{ display: 'none' }} id="desktop-enquire-btn">
            Enquire Now
          </Link>
          <style jsx>{`
            @media (min-width: 640px) {
              #desktop-enquire-btn {
                display: inline-flex !important;
              }
            }
            @media (max-width: 991px) {
              .mobile-toggle {
                display: inline-flex !important;
              }
            }
          `}</style>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="btn btn-ghost mobile-toggle"
            style={{ display: 'none', padding: 'var(--space-2)' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-card)',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <Link href="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
          <Link href="/academics" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Academics</Link>
          <Link href="/facilities" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Facilities</Link>
          <Link href="/notices" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Notices</Link>
          <Link href="/admissions" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Admissions</Link>
          <Link href="/fees" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Fee Structure</Link>
          <Link href="/contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <Link href="/admissions/enquiry" className="btn btn-accent" style={{ flex: 1 }} onClick={() => setMobileMenuOpen(false)}>
              Enquire Now
            </Link>
            <Link href="/auth/login" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setMobileMenuOpen(false)}>
              Portal Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
