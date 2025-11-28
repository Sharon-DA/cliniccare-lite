/**
 * Appointment Form Component
 * 
 * @description Form for scheduling appointments and walk-ins
 */

import React, { useState } from 'react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { APPOINTMENT_STATUS } from '../../utils/constants';

// Validation schema
const appointmentSchema = {
  patientId: {
    label: 'Patient',
    required: true
  },
  date: {
    label: 'Date',
    required: true,
    date: true
  },
  time: {
    label: 'Time',
    required: true
  },
  clinician: {
    label: 'Clinician'
  },
  type: {
    label: 'Visit Type'
  },
  notes: {
    label: 'Notes',
    maxLength: 500
  }
};

// Common appointment types
const APPOINTMENT_TYPES = [
  'general',
  'follow-up',
  'consultation',
  'vaccination',
  'checkup',
  'emergency'
];

function AppointmentForm({ appointment, patients, defaultDate, isWalkIn = false, onSubmit, onCancel }) {
  const isEditing = !!appointment;
  const [patientSearch, setPatientSearch] = useState('');
  
  // Parse existing datetime
  const existingDate = appointment?.datetime?.split('T')[0] || defaultDate || new Date().toISOString().split('T')[0];
  const existingTime = appointment?.datetime?.split('T')[1]?.substring(0, 5) || 
    (isWalkIn ? new Date().toTimeString().substring(0, 5) : '09:00');
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    setValue
  } = useFormValidation(appointmentSchema, {
    patientId: appointment?.patientId || '',
    date: existingDate,
    time: existingTime,
    clinician: appointment?.clinician || '',
    type: appointment?.type || 'general',
    notes: appointment?.notes || ''
  });
  
  // Filter patients by search
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.id.toLowerCase().includes(patientSearch.toLowerCase())
  );
  
  // Get selected patient
  const selectedPatient = patients.find(p => p.id === values.patientId);
  
  const onFormSubmit = async (data) => {
    // Combine date and time
    const datetime = `${data.date}T${data.time}`;
    
    const appointmentData = {
      patientId: data.patientId,
      datetime,
      clinician: data.clinician,
      type: data.type,
      notes: data.notes,
      isWalkIn: isWalkIn || appointment?.isWalkIn,
      status: isWalkIn 
        ? APPOINTMENT_STATUS.CHECKED_IN 
        : (appointment?.status || APPOINTMENT_STATUS.SCHEDULED)
    };
    
    onSubmit(appointmentData);
  };
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Walk-in Badge */}
      {isWalkIn && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
          <strong>Walk-in patient</strong> — Will be added to queue immediately
        </div>
      )}
      
      {/* Patient Selection */}
      <div className="input-group">
        <label className="label">
          Patient <span className="text-red-500">*</span>
        </label>
        
        {selectedPatient ? (
          <div className="flex items-center gap-3 p-3 bg-clinic-50 border border-clinic-200 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-clinic-500 text-white flex items-center justify-center font-semibold">
              {selectedPatient.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">{selectedPatient.name}</p>
              <p className="text-sm text-slate-500">ID: {selectedPatient.id.slice(0, 12)}...</p>
            </div>
            <button
              type="button"
              onClick={() => setValue('patientId', '')}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Search patients by name or ID..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="input"
            />
            
            {patientSearch && (
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl">
                {filteredPatients.length > 0 ? (
                  filteredPatients.slice(0, 10).map(patient => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => {
                        setValue('patientId', patient.id);
                        setPatientSearch('');
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-left border-b last:border-b-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{patient.name}</p>
                        <p className="text-xs text-slate-500">{patient.contact || 'No contact'}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="p-3 text-sm text-slate-500 text-center">No patients found</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {touched.patientId && errors.patientId && (
          <p className="mt-1.5 text-sm text-red-600">{errors.patientId}</p>
        )}
      </div>
      
      {/* Date & Time Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="input-group">
          <label htmlFor="date" className="label">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            type="date"
            {...getFieldProps('date')}
            className={`input ${touched.date && errors.date ? 'input-error' : ''}`}
          />
          {touched.date && errors.date && (
            <p className="mt-1.5 text-sm text-red-600">{errors.date}</p>
          )}
        </div>
        
        <div className="input-group">
          <label htmlFor="time" className="label">
            Time <span className="text-red-500">*</span>
          </label>
          <input
            id="time"
            type="time"
            {...getFieldProps('time')}
            className={`input ${touched.time && errors.time ? 'input-error' : ''}`}
          />
          {touched.time && errors.time && (
            <p className="mt-1.5 text-sm text-red-600">{errors.time}</p>
          )}
        </div>
      </div>
      
      {/* Clinician & Type Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="input-group">
          <label htmlFor="clinician" className="label">Clinician</label>
          <input
            id="clinician"
            type="text"
            {...getFieldProps('clinician')}
            className={`input ${touched.clinician && errors.clinician ? 'input-error' : ''}`}
            placeholder="e.g., Dr. Smith"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="type" className="label">Visit Type</label>
          <select
            id="type"
            {...getFieldProps('type')}
            className="select"
          >
            {APPOINTMENT_TYPES.map(type => (
              <option key={type} value={type} className="capitalize">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Notes */}
      <div className="input-group">
        <label htmlFor="notes" className="label">Notes</label>
        <textarea
          id="notes"
          {...getFieldProps('notes')}
          className={`input min-h-[80px] ${touched.notes && errors.notes ? 'input-error' : ''}`}
          placeholder="Additional notes about this appointment..."
          rows={2}
        />
      </div>
      
      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving...' : 
           isWalkIn ? 'Add to Queue' :
           isEditing ? 'Update Appointment' : 'Schedule Appointment'}
        </button>
      </div>
    </form>
  );
}

export default AppointmentForm;


