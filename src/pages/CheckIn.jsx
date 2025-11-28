/**
 * Check-In Page
 * 
 * @description Verify appointments and check-in patients
 * @workflow First step - Changes status from 'scheduled' to 'checked_in'
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalDB } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import { 
  STORAGE_KEYS, 
  APPOINTMENT_STATUS, 
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS 
} from '../utils/constants';
import { formatDate, formatTime } from '../utils/helpers';
import SearchInput from '../components/common/SearchInput';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';

function CheckIn() {
  const navigate = useNavigate();
  const { data: appointments, update } = useLocalDB(STORAGE_KEYS.APPOINTMENTS);
  const { data: patients } = useLocalDB(STORAGE_KEYS.PATIENTS);
  const { success, error: showError } = useNotifications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [confirmModal, setConfirmModal] = useState(null);
  
  // Get patient name by ID
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  };
  
  const getPatientDetails = (patientId) => {
    return patients.find(p => p.id === patientId);
  };
  
  // Filter appointments for today that can be checked in
  const todayAppointments = useMemo(() => {
    return appointments
      .filter(apt => {
        const aptDate = apt.datetime?.split('T')[0] || apt.date;
        const matchesDate = aptDate === selectedDate;
        const canCheckIn = apt.status === APPOINTMENT_STATUS.SCHEDULED;
        const matchesSearch = searchQuery === '' || 
          getPatientName(apt.patientId).toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.clinician?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesDate && canCheckIn && matchesSearch;
      })
      .sort((a, b) => {
        const timeA = a.datetime || `${a.date}T${a.time}`;
        const timeB = b.datetime || `${b.date}T${b.time}`;
        return new Date(timeA) - new Date(timeB);
      });
  }, [appointments, patients, selectedDate, searchQuery]);
  
  // Already checked-in appointments
  const checkedInAppointments = useMemo(() => {
    return appointments
      .filter(apt => {
        const aptDate = apt.datetime?.split('T')[0] || apt.date;
        return aptDate === selectedDate && apt.status === APPOINTMENT_STATUS.CHECKED_IN;
      })
      .sort((a, b) => new Date(b.checkedInAt) - new Date(a.checkedInAt));
  }, [appointments, selectedDate]);
  
  // Handle check-in
  const handleCheckIn = (appointment) => {
    try {
      update(appointment.id, {
        status: APPOINTMENT_STATUS.CHECKED_IN,
        checkedInAt: new Date().toISOString()
      });
      success(`${getPatientName(appointment.patientId)} has been checked in`, 'Ready for Triage');
      setConfirmModal(null);
    } catch (err) {
      showError('Failed to check in patient');
    }
  };
  
  // Handle walk-in
  const handleWalkIn = () => {
    navigate('/appointments?walkin=true');
  };
  
  // Stats for today
  const stats = useMemo(() => {
    const todayApts = appointments.filter(apt => {
      const aptDate = apt.datetime?.split('T')[0] || apt.date;
      return aptDate === selectedDate;
    });
    
    return {
      total: todayApts.length,
      waiting: todayApts.filter(a => a.status === APPOINTMENT_STATUS.SCHEDULED).length,
      checkedIn: todayApts.filter(a => a.status === APPOINTMENT_STATUS.CHECKED_IN).length,
      completed: todayApts.filter(a => a.status === APPOINTMENT_STATUS.COMPLETED).length
    };
  }, [appointments, selectedDate]);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-800">Patient Check-In</h1>
          <p className="text-slate-500">Verify appointments and check in patients</p>
        </div>
        <button onClick={handleWalkIn} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add Walk-In
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-sm text-slate-500">Total Today</p>
        </div>
        <div className="card p-4 text-center bg-blue-50 border-blue-200">
          <p className="text-3xl font-bold text-blue-600">{stats.waiting}</p>
          <p className="text-sm text-blue-600">Waiting</p>
        </div>
        <div className="card p-4 text-center bg-green-50 border-green-200">
          <p className="text-3xl font-bold text-green-600">{stats.checkedIn}</p>
          <p className="text-sm text-green-600">Checked In</p>
        </div>
        <div className="card p-4 text-center bg-slate-50">
          <p className="text-3xl font-bold text-slate-600">{stats.completed}</p>
          <p className="text-sm text-slate-500">Completed</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by patient or clinician..."
            />
          </div>
          <div className="sm:w-48">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>
      
      {/* Waiting List */}
      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
            Waiting for Check-In ({todayAppointments.length})
          </h2>
        </div>
        
        {todayAppointments.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="No appointments waiting"
            description="All scheduled patients have been checked in"
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {todayAppointments.map((appointment) => {
              const patient = getPatientDetails(appointment.patientId);
              const time = formatTime(appointment.datetime || `2000-01-01T${appointment.time}`);
              
              return (
                <div key={appointment.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-clinic-500 to-clinic-600 
                                      flex items-center justify-center text-white font-semibold text-lg">
                        {patient?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{patient?.name || 'Unknown'}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {time}
                          </span>
                          <span>•</span>
                          <span>{appointment.clinician || 'Any Doctor'}</span>
                        </div>
                        {appointment.reason && (
                          <p className="text-sm text-slate-400 mt-1">{appointment.reason}</p>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setConfirmModal(appointment)}
                      className="btn-primary whitespace-nowrap"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Check In
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Recently Checked In */}
      {checkedInAppointments.length > 0 && (
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Recently Checked In ({checkedInAppointments.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {checkedInAppointments.slice(0, 5).map((appointment) => {
              const patient = getPatientDetails(appointment.patientId);
              
              return (
                <div key={appointment.id} className="p-4 bg-green-50/50">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800">{patient?.name || 'Unknown'}</h3>
                        <p className="text-sm text-slate-500">
                          Checked in at {formatTime(appointment.checkedInAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">Ready for Triage</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title="Confirm Check-In"
      >
        {confirmModal && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-clinic-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-clinic-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                Check in {getPatientName(confirmModal.patientId)}?
              </h3>
              <p className="text-slate-500 mt-1">
                Appointment at {formatTime(confirmModal.datetime || `2000-01-01T${confirmModal.time}`)}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCheckIn(confirmModal)}
                className="btn-primary flex-1"
              >
                Confirm Check-In
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CheckIn;

