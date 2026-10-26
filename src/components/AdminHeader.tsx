'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../lib/auth-context';

export function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        backgroundColor: 'var(--surface-dark)',
        color: 'var(--text-inverse)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-inverse)' }}>
            <Image src="/brand/logo-mark.svg" alt="HCA" width={32} height={32} />
            <span style={{ fontWeight: '700', fontSize: 'var(--font-size-base)', letterSpacing: '0.05em' }}>
              HCA ADMIN
            </span>
          </Link>
          <span className="badge badge-warning" style={{ fontSize: '10px' }}>
            {user?.role ?? 'OFFICE'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--hca-neutral-400)' }}>
            {user?.displayName}
          </span>
          <Link href="/" className="btn btn-ghost" style={{ color: 'var(--hca-brand-primary-300)', fontSize: 'var(--font-size-xs)' }}>
            Public Site
          </Link>
          <button type="button" onClick={logout} className="btn btn-secondary" style={{ minHeight: '32px', padding: '0 var(--space-3)', fontSize: 'var(--font-size-xs)' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Sub-navigation bar */}
      <div style={{ backgroundColor: 'var(--hca-neutral-800)', borderTop: '1px solid var(--hca-neutral-700)', overflowX: 'auto' }}>
        <div className="container" style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-2) var(--space-4)' }}>
          <Link href="/admin" style={{ color: 'var(--hca-neutral-50)', fontSize: 'var(--font-size-xs)', fontWeight: '500', whiteSpace: 'nowrap' }}>
            Overview
          </Link>
          <Link href="/admin/admissions" style={{ color: 'var(--hca-neutral-300)', fontSize: 'var(--font-size-xs)', fontWeight: '500', whiteSpace: 'nowrap' }}>
            Admissions Pipeline
          </Link>
          <Link href="/admin/students" style={{ color: 'var(--hca-neutral-300)', fontSize: 'var(--font-size-xs)', fontWeight: '500', whiteSpace: 'nowrap' }}>
            Student Records
          </Link>
          <Link href="/admin/parents" style={{ color: 'var(--hca-neutral-300)', fontSize: 'var(--font-size-xs)', fontWeight: '500', whiteSpace: 'nowrap' }}>
            Activation Slips
          </Link>
          <Link href="/admin/attendance" style={{ color: 'var(--hca-neutral-300)', fontSize: 'var(--font-size-xs)', fontWeight: '500', whiteSpace: 'nowrap' }}>
            Attendance Reports
          </Link>
          <Link href="/admin/fees" style={{ color: 'var(--hca-neutral-300)', fontSize: 'var(--font-size-xs)', fontWeight: '500', whiteSpace: 'nowrap' }}>
            Fee Operations
          </Link>
          <Link href="/admin/content" style={{ color: 'var(--hca-neutral-300)', fontSize: 'var(--font-size-xs)', fontWeight: '500', whiteSpace: 'nowrap' }}>
            Notices &amp; CMS
          </Link>
          <Link href="/admin/sessions" style={{ color: 'var(--hca-neutral-300)', fontSize: 'var(--font-size-xs)', fontWeight: '500', whiteSpace: 'nowrap' }}>
            Academic Sessions
          </Link>
          <Link href="/admin/audit" style={{ color: 'var(--hca-neutral-400)', fontSize: 'var(--font-size-xs)', fontWeight: '500', whiteSpace: 'nowrap' }}>
            Audit Log
          </Link>
        </div>
      </div>
    </header>
  );
}
