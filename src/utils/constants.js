/**
 * Application Constants
 * 
 * @description Centralized constants for the ClinicCare Lite application
 */

// Storage Keys
export const STORAGE_KEYS = {
  PATIENTS: 'cliniccare_patients',
  INVENTORY: 'cliniccare_inventory',
  APPOINTMENTS: 'cliniccare_appointments',
  SETTINGS: 'cliniccare_settings',
  USER: 'cliniccare_user',
  USERS: 'cliniccare_users'
};

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  CLINICIAN: 'clinician',
  INVENTORY_MANAGER: 'inventory_manager'
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.CLINICIAN]: 'Clinician',
  [ROLES.INVENTORY_MANAGER]: 'Inventory Manager'
};

// Appointment Statuses
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CHECKED_IN: 'checked_in',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
  CANCELLED: 'cancelled'
};

export const APPOINTMENT_STATUS_LABELS = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'Scheduled',
  [APPOINTMENT_STATUS.CHECKED_IN]: 'Checked In',
  [APPOINTMENT_STATUS.IN_PROGRESS]: 'In Progress',
  [APPOINTMENT_STATUS.COMPLETED]: 'Completed',
  [APPOINTMENT_STATUS.NO_SHOW]: 'No Show',
  [APPOINTMENT_STATUS.CANCELLED]: 'Cancelled'
};

export const APPOINTMENT_STATUS_COLORS = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'bg-blue-100 text-blue-700',
  [APPOINTMENT_STATUS.CHECKED_IN]: 'bg-green-100 text-green-700',
  [APPOINTMENT_STATUS.IN_PROGRESS]: 'bg-purple-100 text-purple-700',
  [APPOINTMENT_STATUS.COMPLETED]: 'bg-slate-100 text-slate-700',
  [APPOINTMENT_STATUS.NO_SHOW]: 'bg-red-100 text-red-700',
  [APPOINTMENT_STATUS.CANCELLED]: 'bg-amber-100 text-amber-700'
};

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'O', label: 'Other' }
];

// Controlled Vocabulary - Immunizations
export const IMMUNIZATIONS = [
  { code: 'BCG', name: 'BCG (Tuberculosis)', ageMonths: 0 },
  { code: 'OPV0', name: 'OPV 0 (Polio Birth Dose)', ageMonths: 0 },
  { code: 'HepB0', name: 'Hepatitis B Birth Dose', ageMonths: 0 },
  { code: 'OPV1', name: 'OPV 1 (Polio)', ageMonths: 1.5 },
  { code: 'Penta1', name: 'Pentavalent 1', ageMonths: 1.5 },
  { code: 'PCV1', name: 'Pneumococcal 1', ageMonths: 1.5 },
  { code: 'Rota1', name: 'Rotavirus 1', ageMonths: 1.5 },
  { code: 'OPV2', name: 'OPV 2 (Polio)', ageMonths: 2.5 },
  { code: 'Penta2', name: 'Pentavalent 2', ageMonths: 2.5 },
  { code: 'PCV2', name: 'Pneumococcal 2', ageMonths: 2.5 },
  { code: 'Rota2', name: 'Rotavirus 2', ageMonths: 2.5 },
  { code: 'OPV3', name: 'OPV 3 (Polio)', ageMonths: 3.5 },
  { code: 'Penta3', name: 'Pentavalent 3', ageMonths: 3.5 },
  { code: 'PCV3', name: 'Pneumococcal 3', ageMonths: 3.5 },
  { code: 'IPV', name: 'IPV (Inactivated Polio)', ageMonths: 3.5 },
  { code: 'MR1', name: 'Measles-Rubella 1', ageMonths: 9 },
  { code: 'YF', name: 'Yellow Fever', ageMonths: 9 },
  { code: 'MenA', name: 'Meningitis A', ageMonths: 9 },
  { code: 'Vita1', name: 'Vitamin A 1st Dose', ageMonths: 6 },
  { code: 'MR2', name: 'Measles-Rubella 2', ageMonths: 15 },
  { code: 'COVID', name: 'COVID-19 Vaccine', ageMonths: 60 },
  { code: 'HPV', name: 'HPV Vaccine', ageMonths: 108 },
  { code: 'TT', name: 'Tetanus Toxoid', ageMonths: 180 },
  { code: 'FLU', name: 'Influenza (Seasonal)', ageMonths: 6 }
];

// Inventory Units
export const INVENTORY_UNITS = [
  { value: 'doses', label: 'Doses' },
  { value: 'tablets', label: 'Tablets' },
  { value: 'capsules', label: 'Capsules' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'vials', label: 'Vials' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'packs', label: 'Packs' },
  { value: 'units', label: 'Units' },
  { value: 'pairs', label: 'Pairs' },
  { value: 'rolls', label: 'Rolls' }
];

// Inventory Categories
export const INVENTORY_CATEGORIES = [
  { value: 'vaccines', label: 'Vaccines' },
  { value: 'medications', label: 'Medications' },
  { value: 'supplies', label: 'Medical Supplies' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'consumables', label: 'Consumables' },
  { value: 'other', label: 'Other' }
];

// Default Settings
export const DEFAULT_SETTINGS = {
  lowStockThreshold: 20,
  nearExpiryDays: 30,
  appointmentReminderHours: 24,
  clinicName: 'ClinicCare Lite',
  clinicContact: '',
  clinicAddress: '',
  theme: 'light',
  language: 'en'
};

// Date/Time Formats
export const DATE_FORMATS = {
  display: 'MMM d, yyyy',
  input: 'yyyy-MM-dd',
  datetime: 'MMM d, yyyy h:mm a',
  time: 'h:mm a'
};

// Navigation Items
export const NAV_ITEMS = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    roles: ['admin', 'clinician', 'inventory_manager']
  },
  {
    path: '/patients',
    label: 'Patients',
    icon: 'patients',
    roles: ['admin', 'clinician']
  },
  {
    path: '/appointments',
    label: 'Appointments',
    icon: 'appointments',
    roles: ['admin', 'clinician']
  },
  {
    path: '/inventory',
    label: 'Inventory',
    icon: 'inventory',
    roles: ['admin', 'clinician', 'inventory_manager']
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: 'analytics',
    roles: ['admin', 'clinician', 'inventory_manager']
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: 'settings',
    roles: ['admin', 'clinician', 'inventory_manager']
  }
];

