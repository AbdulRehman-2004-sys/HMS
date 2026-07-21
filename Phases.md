# Development Phases & Implementation Tickets - LALA Medical Complex HMS

This document details the step-by-step roadmap for implementing LALA Medical Complex's HMS. Each ticket contains clear goals, feature definitions, acceptance criteria, dependencies, and testing checklists.

---

## Phase 0: Project Foundation (Current)

### Ticket 0.1: System Architecture, Environment, layouts, Auth & DB Foundation
- **Goal:** Set up a professional Next.js & Express.js project workspace with a production-ready clean architecture, Neon PostgreSQL DB configuration using Drizzle, Winston logging, Zod validation, JWT authentication, and a dashboard sidebar shell.
- **Features:**
  - Decoupled folder structure (`/frontend` and `/backend`).
  - Standardized error handling, Zod validation middleware, and API responses.
  - User and token tables in database schema.
  - Role-based authorization middleware.
  - Sidebar layout shell with navigation context.
- **Acceptance Criteria:**
  - Next.js and Express projects compile with zero TypeScript warnings.
  - Express server boots successfully and passes basic health check routing.
  - Frontend boots, showing a minimal dashboard shell with sidebar layout.
- **Dependencies:** None.
- **Testing Checklist:**
  - Run `npm run type-check` on backend and frontend.
  - Verify error handling middleware returns clean JSON error structures without stack traces.

---

## Phase 1: Authentication & User Administration

### Ticket 1.1: Complete Authentication API & JWT Flow
- **Goal:** Implement secure endpoints for user login, logout, password resets, and session refreshes.
- **Features:**
  - Login endpoint with rate limiter and password hashing (bcryptjs).
  - Cookie-based refresh token handling.
  - Access token reissue.
- **Acceptance Criteria:**
  - Token refresh requests automatically renew access tokens.
  - Invalid or expired tokens return a `401 Unauthorized` response.
- **Dependencies:** Ticket 0.1.
- **Testing Checklist:**
  - Automated tests checking token expiry handlers.
  - Verify secure `HttpOnly` cookie flags on refresh tokens.

### Ticket 1.2: User Management & Profile Management
- **Goal:** Allow Administrators to manage clinic staff accounts and roles.
- **Features:**
  - CRUD operations for Staff (Doctors, Nurses, Receptionists, Admins).
  - Profile page with avatar upload and account updates.
- **Acceptance Criteria:**
  - Only Administrators can create staff accounts or modify their access roles.
- **Dependencies:** Ticket 1.1.

---

## Phase 2: Reception & Patient Management

### Ticket 2.1: Patient Registration & Demographics
- **Goal:** Enable receptionists to register patients and record biographical and demographic details.
- **Features:**
  - Patient registration form with Zod schema validation.
  - Unique Patient ID generation system.
  - Historical lookup of existing patient files.
- **Acceptance Criteria:**
  - Search by phone, name, or medical record number (MRN) returns matches in <200ms.
- **Dependencies:** Phase 1.

### Ticket 2.2: Appointment Scheduling & Calendar
- **Goal:** Allow Receptionists and Patients to book medical appointments.
- **Features:**
  - Calendar workspace showing doctor slots availability.
  - Patient appointment scheduling, rescheduling, and cancellation options.
- **Acceptance Criteria:**
  - Prevents double-booking doctor slots.
- **Dependencies:** Ticket 2.1.

---

## Phase 3: Clinical Workspace (EHR)

### Ticket 3.1: Nursing Triage & Vitals
- **Goal:** Allow Nurses to record patient intake details (vitals, allergies, primary complaints).
- **Features:**
  - Vitals form (blood pressure, temperature, weight, height, BMI computation).
  - Allergy registry and alert tags.
- **Acceptance Criteria:**
  - Active allergy warnings display prominently on the doctor's consultation workspace.
- **Dependencies:** Phase 2.

### Ticket 3.2: Doctor Consultation Workspace & SOAP Notes
- **Goal:** Allow Doctors to record clinical notes and diagnostics.
- **Features:**
  - Subjective, Objective, Assessment, Plan (SOAP) clinical record form.
  - Chronic disease tags and medical history timeline.
- **Acceptance Criteria:**
  - Doctor notes are locked and signed digitally upon consultation completion.
- **Dependencies:** Ticket 3.1.

### Ticket 3.3: Electronic Prescriptions (e-Rx)
- **Goal:** Allow Doctors to write and issue digital prescriptions.
- **Features:**
  - Prescription form with drug dosage and frequency selector.
  - Pharmacy routing and PDF generation for patients.
- **Acceptance Criteria:**
  - Generates clear, readable, print-optimized prescription layouts.
- **Dependencies:** Ticket 3.2.

---

## Phase 4: Patient Management & Registration (Current)

### Ticket 4.1: Patient Registration & Demographics (COMPLETED)
- **Goal:** Enable receptionists to register patients and record demographic details with permanent MR Numbers.

---

## Phase 5: Online Appointment & Doctor Queue Management

### Ticket 5.1: Online Appointment Booking & Reception Check-in (Current)
- **Goal:** Allow patients/receptionists to book appointments, manage pending check-ins on the Reception Dashboard, and check-in patients into the active Doctor Queue.
- **Workflow:**
  1. Patient/Staff books appointment (`PENDING_CHECK_IN`).
  2. Reception Dashboard lists today's appointments under `Pending Check-in`.
  3. Receptionist clicks `Check In`.
  4. Patient is assigned a Queue Token (e.g. `Q-001`) and enters the Doctor Consultation Queue (`patient_visits`).

---

## Phase 6: Diagnostics (Laboratory & Radiology - Deferred)


### Ticket 5.2: Payments & Insurance Claims
- **Goal:** Process patient payments and insurance claims.
- **Features:**
  - Payment entry (cash, card, online transfers).
  - Insurance co-pay configuration and claims processing.
- **Acceptance Criteria:**
  - Correctly flags payment balances and claim approval statuses.
- **Dependencies:** Ticket 5.1.

---

## Phase 6: Wards & Admission (IPD)

### Ticket 6.1: Ward & Bed Management
- **Goal:** Manage inpatient admissions, transfers, and discharge.
- **Features:**
  - Bed mapping grid layout (Wards, ICU, Private Rooms).
  - Admission, internal transfer, and patient discharge workflow.
- **Acceptance Criteria:**
  - Real-time visual interface of room occupancy.
- **Dependencies:** Phase 3.

---

## Phase 7: Analytics, Settings & Audit Logs

### Ticket 7.1: System Configurations & Settings
- **Goal:** Configure global application parameters.
- **Features:**
  - Ward pricing, laboratory rates, and hospital information forms.
- **Acceptance Criteria:**
  - Super admin configuration changes take effect instantly across the application.
- **Dependencies:** Phase 1.

### Ticket 7.2: Security Auditing & Logs
- **Goal:** View audit trail history for critical events.
- **Features:**
  - Chronological grid of system logs (IP address, user, module, activity description).
- **Acceptance Criteria:**
  - Audit logs are read-only and cannot be updated or deleted by any user level.
- **Dependencies:** Phase 1.
