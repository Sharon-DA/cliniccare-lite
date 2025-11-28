/**
 * Signup Page
 * 
 * @description User registration page with role selection
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useFormValidation } from '../hooks/useFormValidation';
import { ROLES, ROLE_LABELS } from '../utils/constants';

// Validation schema
const signupSchema = {
  name: {
    label: 'Full Name',
    required: true,
    minLength: 2
  },
  username: {
    label: 'Username',
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/
  },
  password: {
    label: 'Password',
    required: true,
    minLength: 6
  },
  confirmPassword: {
    label: 'Confirm Password',
    required: true,
    custom: (value, values) => {
      if (value !== values.password) {
        return 'Passwords do not match';
      }
      return null;
    }
  },
  role: {
    label: 'Role',
    required: true
  }
};

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { success, error: showError } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldProps
  } = useFormValidation(signupSchema, {
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: ROLES.CLINICIAN
  });
  
  const onSubmit = async (formData) => {
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = signup({
      name: formData.name,
      username: formData.username,
      password: formData.password,
      role: formData.role
    });
    
    if (result.success) {
      success('Your account has been created!', 'Welcome to ClinicCare');
      navigate('/dashboard');
    } else {
      showError(result.message);
    }
    
    setIsLoading(false);
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-clinic-600 via-clinic-500 to-accent-500 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-2xl font-heading font-bold text-white">ClinicCare Lite</span>
          </div>
        </div>
        
        <div className="text-white">
          <h1 className="text-4xl font-heading font-bold mb-4 leading-tight">
            Join ClinicCare<br/>
            <span className="text-white/80">Start Managing Today</span>
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            Create your account and start managing patients, inventory, 
            and appointments in seconds.
          </p>
          
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/10 backdrop-blur rounded-xl">
              <h3 className="font-semibold mb-1">Clinician</h3>
              <p className="text-sm text-white/70">Full access to patients, appointments, and reports</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur rounded-xl">
              <h3 className="font-semibold mb-1">Inventory Manager</h3>
              <p className="text-sm text-white/70">Manage supplies, track stock, and handle logistics</p>
            </div>
          </div>
        </div>
        
        <div className="text-white/50 text-sm">
          © 2025 ClinicCare Lite. All rights reserved.
        </div>
      </div>
      
      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-clinic-500 to-clinic-600 
                            flex items-center justify-center shadow-lg shadow-clinic-500/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-xl font-heading font-bold text-slate-800">ClinicCare Lite</span>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-heading font-bold text-slate-800 mb-2">
              Create Account
            </h2>
            <p className="text-slate-500">
              Get started with ClinicCare Lite
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="input-group">
              <label htmlFor="name" className="label">Full Name</label>
              <input
                id="name"
                type="text"
                {...getFieldProps('name')}
                className={`input ${touched.name && errors.name ? 'input-error' : ''}`}
                placeholder="Enter your full name"
                autoComplete="name"
              />
              {touched.name && errors.name && (
                <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            
            {/* Username */}
            <div className="input-group">
              <label htmlFor="username" className="label">Username</label>
              <input
                id="username"
                type="text"
                {...getFieldProps('username')}
                className={`input ${touched.username && errors.username ? 'input-error' : ''}`}
                placeholder="Choose a username"
                autoComplete="username"
              />
              {touched.username && errors.username && (
                <p className="mt-1.5 text-sm text-red-600">{errors.username}</p>
              )}
              <p className="mt-1 text-xs text-slate-400">Letters, numbers, and underscores only</p>
            </div>
            
            {/* Password */}
            <div className="input-group">
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                {...getFieldProps('password')}
                className={`input ${touched.password && errors.password ? 'input-error' : ''}`}
                placeholder="Create a password"
                autoComplete="new-password"
              />
              {touched.password && errors.password && (
                <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            
            {/* Confirm Password */}
            <div className="input-group">
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                {...getFieldProps('confirmPassword')}
                className={`input ${touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
            
            {/* Role Selection */}
            <div className="input-group">
              <label className="label">Select Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(ROLES).filter(([key]) => key !== 'ADMIN').map(([key, value]) => (
                  <label
                    key={key}
                    className={`
                      flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer
                      transition-all duration-200
                      ${values.role === value 
                        ? 'border-clinic-500 bg-clinic-50 ring-2 ring-clinic-500/20' 
                        : 'border-slate-200 hover:border-slate-300'}
                    `}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={values.role === value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center
                      ${values.role === value ? 'bg-clinic-500 text-white' : 'bg-slate-100 text-slate-500'}
                    `}>
                      {value === ROLES.CLINICIAN ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${values.role === value ? 'text-clinic-700' : 'text-slate-700'}`}>
                        {ROLE_LABELS[value]}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 mt-6"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>
          
          {/* Sign In Link */}
          <p className="mt-6 text-center text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-clinic-600 hover:text-clinic-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;


