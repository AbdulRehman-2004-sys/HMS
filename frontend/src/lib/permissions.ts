export enum Permission {
  // Super Admin
  MANAGE_SYSTEM = 'manage:system',
  VIEW_AUDIT_LOGS = 'view:audit_logs',

  // Receptionist
  ACCESS_RECEPTION = 'access:reception',
  MANAGE_APPOINTMENTS = 'manage:appointments',
  REGISTER_PATIENTS = 'register:patients',

  // Doctor
  ACCESS_CLINICAL = 'access:clinical',
  MANAGE_EHR = 'manage:ehr',
  CREATE_PRESCRIPTION = 'create:prescription',

  // Laboratory
  ACCESS_LAB = 'access:lab',
  MANAGE_LAB_ORDERS = 'manage:lab_orders',

  // Radiology
  ACCESS_RADIOLOGY = 'access:radiology',
  MANAGE_RAD_ORDERS = 'manage:rad_orders',

  // Billing
  ACCESS_BILLING = 'access:billing',
  MANAGE_INVOICES = 'manage:invoices',
}
