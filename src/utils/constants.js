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
  USERS: 'cliniccare_users',
  TRIAGE: 'cliniccare_triage',
  QUEUE: 'cliniccare_queue',
  CONSULTATIONS: 'cliniccare_consultations',
  PRESCRIPTIONS: 'cliniccare_prescriptions',
  LAB_ORDERS: 'cliniccare_lab_orders'
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

// Appointment Statuses - Full Workflow
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  CHECKED_IN: 'checked_in',
  TRIAGED: 'triaged',
  IN_QUEUE: 'in_queue',
  WITH_DOCTOR: 'with_doctor',
  LAB: 'lab',
  PHARMACY: 'pharmacy',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
  CANCELLED: 'cancelled'
};

export const APPOINTMENT_STATUS_LABELS = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'Scheduled',
  [APPOINTMENT_STATUS.CHECKED_IN]: 'Checked In',
  [APPOINTMENT_STATUS.TRIAGED]: 'Triaged',
  [APPOINTMENT_STATUS.IN_QUEUE]: 'In Queue',
  [APPOINTMENT_STATUS.WITH_DOCTOR]: 'With Doctor',
  [APPOINTMENT_STATUS.LAB]: 'Lab Tests',
  [APPOINTMENT_STATUS.PHARMACY]: 'At Pharmacy',
  [APPOINTMENT_STATUS.COMPLETED]: 'Completed',
  [APPOINTMENT_STATUS.NO_SHOW]: 'No Show',
  [APPOINTMENT_STATUS.CANCELLED]: 'Cancelled'
};

export const APPOINTMENT_STATUS_COLORS = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'bg-blue-100 text-blue-700',
  [APPOINTMENT_STATUS.CHECKED_IN]: 'bg-teal-100 text-teal-700',
  [APPOINTMENT_STATUS.TRIAGED]: 'bg-cyan-100 text-cyan-700',
  [APPOINTMENT_STATUS.IN_QUEUE]: 'bg-yellow-100 text-yellow-700',
  [APPOINTMENT_STATUS.WITH_DOCTOR]: 'bg-purple-100 text-purple-700',
  [APPOINTMENT_STATUS.LAB]: 'bg-indigo-100 text-indigo-700',
  [APPOINTMENT_STATUS.PHARMACY]: 'bg-orange-100 text-orange-700',
  [APPOINTMENT_STATUS.COMPLETED]: 'bg-green-100 text-green-700',
  [APPOINTMENT_STATUS.NO_SHOW]: 'bg-red-100 text-red-700',
  [APPOINTMENT_STATUS.CANCELLED]: 'bg-slate-100 text-slate-700'
};

// Workflow Status Order
export const WORKFLOW_ORDER = [
  APPOINTMENT_STATUS.SCHEDULED,
  APPOINTMENT_STATUS.CHECKED_IN,
  APPOINTMENT_STATUS.TRIAGED,
  APPOINTMENT_STATUS.IN_QUEUE,
  APPOINTMENT_STATUS.WITH_DOCTOR,
  APPOINTMENT_STATUS.LAB,
  APPOINTMENT_STATUS.PHARMACY,
  APPOINTMENT_STATUS.COMPLETED
];

// Service Types for Queue
export const SERVICE_TYPES = [
  { value: 'general-consultation', label: 'General Consultation' },
  { value: 'follow-up', label: 'Follow-up Visit' },
  { value: 'immunization', label: 'Immunization' },
  { value: 'anc', label: 'Antenatal Care' },
  { value: 'lab-only', label: 'Lab Tests Only' },
  { value: 'pharmacy-only', label: 'Pharmacy Only' },
  { value: 'emergency', label: 'Emergency' }
];

// Common Diagnoses (ICD-10 based)
export const COMMON_DIAGNOSES = [
  { code: 'B54', name: 'Malaria' },
  { code: 'J00', name: 'Common Cold' },
  { code: 'J06.9', name: 'Upper Respiratory Infection' },
  { code: 'A09', name: 'Gastroenteritis' },
  { code: 'J18.9', name: 'Pneumonia' },
  { code: 'N39.0', name: 'Urinary Tract Infection' },
  { code: 'K29.7', name: 'Gastritis' },
  { code: 'I10', name: 'Hypertension' },
  { code: 'E11', name: 'Type 2 Diabetes' },
  { code: 'M54.5', name: 'Low Back Pain' },
  { code: 'G43', name: 'Migraine' },
  { code: 'L30.9', name: 'Dermatitis' },
  { code: 'H10', name: 'Conjunctivitis' },
  { code: 'J02.9', name: 'Pharyngitis' },
  { code: 'K52.9', name: 'Colitis' }
];

// Common Medications
export const COMMON_MEDICATIONS = [
  { name: 'Paracetamol 500mg', dosage: '1-2 tablets', frequency: '3 times daily' },
  { name: 'Ibuprofen 400mg', dosage: '1 tablet', frequency: '3 times daily' },
  { name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: '3 times daily' },
  { name: 'Artemether-Lumefantrine', dosage: 'As per weight', frequency: 'Twice daily x 3 days' },
  { name: 'Metformin 500mg', dosage: '1 tablet', frequency: 'Twice daily' },
  { name: 'Omeprazole 20mg', dosage: '1 capsule', frequency: 'Once daily' },
  { name: 'Ciprofloxacin 500mg', dosage: '1 tablet', frequency: 'Twice daily' },
  { name: 'Metronidazole 400mg', dosage: '1 tablet', frequency: '3 times daily' },
  { name: 'ORS Sachets', dosage: '1 sachet in 1L water', frequency: 'As needed' },
  { name: 'Vitamin C 1000mg', dosage: '1 tablet', frequency: 'Once daily' }
];

// Lab Test Types
export const LAB_TESTS = [
  { code: 'CBC', name: 'Complete Blood Count' },
  { code: 'MP', name: 'Malaria Parasite Test' },
  { code: 'RBS', name: 'Random Blood Sugar' },
  { code: 'FBS', name: 'Fasting Blood Sugar' },
  { code: 'UA', name: 'Urinalysis' },
  { code: 'LFT', name: 'Liver Function Test' },
  { code: 'RFT', name: 'Renal Function Test' },
  { code: 'LIPID', name: 'Lipid Profile' },
  { code: 'HIV', name: 'HIV Screening' },
  { code: 'HBsAg', name: 'Hepatitis B Surface Antigen' },
  { code: 'WD', name: 'Widal Test' },
  { code: 'PREG', name: 'Pregnancy Test' }
];

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
    section: 'Clinic Workflow',
    roles: ['admin', 'clinician']
  },
  {
    path: '/check-in',
    label: 'Check-In',
    icon: 'checkin',
    roles: ['admin', 'clinician']
  },
  {
    path: '/triage',
    label: 'Triage',
    icon: 'triage',
    roles: ['admin', 'clinician']
  },
  {
    path: '/queue',
    label: 'Queue',
    icon: 'queue',
    roles: ['admin', 'clinician']
  },
  {
    path: '/consultation',
    label: 'Consultation',
    icon: 'consultation',
    roles: ['admin', 'clinician']
  },
  {
    path: '/pharmacy',
    label: 'Pharmacy',
    icon: 'pharmacy',
    roles: ['admin', 'clinician', 'inventory_manager']
  },
  {
    path: '/lab',
    label: 'Lab',
    icon: 'lab',
    roles: ['admin', 'clinician']
  },
  {
    section: 'Management',
    roles: ['admin', 'clinician', 'inventory_manager']
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


