'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { routes, type ClassLevelDto, EnquiryReceipt } from '@hca/contracts';
import { z } from 'zod';
import { call } from '../../../lib/api';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';

type EnquiryReceiptType = z.infer<typeof EnquiryReceipt>;

export default function EnquiryPage() {
  const [classLevels, setClassLevels] = useState<ClassLevelDto[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(true);

  // 6 Fields + Honeypot
  const [childName, setChildName] = useState('');
  const [classLevelId, setClassLevelId] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [locality, setLocality] = useState('');
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');

  // Form State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<EnquiryReceiptType | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    call(routes.public.classLevels, {})
      .then((data) => {
        if (!cancelled) {
          setClassLevels(data);
          if (data.length > 0 && data[0]) setClassLevelId(data[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) {
          const fallbackLevels: ClassLevelDto[] = [
            { id: '11111111-1111-1111-1111-111111111101', name: 'Nursery', order: 1, stage: 'PRE_PRIMARY', minAge: 3, maxAge: 4 },
            { id: '11111111-1111-1111-1111-111111111102', name: 'LKG', order: 2, stage: 'PRE_PRIMARY', minAge: 4, maxAge: 5 },
            { id: '11111111-1111-1111-1111-111111111103', name: 'HKG', order: 3, stage: 'PRE_PRIMARY', minAge: 5, maxAge: 6 },
            { id: '11111111-1111-1111-1111-111111111104', name: 'Class I', order: 4, stage: 'PRIMARY', minAge: 6, maxAge: 7 },
            { id: '11111111-1111-1111-1111-111111111105', name: 'Class II', order: 5, stage: 'PRIMARY', minAge: 7, maxAge: 8 },
            { id: '11111111-1111-1111-1111-111111111106', name: 'Class III', order: 6, stage: 'PRIMARY', minAge: 8, maxAge: 9 },
            { id: '11111111-1111-1111-1111-111111111107', name: 'Class IV', order: 7, stage: 'PRIMARY', minAge: 9, maxAge: 10 },
            { id: '11111111-1111-1111-1111-111111111108', name: 'Class V', order: 8, stage: 'PRIMARY', minAge: 10, maxAge: 11 },
            { id: '11111111-1111-1111-1111-111111111109', name: 'Class VI', order: 9, stage: 'MIDDLE', minAge: 11, maxAge: 12 },
            { id: '11111111-1111-1111-1111-111111111110', name: 'Class VII', order: 10, stage: 'MIDDLE', minAge: 12, maxAge: 13 },
            { id: '11111111-1111-1111-1111-111111111111', name: 'Class VIII', order: 11, stage: 'MIDDLE', minAge: 13, maxAge: 14 },
            { id: '11111111-1111-1111-1111-111111111112', name: 'Class IX', order: 12, stage: 'SECONDARY', minAge: 14, maxAge: 15 },
            { id: '11111111-1111-1111-1111-111111111113', name: 'Class X', order: 13, stage: 'SECONDARY', minAge: 15, maxAge: 16 },
          ];
          setClassLevels(fallbackLevels);
          if (fallbackLevels[0]) setClassLevelId(fallbackLevels[0].id);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingLevels(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!childName.trim()) errs.childName = 'Child’s full name is required';
    if (!classLevelId) errs.classLevelId = 'Please select a class';
    if (!parentName.trim()) errs.parentName = 'Parent or guardian name is required';
    const cleanedPhone = phone.replace(/[\s\-+]/g, '');
    if (!/^\d{10}$/.test(cleanedPhone)) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!locality.trim()) errs.locality = 'Residential locality or village is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await call(routes.public.createEnquiry, {
        body: {
          childName: childName.trim(),
          classLevelId,
          parentName: parentName.trim(),
          phone: phone.replace(/[\s\-+]/g, ''),
          email: email.trim() ? email.trim() : undefined,
          locality: locality.trim(),
          website: websiteHoneypot || undefined,
        },
      });
      setReceipt(res);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Unable to submit enquiry. Please call our office directly at +91 94605 40956.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main id="main-content" role="main" style={{ padding: 'var(--space-10) 0' }}>
        <div className="container-narrow">
          {receipt ? (
            /* Success State */
            <div className="card-elevated" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--status-success-bg)',
                  border: '2px solid var(--status-success-border)',
                  color: 'var(--status-success-base)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  margin: '0 auto var(--space-4)',
                }}
              >
                ✓
              </div>

              <span className="badge badge-success" style={{ marginBottom: 'var(--space-2)' }}>
                Enquiry Successfully Registered
              </span>

              <h1 className="heading-section" style={{ marginBottom: 'var(--space-2)' }}>
                Thank You, {parentName}!
              </h1>

              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-6)' }}>
                Your admission enquiry for <strong>{childName}</strong> has been received by the Happy Children Academy office.
              </p>

              <div
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  border: '1px solid var(--border-standard)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  maxWidth: '360px',
                  margin: '0 auto var(--space-6)',
                }}
              >
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your Phone Reference Code
                </span>
                <strong style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--hca-brand-primary-800)', letterSpacing: '1px' }}>
                  {receipt.reference}
                </strong>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', display: 'block', marginTop: 'var(--space-1)' }}>
                  Quote this code if you call our office
                </span>
              </div>

              <div style={{ textAlign: 'left', backgroundColor: 'var(--hca-brand-primary-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)' }}>
                <h4 style={{ fontWeight: '700', color: 'var(--hca-brand-primary-900)', marginBottom: 'var(--space-1)' }}>
                  What happens next?
                </h4>
                <ol style={{ paddingLeft: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <li>Our admissions desk will call <strong>+91 {phone}</strong> within 24 to 48 hours.</li>
                  <li>We will confirm seat availability and age eligibility for the selected class.</li>
                  <li>You will receive a private Stage 2 digital link to submit certificates without standing in queues.</li>
                </ol>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
                <Link href="/" className="btn btn-secondary">
                  Return to Home
                </Link>
                <a href="tel:+919460540956" className="btn btn-primary">
                  Call Office Desk
                </a>
              </div>
            </div>
          ) : (
            /* Ideal & Error Form States */
            <div className="card-elevated">
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <span className="badge badge-warning" style={{ marginBottom: 'var(--space-1)' }}>
                  Stage 1 of 1 · Under 2 Minutes
                </span>
                <h1 className="heading-section" style={{ marginBottom: 'var(--space-1)' }}>
                  Quick Admission Enquiry
                </h1>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  No paperwork needed at this stage. Fill these 6 details and our office will call you to discuss enrollment.
                </p>
              </div>

              {apiError && (
                <div className="state-error-banner" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
                  <span>{apiError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Honeypot field (hidden from screen, robots will fill) */}
                <div style={{ display: 'none' }} aria-hidden="true">
                  <label htmlFor="website-field">Leave this empty</label>
                  <input
                    type="text"
                    id="website-field"
                    value={websiteHoneypot}
                    onChange={(e) => setWebsiteHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Field 1: Child's Full Name */}
                <div className="form-group">
                  <label htmlFor="childName" className="form-label">
                    1. Child's Full Name <span style={{ color: 'var(--status-error-base)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="childName"
                    required
                    maxLength={100}
                    placeholder="Enter child’s legal name"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    disabled={submitting}
                    className="form-input"
                    aria-invalid={!!errors.childName}
                    aria-describedby={errors.childName ? 'childName-error' : undefined}
                  />
                  {errors.childName && (
                    <span id="childName-error" className="form-error">{errors.childName}</span>
                  )}
                </div>

                {/* Field 2: Class Level */}
                <div className="form-group">
                  <label htmlFor="classLevelId" className="form-label">
                    2. Class Seeking Admission For <span style={{ color: 'var(--status-error-base)' }}>*</span>
                  </label>
                  <select
                    id="classLevelId"
                    required
                    value={classLevelId}
                    onChange={(e) => setClassLevelId(e.target.value)}
                    disabled={submitting || loadingLevels}
                    className="form-select"
                    aria-invalid={!!errors.classLevelId}
                  >
                    {classLevels.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.name} ({lvl.stage.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                  {errors.classLevelId && (
                    <span className="form-error">{errors.classLevelId}</span>
                  )}
                </div>

                {/* Field 3: Parent / Guardian Full Name */}
                <div className="form-group">
                  <label htmlFor="parentName" className="form-label">
                    3. Parent / Guardian Full Name <span style={{ color: 'var(--status-error-base)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="parentName"
                    required
                    maxLength={100}
                    placeholder="Enter parent or guardian’s name"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    disabled={submitting}
                    className="form-input"
                    aria-invalid={!!errors.parentName}
                  />
                  {errors.parentName && (
                    <span className="form-error">{errors.parentName}</span>
                  )}
                </div>

                {/* Field 4: Mobile Number */}
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    4. Mobile Number (For Office Contact) <span style={{ color: 'var(--status-error-base)' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 var(--space-3)',
                        backgroundColor: 'var(--surface-muted)',
                        border: '1px solid var(--border-standard)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      +91
                    </span>
                    <input
                      type="tel"
                      id="phone"
                      required
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="94605 40956"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      disabled={submitting}
                      className="form-input"
                      aria-invalid={!!errors.phone}
                    />
                  </div>
                  {errors.phone ? (
                    <span className="form-error">{errors.phone}</span>
                  ) : (
                    <span className="form-hint">Our staff will contact you on this number. Never shared externally.</span>
                  )}
                </div>

                {/* Field 5: Email Address (Optional) */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    5. Email Address <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>(Optional, for digital receipt)</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="parent@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    className="form-input"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <span className="form-error">{errors.email}</span>
                  )}
                </div>

                {/* Field 6: Residential Locality / Village */}
                <div className="form-group">
                  <label htmlFor="locality" className="form-label">
                    6. Residential Locality / Village <span style={{ color: 'var(--status-error-base)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="locality"
                    required
                    maxLength={100}
                    placeholder="e.g., Shiv Colony, Pilani / Surajgarh / Nayagaon"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    disabled={submitting}
                    className="form-input"
                    aria-invalid={!!errors.locality}
                  />
                  {errors.locality && (
                    <span className="form-error">{errors.locality}</span>
                  )}
                  <span className="form-hint">Used to evaluate school transport and van routes.</span>
                </div>

                {/* Privacy Assurance & Submit */}
                <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                    🔒 Protected under Section 9 of the DPDP Act 2023. We do not require Aadhaar, caste, or income certificates at this initial enquiry stage.
                  </p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-accent btn-lg"
                    style={{ width: '100%' }}
                  >
                    {submitting ? 'Submitting Enquiry...' : 'Submit Enquiry (Step 1 of 1)'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
