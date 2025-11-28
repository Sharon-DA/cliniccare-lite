/**
 * Consultation Page
 * 
 * @description Doctor's consultation interface for clinical notes, diagnosis, and prescriptions
 * @workflow Fourth step - Records consultation and moves to pharmacy/lab or completion
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  
  // Patients ready for consultation (in queue, with doctor, or lab results ready)
  const patientsForConsultation = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(apt => {
        const aptDate = apt.datetime?.split('T')[0] || apt.date;
        // Show patients who are in queue, already with doctor, or have lab results ready
        return aptDate === today && 
          (apt.status === APPOINTMENT_STATUS.WITH_DOCTOR || 
           apt.status === APPOINTMENT_STATUS.IN_QUEUE ||
           apt.status === APPOINTMENT_STATUS.LAB_RESULTS_READY);
      })
      .filter(apt => {
        const patient = getPatient(apt.patientId);
        return searchQuery === '' || 
          patient?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => {
        // LAB_RESULTS_READY first (urgent review), then WITH_DOCTOR, then IN_QUEUE
        const priority = {
          [APPOINTMENT_STATUS.LAB_RESULTS_READY]: 0,
          [APPOINTMENT_STATUS.WITH_DOCTOR]: 1,
          [APPOINTMENT_STATUS.IN_QUEUE]: 2
        };
        return (priority[a.status] || 3) - (priority[b.status] || 3);
      });
  }, [appointments, patients, searchQuery]);
  
  // When selecting a patient, update their status to WITH_DOCTOR
  const handleSelectPatient = (appointment) => {
    if (appointment.status === APPOINTMENT_STATUS.IN_QUEUE) {
      // Update to WITH_DOCTOR when starting consultation
      updateAppointment(appointment.id, {
        status: APPOINTMENT_STATUS.WITH_DOCTOR,
        calledAt: new Date().toISOString()
      });
      // Mark queue item as called
      const queueItem = queue.find(q => q.appointmentId === appointment.id);
      if (queueItem) {
        updateQueue(queueItem.id, { called: true, calledAt: new Date().toISOString() });
      }
    } else if (appointment.status === APPOINTMENT_STATUS.LAB_RESULTS_READY) {
      // Patient returning from lab - doctor reviews results
      updateAppointment(appointment.id, {
        status: APPOINTMENT_STATUS.WITH_DOCTOR,
        labReviewedAt: new Date().toISOString()
      });
    }
    setSelectedPatient({ ...appointment, status: APPOINTMENT_STATUS.WITH_DOCTOR });
  };
  
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
              Ready for Consultation ({patientsForConsultation.length})
            </h2>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search patients..."
            />
          </div>
          
          {patientsForConsultation.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <p>No patients ready for consultation</p>
              <p className="text-sm text-slate-400 mt-1">Complete triage to add patients to queue</p>
              <Link to="/triage" className="btn-outline mt-3 inline-block">
                Go to Triage
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {patientsForConsultation.map((appointment) => {
                const patient = getPatient(appointment.patientId);
                const triage = getTriage(appointment.id);
                const isInQueue = appointment.status === APPOINTMENT_STATUS.IN_QUEUE;
                const hasLabResults = appointment.status === APPOINTMENT_STATUS.LAB_RESULTS_READY;
                
                return (
                  <div
                    key={appointment.id}
                    onClick={() => handleSelectPatient(appointment)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedPatient?.id === appointment.id 
                        ? 'bg-purple-50 border-l-4 border-purple-500' 
                        : hasLabResults 
                          ? 'bg-emerald-50 border-l-4 border-emerald-500 hover:bg-emerald-100'
                          : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        hasLabResults ? 'bg-emerald-100' : isInQueue ? 'bg-yellow-100' : 'bg-purple-100'
                      }`}>
                        <span className={`font-semibold ${
                          hasLabResults ? 'text-emerald-600' : isInQueue ? 'text-yellow-600' : 'text-purple-600'
                        }`}>
                          {patient?.name?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-slate-800 truncate">{patient?.name}</h3>
                          {hasLabResults && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                              🔬 Lab Results Ready
                            </span>
                          )}
                          {isInQueue && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">In Queue</span>
                          )}
                          {!isInQueue && !hasLabResults && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">With Doctor</span>
                          )}
                        </div>
                        {patient?.allergies && (
                          <p className="text-xs text-red-600 truncate">⚠️ Allergies: {patient.allergies}</p>
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
                {/* Patient Header */}
                <div className="p-4 border-b border-slate-200 bg-purple-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {patient?.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-slate-800">{patient?.name}</h2>
                        <Link to={`/patients/${patient?.id}`} className="text-xs text-purple-600 hover:underline">
                          View Full Profile →
                        </Link>
                      </div>
                      <p className="text-sm text-slate-500">
                        {patient?.gender === 'M' ? 'Male' : 'Female'} • DOB: {formatDate(patient?.dob)}
                        {patient?.bloodType && ` • Blood: ${patient.bloodType}`}
                      </p>
                    </div>
                  </div>
                  
                  {/* Allergies Alert */}
                  {patient?.allergies && (
                    <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded-lg flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-xs font-semibold text-red-700">ALLERGIES</p>
                        <p className="text-sm text-red-800">{patient.allergies}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Medical History */}
                  {patient?.medicalHistory && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs font-semibold text-amber-700">Medical History</p>
                      <p className="text-sm text-amber-800">{patient.medicalHistory}</p>
                    </div>
                  )}
                </div>
                
                {/* Vitals Section - Taken by Nurse during Triage */}
                {triage && (
                  <div className="p-4 bg-teal-50 border-b border-teal-100">
                    <h3 className="text-sm font-semibold text-teal-800 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Vitals (from Triage)
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      <div className="bg-white p-2 rounded-lg text-center">
                        <p className="text-xs text-slate-500">BP</p>
                        <p className="font-bold text-slate-800">{triage.bloodPressure || '-'}</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg text-center">
                        <p className="text-xs text-slate-500">Temp</p>
                        <p className="font-bold text-slate-800">{triage.temperature || '-'}°C</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg text-center">
                        <p className="text-xs text-slate-500">Pulse</p>
                        <p className="font-bold text-slate-800">{triage.pulse || '-'} bpm</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg text-center">
                        <p className="text-xs text-slate-500">O2 Sat</p>
                        <p className="font-bold text-slate-800">{triage.oxygenSaturation || '-'}%</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg text-center">
                        <p className="text-xs text-slate-500">Weight</p>
                        <p className="font-bold text-slate-800">{triage.weight || '-'} kg</p>
                      </div>
                      <div className="bg-white p-2 rounded-lg text-center">
                        <p className="text-xs text-slate-500">BMI</p>
                        <p className="font-bold text-slate-800">{triage.bmi || '-'}</p>
                      </div>
                    </div>
                    {triage.notes && (
                      <div className="mt-3 p-2 bg-slate-100 rounded-lg">
                        <p className="text-xs text-slate-500 font-medium">Nurse Notes:</p>
                        <p className="text-sm text-slate-700">{triage.notes}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Lab Results Section - Show when patient returns from lab */}
                {(() => {
                  const labOrder = labOrders.find(l => l.appointmentId === selectedPatient.id);
                  if (labOrder && labOrder.status === 'completed') {
                    return (
                      <div className="p-4 bg-emerald-50 border-b border-emerald-100">
                        <h3 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Lab Results Ready for Review
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {labOrder.tests.map(test => {
                            const result = labOrder.results?.[test.code];
                            return (
                              <div key={test.code} className="bg-white p-2 rounded-lg">
                                <p className="text-xs text-slate-500">{test.name}</p>
                                <p className="font-bold text-emerald-700">{result?.value || 'N/A'}</p>
                                {result?.notes && (
                                  <p className="text-xs text-slate-500">{result.notes}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <div className="p-4 space-y-5 max-h-[500px] overflow-y-auto">
                  {/* SECTION 1: Symptoms & History */}
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      Symptoms & History
                    </h3>
                    
                    {/* Presenting Symptoms */}
                    <div className="input-group mb-3">
                      <label className="label text-sm">Presenting Symptoms / Complaint *</label>
                      <textarea
                        name="complaint"
                        value={form.complaint}
                        onChange={handleFormChange}
                        className="input min-h-[80px]"
                        placeholder="Describe what the patient is experiencing (e.g., fever for 3 days, headache, body pain...)"
                      />
                    </div>
                    
                    {/* History */}
                    <div className="input-group">
                      <label className="label text-sm">History of Present Illness</label>
                      <textarea
                        name="history"
                        value={form.history}
                        onChange={handleFormChange}
                        className="input min-h-[60px]"
                        placeholder="When did symptoms start? Any previous episodes? Current medications?"
                      />
                    </div>
                  </div>
                  
                  {/* SECTION 2: Physical Examination */}
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      Physical Examination
                    </h3>
                    <div className="input-group">
                      <label className="label text-sm">Examination Findings</label>
                      <textarea
                        name="examination"
                        value={form.examination}
                        onChange={handleFormChange}
                        className="input min-h-[80px]"
                        placeholder="Physical examination findings (e.g., throat is red, abdomen tender...)"
                      />
                    </div>
                  </div>
                  
                  {/* SECTION 3: Diagnosis */}
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      Diagnosis *
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {form.diagnosis.map(d => (
                        <Badge key={d.code} variant="warning" className="flex items-center gap-1 bg-amber-100">
                          {d.name} ({d.code})
                          <button
                            onClick={() => handleRemoveDiagnosis(d.code)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                      {form.diagnosis.length === 0 && (
                        <span className="text-sm text-amber-600">No diagnosis selected yet</span>
                      )}
                    </div>
                    <select
                      onChange={(e) => {
                        const diag = COMMON_DIAGNOSES.find(d => d.code === e.target.value);
                        if (diag) handleAddDiagnosis(diag);
                        e.target.value = '';
                      }}
                      className="input bg-white"
                    >
                      <option value="">+ Add diagnosis...</option>
                      {COMMON_DIAGNOSES.map(d => (
                        <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* SECTION 4: Lab Tests - Will appear on Lab Page */}
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                    <h3 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                      Lab Tests Prescribed
                      <span className="text-xs font-normal text-indigo-600 ml-auto">→ Appears on Lab Page</span>
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {form.labTests.map(test => (
                        <Badge key={test.code} variant="info" className="flex items-center gap-1 bg-indigo-100">
                          {test.name} ({test.code})
                          <button
                            onClick={() => handleRemoveLabTest(test.code)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                      {form.labTests.length === 0 && (
                        <span className="text-sm text-indigo-600">No lab tests prescribed</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {LAB_TESTS.map(test => (
                        <button
                          key={test.code}
                          onClick={() => handleAddLabTest(test)}
                          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                            form.labTests.find(t => t.code === test.code)
                              ? 'bg-indigo-500 text-white'
                              : 'bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {test.code}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* SECTION 5: Medications - Will appear on Pharmacy Page */}
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                      Medications Prescribed
                      <span className="text-xs font-normal text-green-600 ml-auto">→ Appears on Pharmacy Page</span>
                    </h3>
                    
                    {form.medications.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {form.medications.map(med => (
                          <div key={med.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200">
                            <div>
                              <p className="font-medium text-slate-800">{med.name}</p>
                              <p className="text-sm text-slate-500">
                                {med.dosage} • {med.frequency} • {med.duration}
                              </p>
                              {med.instructions && (
                                <p className="text-xs text-green-600 mt-1">📋 {med.instructions}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveMedication(med.id)}
                              className="text-red-500 hover:text-red-600 p-1"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {form.medications.length === 0 && (
                      <p className="text-sm text-green-600 mb-3">No medications prescribed yet</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs text-slate-500 w-full mb-1">Quick add:</span>
                      {COMMON_MEDICATIONS.slice(0, 6).map(med => (
                        <button
                          key={med.name}
                          onClick={() => handleQuickMed(med)}
                          className="px-3 py-1.5 text-sm bg-white hover:bg-green-100 rounded-full text-green-700 border border-green-200"
                        >
                          + {med.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowMedModal(true)}
                      className="btn-secondary w-full"
                    >
                      + Add Custom Medication
                    </button>
                  </div>
                  
                  {/* SECTION 6: Follow-up & Additional Info */}
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-xs font-bold">6</span>
                      Follow-up & Notes
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="input-group">
                        <label className="label text-sm">Follow-up Date</label>
                        <input
                          type="date"
                          name="followUpDate"
                          value={form.followUpDate}
                          onChange={handleFormChange}
                          className="input"
                        />
                      </div>
                      <div className="input-group">
                        <label className="label text-sm">Referral (if any)</label>
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
                    <div className="input-group">
                      <label className="label text-sm">Additional Notes</label>
                      <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleFormChange}
                        className="input"
                        placeholder="Any other notes for this consultation..."
                      />
                    </div>
                  </div>
                  
                  {/* Summary before submit */}
                  <div className="bg-slate-800 text-white p-4 rounded-xl">
                    <h3 className="font-semibold mb-2">Consultation Summary</h3>
                    <div className="text-sm space-y-1 text-slate-300">
                      <p>• Diagnosis: {form.diagnosis.length > 0 ? form.diagnosis.map(d => d.name).join(', ') : 'None selected'}</p>
                      <p>• Lab Tests: {form.labTests.length > 0 ? form.labTests.map(t => t.code).join(', ') : 'None'} {form.labTests.length > 0 && '→ Lab Page'}</p>
                      <p>• Medications: {form.medications.length > 0 ? `${form.medications.length} prescribed` : 'None'} {form.medications.length > 0 && '→ Pharmacy Page'}</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    {form.labTests.length > 0 && (
                      <button
                        onClick={() => handleComplete('lab')}
                        className="btn-secondary flex-1 bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Send to Lab First
                      </button>
                    )}
                    <button
                      onClick={() => handleComplete('pharmacy')}
                      className="btn-primary flex-1"
                    >
                      {form.medications.length > 0 ? (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          Complete & Send to Pharmacy
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Complete Consultation
                        </>
                      )}
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

