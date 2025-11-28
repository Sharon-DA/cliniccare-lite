/**
 * Login Page
 * 
 * @description User login page with form validation
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useFormValidation } from '../hooks/useFormValidation';

// Validation schema
const loginSchema = {
  username: {
    label: 'Username',
    required: true,
    minLength: 3
  },
  password: {
    label: 'Password',
    required: true,
    minLength: 4
  }
};

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
  } = useFormValidation(loginSchema, {
    username: '',
    password: ''
  });
  
  const onSubmit = async (formData) => {
    setIsLoading(true);
    
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = login(formData.username, formData.password);
    
    if (result.success) {
      success('Welcome back!', 'Login Successful');
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
            Manage Your Clinic<br/>
            <span className="text-white/80">Anywhere, Anytime</span>
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            Offline-first clinic management. Track patients, inventory, and appointments 
            even without internet connection.
          </p>
          
          <div className="mt-8 flex gap-6">
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Offline-first</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Easy Export</span>
            </div>
          </div>
        </div>
        
        <div className="text-white/50 text-sm">
          © 2025 ClinicCare Lite. All rights reserved.
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
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
              Welcome Back
            </h2>
            <p className="text-slate-500">
              Sign in to your account to continue
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username Field */}
            <div className="input-group">
              <label htmlFor="username" className="label">
                Username
              </label>
              <input
                id="username"
                type="text"
                {...getFieldProps('username')}
                className={`input ${touched.username && errors.username ? 'input-error' : ''}`}
                placeholder="Enter your username"
                autoComplete="username"
              />
              {touched.username && errors.username && (
                <p className="mt-1.5 text-sm text-red-600" id="username-error">
                  {errors.username}
                </p>
              )}
            </div>
            
            {/* Password Field */}
            <div className="input-group">
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...getFieldProps('password')}
                className={`input ${touched.password && errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              {touched.password && errors.password && (
                <p className="mt-1.5 text-sm text-red-600" id="password-error">
                  {errors.password}
                </p>
              )}
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
          
          {/* Sign Up Link */}
          <p className="mt-6 text-center text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-clinic-600 hover:text-clinic-700">
              Sign up
            </Link>
          </p>
          
          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
              Demo Credentials
            </p>
            <p className="text-sm text-slate-600">
              Create a new account to get started, or use your existing credentials.
              All data is stored locally in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;


