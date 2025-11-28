/**
 * Seed Data for ClinicCare Lite
 * 
 * @description Sample data for demonstration and testing
 * Import this data via Settings > Restore from Backup or use the loadSeedData function
 */

export const seedPatients = [
  {
    id: 'p_001',
    name: 'Grace Adeyemi',
    dob: '1986-03-10',
    gender: 'F',
    contact: '+234 700 123 4567',
    email: 'grace.adeyemi@email.com',
    address: '15 Marina Road, Lagos',
    visits: [
      {
        id: 'v_001',
        date: '2025-11-10',
        reason: 'Routine check-up',
        notes: 'Patient in good health. Blood pressure normal at 120/80. Recommended annual screening.',
        immunizations: [{ code: 'FLU', batch: 'FL2025-001' }],
        createdAt: '2025-11-10T10:00:00.000Z'
      },
      {
        id: 'v_002',
        date: '2025-10-05',
        reason: 'Follow-up',
        notes: 'Follow-up on previous respiratory infection. Fully recovered.',
        immunizations: [],
        createdAt: '2025-10-05T11:30:00.000Z'
      }
    ],
    createdAt: '2025-06-15T09:00:00.000Z'
  },
  {
    id: 'p_002',
    name: 'Chukwuemeka Okonkwo',
    dob: '1992-07-22',
    gender: 'M',
    contact: '+234 801 234 5678',
    email: 'c.okonkwo@email.com',
    address: '45 Unity Street, Enugu',
    visits: [
      {
        id: 'v_003',
        date: '2025-11-15',
        reason: 'Vaccination',
        notes: 'COVID-19 booster administered. No adverse reactions observed.',
        immunizations: [{ code: 'COVID', batch: 'CV2025-B03' }],
        createdAt: '2025-11-15T14:00:00.000Z'
      }
    ],
    createdAt: '2025-08-20T10:30:00.000Z'
  },
  {
    id: 'p_003',
    name: 'Fatima Ibrahim',
    dob: '2023-05-12',
    gender: 'F',
    contact: '+234 802 345 6789',
    address: '8 Hospital Road, Kano',
    visits: [
      {
        id: 'v_004',
        date: '2025-11-20',
        reason: 'Immunization schedule',
        notes: 'Routine childhood immunizations. Baby healthy and meeting milestones.',
        immunizations: [
          { code: 'Penta2', batch: 'PV2025-102' },
          { code: 'PCV2', batch: 'PC2025-088' },
          { code: 'OPV2', batch: 'OP2025-156' }
        ],
        createdAt: '2025-11-20T09:00:00.000Z'
      },
      {
        id: 'v_005',
        date: '2025-10-08',
        reason: 'First vaccinations',
        notes: 'Initial immunization series started. Parents counseled on schedule.',
        immunizations: [
          { code: 'Penta1', batch: 'PV2025-098' },
          { code: 'PCV1', batch: 'PC2025-075' },
          { code: 'OPV1', batch: 'OP2025-142' }
        ],
        createdAt: '2025-10-08T10:30:00.000Z'
      }
    ],
    createdAt: '2025-06-01T08:00:00.000Z'
  },
  {
    id: 'p_004',
    name: 'Oluwaseun Abiodun',
    dob: '1978-11-03',
    gender: 'M',
    contact: '+234 803 456 7890',
    email: 'seun.abiodun@email.com',
    address: '22 Broad Street, Ibadan',
    visits: [
      {
        id: 'v_006',
        date: '2025-11-25',
        reason: 'Diabetes management',
        notes: 'HbA1c at 6.8%. Blood sugar well controlled. Continue current medication.',
        immunizations: [],
        createdAt: '2025-11-25T11:00:00.000Z'
      }
    ],
    createdAt: '2025-03-10T09:00:00.000Z'
  },
  {
    id: 'p_005',
    name: 'Amina Yusuf',
    dob: '1995-02-28',
    gender: 'F',
    contact: '+234 804 567 8901',
    address: '12 Government Road, Abuja',
    visits: [],
    createdAt: '2025-11-01T14:00:00.000Z'
  }
];

export const seedInventory = [
  {
    id: 'i_001',
    name: 'Measles-Rubella Vaccine',
    sku: 'VAC-MR-001',
    category: 'vaccines',
    batch: 'MR2025-A01',
    quantity: 120,
    unit: 'doses',
    expiryDate: '2026-04-01',
    storageNotes: 'Store at 2-8°C. Protect from light.',
    transactions: [
      { t: 'in', qty: 200, date: '2025-06-01T08:00:00.000Z', notes: 'Initial stock from WHO' },
      { t: 'out', qty: 45, date: '2025-08-15T10:00:00.000Z', notes: 'Immunization campaign' },
      { t: 'out', qty: 35, date: '2025-10-20T11:00:00.000Z', notes: 'Routine immunizations' }
    ],
    createdAt: '2025-06-01T08:00:00.000Z'
  },
  {
    id: 'i_002',
    name: 'Pentavalent Vaccine',
    sku: 'VAC-PENTA-001',
    category: 'vaccines',
    batch: 'PV2025-B02',
    quantity: 85,
    unit: 'doses',
    expiryDate: '2026-02-15',
    storageNotes: 'Store at 2-8°C. Do not freeze.',
    transactions: [
      { t: 'in', qty: 150, date: '2025-05-15T09:00:00.000Z', notes: 'Supply delivery' },
      { t: 'out', qty: 65, date: '2025-09-01T10:00:00.000Z', notes: 'Monthly usage' }
    ],
    createdAt: '2025-05-15T09:00:00.000Z'
  },
  {
    id: 'i_003',
    name: 'Paracetamol 500mg',
    sku: 'MED-PARA-500',
    category: 'medications',
    batch: 'PCM2025-C03',
    quantity: 500,
    unit: 'tablets',
    expiryDate: '2027-01-31',
    storageNotes: 'Store below 25°C in dry place.',
    transactions: [
      { t: 'in', qty: 1000, date: '2025-04-01T08:00:00.000Z', notes: 'Bulk purchase' },
      { t: 'out', qty: 300, date: '2025-07-15T14:00:00.000Z', notes: 'Dispensed to patients' },
      { t: 'out', qty: 200, date: '2025-10-01T11:00:00.000Z', notes: 'Monthly dispensing' }
    ],
    createdAt: '2025-04-01T08:00:00.000Z'
  },
  {
    id: 'i_004',
    name: 'Disposable Syringes 5ml',
    sku: 'SUP-SYR-5ML',
    category: 'supplies',
    batch: 'SYR2025-D04',
    quantity: 15,
    unit: 'boxes',
    expiryDate: '2028-12-31',
    storageNotes: 'Keep sealed until use.',
    transactions: [
      { t: 'in', qty: 50, date: '2025-03-01T08:00:00.000Z', notes: 'Annual supply' },
      { t: 'out', qty: 35, date: '2025-09-15T09:00:00.000Z', notes: 'Used in vaccinations' }
    ],
    createdAt: '2025-03-01T08:00:00.000Z'
  },
  {
    id: 'i_005',
    name: 'COVID-19 Vaccine (Pfizer)',
    sku: 'VAC-COVID-PFZ',
    category: 'vaccines',
    batch: 'CV2025-E05',
    quantity: 45,
    unit: 'doses',
    expiryDate: '2025-12-15',
    storageNotes: 'Store at -20°C. Ultra-cold chain required.',
    transactions: [
      { t: 'in', qty: 100, date: '2025-08-01T08:00:00.000Z', notes: 'Government allocation' },
      { t: 'out', qty: 55, date: '2025-11-01T10:00:00.000Z', notes: 'Booster campaign' }
    ],
    createdAt: '2025-08-01T08:00:00.000Z'
  },
  {
    id: 'i_006',
    name: 'ORS Packets',
    sku: 'MED-ORS-001',
    category: 'medications',
    batch: 'ORS2025-F06',
    quantity: 8,
    unit: 'boxes',
    expiryDate: '2026-06-30',
    storageNotes: 'Keep in cool, dry place.',
    transactions: [
      { t: 'in', qty: 30, date: '2025-05-01T08:00:00.000Z', notes: 'Initial stock' },
      { t: 'out', qty: 22, date: '2025-10-15T11:00:00.000Z', notes: 'Diarrhea season usage' }
    ],
    createdAt: '2025-05-01T08:00:00.000Z'
  },
  {
    id: 'i_007',
    name: 'Examination Gloves (Medium)',
    sku: 'SUP-GLV-M',
    category: 'supplies',
    batch: 'GLV2025-G07',
    quantity: 25,
    unit: 'boxes',
    expiryDate: '2027-03-31',
    storageNotes: 'Store away from direct sunlight.',
    transactions: [
      { t: 'in', qty: 50, date: '2025-06-01T08:00:00.000Z', notes: 'Quarterly supply' },
      { t: 'out', qty: 25, date: '2025-09-01T09:00:00.000Z', notes: 'Regular usage' }
    ],
    createdAt: '2025-06-01T08:00:00.000Z'
  },
  {
    id: 'i_008',
    name: 'Amoxicillin 250mg',
    sku: 'MED-AMOX-250',
    category: 'medications',
    batch: 'AMX2024-H08',
    quantity: 150,
    unit: 'capsules',
    expiryDate: '2025-02-28',
    storageNotes: 'Store below 25°C.',
    transactions: [
      { t: 'in', qty: 500, date: '2024-03-01T08:00:00.000Z', notes: 'Bulk order' },
      { t: 'out', qty: 350, date: '2025-01-15T10:00:00.000Z', notes: 'Prescriptions' }
    ],
    createdAt: '2024-03-01T08:00:00.000Z'
  }
];

export const seedAppointments = [
  {
    id: 'a_001',
    patientId: 'p_001',
    patientName: 'Grace Adeyemi',
    datetime: '2025-11-28T09:00',
    clinician: 'Dr. Okafor',
    type: 'follow-up',
    status: 'scheduled',
    notes: 'Follow-up on previous visit',
    createdAt: '2025-11-20T08:00:00.000Z'
  },
  {
    id: 'a_002',
    patientId: 'p_002',
    patientName: 'Chukwuemeka Okonkwo',
    datetime: '2025-11-28T10:00',
    clinician: 'Dr. Okafor',
    type: 'vaccination',
    status: 'scheduled',
    notes: 'Second dose vaccination',
    createdAt: '2025-11-18T09:00:00.000Z'
  },
  {
    id: 'a_003',
    patientId: 'p_003',
    patientName: 'Fatima Ibrahim',
    datetime: '2025-11-28T11:00',
    clinician: 'Dr. Aminu',
    type: 'checkup',
    status: 'scheduled',
    notes: 'Regular pediatric checkup',
    createdAt: '2025-11-15T10:00:00.000Z'
  },
  {
    id: 'a_004',
    patientId: 'p_004',
    patientName: 'Oluwaseun Abiodun',
    datetime: '2025-11-28T14:00',
    clinician: 'Dr. Okafor',
    type: 'consultation',
    status: 'scheduled',
    notes: 'Diabetes management review',
    createdAt: '2025-11-22T11:00:00.000Z'
  },
  {
    id: 'a_005',
    patientId: 'p_001',
    patientName: 'Grace Adeyemi',
    datetime: '2025-11-27T09:30',
    clinician: 'Dr. Aminu',
    type: 'general',
    status: 'completed',
    notes: 'Completed successfully',
    createdAt: '2025-11-20T08:00:00.000Z'
  },
  {
    id: 'a_006',
    patientId: 'p_005',
    patientName: 'Amina Yusuf',
    datetime: '2025-11-27T11:00',
    clinician: 'Dr. Okafor',
    type: 'general',
    status: 'no_show',
    notes: 'Patient did not arrive',
    createdAt: '2025-11-19T10:00:00.000Z'
  }
];

export const seedSettings = {
  id: 'settings_001',
  lowStockThreshold: 20,
  nearExpiryDays: 30,
  clinicName: 'ClinicCare Lite Demo Clinic',
  clinicContact: '+234 800 123 4567',
  clinicAddress: '123 Healthcare Avenue, Medical District',
  theme: 'light',
  language: 'en',
  createdAt: '2025-01-01T00:00:00.000Z'
};

/**
 * Full backup object for import
 */
export const fullSeedBackup = {
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  data: {
    patients: seedPatients,
    inventory: seedInventory,
    appointments: seedAppointments,
    settings: seedSettings
  }
};

/**
 * Load seed data into localStorage
 * @param {boolean} force - Whether to overwrite existing data
 */
export function loadSeedData(force = false) {
  const keys = {
    patients: 'cliniccare_patients',
    inventory: 'cliniccare_inventory',
    appointments: 'cliniccare_appointments',
    settings: 'cliniccare_settings'
  };
  
  Object.entries(keys).forEach(([key, storageKey]) => {
    const existing = localStorage.getItem(storageKey);
    if (!existing || force) {
      let data;
      switch (key) {
        case 'patients':
          data = seedPatients;
          break;
        case 'inventory':
          data = seedInventory;
          break;
        case 'appointments':
          data = seedAppointments;
          break;
        case 'settings':
          data = [seedSettings];
          break;
      }
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  });
  
  console.log('Seed data loaded successfully!');
}

export default { seedPatients, seedInventory, seedAppointments, seedSettings, fullSeedBackup, loadSeedData };


