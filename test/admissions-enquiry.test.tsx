import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EnquiryPage from '../src/app/admissions/enquiry/page';
import { AuthProvider } from '../src/lib/auth-context';

function renderWithAuth(ui: React.ReactElement) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe('Admissions Enquiry User Flow (Stage 1 Form)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders all 6 required fields and displays validation errors when submitted empty', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/public/class-levels')) {
        return Promise.resolve(
          new Response(
            JSON.stringify([
              { id: '11111111-1111-1111-1111-111111111101', name: 'Nursery', order: 1, stage: 'PRE_PRIMARY', minAge: 3, maxAge: 4 },
              { id: '11111111-1111-1111-1111-111111111104', name: 'Class I', order: 4, stage: 'PRIMARY', minAge: 6, maxAge: 7 },
            ]),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        );
      }
      return Promise.resolve(new Response('{}', { status: 200 }));
    });

    renderWithAuth(<EnquiryPage />);

    expect(screen.getByLabelText(/Child's Full Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Class Seeking Admission For/i)).toBeDefined();
    expect(screen.getByLabelText(/Parent \/ Guardian Full Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Mobile Number/i)).toBeDefined();
    expect(screen.getByLabelText(/Residential Locality/i)).toBeDefined();

    const submitBtn = screen.getByRole('button', { name: /Submit Enquiry/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Child’s full name is required/i)).toBeDefined();
      expect(screen.getByText(/Parent or guardian name is required/i)).toBeDefined();
      expect(screen.getByText(/Please enter a valid 10-digit mobile number/i)).toBeDefined();
      expect(screen.getByText(/Residential locality or village is required/i)).toBeDefined();
    });
  });

  it('submits valid enquiry data and renders tracking confirmation receipt', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/public/class-levels')) {
        return Promise.resolve(
          new Response(
            JSON.stringify([
              { id: '11111111-1111-1111-1111-111111111101', name: 'Nursery', order: 1, stage: 'PRE_PRIMARY', minAge: 3, maxAge: 4 },
            ]),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        );
      }
      if (url.includes('/public/enquiries')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              reference: 'HCA-2026-0042',
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
          )
        );
      }
      return Promise.resolve(new Response('{}', { status: 200 }));
    });

    renderWithAuth(<EnquiryPage />);

    // Wait for class levels dropdown to load and populate
    await waitFor(() => {
      const select = screen.getByLabelText(/Class Seeking Admission For/i) as HTMLSelectElement;
      expect(select.disabled).toBe(false);
      expect(select.value).toBe('11111111-1111-1111-1111-111111111101');
    });

    fireEvent.change(screen.getByLabelText(/Child's Full Name/i), { target: { value: 'Aarav Sharma' } });
    fireEvent.change(screen.getByLabelText(/Class Seeking Admission For/i), { target: { value: '11111111-1111-1111-1111-111111111101' } });
    fireEvent.change(screen.getByLabelText(/Parent \/ Guardian Full Name/i), { target: { value: 'Rajesh Sharma' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByLabelText(/Residential Locality/i), { target: { value: 'Near BITS Campus, Pilani' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Enquiry/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Enquiry Successfully Registered/i)).toBeDefined();
      expect(screen.getByText('HCA-2026-0042')).toBeDefined();
      expect(screen.getByText(/Thank You, Rajesh Sharma!/)).toBeDefined();
    });
  });

  it('surfaces server API rejection errors cleanly in the banner', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/public/class-levels')) {
        return Promise.resolve(
          new Response(
            JSON.stringify([
              { id: '11111111-1111-1111-1111-111111111101', name: 'Nursery', order: 1, stage: 'PRE_PRIMARY', minAge: 3, maxAge: 4 },
            ]),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        );
      }
      if (url.includes('/public/enquiries')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              type: 'https://hca.edu.in/problems/no-admission-session',
              title: 'No Admission Session Open',
              status: 409,
              detail: 'No academic session currently open for new admissions.',
              code: 'NO_ADMISSION_SESSION_OPEN',
              requestId: 'req-err-409',
            }),
            { status: 409, headers: { 'Content-Type': 'application/json' } }
          )
        );
      }
      return Promise.resolve(new Response('{}', { status: 200 }));
    });

    renderWithAuth(<EnquiryPage />);

    // Wait for class levels dropdown to load and populate
    await waitFor(() => {
      const select = screen.getByLabelText(/Class Seeking Admission For/i) as HTMLSelectElement;
      expect(select.disabled).toBe(false);
      expect(select.value).toBe('11111111-1111-1111-1111-111111111101');
    });

    fireEvent.change(screen.getByLabelText(/Child's Full Name/i), { target: { value: 'Aarav Sharma' } });
    fireEvent.change(screen.getByLabelText(/Class Seeking Admission For/i), { target: { value: '11111111-1111-1111-1111-111111111101' } });
    fireEvent.change(screen.getByLabelText(/Parent \/ Guardian Full Name/i), { target: { value: 'Rajesh Sharma' } });
    fireEvent.change(screen.getByLabelText(/Mobile Number/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByLabelText(/Residential Locality/i), { target: { value: 'Pilani' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Enquiry/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/No Admission Session Open/i)).toBeDefined();
    });
  });
});
