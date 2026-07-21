import { Permission } from '../../config/permissions';

export const INITIAL_ROLES = [
  {
    name: 'Super Admin',
    description: 'Full system configuration, audit logs, and operational controls.',
    permissions: Object.values(Permission),
  },
  {
    name: 'Receptionist',
    description: 'Patient registration, appointment scheduling, and front-desk management.',
    permissions: [
      Permission.ACCESS_RECEPTION,
      Permission.MANAGE_APPOINTMENTS,
      Permission.REGISTER_PATIENTS,
    ],
  },
  {
    name: 'Doctor',
    description: 'Clinical consultation workspace, EHR notes, and electronic prescriptions.',
    permissions: [
      Permission.ACCESS_CLINICAL,
      Permission.MANAGE_EHR,
      Permission.CREATE_PRESCRIPTION,
    ],
  },
  {
    name: 'Laboratory',
    description: 'Laboratory order status updates and diagnostic results entry.',
    permissions: [
      Permission.ACCESS_LAB,
      Permission.MANAGE_LAB_ORDERS,
    ],
  },
  {
    name: 'Radiology',
    description: 'Radiology imaging study updates and diagnostic reporting.',
    permissions: [
      Permission.ACCESS_RADIOLOGY,
      Permission.MANAGE_RAD_ORDERS,
    ],
  },
  {
    name: 'Billing',
    description: 'Patient invoicing, cashier processing, and financial transactions.',
    permissions: [
      Permission.ACCESS_BILLING,
      Permission.MANAGE_INVOICES,
    ],
  },
];
