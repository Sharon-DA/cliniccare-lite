/**
 * Visit Form Component
 * 
 * @description Form for adding/editing patient visits with immunizations
 */

import React, { useState } from 'react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { IMMUNIZATIONS } from '../../utils/constants';
import { calculateAgeInMonths } from '../../utils/helpers';
import Badge from '../common/Badge';

// Validation schema
const visitSchema = {
  date: {
    label: 'Visit Date',
    required: true,
    date: true
  },
  reason: {
    label: 'Reason for Visit',
    maxLength: 100
  },
  notes: {
    label: 'Clinical Notes',
    maxLength: 2000
  }
};

function VisitForm({ visit, patientDob, onSubmit, onCancel }) {
  const isEditing = !!visit;
  const [selectedImmunizations, setSelectedImmunizations] = useState(
    visit?.immunizations || []
  );
  const [showImmunizations, setShowImmunizations] = useState(
    visit?.immunizations?.length > 0
  );
  
  const patientAgeMonths = calculateAgeInMonths(patientDob);
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    getFieldProps
  } = useFormValidation(visitSchema, {
    date: visit?.date || new Date().toISOString().split('T')[0],
    reason: visit?.reason || '',
    notes: visit?.notes || ''
  });
  
  const handleImmunizationToggle = (immunization) => {
    const exists = selectedImmunizations.find(i => i.code === immunization.code);
    if (exists) {
      setSelectedImmunizations(prev => prev.filter(i => i.code !== immunization.code));
    } else {
      setSelectedImmunizations(prev => [...prev, { code: immunization.code, batch: '' }]);
    }
  };
  
  const handleBatchChange = (code, batch) => {
    setSelectedImmunizations(prev => 
      prev.map(i => i.code === code ? { ...i, batch } : i)
    );
  };
  
  const onFormSubmit = async (data) => {
    onSubmit({
      ...data,
      immunizations: selectedImmunizations
    });
  };
  
  // Filter immunizations suitable for patient age
  const suitableImmunizations = IMMUNIZATIONS.filter(imm => {
    // Show all if editing or if age is appropriate
    if (isEditing) return true;
    // Allow some margin (6 months before recommended age)
    return patientAgeMonths >= (imm.ageMonths - 6);
  });
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Date & Reason Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="input-group">
          <label htmlFor="date" className="label">
            Visit Date <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            type="date"
            {...getFieldProps('date')}
            className={`input ${touched.date && errors.date ? 'input-error' : ''}`}
            max={new Date().toISOString().split('T')[0]}
          />
          {touched.date && errors.date && (
            <p className="mt-1.5 text-sm text-red-600">{errors.date}</p>
          )}
        </div>
        
        <div className="input-group">
          <label htmlFor="reason" className="label">Reason for Visit</label>
          <input
            id="reason"
            type="text"
            {...getFieldProps('reason')}
            className={`input ${touched.reason && errors.reason ? 'input-error' : ''}`}
            placeholder="e.g., Routine check-up"
          />
        </div>
      </div>
      
      {/* Notes */}
      <div className="input-group">
        <label htmlFor="notes" className="label">Clinical Notes</label>
        <textarea
          id="notes"
          {...getFieldProps('notes')}
          className={`input min-h-[100px] ${touched.notes && errors.notes ? 'input-error' : ''}`}
          placeholder="Enter clinical notes, observations, prescriptions..."
          rows={4}
        />
      </div>
      
      {/* Immunizations Toggle */}
      <div className="border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={() => setShowImmunizations(!showImmunizations)}
          className="flex items-center gap-2 text-slate-700 font-medium hover:text-clinic-600"
        >
          <svg 
            className={`w-5 h-5 transition-transform ${showImmunizations ? 'rotate-90' : ''}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Immunizations ({selectedImmunizations.length} selected)
        </button>
        
        {showImmunizations && (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500 mb-3">
              Select immunizations administered during this visit
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {suitableImmunizations.map(imm => {
                const isSelected = selectedImmunizations.find(i => i.code === imm.code);
                return (
                  <div 
                    key={imm.code}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-clinic-500 bg-clinic-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => handleImmunizationToggle(imm)}
                        className="w-4 h-4 text-clinic-600 rounded border-slate-300 
                                   focus:ring-clinic-500 focus:ring-offset-0"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-slate-800">{imm.name}</span>
                        <span className="ml-2 text-xs text-slate-500">({imm.code})</span>
                      </div>
                    </label>
                    
                    {isSelected && (
                      <div className="mt-2 ml-7">
                        <input
                          type="text"
                          placeholder="Batch number (optional)"
                          value={isSelected.batch}
                          onChange={(e) => handleBatchChange(imm.code, e.target.value)}
                          className="input py-2 text-sm"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {selectedImmunizations.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200">
                <p className="text-sm font-medium text-slate-600 mb-2">Selected:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedImmunizations.map(imm => (
                    <Badge key={imm.code} variant="success">
                      {imm.code}
                      {imm.batch && ` (${imm.batch})`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Visit' : 'Add Visit'}
        </button>
      </div>
    </form>
  );
}

export default VisitForm;

