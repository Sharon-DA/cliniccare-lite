/**
 * Export/Import Utilities
 * 
 * @description Utilities for exporting and importing data in various formats
 */

import Papa from 'papaparse';
import { downloadFile } from './helpers';

/**
 * Export data to JSON file
 * @param {Object|Array} data - Data to export
 * @param {string} filename - File name (without extension)
 */
export function exportToJSON(data, filename) {
  const jsonStr = JSON.stringify(data, null, 2);
  downloadFile(jsonStr, `${filename}.json`, 'application/json');
}

/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - File name (without extension)
 * @param {Object} options - Papa Parse options
 */
export function exportToCSV(data, filename, options = {}) {
  const csv = Papa.unparse(data, {
    quotes: true,
    ...options
  });
  downloadFile(csv, `${filename}.csv`, 'text/csv');
}

/**
 * Parse CSV file to JSON
 * @param {File} file - CSV file to parse
 * @returns {Promise<Array>} Parsed data array
 */
export function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parse warnings:', results.errors);
        }
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * Parse JSON file
 * @param {File} file - JSON file to parse
 * @returns {Promise<Object|Array>} Parsed data
 */
export function parseJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
}

/**
 * Export patients data
 * @param {Array} patients - Patients array
 * @param {string} format - Export format ('json' or 'csv')
 */
export function exportPatients(patients, format = 'json') {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `patients_export_${timestamp}`;
  
  if (format === 'csv') {
    // Flatten patient data for CSV
    const flatData = patients.map(patient => ({
      id: patient.id,
      name: patient.name,
      dob: patient.dob,
      gender: patient.gender,
      contact: patient.contact,
      email: patient.email || '',
      address: patient.address || '',
      visitCount: patient.visits?.length || 0,
      lastVisit: patient.visits?.[patient.visits.length - 1]?.date || '',
      createdAt: patient.createdAt
    }));
    exportToCSV(flatData, filename);
  } else {
    exportToJSON(patients, filename);
  }
}

/**
 * Export inventory data
 * @param {Array} inventory - Inventory array
 * @param {string} format - Export format ('json' or 'csv')
 */
export function exportInventory(inventory, format = 'json') {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `inventory_export_${timestamp}`;
  
  if (format === 'csv') {
    // Flatten inventory data for CSV
    const flatData = inventory.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category || '',
      batch: item.batch,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate,
      storageNotes: item.storageNotes || '',
      transactionCount: item.transactions?.length || 0,
      createdAt: item.createdAt
    }));
    exportToCSV(flatData, filename);
  } else {
    exportToJSON(inventory, filename);
  }
}

/**
 * Export inventory transactions
 * @param {Array} inventory - Inventory array with transactions
 */
export function exportInventoryTransactions(inventory) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `inventory_transactions_${timestamp}`;
  
  // Flatten all transactions
  const transactions = [];
  inventory.forEach(item => {
    if (item.transactions) {
      item.transactions.forEach(tx => {
        transactions.push({
          itemId: item.id,
          itemName: item.name,
          sku: item.sku,
          type: tx.t === 'in' ? 'Intake' : 'Outtake',
          quantity: tx.qty,
          date: tx.date,
          notes: tx.notes || ''
        });
      });
    }
  });
  
  exportToCSV(transactions, filename);
}

/**
 * Export appointments data
 * @param {Array} appointments - Appointments array
 * @param {string} format - Export format ('json' or 'csv')
 */
export function exportAppointments(appointments, format = 'json') {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `appointments_export_${timestamp}`;
  
  if (format === 'csv') {
    const flatData = appointments.map(apt => ({
      id: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName || '',
      datetime: apt.datetime,
      clinician: apt.clinician,
      status: apt.status,
      type: apt.type || 'general',
      notes: apt.notes || '',
      createdAt: apt.createdAt
    }));
    exportToCSV(flatData, filename);
  } else {
    exportToJSON(appointments, filename);
  }
}

/**
 * Export attendance/no-show report
 * @param {Array} appointments - Appointments array
 * @param {Object} dateRange - Date range filter { start, end }
 */
export function exportAttendanceReport(appointments, dateRange = null) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `attendance_report_${timestamp}`;
  
  let filtered = appointments;
  if (dateRange?.start && dateRange?.end) {
    filtered = appointments.filter(apt => {
      const aptDate = new Date(apt.datetime);
      return aptDate >= new Date(dateRange.start) && aptDate <= new Date(dateRange.end);
    });
  }
  
  const report = filtered.map(apt => ({
    date: apt.datetime?.split('T')[0] || '',
    time: apt.datetime?.split('T')[1]?.substring(0, 5) || '',
    patientId: apt.patientId,
    patientName: apt.patientName || '',
    clinician: apt.clinician,
    status: apt.status,
    attended: ['checked_in', 'in_progress', 'completed'].includes(apt.status) ? 'Yes' : 'No',
    noShow: apt.status === 'no_show' ? 'Yes' : 'No'
  }));
  
  exportToCSV(report, filename);
}

/**
 * Create full backup of all data
 * @param {Object} data - Object containing all data collections
 */
export function createFullBackup(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backup = {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    data: {
      patients: data.patients || [],
      inventory: data.inventory || [],
      appointments: data.appointments || [],
      settings: data.settings || {}
    }
  };
  
  exportToJSON(backup, `cliniccare_backup_${timestamp}`);
}

/**
 * Validate backup file structure
 * @param {Object} backup - Backup data to validate
 * @returns {Object} Validation result { valid, errors }
 */
export function validateBackup(backup) {
  const errors = [];
  
  if (!backup || typeof backup !== 'object') {
    return { valid: false, errors: ['Invalid backup file format'] };
  }
  
  if (!backup.data) {
    return { valid: false, errors: ['Missing data object in backup'] };
  }
  
  // Validate patients
  if (backup.data.patients && !Array.isArray(backup.data.patients)) {
    errors.push('Patients data should be an array');
  }
  
  // Validate inventory
  if (backup.data.inventory && !Array.isArray(backup.data.inventory)) {
    errors.push('Inventory data should be an array');
  }
  
  // Validate appointments
  if (backup.data.appointments && !Array.isArray(backup.data.appointments)) {
    errors.push('Appointments data should be an array');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}


