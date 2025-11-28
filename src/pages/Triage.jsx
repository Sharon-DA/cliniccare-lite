/**
 * Triage Page
 * 
 * @description Record patient vitals and triage information
 * @workflow Second step - Changes status from 'checked_in' to 'triaged', then adds to queue
 */

import React, { useState, useMemo } from 'react';
import { useLocalDB } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import { 
  STORAGE_KEYS, 
  APPOINTMENT_STATUS,
  SERVICE_TYPES 
} from '../utils/constants';
import { formatTime, generateId } from '../utils/helpers';
import SearchInput from '../components/common/SearchInput';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';

function Triage() {
  const { data: appointments, update: updateAppointment } = useLocalDB(STORAGE_KEYS.APPOINTMENTS);
  const { data: patients } = useLocalDB(STORAGE_KEYS.PATIENTS);
  const { data: triageRecords, create: createTriage } = useLocalDB(STORAGE_KEYS.TRIAGE);
  const { data: queue, create: addToQueue } = useLocalDB(STORAGE_KEYS.QUEUE);
  const { success, error: showError } = useNotifications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [triageForm, setTriageForm] = useState({
    temperature: '',
    bloodPressure: '',
    pulse: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    painLevel: '',
    notes: '',  // Nurse observations only (symptoms collected by doctor)
    urgency: 'normal',
    serviceType: 'general-consultation'
  });
  
  // Get patient details
  const getPatient = (patientId) => patients.find(p => p.id === patientId);
  
  // Filter checked-in patients waiting for triage
  const waitingForTriage = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(apt => {
        const aptDate = apt.datetime?.split('T')[0] || apt.date;
        const isToday = aptDate === today;
        const isCheckedIn = apt.status === APPOINTMENT_STATUS.CHECKED_IN;
        const patient = getPatient(apt.patientId);
        const matchesSearch = searchQuery === '' || 
          patient?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return isToday && isCheckedIn && matchesSearch;
      })
      .sort((a, b) => new Date(a.checkedInAt) - new Date(b.checkedInAt));
  }, [appointments, patients, searchQuery]);
  
  // Already triaged today (now in queue or further)
  const triagedToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(apt => {
        const aptDate = apt.datetime?.split('T')[0] || apt.date;
        const isTriaged = [
          APPOINTMENT_STATUS.TRIAGED,
          APPOINTMENT_STATUS.IN_QUEUE,
          APPOINTMENT_STATUS.WITH_DOCTOR,
          APPOINTMENT_STATUS.LAB,
          APPOINTMENT_STATUS.PHARMACY,
          APPOINTMENT_STATUS.COMPLETED
        ].includes(apt.status);
        return aptDate === today && isTriaged && apt.triagedAt;
      });
  }, [appointments]);
  
  // Handle triage form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTriageForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Calculate BMI
  const calculateBMI = () => {
    if (triageForm.weight && triageForm.height) {
      const heightM = triageForm.height / 100;
      const bmi = (triageForm.weight / (heightM * heightM)).toFixed(1);
      return bmi;
    }
    return null;
  };
  
  // Handle triage submission
  const handleSubmitTriage = () => {
    if (!selectedAppointment) return;
    
    // Validate required fields
    if (!triageForm.temperature || !triageForm.bloodPressure || !triageForm.pulse) {
      showError('Please fill in temperature, blood pressure, and pulse');
      return;
    }
    
    try {
      // Create triage record
      const triageData = {
        id: generateId('tr'),
        appointmentId: selectedAppointment.id,
        patientId: selectedAppointment.patientId,
        ...triageForm,
        bmi: calculateBMI(),
        recordedAt: new Date().toISOString(),
        recordedBy: 'Current User' // Would come from auth context
      };
      
      createTriage(triageData);
      
      // Update appointment status to IN_QUEUE (ready for consultation)
      updateAppointment(selectedAppointment.id, {
        status: APPOINTMENT_STATUS.IN_QUEUE,
        triagedAt: new Date().toISOString(),
        triageId: triageData.id
      });
      
      // Add to queue
      const queuePosition = queue.filter(q => !q.completed).length + 1;
      addToQueue({
        id: generateId('q'),
        appointmentId: selectedAppointment.id,
        patientId: selectedAppointment.patientId,
        position: queuePosition,
        service: triageForm.serviceType,
        urgency: triageForm.urgency,
        addedAt: new Date().toISOString(),
        completed: false
      });
      
      success(
        `${getPatient(selectedAppointment.patientId)?.name} triaged successfully`,
        `Added to queue at position ${queuePosition}`
      );
      
      // Reset form
      setSelectedAppointment(null);
      setTriageForm({
        temperature: '',
        bloodPressure: '',
        pulse: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        weight: '',
        height: '',
        painLevel: '',
        notes: '',
        urgency: 'normal',
        serviceType: 'general-consultation'
      });
    } catch (err) {
      showError('Failed to save triage data');
    }
  };
  
  // Get urgency badge variant
  const getUrgencyVariant = (urgency) => {
    switch (urgency) {
      case 'emergency': return 'danger';
      case 'urgent': return 'warning';
      default: return 'info';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-slate-800">Triage Station</h1>
        <p className="text-slate-500">Record patient vitals and assessment</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-4 text-center bg-teal-50 border-teal-200">
          <p className="text-3xl font-bold text-teal-600">{waitingForTriage.length}</p>
          <p className="text-sm text-teal-600">Waiting for Triage</p>
        </div>
        <div className="card p-4 text-center bg-cyan-50 border-cyan-200">
          <p className="text-3xl font-bold text-cyan-600">{triagedToday.length}</p>
          <p className="text-sm text-cyan-600">Triaged Today</p>
        </div>
        <div className="card p-4 text-center hidden lg:block">
          <p className="text-3xl font-bold text-slate-600">{queue.filter(q => !q.completed).length}</p>
          <p className="text-sm text-slate-500">In Queue</p>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Waiting List */}
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">Patients Waiting</h2>
            <div className="mt-3">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search patients..."
              />
            </div>
          </div>
          
          {waitingForTriage.length === 0 ? (
            <EmptyState
              icon="users"
              title="No patients waiting"
              description="Check-in patients will appear here"
            />
          ) : (
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {waitingForTriage.map((appointment) => {
                const patient = getPatient(appointment.patientId);
                const waitTime = Math.round((new Date() - new Date(appointment.checkedInAt)) / 60000);
                
                return (
                  <div
                    key={appointment.id}
                    onClick={() => setSelectedAppointment(appointment)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedAppointment?.id === appointment.id 
                        ? 'bg-clinic-50 border-l-4 border-clinic-500' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <span className="font-semibold text-teal-600">
                            {patient?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-800">{patient?.name}</h3>
                          <p className="text-sm text-slate-500">
                            Waiting {waitTime} min
                          </p>
                        </div>
                      </div>
                      <Badge variant={waitTime > 30 ? 'warning' : 'info'}>
                        {waitTime > 30 ? 'Long wait' : 'Waiting'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Triage Form */}
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">
              {selectedAppointment 
                ? `Triage: ${getPatient(selectedAppointment.patientId)?.name}`
                : 'Select a Patient'
              }
            </h2>
          </div>
          
          {!selectedAppointment ? (
            <div className="p-8 text-center text-slate-500">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>Select a patient from the waiting list to begin triage</p>
            </div>
          ) : (
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
              {/* Vital Signs */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Vital Signs
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="input-group">
                    <label className="label text-xs">Temperature (°C) *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="temperature"
                      value={triageForm.temperature}
                      onChange={handleFormChange}
                      className="input"
                      placeholder="36.5"
                    />
                  </div>
                  <div className="input-group">
                    <label className="label text-xs">Blood Pressure *</label>
                    <input
                      type="text"
                      name="bloodPressure"
                      value={triageForm.bloodPressure}
                      onChange={handleFormChange}
                      className="input"
                      placeholder="120/80"
                    />
                  </div>
                  <div className="input-group">
                    <label className="label text-xs">Pulse (bpm) *</label>
                    <input
                      type="number"
                      name="pulse"
                      value={triageForm.pulse}
                      onChange={handleFormChange}
                      className="input"
                      placeholder="72"
                    />
                  </div>
                  <div className="input-group">
                    <label className="label text-xs">Respiratory Rate</label>
                    <input
                      type="number"
                      name="respiratoryRate"
                      value={triageForm.respiratoryRate}
                      onChange={handleFormChange}
                      className="input"
                      placeholder="16"
                    />
                  </div>
                  <div className="input-group">
                    <label className="label text-xs">O2 Saturation (%)</label>
                    <input
                      type="number"
                      name="oxygenSaturation"
                      value={triageForm.oxygenSaturation}
                      onChange={handleFormChange}
                      className="input"
                      placeholder="98"
                    />
                  </div>
                  <div className="input-group">
                    <label className="label text-xs">Pain Level (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      name="painLevel"
                      value={triageForm.painLevel}
                      onChange={handleFormChange}
                      className="input"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              
              {/* Measurements */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Measurements</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="input-group">
                    <label className="label text-xs">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      value={triageForm.weight}
                      onChange={handleFormChange}
                      className="input"
                      placeholder="70"
                    />
                  </div>
                  <div className="input-group">
                    <label className="label text-xs">Height (cm)</label>
                    <input
                      type="number"
                      name="height"
                      value={triageForm.height}
                      onChange={handleFormChange}
                      className="input"
                      placeholder="170"
                    />
                  </div>
                  <div className="input-group">
                    <label className="label text-xs">BMI</label>
                    <input
                      type="text"
                      value={calculateBMI() || '-'}
                      disabled
                      className="input bg-slate-50"
                    />
                  </div>
                </div>
              </div>
              
              {/* Service & Urgency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="input-group">
                  <label className="label text-xs">Service Type</label>
                  <select
                    name="serviceType"
                    value={triageForm.serviceType}
                    onChange={handleFormChange}
                    className="input"
                  >
                    {SERVICE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="label text-xs">Urgency</label>
                  <select
                    name="urgency"
                    value={triageForm.urgency}
                    onChange={handleFormChange}
                    className="input"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
              
              {/* Notes */}
              <div className="input-group">
                <label className="label text-xs">Additional Notes</label>
                <textarea
                  name="notes"
                  value={triageForm.notes}
                  onChange={handleFormChange}
                  className="input min-h-[60px]"
                  placeholder="Any additional observations..."
                />
              </div>
              
              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTriage}
                  className="btn-primary flex-1"
                >
                  Complete Triage & Add to Queue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Triage;

