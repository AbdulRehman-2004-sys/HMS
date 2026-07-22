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

  // History
  VIEW_PATIENT_HISTORY = 'view:patient_history',

  // Dashboard & Reports
  VIEW_DASHBOARD = 'view:dashboard',
  VIEW_REPORTS = 'view:reports',

  // Hospital Settings
  MANAGE_SETTINGS = 'manage:settings',
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  'Super Admin': Object.values(Permission),
  'Receptionist': [
    Permission.ACCESS_RECEPTION,
    Permission.MANAGE_APPOINTMENTS,
    Permission.REGISTER_PATIENTS,
    Permission.ACCESS_BILLING,
    Permission.MANAGE_INVOICES,
    Permission.VIEW_PATIENT_HISTORY,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_REPORTS,
  ],

  'Doctor': [
    Permission.ACCESS_CLINICAL,
    Permission.MANAGE_EHR,
    Permission.CREATE_PRESCRIPTION,
    Permission.VIEW_PATIENT_HISTORY,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_REPORTS,
  ],
  'Laboratory': [
    Permission.ACCESS_LAB,
    Permission.MANAGE_LAB_ORDERS,
    Permission.VIEW_PATIENT_HISTORY,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_REPORTS,
  ],
  'Radiology': [
    Permission.ACCESS_RADIOLOGY,
    Permission.MANAGE_RAD_ORDERS,
    Permission.VIEW_PATIENT_HISTORY,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_REPORTS,
  ],
  'Billing': [
    Permission.ACCESS_BILLING,
    Permission.MANAGE_INVOICES,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_REPORTS,
  ],
};

export const getPermissionsForRoles = (roles: string[]): string[] => {
  const permissions = new Set<string>();
  for (const role of roles) {
    const rolePerms = ROLE_PERMISSIONS[role];
    if (rolePerms) {
      rolePerms.forEach((p) => permissions.add(p));
    }
  }
  return Array.from(permissions);
};
