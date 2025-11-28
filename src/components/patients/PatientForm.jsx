/**
 * Patient Form Component
 * 
 * @description Form for creating and editing patients
 */

import React from 'react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { GENDER_OPTIONS } from '../../utils/constants';

// Validation schema
const patientSchema = {
  name: {
    label: 'Full Name',
    required: true,
    minLength: 2
  },
  dob: {
    label: 'Date of Birth',
    required: true,
    date: true
  },
  gender: {
    label: 'Gender',
    required: true
  },
  contact: {
    label: 'Contact Number',
    phone: true
  },
  email: {
    label: 'Email',
    email: true
  },
  address: {
    label: 'Address',
    maxLength: 200
  },
  nextOfKin: {
    label: 'Next of Kin'
  },
  nextOfKinContact: {
    label: 'Next of Kin Contact',
    phone: true
  },
  bloodType: {
    label: 'Blood Type'
  },
  allergies: {
    label: 'Allergies'
  },
  medicalHistory: {
    label: 'Medical History'
  }
};

function PatientForm({ patient, onSubmit, onCancel }) {
  const isEditing = !!patient;
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    getFieldProps
  } = useFormValidation(patientSchema, {
    name: patient?.name || '',
    dob: patient?.dob || '',
    gender: patient?.gender || '',
    contact: patient?.contact || '',
    email: patient?.email || '',
    address: patient?.address || '',
    nextOfKin: patient?.nextOfKin || '',
    nextOfKinContact: patient?.nextOfKinContact || '',
    bloodType: patient?.bloodType || '',
    allergies: patient?.allergies || '',
    medicalHistory: patient?.medicalHistory || ''
  });
  
  const onFormSubmit = async (data) => {
    // Preserve visits if editing
    if (isEditing) {
      data.visits = patient.visits || [];
    }
    onSubmit(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Name */}
      <div className="input-group">
        <label htmlFor="name" className="label">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...getFieldProps('name')}
          className={`input ${touched.name && errors.name ? 'input-error' : ''}`}
          placeholder="Enter patient's full name"
        />
        {touched.name && errors.name && (
          <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
        )}
      </div>
      
      {/* DOB & Gender Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="input-group">
          <label htmlFor="dob" className="label">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            id="dob"
            type="date"
            {...getFieldProps('dob')}
            className={`input ${touched.dob && errors.dob ? 'input-error' : ''}`}
            max={new Date().toISOString().split('T')[0]}
          />
          {touched.dob && errors.dob && (
            <p className="mt-1.5 text-sm text-red-600">{errors.dob}</p>
          )}
        </div>
        
        <div className="input-group">
          <label htmlFor="gender" className="label">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            {...getFieldProps('gender')}
            className={`select ${touched.gender && errors.gender ? 'input-error' : ''}`}
          >
            <option value="">Select gender</option>
            {GENDER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {touched.gender && errors.gender && (
            <p className="mt-1.5 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>
      </div>
      
      {/* Contact & Email Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="input-group">
          <label htmlFor="contact" className="label">Contact Number</label>
          <input
            id="contact"
            type="tel"
            {...getFieldProps('contact')}
            className={`input ${touched.contact && errors.contact ? 'input-error' : ''}`}
            placeholder="e.g., +1234567890"
          />
          {touched.contact && errors.contact && (
            <p className="mt-1.5 text-sm text-red-600">{errors.contact}</p>
          )}
        </div>
        
        <div className="input-group">
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            {...getFieldProps('email')}
            className={`input ${touched.email && errors.email ? 'input-error' : ''}`}
            placeholder="patient@example.com"
          />
          {touched.email && errors.email && (
            <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
      </div>
      
      {/* Address */}
      <div className="input-group">
        <label htmlFor="address" className="label">Address</label>
        <textarea
          id="address"
          {...getFieldProps('address')}
          className={`input min-h-[60px] ${touched.address && errors.address ? 'input-error' : ''}`}
          placeholder="Enter patient's address"
          rows={2}
        />
        {touched.address && errors.address && (
          <p className="mt-1.5 text-sm text-red-600">{errors.address}</p>
        )}
      </div>
      
      {/* Next of Kin Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="input-group">
          <label htmlFor="nextOfKin" className="label">Next of Kin</label>
          <input
            id="nextOfKin"
            type="text"
            {...getFieldProps('nextOfKin')}
            className="input"
            placeholder="Name of emergency contact"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="nextOfKinContact" className="label">Next of Kin Contact</label>
          <input
            id="nextOfKinContact"
            type="tel"
            {...getFieldProps('nextOfKinContact')}
            className={`input ${touched.nextOfKinContact && errors.nextOfKinContact ? 'input-error' : ''}`}
            placeholder="e.g., +1234567890"
          />
          {touched.nextOfKinContact && errors.nextOfKinContact && (
            <p className="mt-1.5 text-sm text-red-600">{errors.nextOfKinContact}</p>
          )}
        </div>
      </div>
      
      {/* Medical Info Section */}
      <div className="pt-4 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Medical Information</h3>
        
        {/* Blood Type */}
        <div className="input-group mb-4">
          <label htmlFor="bloodType" className="label">Blood Type</label>
          <select
            id="bloodType"
            {...getFieldProps('bloodType')}
            className="select"
          >
            <option value="">Select blood type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
        
        {/* Allergies */}
        <div className="input-group mb-4">
          <label htmlFor="allergies" className="label">
            Known Allergies
            <span className="text-xs text-slate-400 ml-2">(drugs, food, environmental)</span>
          </label>
          <textarea
            id="allergies"
            {...getFieldProps('allergies')}
            className="input min-h-[60px]"
            placeholder="e.g., Penicillin, Peanuts, Latex..."
            rows={2}
          />
        </div>
        
        {/* Medical History */}
        <div className="input-group">
          <label htmlFor="medicalHistory" className="label">
            Medical History
            <span className="text-xs text-slate-400 ml-2">(chronic conditions, past surgeries)</span>
          </label>
          <textarea
            id="medicalHistory"
            {...getFieldProps('medicalHistory')}
            className="input min-h-[80px]"
            placeholder="e.g., Diabetes Type 2, Hypertension, Appendectomy (2015)..."
            rows={3}
          />
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : isEditing ? 'Update Patient' : 'Add Patient'}
        </button>
      </div>
    </form>
  );
}

export default PatientForm;


