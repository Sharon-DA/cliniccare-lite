/**
 * Pharmacy Page
 * 
 * @description Dispense medications and manage prescriptions
 * @workflow Fifth step - Dispenses medications and completes visit
 */

import React, { useState, useMemo } from 'react';
import { useLocalDB } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import { 
  STORAGE_KEYS, 
  APPOINTMENT_STATUS
} from '../utils/constants';
import { formatDate, formatTime } from '../utils/helpers';
import SearchInput from '../components/common/SearchInput';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';

function Pharmacy() {
  const { data: appointments, update: updateAppointment } = useLocalDB(STORAGE_KEYS.APPOINTMENTS);
  const { data: patients } = useLocalDB(STORAGE_KEYS.PATIENTS);
  const { data: prescriptions, update: updatePrescription } = useLocalDB(STORAGE_KEYS.PRESCRIPTIONS);
  const { data: consultations } = useLocalDB(STORAGE_KEYS.CONSULTATIONS);
  const { data: inventory, update: updateInventory } = useLocalDB(STORAGE_KEYS.INVENTORY);
  const { success, error: showError, warning } = useNotifications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [dispensedMeds, setDispensedMeds] = useState({});
  
  // Get patient details
  const getPatient = (patientId) => patients.find(p => p.id === patientId);
  
  // Get consultation
  const getConsultation = (consultationId) => consultations.find(c => c.id === consultationId);
  
  // Pending prescriptions
  const pendingPrescriptions = useMemo(() => {
    return prescriptions
      .filter(rx => !rx.dispensed)
      .filter(rx => {
        const patient = getPatient(rx.patientId);
        return searchQuery === '' || 
          patient?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  }, [prescriptions, patients, searchQuery]);
  
  // Dispensed today
  const dispensedToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return prescriptions.filter(rx => {
      const dispensedDate = rx.dispensedAt?.split('T')[0];
      return dispensedDate === today;
    });
  }, [prescriptions]);
  
  // Handle dispense medication
  const handleDispense = () => {
    if (!selectedPrescription) return;
    
    const allDispensed = selectedPrescription.medications.every(
      med => dispensedMeds[med.id]
    );
    
    if (!allDispensed) {
      warning('Please mark all medications as dispensed');
      return;
    }
    
    try {
      // Update prescription
      updatePrescription(selectedPrescription.id, {
        dispensed: true,
        dispensedAt: new Date().toISOString(),
        dispensedBy: 'Current Pharmacist'
      });
      
      // Update appointment status to completed
      updateAppointment(selectedPrescription.appointmentId, {
        status: APPOINTMENT_STATUS.COMPLETED,
        completedAt: new Date().toISOString()
      });
      
      // Optionally update inventory (decrease stock)
      // This would need proper inventory item matching
      
      const patient = getPatient(selectedPrescription.patientId);
      success(`Prescription dispensed for ${patient?.name}`, 'Visit Complete');
      
      setSelectedPrescription(null);
      setDispensedMeds({});
    } catch (err) {
      showError('Failed to dispense prescription');
    }
  };
  
  // Toggle medication dispensed
  const toggleDispensed = (medId) => {
    setDispensedMeds(prev => ({
      ...prev,
      [medId]: !prev[medId]
    }));
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-slate-800">Pharmacy</h1>
        <p className="text-slate-500">Dispense medications and complete visits</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 text-center bg-orange-50 border-orange-200">
          <p className="text-3xl font-bold text-orange-600">{pendingPrescriptions.length}</p>
          <p className="text-sm text-orange-600">Pending</p>
        </div>
        <div className="card p-4 text-center bg-green-50 border-green-200">
          <p className="text-3xl font-bold text-green-600">{dispensedToday.length}</p>
          <p className="text-sm text-green-600">Dispensed Today</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-slate-600">
            {pendingPrescriptions.reduce((sum, rx) => sum + rx.medications.length, 0)}
          </p>
          <p className="text-sm text-slate-500">Medications to Dispense</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-slate-600">
            {inventory.filter(i => i.quantity <= 20).length}
          </p>
          <p className="text-sm text-slate-500">Low Stock Items</p>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Prescriptions */}
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-3">Pending Prescriptions</h2>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search patients..."
            />
          </div>
          
          {pendingPrescriptions.length === 0 ? (
            <EmptyState
              icon="prescription"
              title="No pending prescriptions"
              description="Prescriptions will appear here after consultation"
            />
          ) : (
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {pendingPrescriptions.map((prescription) => {
                const patient = getPatient(prescription.patientId);
                const consultation = getConsultation(prescription.consultationId);
                const waitTime = Math.round((new Date() - new Date(prescription.issuedAt)) / 60000);
                
                return (
                  <div
                    key={prescription.id}
                    onClick={() => {
                      setSelectedPrescription(prescription);
                      setDispensedMeds({});
                    }}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedPrescription?.id === prescription.id 
                        ? 'bg-orange-50 border-l-4 border-orange-500' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-800">{patient?.name}</h3>
                          <p className="text-sm text-slate-500">
                            {prescription.medications.length} medication(s) • {waitTime} min ago
                          </p>
                        </div>
                      </div>
                      <Badge variant={waitTime > 30 ? 'warning' : 'info'}>
                        {waitTime > 30 ? 'Waiting' : 'New'}
                      </Badge>
                    </div>
                    
                    {/* Preview medications */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {prescription.medications.slice(0, 3).map((med, idx) => (
                        <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          {med.name.split(' ')[0]}
                        </span>
                      ))}
                      {prescription.medications.length > 3 && (
                        <span className="text-xs text-slate-400">
                          +{prescription.medications.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Dispense Panel */}
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">Dispense Medications</h2>
          </div>
          
          {!selectedPrescription ? (
            <div className="p-12 text-center">
              <svg className="w-20 h-20 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <p className="text-slate-500">Select a prescription to dispense</p>
            </div>
          ) : (() => {
            const patient = getPatient(selectedPrescription.patientId);
            const consultation = getConsultation(selectedPrescription.consultationId);
            
            return (
              <div className="p-4">
                {/* Patient Info */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                    {patient?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{patient?.name}</h3>
                    <p className="text-sm text-slate-500">
                      Issued: {formatTime(selectedPrescription.issuedAt)}
                    </p>
                  </div>
                </div>
                
                {/* Diagnosis */}
                {consultation?.diagnosis && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Diagnosis</p>
                    <div className="flex flex-wrap gap-2">
                      {consultation.diagnosis.map(d => (
                        <Badge key={d.code} variant="info">{d.name}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Medications List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {selectedPrescription.medications.map((med) => (
                    <div
                      key={med.id}
                      className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                        dispensedMeds[med.id]
                          ? 'bg-green-50 border-green-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => toggleDispensed(med.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800 flex items-center gap-2">
                            {dispensedMeds[med.id] && (
                              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {med.name}
                          </h4>
                          <div className="mt-1 text-sm text-slate-500 space-y-0.5">
                            <p>Dosage: {med.dosage}</p>
                            <p>Frequency: {med.frequency}</p>
                            <p>Duration: {med.duration}</p>
                            {med.instructions && (
                              <p className="text-orange-600">Note: {med.instructions}</p>
                            )}
                          </div>
                        </div>
                        <div className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center
                          ${dispensedMeds[med.id] 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-slate-300'
                          }
                        `}>
                          {dispensedMeds[med.id] && (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Progress */}
                <div className="mt-4 mb-4">
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>
                      {Object.values(dispensedMeds).filter(Boolean).length} / {selectedPrescription.medications.length}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{
                        width: `${(Object.values(dispensedMeds).filter(Boolean).length / selectedPrescription.medications.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedPrescription(null);
                      setDispensedMeds({});
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDispense}
                    disabled={!selectedPrescription.medications.every(med => dispensedMeds[med.id])}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    Complete Dispensing
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default Pharmacy;

