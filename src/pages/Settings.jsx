/**
 * Settings Page
 * 
 * @description Application settings, backup/restore, and configuration
 */

import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalDB } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import { STORAGE_KEYS, ROLES, ROLE_LABELS, DEFAULT_SETTINGS } from '../utils/constants';
import { createFullBackup, validateBackup, parseJSONFile } from '../utils/exportUtils';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

function Settings() {
  const { user, updateRole } = useAuth();
  const { data: patients, replaceAll: replacePatients, clear: clearPatients } = useLocalDB(STORAGE_KEYS.PATIENTS);
  const { data: inventory, replaceAll: replaceInventory, clear: clearInventory } = useLocalDB(STORAGE_KEYS.INVENTORY);
  const { data: appointments, replaceAll: replaceAppointments, clear: clearAppointments } = useLocalDB(STORAGE_KEYS.APPOINTMENTS);
  const { data: settingsArray, create: createSettings, update: updateSettings, clear: clearSettings } = useLocalDB(STORAGE_KEYS.SETTINGS);
  
  const settings = settingsArray[0] || DEFAULT_SETTINGS;
  const { success, error: showError, warning } = useNotifications();
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState(null);
  
  const fileInputRef = useRef(null);
  
  // Handle settings change
  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    if (settingsArray.length === 0) {
      createSettings(newSettings);
    } else {
      updateSettings(settings.id, newSettings);
    }
    success('Setting updated');
  };
  
  // Handle role change
  const handleRoleChange = (newRole) => {
    updateRole(newRole);
    success(`Role changed to ${ROLE_LABELS[newRole]}`);
  };
  
  // Create backup
  const handleBackup = () => {
    try {
      createFullBackup({
        patients,
        inventory,
        appointments,
        settings
      });
      success('Backup created and downloaded');
    } catch (err) {
      showError('Failed to create backup');
    }
  };
  
  // Handle file selection for restore
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const data = await parseJSONFile(file);
      const validation = validateBackup(data);
      
      if (!validation.valid) {
        showError(validation.errors.join(', '));
        return;
      }
      
      setImportData(data);
      setShowImportModal(true);
    } catch (err) {
      showError('Invalid backup file: ' + err.message);
    }
    
    // Reset file input
    e.target.value = '';
  };
  
  // Perform restore
  const handleRestore = () => {
    if (!importData?.data) return;
    
    try {
      if (importData.data.patients) {
        replacePatients(importData.data.patients);
      }
      if (importData.data.inventory) {
        replaceInventory(importData.data.inventory);
      }
      if (importData.data.appointments) {
        replaceAppointments(importData.data.appointments);
      }
      if (importData.data.settings) {
        clearSettings();
        createSettings(importData.data.settings);
      }
      
      success('Data restored successfully');
      setShowImportModal(false);
      setImportData(null);
    } catch (err) {
      showError('Failed to restore data: ' + err.message);
    }
  };
  
  // Reset all data
  const handleReset = () => {
    try {
      clearPatients();
      clearInventory();
      clearAppointments();
      clearSettings();
      success('All data has been reset');
      setShowResetConfirm(false);
    } catch (err) {
      showError('Failed to reset data');
    }
  };
  
  // Data counts
  const dataCounts = {
    patients: patients.length,
    inventory: inventory.length,
    appointments: appointments.length
  };
  
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500">Configure your clinic preferences</p>
      </div>
      
      {/* User Settings */}
      <div className="card">
        <h2 className="text-lg font-heading font-semibold text-slate-800 mb-4">
          User Settings
        </h2>
        
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-clinic-400 to-clinic-600 
                            flex items-center justify-center text-white font-bold text-xl">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{user?.name}</p>
              <p className="text-sm text-slate-500">@{user?.username}</p>
            </div>
          </div>
          
          {/* Role Selection */}
          <div className="input-group">
            <label className="label">Current Role</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(ROLES).filter(([key]) => key !== 'ADMIN').map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleRoleChange(value)}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
                    ${user?.role === value
                      ? 'border-clinic-500 bg-clinic-50'
                      : 'border-slate-200 hover:border-slate-300'}
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${user?.role === value ? 'bg-clinic-500 text-white' : 'bg-slate-100 text-slate-500'}
                  `}>
                    {value === ROLES.CLINICIAN ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{ROLE_LABELS[value]}</p>
                    <p className="text-xs text-slate-500">
                      {value === ROLES.CLINICIAN 
                        ? 'Patients, appointments, analytics' 
                        : 'Inventory, supplies, reports'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Alert Thresholds */}
      <div className="card">
        <h2 className="text-lg font-heading font-semibold text-slate-800 mb-4">
          Alert Thresholds
        </h2>
        
        <div className="space-y-4">
          <div className="input-group">
            <label htmlFor="lowStock" className="label">
              Low Stock Threshold
              <span className="text-slate-400 font-normal ml-2">(items ≤ this value)</span>
            </label>
            <input
              id="lowStock"
              type="number"
              min="0"
              value={settings.lowStockThreshold || 20}
              onChange={(e) => handleSettingChange('lowStockThreshold', parseInt(e.target.value) || 0)}
              className="input w-32"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="nearExpiry" className="label">
              Near Expiry Warning
              <span className="text-slate-400 font-normal ml-2">(days before expiry)</span>
            </label>
            <input
              id="nearExpiry"
              type="number"
              min="0"
              value={settings.nearExpiryDays || 30}
              onChange={(e) => handleSettingChange('nearExpiryDays', parseInt(e.target.value) || 0)}
              className="input w-32"
            />
          </div>
        </div>
      </div>
      
      {/* Clinic Info */}
      <div className="card">
        <h2 className="text-lg font-heading font-semibold text-slate-800 mb-4">
          Clinic Information
        </h2>
        
        <div className="space-y-4">
          <div className="input-group">
            <label htmlFor="clinicName" className="label">Clinic Name</label>
            <input
              id="clinicName"
              type="text"
              value={settings.clinicName || ''}
              onChange={(e) => handleSettingChange('clinicName', e.target.value)}
              className="input"
              placeholder="ClinicCare Lite"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="clinicContact" className="label">Contact Number</label>
            <input
              id="clinicContact"
              type="tel"
              value={settings.clinicContact || ''}
              onChange={(e) => handleSettingChange('clinicContact', e.target.value)}
              className="input"
              placeholder="+1234567890"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="clinicAddress" className="label">Address</label>
            <textarea
              id="clinicAddress"
              value={settings.clinicAddress || ''}
              onChange={(e) => handleSettingChange('clinicAddress', e.target.value)}
              className="input min-h-[80px]"
              placeholder="123 Medical Center Dr..."
              rows={2}
            />
          </div>
        </div>
      </div>
      
      {/* Data Management */}
      <div className="card">
        <h2 className="text-lg font-heading font-semibold text-slate-800 mb-4">
          Data Management
        </h2>
        
        {/* Current Data Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-blue-600">{dataCounts.patients}</p>
            <p className="text-sm text-blue-700">Patients</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-purple-600">{dataCounts.inventory}</p>
            <p className="text-sm text-purple-700">Inventory</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-green-600">{dataCounts.appointments}</p>
            <p className="text-sm text-green-700">Appointments</p>
          </div>
        </div>
        
        {/* Backup & Restore */}
        <div className="space-y-3">
          <button onClick={handleBackup} className="btn-primary w-full sm:w-auto">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Create Full Backup
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="btn-secondary w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Restore from Backup
          </button>
          
          <div className="border-t border-slate-200 pt-4 mt-4">
            <button 
              onClick={() => setShowResetConfirm(true)} 
              className="btn-danger w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Reset All Data
            </button>
            <p className="text-sm text-slate-500 mt-2">
              This will permanently delete all patients, inventory, and appointments.
            </p>
          </div>
        </div>
      </div>
      
      {/* About */}
      <div className="card">
        <h2 className="text-lg font-heading font-semibold text-slate-800 mb-4">
          About ClinicCare Lite
        </h2>
        <div className="text-sm text-slate-600 space-y-2">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Type:</strong> Offline-first Progressive Web App</p>
          <p><strong>Storage:</strong> LocalStorage / IndexedDB</p>
          <p className="pt-2">
            ClinicCare Lite is a portfolio-ready clinic management application 
            designed for offline-first operation. All data is stored locally 
            in your browser.
          </p>
        </div>
      </div>
      
      {/* Import Confirmation Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportData(null);
        }}
        title="Restore from Backup"
        size="md"
        footer={
          <>
            <button 
              onClick={() => {
                setShowImportModal(false);
                setImportData(null);
              }} 
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleRestore} className="btn-primary">
              Restore Data
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="alert-warning">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold">This will replace all existing data</p>
              <p className="text-sm">Current data will be overwritten with the backup contents.</p>
            </div>
          </div>
          
          {importData && (
            <div className="space-y-2 text-sm">
              <p><strong>Backup created:</strong> {importData.createdAt ? new Date(importData.createdAt).toLocaleString() : 'Unknown'}</p>
              <p><strong>Patients:</strong> {importData.data?.patients?.length || 0}</p>
              <p><strong>Inventory:</strong> {importData.data?.inventory?.length || 0}</p>
              <p><strong>Appointments:</strong> {importData.data?.appointments?.length || 0}</p>
            </div>
          )}
        </div>
      </Modal>
      
      {/* Reset Confirmation */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset All Data"
        message="This will permanently delete all patients, inventory items, and appointments. This action cannot be undone. Are you sure?"
        confirmText="Reset Everything"
        confirmVariant="danger"
      />
    </div>
  );
}

export default Settings;

