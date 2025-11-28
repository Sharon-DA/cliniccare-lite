/**
 * useFormValidation Hook
 * 
 * @description Reusable form validation hook with schema-based validation
 * @features
 *   - Schema-based field validation
 *   - Real-time validation feedback
 *   - Support for required, pattern, min/max, custom validators
 *   - Touch tracking for better UX
 * 
 * @param {Object} schema - Validation schema object
 * @param {Object} initialValues - Initial form values
 * @returns {Object} Form state and validation methods
 */

import { useState, useCallback, useMemo } from 'react';

// Common validation patterns
export const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-+()]{7,20}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+\.?\d*$/
};

// Built-in validator functions
const validators = {
  required: (value, param, fieldName) => {
    if (param && (value === undefined || value === null || value === '' || 
        (Array.isArray(value) && value.length === 0))) {
      return `${fieldName} is required`;
    }
    return null;
  },
  
  minLength: (value, param, fieldName) => {
    if (value && value.length < param) {
      return `${fieldName} must be at least ${param} characters`;
    }
    return null;
  },
  
  maxLength: (value, param, fieldName) => {
    if (value && value.length > param) {
      return `${fieldName} must be no more than ${param} characters`;
    }
    return null;
  },
  
  min: (value, param, fieldName) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue < param) {
      return `${fieldName} must be at least ${param}`;
    }
    return null;
  },
  
  max: (value, param, fieldName) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue > param) {
      return `${fieldName} must be no more than ${param}`;
    }
    return null;
  },
  
  pattern: (value, param, fieldName) => {
    const regex = param instanceof RegExp ? param : new RegExp(param);
    if (value && !regex.test(value)) {
      return `${fieldName} format is invalid`;
    }
    return null;
  },
  
  email: (value, param, fieldName) => {
    if (param && value && !PATTERNS.email.test(value)) {
      return `${fieldName} must be a valid email address`;
    }
    return null;
  },
  
  phone: (value, param, fieldName) => {
    if (param && value && !PATTERNS.phone.test(value)) {
      return `${fieldName} must be a valid phone number`;
    }
    return null;
  },
  
  date: (value, param, fieldName) => {
    if (param && value) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return `${fieldName} must be a valid date`;
      }
    }
    return null;
  },
  
  dateRange: (value, { min, max }, fieldName) => {
    if (value) {
      const date = new Date(value);
      if (min && date < new Date(min)) {
        return `${fieldName} must be after ${min}`;
      }
      if (max && date > new Date(max)) {
        return `${fieldName} must be before ${max}`;
      }
    }
    return null;
  },
  
  match: (value, { field, values }, fieldName) => {
    if (value && values[field] && value !== values[field]) {
      return `${fieldName} must match ${field}`;
    }
    return null;
  },
  
  custom: (value, validatorFn, fieldName, values) => {
    return validatorFn(value, values, fieldName);
  }
};

export function useFormValidation(schema = {}, initialValues = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  /**
   * Validate a single field
   */
  const validateField = useCallback((name, value, allValues = values) => {
    const fieldSchema = schema[name];
    if (!fieldSchema) return null;
    
    const fieldName = fieldSchema.label || name;
    
    for (const [rule, param] of Object.entries(fieldSchema)) {
      if (rule === 'label') continue;
      
      const validator = validators[rule];
      if (!validator) continue;
      
      let error;
      if (rule === 'match') {
        error = validator(value, { field: param, values: allValues }, fieldName);
      } else if (rule === 'custom') {
        error = validator(value, param, fieldName, allValues);
      } else {
        error = validator(value, param, fieldName);
      }
      
      if (error) return error;
    }
    
    return null;
  }, [schema, values]);
  
  /**
   * Validate all fields
   */
  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;
    
    for (const [name] of Object.entries(schema)) {
      const error = validateField(name, values[name], values);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  }, [schema, values, validateField]);
  
  /**
   * Handle input change
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => {
      const updated = { ...prev, [name]: newValue };
      // Validate on change if field has been touched
      if (touched[name]) {
        const error = validateField(name, newValue, updated);
        setErrors(prev => ({ ...prev, [name]: error }));
      }
      return updated;
    });
  }, [touched, validateField]);
  
  /**
   * Handle input blur
   */
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);
  
  /**
   * Set a specific field value
   */
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);
  
  /**
   * Set multiple values at once
   */
  const setMultipleValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);
  
  /**
   * Reset form to initial values
   */
  const reset = useCallback((newInitialValues = initialValues) => {
    setValues(newInitialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  /**
   * Set a specific field error
   */
  const setError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);
  
  /**
   * Check if form is valid
   */
  const isValid = useMemo(() => {
    return Object.values(errors).every(error => !error);
  }, [errors]);
  
  /**
   * Check if form has been modified
   */
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);
  
  /**
   * Get props for an input field
   */
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] ?? '',
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `${name}-error` : undefined
  }), [values, handleChange, handleBlur, errors]);
  
  /**
   * Handle form submission
   */
  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e?.preventDefault();
    
    // Touch all fields
    const allTouched = Object.keys(schema).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    // Validate all fields
    if (!validateAll()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [schema, validateAll, values]);
  
  return {
    // State
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    
    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,
    
    // Setters
    setValue,
    setValues: setMultipleValues,
    setError,
    reset,
    
    // Helpers
    getFieldProps,
    validateField,
    validateAll
  };
}

export default useFormValidation;


