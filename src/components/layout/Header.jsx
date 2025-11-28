/**
 * Header Component
 * 
 * @description Top header bar with menu toggle, search, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Page titles mapping
const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/patients': 'Patients',
  '/inventory': 'Inventory',
  '/appointments': 'Appointments',
  '/analytics': 'Analytics & Reports',
  '/settings': 'Settings'
};

function Header({ onMenuClick }) {
  const location = useLocation();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Get page title from route
  const pageTitle = PAGE_TITLES[location.pathname] || 
    (location.pathname.startsWith('/patients/') ? 'Patient Details' : 'ClinicCare Lite');
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        {/* Left: Menu Button & Title */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="btn-icon lg:hidden"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Page Title */}
          <div>
            <h1 className="text-xl lg:text-2xl font-heading font-bold text-slate-800">
              {pageTitle}
            </h1>
            <p className="text-sm text-slate-500 hidden sm:block">
              {formatDate(currentTime)}
            </p>
          </div>
        </div>
        
        {/* Right: Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Online/Offline Status */}
          <div className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
            ${isOnline 
              ? 'bg-green-100 text-green-700' 
              : 'bg-amber-100 text-amber-700 animate-pulse-soft'}
          `}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-amber-500'}`} />
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications Bell - Could be expanded later */}
            <button 
              className="btn-icon relative"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            
            {/* User Avatar */}
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-clinic-400 to-clinic-600 
                              flex items-center justify-center text-white font-semibold text-sm
                              ring-2 ring-white shadow-md">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

