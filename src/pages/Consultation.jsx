/**
 * Consultation Page
 * 
 * @description Doctor's consultation interface for clinical notes, diagnosis, and prescriptions
 * @workflow Fourth step - Records consultation and moves to pharmacy/lab or completion
 */

import React, { useState, useMemo } from 'react';
import { useLocalDB } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import { 
  STORAGE_KEYS, 
  APPOINTMENT_STATUS,
  COMMON_DIAGNOSES,
  COMMON_MEDICATIONS,
  LAB_TESTS
} from '../utils/constants';
import { generateId, formatDate } from '../utils/helpers';
import SearchInput from '../components/common/SearchInput';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';

function Consultation() {
  const { data: appointments, update: updateAppointment } = useLocalDB(STORAGE_KEYS.APPOINTMENTS);
  const { data: patients } = useLocalDB(STORAGE_KEYS.PATIENTS);
  const { data: triageRecords } = useLocalDB(STORAGE_KEYS.TRIAGE);
  const { data: queue, update: updateQueue } = useLocalDB(STORAGE_KEYS.QUEUE);
  const { data: consultations, create: createConsultation } = useLocalDB(STORAGE_KEYS.CONSULTATIONS);
  const { data: prescriptions, create: createPrescription } = useLocalDB(STORAGE_KEYS.PRESCRIPTIONS);
  const { data: labOrders, create: createLabOrder } = useLocalDB(STORAGE_KEYS.LAB_ORDERS);
  const { success, error: showError } = useNotifications();
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Consultation form state
  const [form, setForm] = useState({
    complaint: '',
    history: '',
    examination: '',
    diagnosis: [],
    medications: [],
    labTests: [],
    followUpDate: '',
    notes: '',
    referral: ''
  });
  
  // Temporary medication input
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
  const [showMedModal, setShowMedModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  
  // Get patient details
  const getPatient = (patientId) => patients.find(p => p.id === patientId);
  
  // Get triage data
  const getTriage = (appointmentId) => triageRecords.find(t => t.appointmentId === appointmentId);
  
  // Patients currently with doctor
  const patientsWithDoctor = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(apt => {
        const aptDate = apt.datetime?.split('T')[0] || apt.date;
        return aptDate === today && apt.status === APPOINTMENT_STATUS.WITH_DOCTOR;
      })
      .filter(apt => {
        const patient = getPatient(apt.patientId);
        return searchQuery === '' || 
          patient?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [appointments, patients, searchQuery]);
  
  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Add diagnosis
  const handleAddDiagnosis = (diagnosis) => {
    if (!form.diagnosis.find(d => d.code === diagnosis.code)) {
      setForm(prev => ({
        ...prev,
        diagnosis: [...prev.diagnosis, diagnosis]
      }));
    }
  };
  
  // Remove diagnosis
  const handleRemoveDiagnosis = (code) => {
    setForm(prev => ({
      ...prev,
      diagnosis: prev.diagnosis.filter(d => d.code !== code)
    }));
  };
  
  // Add medication
  const handleAddMedication = () => {
    if (newMed.name) {
      setForm(prev => ({
        ...prev,
        medications: [...prev.medications, { ...newMed, id: generateId('med') }]
      }));
      setNewMed({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
      setShowMedModal(false);
    }
  };
  
  // Add quick medication
  const handleQuickMed = (med) => {
    setForm(prev => ({
      ...prev,
      medications: [...prev.medications, { ...med, id: generateId('med'), duration: '5 days' }]
    }));
  };
  
  // Remove medication
  const handleRemoveMedication = (id) => {
    setForm(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== id)
    }));
  };
  
  // Add lab test
  const handleAddLabTest = (test) => {
    if (!form.labTests.find(t => t.code === test.code)) {
      setForm(prev => ({
        ...prev,
        labTests: [...prev.labTests, test]
      }));
    }
  };
  
  // Remove lab test
  const handleRemoveLabTest = (code) => {
    setForm(prev => ({
      ...prev,
      labTests: prev.labTests.filter(t => t.code !== code)
    }));
  };
  
  // Complete consultation
  const handleComplete = (sendTo = 'completed') => {
    if (!selectedPatient) return;
    
    if (form.diagnosis.length === 0) {
      showError('Please add at least one diagnosis');
      return;
    }
    
    try {
      // Create consultation record
      const consultationData = {
        id: generateId('cons'),
        appointmentId: selectedPatient.id,
        patientId: selectedPatient.patientId,
        ...form,
        completedAt: new Date().toISOString(),
        completedBy: 'Current Doctor'
      };
      createConsultation(consultationData);
      
      // Create prescriptions if any
      if (form.medications.length > 0) {
        createPrescription({
          id: generateId('rx'),
          appointmentId: selectedPatient.id,
          patientId: selectedPatient.patientId,
          consultationId: consultationData.id,
          medications: form.medications,
          issuedAt: new Date().toISOString(),
          dispensed: false
        });
      }
      
      // Create lab orders if any
      if (form.labTests.length > 0) {
        createLabOrder({
          id: generateId('lab'),
          appointmentId: selectedPatient.id,
          patientId: selectedPatient.patientId,
          consultationId: consultationData.id,
          tests: form.labTests,
          orderedAt: new Date().toISOString(),
          status: 'pending'
        });
      }
      
      // Determine next status
      let nextStatus;
      if (sendTo === 'lab' && form.labTests.length > 0) {
        nextStatus = APPOINTMENT_STATUS.LAB;
      } else if (form.medications.length > 0) {
        nextStatus = APPOINTMENT_STATUS.PHARMACY;
      } else {
        nextStatus = APPOINTMENT_STATUS.COMPLETED;
      }
      
      // Update appointment
      updateAppointment(selectedPatient.id, {
        status: nextStatus,
        consultationId: consultationData.id,
        consultedAt: new Date().toISOString()
      });
      
      // Mark queue as completed
      const queueItem = queue.find(q => q.appointmentId === selectedPatient.id);
      if (queueItem) {
        updateQueue(queueItem.id, { completed: true });
      }
      
      const patient = getPatient(selectedPatient.patientId);
      success(
        `Consultation completed for ${patient?.name}`,
        nextStatus === APPOINTMENT_STATUS.PHARMACY 
          ? 'Sent to Pharmacy' 
          : nextStatus === APPOINTMENT_STATUS.LAB 
            ? 'Sent to Lab' 
            : 'Visit Complete'
      );
      
      // Reset
      setSelectedPatient(null);
      setForm({
        complaint: '',
        history: '',
        examination: '',
        diagnosis: [],
        medications: [],
        labTests: [],
        followUpDate: '',
        notes: '',
        referral: ''
      });
    } catch (err) {
      showError('Failed to save consultation');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-slate-800">Consultation</h1>
        <p className="text-slate-500">Record clinical notes, diagnosis, and prescriptions</p>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="card lg:col-span-1">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-3">
              Current Patients ({patientsWithDoctor.length})
            </h2>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search patients..."
            />
          </div>
          
          {patientsWithDoctor.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <p>No patients currently with doctor</p>
              <p className="text-sm text-slate-400 mt-1">Call patients from the queue</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {patientsWithDoctor.map((appointment) => {
                const patient = getPatient(appointment.patientId);
                const triage = getTriage(appointment.id);
                
                return (
                  <div
                    key={appointment.id}
                    onClick={() => setSelectedPatient(appointment)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedPatient?.id === appointment.id 
                        ? 'bg-purple-50 border-l-4 border-purple-500' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="font-semibold text-purple-600">
                          {patient?.name?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-800 truncate">{patient?.name}</h3>
                        {triage?.chiefComplaint && (
                          <p className="text-sm text-slate-500 truncate">{triage.chiefComplaint}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Consultation Form */}
        <div className="card lg:col-span-2">
          {!selectedPatient ? (
            <div className="p-12 text-center">
              <svg className="w-20 h-20 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-500">Select a patient to begin consultation</p>
            </div>
          ) : (() => {
            const patient = getPatient(selectedPatient.patientId);
            const triage = getTriage(selectedPatient.id);
            
            return (
              <>
                <div className="p-4 border-b border-slate-200 bg-purple-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {patient?.name?.charAt(0)}
                      </div>
                      <div>
                        <h2 className="font-semibold text-slate-800">{patient?.name}</h2>
                        <p className="text-sm text-slate-500">
                          {patient?.gender === 'M' ? 'Male' : 'Female'} • DOB: {formatDate(patient?.dob)}
                        </p>
                      </div>
                    </div>
                    {triage && (
                      <div className="text-right text-sm">
                        <p className="text-slate-500">Vitals: {triage.bloodPressure}, {triage.temperature}°C</p>
                        <p className="text-slate-500">Pulse: {triage.pulse} bpm</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 space-y-5 max-h-[600px] overflow-y-auto">
                  {/* Chief Complaint */}
                  <div className="input-group">
                    <label className="label">Chief Complaint</label>
                    <textarea
                      name="complaint"
                      value={form.complaint}
                      onChange={handleFormChange}
                      className="input min-h-[80px]"
                      placeholder="Patient's main complaint..."
                    />
                  </div>
                  
                  {/* History */}
                  <div className="input-group">
                    <label className="label">History of Present Illness</label>
                    <textarea
                      name="history"
                      value={form.history}
                      onChange={handleFormChange}
                      className="input min-h-[80px]"
                      placeholder="Detailed history..."
                    />
                  </div>
                  
                  {/* Examination */}
                  <div className="input-group">
                    <label className="label">Physical Examination</label>
                    <textarea
                      name="examination"
                      value={form.examination}
                      onChange={handleFormChange}
                      className="input min-h-[80px]"
                      placeholder="Examination findings..."
                    />
                  </div>
                  
                  {/* Diagnosis */}
                  <div>
                    <label className="label">Diagnosis *</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.diagnosis.map(d => (
                        <Badge key={d.code} variant="info" className="flex items-center gap-1">
                          {d.name}
                          <button
                            onClick={() => handleRemoveDiagnosis(d.code)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        const diag = COMMON_DIAGNOSES.find(d => d.code === e.target.value);
                        if (diag) handleAddDiagnosis(diag);
                        e.target.value = '';
                      }}
                      className="input"
                    >
                      <option value="">Add diagnosis...</option>
                      {COMMON_DIAGNOSES.map(d => (
                        <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Medications */}
                  <div>
                    <label className="label flex items-center justify-between">
                      <span>Medications</span>
                      <button
                        onClick={() => setShowMedModal(true)}
                        className="text-sm text-clinic-600 hover:text-clinic-700"
                      >
                        + Custom
                      </button>
                    </label>
                    
                    {form.medications.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {form.medications.map(med => (
                          <div key={med.id} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                            <div>
                              <p className="font-medium text-slate-800">{med.name}</p>
                              <p className="text-sm text-slate-500">
                                {med.dosage} • {med.frequency} • {med.duration}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveMedication(med.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {COMMON_MEDICATIONS.slice(0, 5).map(med => (
                        <button
                          key={med.name}
                          onClick={() => handleQuickMed(med)}
                          className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700"
                        >
                          + {med.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Lab Tests */}
                  <div>
                    <label className="label">Lab Tests</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.labTests.map(test => (
                        <Badge key={test.code} variant="warning" className="flex items-center gap-1">
                          {test.name}
                          <button
                            onClick={() => handleRemoveLabTest(test.code)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {LAB_TESTS.slice(0, 6).map(test => (
                        <button
                          key={test.code}
                          onClick={() => handleAddLabTest(test)}
                          className={`px-3 py-1.5 text-sm rounded-full ${
                            form.labTests.find(t => t.code === test.code)
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {test.code}
                        </button>
                      ))}
                      <button
                        onClick={() => setShowLabModal(true)}
                        className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700"
                      >
                        More...
                      </button>
                    </div>
                  </div>
                  
                  {/* Follow-up */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="input-group">
                      <label className="label">Follow-up Date</label>
                      <input
                        type="date"
                        name="followUpDate"
                        value={form.followUpDate}
                        onChange={handleFormChange}
                        className="input"
                      />
                    </div>
                    <div className="input-group">
                      <label className="label">Referral (if any)</label>
                      <input
                        type="text"
                        name="referral"
                        value={form.referral}
                        onChange={handleFormChange}
                        className="input"
                        placeholder="Specialist name..."
                      />
                    </div>
                  </div>
                  
                  {/* Notes */}
                  <div className="input-group">
                    <label className="label">Additional Notes</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleFormChange}
                      className="input"
                      placeholder="Any other notes..."
                    />
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleComplete('lab')}
                      disabled={form.labTests.length === 0}
                      className="btn-secondary flex-1 disabled:opacity-50"
                    >
                      Send to Lab
                    </button>
                    <button
                      onClick={() => handleComplete('pharmacy')}
                      className="btn-primary flex-1"
                    >
                      {form.medications.length > 0 ? 'Send to Pharmacy' : 'Complete Visit'}
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
      
      {/* Custom Medication Modal */}
      <Modal
        isOpen={showMedModal}
        onClose={() => setShowMedModal(false)}
        title="Add Custom Medication"
      >
        <div className="space-y-4">
          <div className="input-group">
            <label className="label">Medication Name *</label>
            <input
              type="text"
              value={newMed.name}
              onChange={(e) => setNewMed(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              placeholder="e.g., Amoxicillin 500mg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="input-group">
              <label className="label">Dosage</label>
              <input
                type="text"
                value={newMed.dosage}
                onChange={(e) => setNewMed(prev => ({ ...prev, dosage: e.target.value }))}
                className="input"
                placeholder="e.g., 1 tablet"
              />
            </div>
            <div className="input-group">
              <label className="label">Frequency</label>
              <input
                type="text"
                value={newMed.frequency}
                onChange={(e) => setNewMed(prev => ({ ...prev, frequency: e.target.value }))}
                className="input"
                placeholder="e.g., 3 times daily"
              />
            </div>
          </div>
          <div className="input-group">
            <label className="label">Duration</label>
            <input
              type="text"
              value={newMed.duration}
              onChange={(e) => setNewMed(prev => ({ ...prev, duration: e.target.value }))}
              className="input"
              placeholder="e.g., 5 days"
            />
          </div>
          <div className="input-group">
            <label className="label">Special Instructions</label>
            <input
              type="text"
              value={newMed.instructions}
              onChange={(e) => setNewMed(prev => ({ ...prev, instructions: e.target.value }))}
              className="input"
              placeholder="e.g., Take after meals"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowMedModal(false)} className="btn-secondary flex-1">
              Cancel
            </button>
            <button onClick={handleAddMedication} className="btn-primary flex-1">
              Add Medication
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Lab Tests Modal */}
      <Modal
        isOpen={showLabModal}
        onClose={() => setShowLabModal(false)}
        title="Select Lab Tests"
      >
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {LAB_TESTS.map(test => (
            <button
              key={test.code}
              onClick={() => handleAddLabTest(test)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                form.labTests.find(t => t.code === test.code)
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span className="font-medium">{test.name}</span>
              <span className="text-sm text-slate-500 ml-2">({test.code})</span>
            </button>
          ))}
        </div>
        <div className="mt-4">
          <button onClick={() => setShowLabModal(false)} className="btn-primary w-full">
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Consultation;

