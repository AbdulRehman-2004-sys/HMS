# Project State Memory - LALA Medical Complex HMS

## Completed
- Created initial PRD, Architecture, Rules, Phases, Design, and Memory documents.
- Initialized Express.js backend project structure with Winston logging, custom error handlers, and security middlewares.
- Initialized Next.js 14 App Router frontend workspace with Axios and React Query providers.
- Refactored database schema in `schema.ts` to support dynamic user-roles relation (many-to-many join table `user_roles`) and audit logging.
- Built centralized permissions system (`Permission` enum) mapping roles (`Super Admin`, `Receptionist`, `Doctor`, `Laboratory`, `Radiology`, `Billing`) to fine-grained permission nodes.
- Refactored `AuthService` to query database-driven user roles, verify bcrypt password hashes, and handle secure JWT token rotation and cookie lifecycle.
- Implemented a resilient database connection check and an in-memory database mock fallback allowing fully-featured login, registration, and RBAC token rotation tests even when the PostgreSQL server is offline.
- Created Next.js client-side `PermissionGuard` and clinical error views (403 Unauthorized, 404 Node Not Found).
- Built 5 individual verification route gates under `/dashboard` to test and confirm active role permissions.
- Implemented a concurrent refresh lock mechanism (`activeRefreshPromise`) on the frontend to solve double-mounting race conditions.
- Added `phone` and `username` columns to the `users` database table schema and updated the default admin/test user seeding logic.
- Built a complete, production-ready User Management Module restricted to Super Admins (using `Permission.MANAGE_SYSTEM` RBAC protection).
- Built complete, scalable **Doctor Management Module** (Phase 3 — Ticket 3).
- Built complete, scalable **Patient Registration Module** (Phase 4 — Ticket 4).
- Built complete **Doctor Queue & Patient Visit (Encounter) Module** (Phase 5 — Ticket 6).
- Built complete **Electronic Prescriptions (e-Rx) & Medication Pad Module** (Phase 3 — Ticket 3.3 / Ticket 7):
  - Created `prescriptions` and `prescription_items` database tables with Drizzle migration `0006_nostalgic_red_skull.sql`.
  - Built backend Prescriptions REST API endpoints (`/api/prescriptions`, `/api/prescriptions/visit/:visitId`, `/api/prescriptions/patient/:patientId`, `/api/prescriptions/medicines/search`) with Zod input validation and audit logging.
  - Built interactive e-Prescription Builder directly inside `EMRScreen.tsx` with Diagnosis input, Medicine row manager, Drug auto-complete search library, Frequency/Dosage/Duration selectors, Advice, and Follow-Up Date picker.
  - Integrated structured e-Prescription table onto the physical A4 prescription pad sheet for printouts.
  - Verified zero TypeScript compilation errors across backend and frontend workspaces.
- Built complete **Doctor Orders Module** (Phase 5 — Ticket 8):
  - Created `lab_orders`, `radiology_orders`, `admission_orders`, and `operation_orders` database tables with Drizzle migration `0007_ambiguous_dexter_bennett.sql`.
  - Built backend Orders REST API endpoints (`/api/orders/lab`, `/api/orders/radiology`, `/api/orders/admission`, `/api/orders/operation`, `/api/orders/visit/:visitId`, `/api/orders/:type/:id/status`).
  - Implemented strict business rules: max 1 active admission order per visit, max 1 active operation order per visit, enum-driven order status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), order cancellation guards, and audit logging.
  - Built interactive Clinical Orders tab in `EMRScreen.tsx` with one-click checkboxes for Lab tests, Radiology imaging (X-Ray & Ultrasound), Inpatient Admission requests, Surgery Operation requests, active orders list, and order cancellation.
  - Verified zero TypeScript compilation errors across backend and frontend workspaces.
- Built complete **Laboratory Module** (Phase 6 — Ticket 9):
  - Created `lab_reports` and `lab_report_items` database tables with Drizzle migration `0008_wild_fenris.sql`.
  - Built backend REST API endpoints (`/api/lab/orders`, `/api/lab/orders/:id/report`, `/api/lab/reports`, `/api/lab/reports/visit/:visitId`) with Zod validation, `LR-YYYYMMDD-XXXX` report number generation, order status syncing (`PENDING` -> `IN_PROGRESS` -> `COMPLETED`), and audit logging.
  - Built **Laboratory Dashboard** (`/dashboard/lab`) with metric summary cards, status tabs (`PENDING`, `IN_PROGRESS`, `COMPLETED`), search filter, and interactive structured text report builder with quick pre-filled parameter presets (CBC, LFT, RFT, FBS, Urine RE).
  - Integrated real-time released diagnostic reports into Doctor's EMR consultation workspace (`EMRScreen.tsx` Lab Reports tab) with parameter tables, reference ranges, abnormal red flag badges, technician details, and result date.
  - Verified zero TypeScript compilation errors across backend and frontend workspaces.
- Built complete **Radiology Module (X-Ray & Ultrasound)** (Phase 7 — Ticket 10):
  - Created `radiology_reports` database table with Drizzle migration `0009_empty_kabuki.sql`.
  - Built backend REST API endpoints (`/api/radiology/orders`, `/api/radiology/orders/:id/report`, `/api/radiology/reports`, `/api/radiology/reports/visit/:visitId`) with Zod validation, `RR-YYYYMMDD-XXXX` report number generation, order status syncing (`PENDING` -> `IN_PROGRESS` -> `COMPLETED`), and audit logging.
  - Built **Radiology Dashboard** (`/dashboard/radiology`) with metric summary cards, status tabs (`PENDING`, `IN_PROGRESS`, `COMPLETED`), modality filter (`ALL`, `XRAY`, `ULTRASOUND`), search filter, and interactive structured text report builder with quick pre-filled imaging presets (Normal Chest X-Ray, Normal Abdomen X-Ray, Normal Abdomen & Pelvis USG, KUB USG).
  - Integrated real-time released radiology reports into Doctor's EMR consultation workspace (`EMRScreen.tsx` Radiology tab) with Examination title, Service Type badge, Clinical Findings, Impression, Recommendation, technician details, and report date.
  - Verified zero TypeScript compilation errors across backend and frontend workspaces.
- Built complete **Patient Admission Module (Simple)** (Phase 8 — Ticket 11):
  - Created `patient_admissions` and `billing_charges` database tables with Drizzle migration `0010_unknown_silk_fever.sql`.
  - Built backend REST API endpoints (`/api/admissions/summary`, `/api/admissions/admit`, `/api/admissions/:id/discharge`, `/api/admissions/visit/:visitId`) with Zod validation, `ADM-YYYYMMDD-XXXX` admission number generation, default **Rs. 5000** room charges (editable), automatic billing charge entry creation, parent `admission_orders.status` sync (`PENDING` -> `COMPLETED`), and audit logging.
  - Built **Inpatient Admissions Dashboard** (`/dashboard/admissions`) with metric summary cards, status tabs (`PENDING_ORDERS`, `ACTIVE_ADMISSIONS`, `DISCHARGED`), patient search filter, room preset selection, editable room admission charge field, and one-click patient check-in & discharge workflows.
  - Updated sidebar navigation with `Inpatient Admissions` link (`/dashboard/admissions`).
  - Verified zero TypeScript compilation errors across backend and frontend workspaces.
- Built complete **Operation Module (Simple)** (Phase 9 — Ticket 12):
  - Created `patient_operations` database table with Drizzle migration `0011_greedy_susan_delgado.sql`.
  - Built backend REST API endpoints (`/api/operations`, `/api/operations/:id/cancel`, `/api/operations/visit/:visitId`) with Zod validation, `OPT-YYYYMMDD-XXXX` operation number generation, default **Rs. 20,000** operation charges (editable), automatic billing charge entry creation (`sourceModule = 'OPERATION'`), and audit logging.
  - Updated **Clinical Orders Tab** in `EMRScreen.tsx` with surgery operation procedure input, urgency selector, anesthesia selector, and editable **Operation Charge (PKR)** field (pre-filled with Rs. 20,000).
  - Verified zero TypeScript compilation errors across backend and frontend workspaces.
- Built complete **Billing & Payments Module** (Phase 10 — Tickets 13 & 14):
  - Created `invoices` and `invoice_items` database tables with Drizzle migration `0012_flashy_azazel.sql`.
  - Built backend REST API endpoints (`/api/billing/summary`, `/api/billing/generate`, `/api/billing/:id/pay`, `/api/billing/visit/:visitId`, `/api/billing/:id`) with Zod validation, `INV-YYYYMMDD-XXXX` bill number generation, automatic charge aggregation across Consultation, Lab, Radiology, Admissions, and Operations, read-only invoice locks, payment recording (`PENDING` -> `PAID`), and audit logging.
  - Built **Billing & Cashier Dashboard** (`/dashboard/billing`) with metric summary cards, search filter, patient encounter billing queue, itemized read-only invoice view modal, payment collection controls (Cash, Card, Online), and **80mm Thermal Receipt Printer** layout.
  - Verified zero TypeScript compilation errors across backend and frontend workspaces.
- Built complete **Patient History Module** (Phase 11 — Ticket 15):
  - Added `VIEW_PATIENT_HISTORY = 'view:patient_history'` to `Permission` enum and mapped permission to `Super Admin`, `Doctor`, `Receptionist`, `Laboratory`, and `Radiology` in `ROLE_PERMISSIONS`.
  - Built backend REST API endpoints (`/api/history/search?mrNumber=...`, `/api/history/patient/:patientId`, `/api/history/visit/:visitId`, `/api/history/prescriptions/:patientId`, `/api/history/lab/:patientId`, `/api/history/radiology/:patientId`, `/api/history/billing/:patientId`) with Zod validation, RBAC role-scoping (`FULL`, `LAB_ONLY`, `RAD_ONLY`), and audit logging.
  - Built **Patient History Dashboard** (`/dashboard/history`) with MR Number search bar, Patient Summary Card (MRN, Name, Age, Gender, Phone, Blood Group, CNIC, Allergies/Chronic Disease alert badges), and Master Expand/Collapse All controls.
  - Built Chronological Encounter Visit Timeline (ordered newest first) rendering detailed read-only sections for Visit Info & Vitals, Prescription (e-Rx), Laboratory Reports & Parameters, Radiology Scans (X-Ray & Ultrasound), Ward Admission, Surgical Operations, and Billing Receipts, displaying "Not Available" for unused modules.
  - Integrated printable stylesheet for A4 Patient History reports (`@media print`).
  - Verified zero TypeScript compilation errors across backend and frontend workspaces.
- Built complete **Dashboard & Reports Module** (Phase 12 — Ticket 16):
  - Added `VIEW_DASHBOARD = 'view:dashboard'` and `VIEW_REPORTS = 'view:reports'` to `Permission` enum and mapped permissions to `Super Admin`, `Receptionist`, `Doctor`, `Laboratory`, `Radiology`, and `Billing` in `ROLE_PERMISSIONS`.
  - Built backend REST API endpoints (`/api/dashboard/summary`, `/api/dashboard/charts`, `/api/dashboard/activities`, `/api/reports/:reportType`) with Zod validation, role filtering, and audit logging.
  - Built **Operational Dashboard** (`/dashboard`) with 11 large KPI Cards (Total Patients, Today Patients, Total Revenue, Today Revenue, Pending Bills, Today Appointments, Lab Tests Today, X-Ray Today, Ultrasound Today, Active Admissions, Total Doctors), 4 simple SVG weekly trend charts (Patients This Week, Revenue This Week, Lab Tests This Week, Doctor-wise Patient Count), and Recent Activity Stream (last 10 records).
  - Built **Reports & Analytics Page** (`/dashboard/reports`) with Report Category Tabs (Patient, Doctor, Lab, Radiology, Admission, Billing, Revenue), Date Range picker, Department/Specialty filters, Summary KPI metrics, and clean data tables.
  - Verified zero TypeScript compilation errors across backend and frontend workspaces.
- Built complete **Hospital Settings Module** (Phase 13 — Ticket 17):
  - Added `MANAGE_SETTINGS = 'manage:settings'` to `Permission` enum and mapped permission to `Super Admin` in `ROLE_PERMISSIONS`.
  - Created `hospital_settings` database table schema in `settings.schema.ts` storing singleton Hospital Name, Logo (Base64/URL), Address, Contact Phone, and Email.
  - Built backend REST API endpoints (`GET /api/settings/hospital` for read-only staff access, `PUT /api/settings/hospital` guarded by `Permission.MANAGE_SETTINGS` for Super Admin updates) with Zod validation, singleton persistence, and audit logging.
  - Built **Hospital Settings Page** (`/dashboard/settings`) with simple minimal form, Base64 image file uploader with live preview, remove logo action, and instant feedback toasts.
  - Dynamically integrated hospital settings profile across all HMS printouts and headers:
    - Desktop & mobile sidebar navigation header branding (Name & Logo)
    - Patient Registration Slips (`RegistrationSlip.tsx`)
    - e-Prescription Pad header & footer (`EMRScreen.tsx`)
    - Billing Receipts & 80mm Cashier Thermal Prints (`/dashboard/billing/page.tsx`)
    - Patient History printable header banner (`/dashboard/history/page.tsx`)
  - Verified zero TypeScript compilation errors across backend and frontend workspaces.
- Built complete **Public Website Foundation** (Phase 14 — Ticket 18):
  - Built modern, responsive, accessible, and SEO-friendly public hospital website foundation.
  - Created reusable design system component library under `frontend/src/components/ui/`: `Container`, `Button`, `Card`, `SectionTitle`, `Badge`, `Breadcrumbs`, `LoadingSpinner`, `EmptyState`, `ErrorState`.
  - Created public layout components under `frontend/src/components/public/`: `PublicNavbar` (top utility bar, dynamic logo, desktop menu, staff portal link, mobile drawer), `PublicFooter` (quick links, clinical specializations, contact info, social links, staff portal link), and `PublicLayout`.
  - Built Public Homepage (`frontend/src/app/page.tsx`) with 7 modular sections: `HeroSection` (headline, CTA buttons, value cards), `AboutPreview` (hospital narrative, milestones), `DepartmentsPreview` (clinical services cards), `DoctorsPreview` (senior faculty list), `WhyChooseUs` (4 core pillars), `EmergencyBanner` (24/7 helpline banner), and `CtaBanner` (online booking CTA).
  - Created placeholder routing pages with breadcrumbs and SEO metadata:
    - `/about` (About Hospital Story & Mission)
    - `/doctors` (Medical Faculty Directory)
    - `/departments` (Clinical Departments & Services)
    - `/book-appointment` (Online Appointment Request Form UI)
    - `/contact` (Helpline, Location, Inquiry Form UI)
    - `/privacy-policy` (Patient Data Confidentiality Policy)
  - Implemented Next.js App Router SEO indexation files: `frontend/src/app/sitemap.ts` and `frontend/src/app/robots.ts`.
  - Verified zero TypeScript compilation errors across backend and frontend workspaces.

- Built complete **Public Website Foundation** (Phase 14 — Ticket 18):
  - Built modern, responsive, accessible, and SEO-friendly public hospital website foundation.
  - Created reusable design system component library under `frontend/src/components/ui/`: `Container`, `Button`, `Card`, `SectionTitle`, `Badge`, `Breadcrumbs`, `LoadingSpinner`, `EmptyState`, `ErrorState`.
  - Created public layout components under `frontend/src/components/public/`: `PublicNavbar`, `PublicFooter`, and `PublicLayout`.
  - Built Public Homepage (`frontend/src/app/page.tsx`) with 7 modular sections.
  - Created Next.js App Router SEO indexation files: `frontend/src/app/sitemap.ts` and `frontend/src/app/robots.ts`.
  - Verified zero TypeScript compilation errors across backend and frontend workspaces.
- Built complete **Hospital Information Module** (Phase 15 — Ticket 19):
  - Built dedicated, informative, trustworthy hospital information pages (`/about`, `/facilities`, `/gallery`).
  - Created reusable info components under `frontend/src/components/public/info/`:
    - `VisionMissionCard.tsx`: Official Vision ("Lighting New Ways in Healthcare" / "صحت کی دیکھ بھال میں نئے طریقوں کو اجاگر کرنا"), Mission ("Working Together with our community to deliver innovative, safe and equitable healthcare" / "جدید، محفوظ اور مساوی صحت کی دیکھ بھال فراہم کرنے کے لیے اپنی کمیونٹی کے ساتھ مل کر کام کرنا"), and Core Values (Compassion, Professionalism, Respect) in English & Urdu matching the official hospital banner.
    - `CeoMessageCard.tsx`: Dedicated CEO welcome message card featuring **Prof. Dr. Zafar Iqbal CEO** with photo (`/images/CEO.webp`), pediatric surgical credentials, and signature block.
    - `FacilityCard.tsx`: Reusable clinical & administrative facility card primitive.
    - `GalleryGrid.tsx`: Interactive photo gallery grid utilizing real hospital assets from `public/images/` (`CEO.webp`, `staff.jpeg`, `CPSP visit 2025.webp`, and building/OT/ward JPEG photos) with category filter tags and full-screen lightbox modal viewer.
  - Updated `/about` page with Hero, Introduction, Vision & Mission, CEO Message, Operational Statistics, Why Choose Us, and CTA.
  - Built `/facilities` page showcasing 9 clinical & administrative hospital services (24/7 Emergency, OPD Clinics, IPD Wards, Sterile Operation Theatre Suites, Pathology Lab, Digital PACS Radiology, ICU/NICU, Emergency Ambulance, Pharmacy).
  - Built `/gallery` page showcasing high-definition real hospital photographs with category filtering and interactive lightbox.
  - Updated `PublicNavbar` and `PublicFooter` navigation to include `Facilities` and `Photo Gallery` links.
  - Implemented Open Graph SEO metadata for `/about`, `/facilities`, and `/gallery`.
  - Verified zero TypeScript compilation errors across backend and frontend workspaces.
- Fixed root homepage (`/`) redirect glitch:
  - Made `GET /api/settings/hospital` in [settings.controller.ts](file:///g:/lala%20complex/backend/src/features/settings/settings.controller.ts) public so unauthenticated public visitors on `/`, `/about`, `/facilities`, `/gallery`, `/doctors`, `/contact` can retrieve hospital branding/contact info without triggering a 401 Unauthorized error.
- Built complete **Doctors & Departments Module (API-First)** (Phase 16 — Ticket 20):
  - Implemented public read-only REST APIs in backend under `/api/public`:
    - `GET /api/public/doctors` (supports search, department filter, day of week availability filter, and sorting)
    - `GET /api/public/doctors/:idOrSlug` (single doctor profile with PMDC reg #, biography, services, and weekly schedule)
    - `GET /api/public/departments` (clinical departments with doctor counts and service lists)
    - `GET /api/public/departments/:idOrSlug` (department details with list of doctors loaded dynamically from HMS DB)
  - Created frontend client API wrapper in `public-doctors.ts`.
  - Implemented public read-only REST APIs under `/api/public`.
  - Built interactive public pages (`/doctors`, `/doctors/[slug]`, `/departments`, `/departments/[slug]`).
  - Configured doctor consultation fees: **Rs. 500** for Dr. Shumaila Irum (APWMO / MS) and **Rs. 1000** for all other senior consultants & surgeons.
- Completed **Online Appointment System Module (API-First)** (Phase 17 — Ticket 21):
  - Created `appointments` Drizzle schema table with status enums (`PENDING_CHECKIN`, `CHECKED_IN`, `COMPLETED`, `CANCELLED`).
  - Created backend appointments feature layer.
  - Created public booking endpoint `POST /api/public/appointments` with Zod validation.
  - Created protected reception endpoints `GET /api/appointments/pending` and `POST /api/appointments/:id/checkin`.
  - Created public booking page `/book-appointment` with department selection, doctor filtering, date picker, demographic inputs, and confirmation modal featuring Appointment Number (`APT-YYYYMMDD-XXXX`) & reception arrival instructions.
  - Enhanced HMS Reception Dashboard (`/dashboard/patients`) with **Online Pending Check-ins** tab.
  - Implemented one-click Reception Check-In workflow: reuses existing patient MR Number or creates new patient (`MRN-YYYYMMDD-XXXX`), generates Queue Token (`Q-XXX`), creates `patient_visits` entry, pops up printable `RegistrationSlip` modal, and queues patient into doctor's consultation view.
  - Verified zero TypeScript compilation errors across backend and frontend workspaces.

- Completed **Contact & Miscellaneous Pages Module** (Phase 18 — Ticket 22):
  - Built reusable public components under `frontend/src/components/public/contact/`: `ContactCard.tsx`, `EmergencyNumbers.tsx`, `OpeningHoursTable.tsx`, `GoogleMapSection.tsx`, `FaqAccordion.tsx`, and `InfoCard.tsx`.
  - Refactored Contact Us page (`/contact`) with official hospital address, helpline, email, emergency numbers section with clickable `tel:` links, opening hours table, interactive Google Maps embed for Sargodha, quick booking CTAs, and OpenGraph SEO metadata.
  - Built dedicated FAQ page (`/faq`) featuring keyboard-accessible (`aria-expanded`, `aria-controls`, `role="button"`) interactive `FaqAccordion` component, answers to core patient queries (Appointment booking, Hospital timings, Finding a doctor, Location, Services, What to bring), helpline callout, and OpenGraph SEO metadata.
  - Enhanced Privacy Policy page (`/privacy-policy`) with structured compliance sections: Information We Collect, How We Use Information, Data Protection & EMR Security, Cookies & Local Storage, Third-Party Services, and Patient Data Request Contacts.
  - Updated `PublicNavbar.tsx` and `PublicFooter.tsx` with FAQ links and updated Next.js `sitemap.ts` with `/faq` route.
  - Verified zero TypeScript compilation errors across backend and frontend workspaces.

## Current Ticket
- **Phase 18 - Ticket 22:** Contact & Miscellaneous Pages (COMPLETED).

## Current Progress
- [x] Create reusable contact components (`ContactCard`, `EmergencyNumbers`, `OpeningHoursTable`, `GoogleMapSection`, `FaqAccordion`, `InfoCard`).
- [x] Update Contact Us page (`/contact`) with location, map embed, emergency links, opening hours, and appointment links.
- [x] Create dedicated FAQ page (`/faq`) with interactive keyboard-accessible accordion.
- [x] Update Privacy Policy page (`/privacy-policy`) with structured data protection sections.
- [x] Update `PublicNavbar` and `PublicFooter` with FAQ links.
- [x] Update Next.js `sitemap.ts` with `/faq`.
- [x] Run automated TypeScript type-checks (`npm run type-check`) for backend & frontend (zero errors).
- [x] Update `Memory.md` and create `walkthrough.md`.

## Files Created / Modified

### Frontend:
- `[NEW]` [ContactCard.tsx](file:///g:/lala%20complex/frontend/src/components/public/contact/ContactCard.tsx) — Reusable contact card component.
- `[NEW]` [EmergencyNumbers.tsx](file:///g:/lala%20complex/frontend/src/components/public/contact/EmergencyNumbers.tsx) — Clickable `tel:` emergency hotlines section.
- `[NEW]` [OpeningHoursTable.tsx](file:///g:/lala%20complex/frontend/src/components/public/contact/OpeningHoursTable.tsx) — Hospital schedule table.
- `[NEW]` [GoogleMapSection.tsx](file:///g:/lala%20complex/frontend/src/components/public/contact/GoogleMapSection.tsx) — Google Maps iframe embed & directions button.
- `[NEW]` [FaqAccordion.tsx](file:///g:/lala%20complex/frontend/src/components/public/contact/FaqAccordion.tsx) — Accessible FAQ accordion component.
- `[NEW]` [InfoCard.tsx](file:///g:/lala%20complex/frontend/src/components/public/contact/InfoCard.tsx) — Reusable informational card component.
- `[NEW]` [page.tsx (FAQ)](file:///g:/lala%20complex/frontend/src/app/faq/page.tsx) — Dedicated FAQ page with accordion and helpline callout.
- `[MODIFY]` [page.tsx (Contact)](file:///g:/lala%20complex/frontend/src/app/contact/page.tsx) — Refactored Contact Us page with map, hotlines, timings, and CTAs.
- `[MODIFY]` [page.tsx (Privacy Policy)](file:///g:/lala%20complex/frontend/src/app/privacy-policy/page.tsx) — Enhanced Privacy Policy page with structured sections.
- `[MODIFY]` [PublicNavbar.tsx](file:///g:/lala%20complex/frontend/src/components/public/PublicNavbar.tsx) — Added FAQ link to navigation.
- `[MODIFY]` [PublicFooter.tsx](file:///g:/lala%20complex/frontend/src/components/public/PublicFooter.tsx) — Added FAQ link to footer quick links.
- `[MODIFY]` [sitemap.ts](file:///g:/lala%20complex/frontend/src/app/sitemap.ts) — Added `/faq` route to SEO sitemap.

## Known Issues
- None.

## Next Ticket
- Next phase / ticket as assigned.

## Pending Work
- None.

## Architecture Decisions
- **Accessible Accordion Component**: `FaqAccordion` implements WAI-ARIA standards with `aria-expanded`, `aria-controls`, and `onKeyDown` handlers for `Enter` and `Space` key interaction.
- **Clickable Mobile Telephony**: Emergency numbers wrap in native `tel:` URI schemes so users on mobile devices can immediately trigger calls.
- **Modular Component Primitives**: All contact elements (Cards, Emergency section, Timings table, Map section) are self-contained reusable components in `frontend/src/components/public/contact/`.
