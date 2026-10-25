# HCA Education Web (`hca-edu-web`)

Public school website and portal progressive web application (PWA) for **Harihar Chahar Academy (HCA)**.

## Architecture

- **Framework**: Next.js 15 (App Router), React 19
- **Design System**: Strict token-based styling via `tokens.css` (conforming to `DESIGN-SPEC-001`)
- **API Contracts**: Typed against `@hca/contracts`
- **Surfaces**:
  - **Public Website (`hca.edu.in`)**: Statically rendered pages (`/`, `/about`, `/academics`, `/facilities`, `/contact`, `/fees`, `/notices`) with dynamic institution age calculation.
  - **Admissions Funnel**: DPDP Act compliant Stage 1 public enquiry and Stage 2 invited tokenized application.
  - **Parent Portal PWA (`/portal`)**: Multi-child dashboard, attendance calendar, itemized fee statements with printable official receipts.
  - **Teacher Classroom Attendance (`/portal/attendance`)**: Phone-first, single-handed ergonomics with 48px tactile pills, 1-tap "Mark All Present", and offline outbox synchronization.
  - **Admin / Office Panel (`/admin`)**: Student directory, admissions pipeline, sessions lifecycle, fee ledger, and audit log.

## Getting Started

```bash
# Install dependencies
npm install

# Typecheck
npm run typecheck

# Production build
npm run build

# Start production server
npm run start
```
