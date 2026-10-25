'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  routes,
  type ApplicationView,
  type ApplicationForm,
  type Gender,
  type DocumentKind,
} from '@hca/contracts';
import { call } from '../../../../lib/api';
import { Header } from '../../../../components/Header';
import { Footer } from '../../../../components/Footer';
import { Skeleton, ErrorBanner } from '../../../../components/FiveStateView';

export default function Stage2ApplicationPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<ApplicationView | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form Fields
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');

  // Address
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('Pilani');
  const [state, setState] = useState('Rajasthan');
  const [pin, setPin] = useState('333031');

  // Father
  const [fatherName, setFatherName] = useState('');
  const [fatherOccupation, setFatherOccupation] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');

  // Mother
  const [motherName, setMotherName] = useState('');
  const [motherOccupation, setMotherOccupation] = useState('');
  const [motherPhone, setMotherPhone] = useState('');

  // Emergency Contact
  const [emergName, setEmergName] = useState('');
  const [emergRelation, setEmergRelation] = useState('Father');
  const [emergPhone, setEmergPhone] = useState('');

  // Documents
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docKind, setDocKind] = useState<DocumentKind>('BIRTH_CERTIFICATE');

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadApplication = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await call(routes.public.getApplication, { params: { token } });
      setAppData(data);
      if (data.form) {
        setDob(data.form.childDob);
        setGender(data.form.gender);
        setAddressLine1(data.form.address.line1);
        setCity(data.form.address.city);
        setState(data.form.address.state);
        setPin(data.form.address.pin);
        setFatherName(data.form.father.fullName);
        setFatherOccupation(data.form.father.occupation ?? '');
        setFatherPhone(data.form.father.phone);
        if (data.form.mother) {
          setMotherName(data.form.mother.fullName);
          setMotherOccupation(data.form.mother.occupation ?? '');
          setMotherPhone(data.form.mother.phone);
        }
        setEmergName(data.form.emergencyContact.name);
        setEmergRelation(data.form.emergencyContact.relation);
        setEmergPhone(data.form.emergencyContact.phone);
      } else {
        setFatherName(data.enquiry.parentName);
      }
    } catch {
      setLoadError('This admission application link is invalid or has expired (30-day limit). Please contact the school office at +91 94605 40956 to request a new link.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadApplication();
  }, [token]);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds the 2MB limit. Please upload a smaller scan or image.');
      return;
    }

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('kind', docKind);
      formData.append('file', file);

      const res = await fetch(`/api/v1/public/applications/${encodeURIComponent(token)}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      await loadApplication();
      alert('Document uploaded successfully.');
    } catch {
      alert('Failed to upload document. Please ensure it is a PDF or JPG under 2MB.');
    } finally {
      setUploadingDoc(false);
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to remove this uploaded document?')) return;
    try {
      await call(routes.public.deleteApplicationDocument, { params: { token, docId } });
      await loadApplication();
    } catch {
      alert('Failed to remove document.');
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!dob) {
      setFormError('Please enter the child’s date of birth.');
      return;
    }
    if (!addressLine1.trim()) {
      setFormError('Please enter residential address.');
      return;
    }
    if (!/^\d{6}$/.test(pin.trim())) {
      setFormError('Please enter a valid 6-digit PIN code.');
      return;
    }
    if (!fatherName.trim() || !fatherPhone.trim()) {
      setFormError('Father/guardian name and 10-digit mobile number are required.');
      return;
    }
    if (!emergName.trim() || !emergPhone.trim()) {
      setFormError('Emergency contact name and phone number are required.');
      return;
    }

    const payload: ApplicationForm = {
      childDob: dob,
      gender,
      address: {
        line1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pin: pin.trim(),
      },
      father: {
        fullName: fatherName.trim(),
        occupation: fatherOccupation.trim() || undefined,
        phone: fatherPhone.replace(/\D/g, ''),
      },
      mother: motherName.trim()
        ? {
            fullName: motherName.trim(),
            occupation: motherOccupation.trim() || undefined,
            phone: motherPhone.replace(/\D/g, '') || fatherPhone.replace(/\D/g, ''),
          }
        : undefined,
      emergencyContact: {
        name: emergName.trim(),
        relation: emergRelation.trim(),
        phone: emergPhone.replace(/\D/g, ''),
      },
      siblings: [],
    };

    setSubmitting(true);
    try {
      await call(routes.public.submitApplication, { params: { token }, body: payload });
      setSubmitSuccess(true);
      await loadApplication();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit application. Application may be locked by office.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main id="main-content" role="main" style={{ padding: 'var(--space-10) 0' }}>
        <div className="container-narrow">
          {loading ? (
            <div className="card">
              <Skeleton height="32px" width="60%" />
              <div style={{ marginTop: 'var(--space-4)' }}>
                <Skeleton height="20px" count={4} />
              </div>
            </div>
          ) : loadError ? (
            <div className="card-elevated" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <span className="badge badge-error" style={{ marginBottom: 'var(--space-2)' }}>Invalid Link</span>
              <h1 className="heading-section" style={{ marginBottom: 'var(--space-3)' }}>Application Link Expired or Not Found</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>{loadError}</p>
              <Link href="/admissions" className="btn btn-primary">Admissions Overview</Link>
            </div>
          ) : appData ? (
            <div>
              {/* Header Box */}
              <div className="card-elevated" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                  <span className="badge badge-info">Stage 2 Application</span>
                  {appData.status && (
                    <span className="badge badge-success">Status: {appData.status}</span>
                  )}
                </div>

                <h1 className="heading-section" style={{ marginBottom: 'var(--space-1)' }}>
                  Enrollment Application: {appData.enquiry.childName}
                </h1>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Class: <strong>{appData.enquiry.className}</strong> · Academic Session: <strong>{appData.enquiry.sessionLabel}</strong>
                </p>

                {!appData.editable && (
                  <div className="state-offline-banner" style={{ marginTop: 'var(--space-4)' }}>
                    <span>ℹ️ This application has been reviewed and locked by the admissions office. Changes can only be made in person at the school desk.</span>
                  </div>
                )}
              </div>

              {submitSuccess && (
                <div className="card" style={{ backgroundColor: 'var(--status-success-bg)', borderColor: 'var(--status-success-border)', marginBottom: 'var(--space-6)' }}>
                  <h3 style={{ color: 'var(--status-success-text)', fontSize: 'var(--font-size-lg)', fontWeight: 'bold' }}>
                    ✓ Application Submitted Successfully
                  </h3>
                  <p style={{ color: 'var(--status-success-text)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
                    The school admissions desk has received your updated details. You may also upload any remaining document scans below.
                  </p>
                </div>
              )}

              {formError && <ErrorBanner message={formError} />}

              {/* Multi-Section Form */}
              <form onSubmit={handleSubmitApplication}>
                {/* Section 1: Demographics */}
                <fieldset className="card" style={{ marginBottom: 'var(--space-6)', border: '1px solid var(--border-subtle)' }} disabled={!appData.editable || submitting}>
                  <legend style={{ fontWeight: '700', fontSize: 'var(--font-size-base)', padding: '0 var(--space-2)', color: 'var(--hca-brand-primary-800)' }}>
                    Section 1: Child Demographics
                  </legend>

                  <div className="grid-cols-2" style={{ marginTop: 'var(--space-3)' }}>
                    <div className="form-group">
                      <label htmlFor="dob" className="form-label">Date of Birth (As on Birth Certificate) *</label>
                      <input
                        type="date"
                        id="dob"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="gender" className="form-label">Gender *</label>
                      <select
                        id="gender"
                        required
                        value={gender}
                        onChange={(e) => setGender(e.target.value as Gender)}
                        className="form-select"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                </fieldset>

                {/* Section 2: Address */}
                <fieldset className="card" style={{ marginBottom: 'var(--space-6)', border: '1px solid var(--border-subtle)' }} disabled={!appData.editable || submitting}>
                  <legend style={{ fontWeight: '700', fontSize: 'var(--font-size-base)', padding: '0 var(--space-2)', color: 'var(--hca-brand-primary-800)' }}>
                    Section 2: Residential Address
                  </legend>

                  <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>
                    <label htmlFor="addr1" className="form-label">Street / House No. / Ward *</label>
                    <input
                      type="text"
                      id="addr1"
                      required
                      placeholder="e.g., House #42, Near Water Tank, Ward 7"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="grid-cols-3">
                    <div className="form-group">
                      <label htmlFor="city" className="form-label">City / Town *</label>
                      <input type="text" id="city" required value={city} onChange={(e) => setCity(e.target.value)} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="state" className="form-label">State *</label>
                      <input type="text" id="state" required value={state} onChange={(e) => setState(e.target.value)} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pin" className="form-label">PIN Code *</label>
                      <input type="text" id="pin" maxLength={6} required value={pin} onChange={(e) => setPin(e.target.value)} className="form-input" />
                    </div>
                  </div>
                </fieldset>

                {/* Section 3: Parents Background */}
                <fieldset className="card" style={{ marginBottom: 'var(--space-6)', border: '1px solid var(--border-subtle)' }} disabled={!appData.editable || submitting}>
                  <legend style={{ fontWeight: '700', fontSize: 'var(--font-size-base)', padding: '0 var(--space-2)', color: 'var(--hca-brand-primary-800)' }}>
                    Section 3: Parent &amp; Guardian Details
                  </legend>

                  <div className="grid-cols-2" style={{ marginTop: 'var(--space-3)' }}>
                    <div>
                      <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>Father / Guardian Details</h4>
                      <div className="form-group">
                        <label htmlFor="fatherName" className="form-label">Full Name *</label>
                        <input type="text" id="fatherName" required value={fatherName} onChange={(e) => setFatherName(e.target.value)} className="form-input" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="fatherOcc" className="form-label">Occupation</label>
                        <input type="text" id="fatherOcc" placeholder="e.g., Business, Agriculture, Service" value={fatherOccupation} onChange={(e) => setFatherOccupation(e.target.value)} className="form-input" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="fatherPhone" className="form-label">Mobile Number *</label>
                        <input type="tel" id="fatherPhone" maxLength={10} required value={fatherPhone} onChange={(e) => setFatherPhone(e.target.value)} className="form-input" />
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>Mother Details (Optional)</h4>
                      <div className="form-group">
                        <label htmlFor="motherName" className="form-label">Full Name</label>
                        <input type="text" id="motherName" value={motherName} onChange={(e) => setMotherName(e.target.value)} className="form-input" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="motherOcc" className="form-label">Occupation</label>
                        <input type="text" id="motherOcc" placeholder="e.g., Homemaker, Teacher, Doctor" value={motherOccupation} onChange={(e) => setMotherOccupation(e.target.value)} className="form-input" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="motherPhone" className="form-label">Mobile Number</label>
                        <input type="tel" id="motherPhone" maxLength={10} value={motherPhone} onChange={(e) => setMotherPhone(e.target.value)} className="form-input" />
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* Section 4: Emergency Contact */}
                <fieldset className="card" style={{ marginBottom: 'var(--space-6)', border: '1px solid var(--border-subtle)' }} disabled={!appData.editable || submitting}>
                  <legend style={{ fontWeight: '700', fontSize: 'var(--font-size-base)', padding: '0 var(--space-2)', color: 'var(--hca-brand-primary-800)' }}>
                    Section 4: Primary Emergency Contact
                  </legend>

                  <div className="grid-cols-3" style={{ marginTop: 'var(--space-3)' }}>
                    <div className="form-group">
                      <label htmlFor="emergName" className="form-label">Contact Person Name *</label>
                      <input type="text" id="emergName" required value={emergName} onChange={(e) => setEmergName(e.target.value)} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="emergRel" className="form-label">Relation *</label>
                      <input type="text" id="emergRel" required placeholder="Father / Uncle" value={emergRelation} onChange={(e) => setEmergRelation(e.target.value)} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="emergPhone" className="form-label">Emergency Phone *</label>
                      <input type="tel" id="emergPhone" maxLength={10} required value={emergPhone} onChange={(e) => setEmergPhone(e.target.value)} className="form-input" />
                    </div>
                  </div>
                </fieldset>

                {/* Submit Action Bar */}
                {appData.editable && (
                  <div style={{ marginBottom: 'var(--space-8)' }}>
                    <button type="submit" disabled={submitting} className="btn btn-accent btn-lg" style={{ width: '100%' }}>
                      {submitting ? 'Saving Application...' : 'Save & Submit Application'}
                    </button>
                  </div>
                )}
              </form>

              {/* Section 5: Document Uploads */}
              <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '700', marginBottom: 'var(--space-2)' }}>
                  Section 5: Certificate &amp; Document Uploads
                </h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                  Upload clear PDF scans or JPG photos under 2MB. (Birth Certificate, Child Passport Photo, Transfer Certificate).
                </p>

                {appData.editable && (
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 'var(--space-4)', padding: 'var(--space-4)', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="docKind" className="form-label">Document Category</label>
                      <select id="docKind" value={docKind} onChange={(e) => setDocKind(e.target.value as DocumentKind)} className="form-select">
                        <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
                        <option value="PHOTO_CHILD">Child Passport Photo (1:1)</option>
                        <option value="PREVIOUS_MARKSHEET">Previous Marksheet</option>
                        <option value="TRANSFER_CERTIFICATE">Transfer Certificate (TC)</option>
                        <option value="ADDRESS_PROOF">Address Proof</option>
                        <option value="OTHER">Other Certificate</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="docFile" className="form-label">Select File (PDF/JPG &lt; 2MB)</label>
                      <input type="file" id="docFile" accept="image/jpeg,image/png,application/pdf" disabled={uploadingDoc} onChange={handleDocumentUpload} className="form-input" style={{ padding: 'var(--space-1)' }} />
                    </div>

                    {uploadingDoc && (
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--hca-brand-primary-600)', fontWeight: '600' }}>Uploading...</span>
                    )}
                  </div>
                )}

                {/* Uploaded Documents List */}
                {appData.documents.length === 0 ? (
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    No documents uploaded yet. You can upload them now or bring original hard copies during office verification.
                  </p>
                ) : (
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Document Category</th>
                          <th>File Format</th>
                          <th>Size</th>
                          <th>Uploaded At</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appData.documents.map((doc) => (
                          <tr key={doc.id}>
                            <td><strong>{doc.kind.replace('_', ' ')}</strong></td>
                            <td>{doc.mimeType}</td>
                            <td>{(doc.sizeBytes / 1024).toFixed(1)} KB</td>
                            <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                            <td>
                              {appData.editable && (
                                <button type="button" onClick={() => handleDeleteDocument(doc.id)} className="btn btn-ghost" style={{ color: 'var(--status-error-base)', fontSize: 'var(--font-size-xs)' }}>
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
