# Product Requirements Document (PRD) - LALA Medical Complex HMS

## 1. Project Overview
LALA Medical Complex is a multi-specialty healthcare provider requiring a modern, secure, and production-grade Hospital Management System (HMS). This platform will serve as the digital backbone for administrative, clinical, financial, and operational activities. The system must replace fragmented workflows with unified processes, ensuring security, data integrity, and compliance.

## 2. Goals
- **Patient-Centric Care:** Minimize patient wait times, ensure secure access to medical records, and ease clinical charting.
- **Operational Efficiency:** Automate scheduling, billing, and lab requests to reduce paperwork and administrative overhead.
- **Modular Scalability:** Develop a highly modular system where new departments/features can be added without risk to existing workflows.
- **Compliance & Security:** Ensure patient data security, robust access control, and complete audit logging.

## 3. Scope
The HMS is envisioned as a long-term enterprise platform.
- **In-Scope (Full Lifecycle):** Administrative tools, scheduling, electronic health records (EHR), billing, lab integration, radiology integration, admissions, and audit logs.
- **Out-of-Scope (Ticket 0.1):** Development of operational features. The current scope covers *exclusively* the architectural foundation, folder structures, authorization/authentication baseline, database layer, shared layouts, and dashboard shell.

## 4. Roles & Permissions (Access Matrix)
The system enforces Role-Based Access Control (RBAC). The core roles are:
1. **Super Admin:** Full system configuration, audit log access, database/backups management, role overrides.
2. **Administrator:** Staff management, department configuration, billing oversight, reporting access.
3. **Receptionist:** Patient registration, appointment scheduling, billing checkout, general enquiries.
4. **Doctor:** Electronic Health Records (EHR) read/write, e-prescriptions, clinical notes, appointment queue management.
5. **Nurse:** Vitals recording, medication administration, inpatient ward logs, triage details.
6. **Lab Technician:** Diagnostic order updates, lab result entry, specimen inventory management.
7. **Radiologist:** Imaging study updates, DICOM/report attachments, radiology order logs.
8. **Pharmacist:** Inventory management, medication dispensing, prescription validation.

## 5. Modules Map (Future Expansion)
To maintain low coupling, modules are defined as self-contained feature boundaries:
- **Reception & Scheduling:** Patient check-in, dynamic calendar, slots availability.
- **Clinical (Doctors/Nurses):** Consultation workspace, SOAP notes, prescriptions, vitals.
- **Laboratory:** Diagnostic orders, test status tracking, result validation.
- **Radiology:** Imaging orders, reporting, link to PACS/DICOM viewers.
- **Billing & Payments:** Invoicing, insurance verification, payment gateways, cash management.
- **Wards & Admission (IPD):** Bed management, ward allocation, discharge summaries.
- **Inventory & Pharmacy:** Drug inventory, expiration alerts, queue management.
- **Audit Logs & Analytics:** Security auditing, financial summaries, operational reports.

## 6. Functional Requirements (General System)
- **Unified Auth:** Multi-factor capable JWT-based authentication with active session tracking.
- **Protected Routing:** Strict RBAC routing on the backend and route protection guards on the frontend.
- **Tenant & Audit System:** Comprehensive auditing of clinical or financial operations, tracing back to the operator.
- **Responsive Layout:** Optimized interface for desktop, tablet, and mobile browsers (except medical charts which target desktop displays).

## 7. Non-Functional Requirements
- **Scalability:** Support up to 1,000 concurrent users with sub-100ms response times for key database operations.
- **Availability:** target 99.9% uptime with hot-standby replication.
- **Security:** Data-in-transit encrypted using TLS 1.3, data-at-rest encrypted. HIPAA-guided architecture patterns.
- **Printability:** Dedicated CSS print styles for billing receipts, prescriptions, and laboratory/radiology reports.
- **Reliability:** Graceful error handling with zero system state leakage.

## 8. Development Philosophy
- **Modular Isolation:** Features must not directly import internals of other features. Inter-feature communication goes through shared contracts or services.
- **No MVP Haste:** We prioritize correct types, error checking, robust configuration, and clean modular code over quick delivery.
- **Zero-Placeholders Policy:** Placeholders or `TODO` statements that impact application stability must not be committed to main branches.
