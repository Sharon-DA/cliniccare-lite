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
    address: patient?.address || ''
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
          className={`input min-h-[80px] ${touched.address && errors.address ? 'input-error' : ''}`}
          placeholder="Enter patient's address"
          rows={3}
        />
        {touched.address && errors.address && (
          <p className="mt-1.5 text-sm text-red-600">{errors.address}</p>
        )}
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

