/**
 * Dashboard Page
 * 
 * @description Main dashboard with stats overview and quick actions
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocalDB } from '../hooks/useLocalDB';
import { STORAGE_KEYS, APPOINTMENT_STATUS } from '../utils/constants';
import { formatDate, isDateToday, isPast, daysUntil, isWithinDays } from '../utils/helpers';
import Badge from '../components/common/Badge';

function Dashboard() {
  const { user, hasRole } = useAuth();
  const { data: patients } = useLocalDB(STORAGE_KEYS.PATIENTS);
  const { data: inventory } = useLocalDB(STORAGE_KEYS.INVENTORY);
  const { data: appointments } = useLocalDB(STORAGE_KEYS.APPOINTMENTS);
  
  // Get settings for thresholds
  const { data: settingsArray } = useLocalDB(STORAGE_KEYS.SETTINGS);
  const settings = settingsArray[0] || { lowStockThreshold: 20, nearExpiryDays: 30 };
  
  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Today's appointments
    const todayAppointments = appointments.filter(apt => 
      apt.datetime?.startsWith(today)
    );
    
    const checkedIn = todayAppointments.filter(apt => 
      ['checked_in', 'in_progress', 'completed'].includes(apt.status)
    ).length;
    
    const noShows = todayAppointments.filter(apt => 
      apt.status === APPOINTMENT_STATUS.NO_SHOW
    ).length;
    
    // Low stock items
    const lowStock = inventory.filter(item => 
      item.quantity <= settings.lowStockThreshold
    );
    
    // Near expiry items
    const nearExpiry = inventory.filter(item => 
      item.expiryDate && isWithinDays(item.expiryDate, settings.nearExpiryDays)
    );
    
    // Expired items
    const expired = inventory.filter(item => 
      item.expiryDate && isPast(item.expiryDate)
    );
    
    return {
      totalPatients: patients.length,
      totalInventory: inventory.length,
      todayAppointments: todayAppointments.length,
      checkedIn,
      noShows,
      lowStock,
      nearExpiry,
      expired
    };
  }, [patients, inventory, appointments, settings]);
  
  // Get upcoming appointments
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter(apt => new Date(apt.datetime) >= now && apt.status === APPOINTMENT_STATUS.SCHEDULED)
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
      .slice(0, 5);
  }, [appointments]);
  
  // Get recent patients
  const recentPatients = useMemo(() => {
    return [...patients]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5);
  }, [patients]);
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="card bg-gradient-to-r from-clinic-500 to-clinic-600 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-heading font-bold mb-1">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
            </h2>
            <p className="text-white/80">
              Here's what's happening at your clinic today.
            </p>
          </div>
          <div className="flex gap-3">
            {hasRole(['clinician', 'admin']) && (
              <Link to="/patients" className="btn bg-white/20 hover:bg-white/30 text-white backdrop-blur">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Patient
              </Link>
            )}
            {hasRole(['clinician', 'admin']) && (
              <Link to="/appointments" className="btn bg-white text-clinic-600 hover:bg-white/90">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        {hasRole(['clinician', 'admin']) && (
          <div className="stat-card">
            <div className="stat-icon from-blue-400 to-blue-600 shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="stat-value">{stats.totalPatients}</p>
              <p className="stat-label">Total Patients</p>
            </div>
          </div>
        )}
        
        {/* Today's Appointments */}
        {hasRole(['clinician', 'admin']) && (
          <div className="stat-card">
            <div className="stat-icon from-clinic-400 to-clinic-600 shadow-clinic-500/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="stat-value">{stats.todayAppointments}</p>
              <p className="stat-label">Today's Appointments</p>
              {stats.checkedIn > 0 && (
                <p className="text-xs text-green-600 mt-1">{stats.checkedIn} checked in</p>
              )}
            </div>
          </div>
        )}
        
        {/* Inventory Items */}
        <div className="stat-card">
          <div className="stat-icon from-purple-400 to-purple-600 shadow-purple-500/30">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p className="stat-value">{stats.totalInventory}</p>
            <p className="stat-label">Inventory Items</p>
          </div>
        </div>
        
        {/* Alerts */}
        <div className="stat-card">
          <div className={`stat-icon ${stats.lowStock.length + stats.expired.length > 0 
            ? 'from-red-400 to-red-600 shadow-red-500/30' 
            : 'from-green-400 to-green-600 shadow-green-500/30'}`}>
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <p className="stat-value">{stats.lowStock.length + stats.nearExpiry.length + stats.expired.length}</p>
            <p className="stat-label">Active Alerts</p>
          </div>
        </div>
      </div>
      
      {/* Alerts Section */}
      {(stats.lowStock.length > 0 || stats.nearExpiry.length > 0 || stats.expired.length > 0) && (
        <div className="space-y-3">
          <h3 className="text-lg font-heading font-semibold text-slate-800">⚠️ Alerts</h3>
          
          {/* Expired Items */}
          {stats.expired.length > 0 && (
            <div className="alert-danger">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">Expired Items ({stats.expired.length})</p>
                <p className="text-sm mt-1">
                  {stats.expired.map(item => item.name).join(', ')}
                </p>
              </div>
              <Link to="/inventory" className="btn-ghost text-red-700 text-sm">View</Link>
            </div>
          )}
          
          {/* Low Stock */}
          {stats.lowStock.length > 0 && (
            <div className="alert-warning">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">Low Stock ({stats.lowStock.length})</p>
                <p className="text-sm mt-1">
                  {stats.lowStock.map(item => `${item.name} (${item.quantity})`).join(', ')}
                </p>
              </div>
              <Link to="/inventory" className="btn-ghost text-amber-700 text-sm">View</Link>
            </div>
          )}
          
          {/* Near Expiry */}
          {stats.nearExpiry.length > 0 && (
            <div className="alert-info">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">Expiring Soon ({stats.nearExpiry.length})</p>
                <p className="text-sm mt-1">
                  {stats.nearExpiry.map(item => `${item.name} (${daysUntil(item.expiryDate)} days)`).join(', ')}
                </p>
              </div>
              <Link to="/inventory" className="btn-ghost text-blue-700 text-sm">View</Link>
            </div>
          )}
        </div>
      )}
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        {hasRole(['clinician', 'admin']) && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold text-slate-800">
                Upcoming Appointments
              </h3>
              <Link to="/appointments" className="text-sm text-clinic-600 hover:text-clinic-700 font-medium">
                View all →
              </Link>
            </div>
            
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map(apt => {
                  const patient = patients.find(p => p.id === apt.patientId);
                  return (
                    <div key={apt.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-clinic-100 text-clinic-600 
                                      flex items-center justify-center font-semibold text-sm">
                        {patient?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {patient?.name || 'Unknown Patient'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDate(apt.datetime, 'MMM d')} at {formatDate(apt.datetime, 'h:mm a')}
                        </p>
                      </div>
                      <Badge variant={isDateToday(apt.datetime) ? 'primary' : 'neutral'} size="sm">
                        {isDateToday(apt.datetime) ? 'Today' : formatDate(apt.datetime, 'EEE')}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No upcoming appointments</p>
              </div>
            )}
          </div>
        )}
        
        {/* Recent Patients */}
        {hasRole(['clinician', 'admin']) && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold text-slate-800">
                Recent Patients
              </h3>
              <Link to="/patients" className="text-sm text-clinic-600 hover:text-clinic-700 font-medium">
                View all →
              </Link>
            </div>
            
            {recentPatients.length > 0 ? (
              <div className="space-y-3">
                {recentPatients.map(patient => (
                  <Link 
                    key={patient.id} 
                    to={`/patients/${patient.id}`}
                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 
                                    flex items-center justify-center font-semibold text-sm">
                      {patient.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{patient.name}</p>
                      <p className="text-sm text-slate-500">
                        {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'} • 
                        {patient.dob ? ` ${formatDate(patient.dob)}` : ' No DOB'}
                      </p>
                    </div>
                    <Badge variant="neutral" size="sm">
                      {patient.visits?.length || 0} visits
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No patients yet</p>
                <Link to="/patients" className="btn-primary mt-4">
                  Add First Patient
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* Quick Stats for Inventory Manager */}
        {hasRole(['inventory_manager']) && !hasRole(['clinician', 'admin']) && (
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-heading font-semibold text-slate-800 mb-4">
              Inventory Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-green-600">{stats.totalInventory}</p>
                <p className="text-sm text-green-700">Total Items</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-amber-600">{stats.lowStock.length}</p>
                <p className="text-sm text-amber-700">Low Stock</p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-red-600">{stats.expired.length}</p>
                <p className="text-sm text-red-700">Expired</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;


