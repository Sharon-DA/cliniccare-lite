/**
 * Appointments Page
 * 
 * @description Appointment scheduling, day view, check-in, and queue management
 */

import React, { useState, useMemo } from 'react';
import { useLocalDB } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import { STORAGE_KEYS, APPOINTMENT_STATUS, APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '../utils/constants';
import { formatDate, formatTime, isDateToday, sortBy } from '../utils/helpers';
import { exportAppointments, exportAttendanceReport } from '../utils/exportUtils';

import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import AppointmentForm from '../components/appointments/AppointmentForm';

function Appointments() {
  const { data: appointments, create, update, remove } = useLocalDB(STORAGE_KEYS.APPOINTMENTS);
  const { data: patients } = useLocalDB(STORAGE_KEYS.PATIENTS);
  const { success, error: showError } = useNotifications();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showWalkIn, setShowWalkIn] = useState(false);
  
  // Get patient name helper
  const getPatientName = (patientId) => {
    return patients.find(p => p.id === patientId)?.name || 'Unknown Patient';
  };
  
  // Filter appointments for selected date
  const dayAppointments = useMemo(() => {
    let result = appointments.filter(apt => 
      apt.datetime?.startsWith(selectedDate)
    );
    
    if (statusFilter) {
      result = result.filter(apt => apt.status === statusFilter);
    }
    
    // Sort by time
    return sortBy(result, 'datetime', 'asc');
  }, [appointments, selectedDate, statusFilter]);
  
  // Calculate stats for the day
  const dayStats = useMemo(() => {
    const dayApts = appointments.filter(apt => apt.datetime?.startsWith(selectedDate));
    return {
      total: dayApts.length,
      scheduled: dayApts.filter(apt => apt.status === APPOINTMENT_STATUS.SCHEDULED).length,
      checkedIn: dayApts.filter(apt => apt.status === APPOINTMENT_STATUS.CHECKED_IN).length,
      inProgress: dayApts.filter(apt => apt.status === APPOINTMENT_STATUS.IN_PROGRESS).length,
      completed: dayApts.filter(apt => apt.status === APPOINTMENT_STATUS.COMPLETED).length,
      noShow: dayApts.filter(apt => apt.status === APPOINTMENT_STATUS.NO_SHOW).length,
      cancelled: dayApts.filter(apt => apt.status === APPOINTMENT_STATUS.CANCELLED).length
    };
  }, [appointments, selectedDate]);
  
  // Queue (walk-ins waiting)
  const queue = useMemo(() => {
    return dayAppointments.filter(apt => 
      apt.isWalkIn && apt.status === APPOINTMENT_STATUS.CHECKED_IN
    );
  }, [dayAppointments]);
  
  const handleCreateAppointment = (data) => {
    // Add patient name for easier reference
    data.patientName = getPatientName(data.patientId);
    create(data);
    setIsModalOpen(false);
    setShowWalkIn(false);
    success('Appointment scheduled');
  };
  
  const handleUpdateAppointment = (data) => {
    data.patientName = getPatientName(data.patientId);
    update(editingAppointment.id, data);
    setEditingAppointment(null);
    success('Appointment updated');
  };
  
  const handleDeleteAppointment = () => {
    if (deleteConfirm) {
      remove(deleteConfirm.id);
      setDeleteConfirm(null);
      success('Appointment deleted');
    }
  };
  
  const handleStatusChange = (appointment, newStatus) => {
    update(appointment.id, { status: newStatus });
    
    const statusMessages = {
      [APPOINTMENT_STATUS.CHECKED_IN]: 'Patient checked in',
      [APPOINTMENT_STATUS.IN_PROGRESS]: 'Appointment started',
      [APPOINTMENT_STATUS.COMPLETED]: 'Appointment completed',
      [APPOINTMENT_STATUS.NO_SHOW]: 'Marked as no-show',
      [APPOINTMENT_STATUS.CANCELLED]: 'Appointment cancelled'
    };
    
    success(statusMessages[newStatus] || 'Status updated');
  };
  
  const handleExport = (format) => {
    try {
      exportAppointments(appointments, format);
      success(`Exported appointments to ${format.toUpperCase()}`);
    } catch (err) {
      showError('Failed to export appointments');
    }
  };
  
  const handleExportAttendance = () => {
    try {
      exportAttendanceReport(appointments, { start: selectedDate, end: selectedDate });
      success('Exported attendance report');
    } catch (err) {
      showError('Failed to export report');
    }
  };
  
  // Quick navigation dates
  const dateOptions = useMemo(() => {
    const today = new Date();
    const dates = [];
    for (let i = -3; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500">
            {formatDate(selectedDate, 'EEEE, MMMM d, yyyy')}
            {isDateToday(selectedDate) && <Badge variant="primary" className="ml-2">Today</Badge>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowWalkIn(true)} className="btn-secondary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Walk-In
          </button>
          <div className="relative group">
            <button className="btn-secondary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-200 
                            opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button 
                onClick={() => handleExport('json')}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-t-xl"
              >
                Export JSON
              </button>
              <button 
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Export CSV
              </button>
              <button 
                onClick={handleExportAttendance}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-b-xl"
              >
                Attendance Report
              </button>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Schedule
          </button>
        </div>
      </div>
      
      {/* Date Navigation */}
      <div className="card p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="btn-icon"
            aria-label="Previous day"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex-1 overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 min-w-max px-2">
              {dateOptions.map(date => {
                const d = new Date(date);
                const isSelected = date === selectedDate;
                const isToday = isDateToday(date);
                
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      flex flex-col items-center px-4 py-2 rounded-xl transition-all
                      ${isSelected 
                        ? 'bg-gradient-to-br from-clinic-500 to-clinic-600 text-white shadow-lg shadow-clinic-500/25' 
                        : 'hover:bg-slate-100'}
                      ${isToday && !isSelected ? 'ring-2 ring-clinic-500' : ''}
                    `}
                  >
                    <span className={`text-xs font-medium ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                      {formatDate(date, 'EEE')}
                    </span>
                    <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {formatDate(date, 'd')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="btn-icon"
            aria-label="Next day"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input w-auto ml-2"
          />
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { key: '', label: 'Total', value: dayStats.total, color: 'slate' },
          { key: APPOINTMENT_STATUS.SCHEDULED, label: 'Scheduled', value: dayStats.scheduled, color: 'blue' },
          { key: APPOINTMENT_STATUS.CHECKED_IN, label: 'Checked In', value: dayStats.checkedIn, color: 'green' },
          { key: APPOINTMENT_STATUS.IN_PROGRESS, label: 'In Progress', value: dayStats.inProgress, color: 'purple' },
          { key: APPOINTMENT_STATUS.COMPLETED, label: 'Completed', value: dayStats.completed, color: 'slate' },
          { key: APPOINTMENT_STATUS.NO_SHOW, label: 'No Show', value: dayStats.noShow, color: 'red' }
        ].map(stat => (
          <button
            key={stat.key}
            onClick={() => setStatusFilter(stat.key)}
            className={`
              p-3 rounded-xl text-center transition-all
              ${statusFilter === stat.key 
                ? `bg-${stat.color}-100 ring-2 ring-${stat.color}-500` 
                : 'bg-white shadow-card hover:shadow-card-hover'}
            `}
          >
            <p className={`text-xl font-bold text-${stat.color}-600`}>{stat.value}</p>
            <p className="text-xs text-slate-500 truncate">{stat.label}</p>
          </button>
        ))}
      </div>
      
      {/* Walk-in Queue */}
      {queue.length > 0 && (
        <div className="card bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-amber-800">Walk-in Queue ({queue.length})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {queue.map(apt => (
              <div key={apt.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                <span className="font-medium text-slate-800">{getPatientName(apt.patientId)}</span>
                <span className="text-sm text-slate-500">{formatTime(apt.datetime)}</span>
                <button
                  onClick={() => handleStatusChange(apt, APPOINTMENT_STATUS.IN_PROGRESS)}
                  className="ml-2 text-clinic-600 hover:text-clinic-700 font-medium text-sm"
                >
                  Start →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Appointments List */}
      {dayAppointments.length > 0 ? (
        <div className="space-y-3">
          {dayAppointments.map((apt) => (
            <div 
              key={apt.id} 
              className={`card p-4 ${apt.status === APPOINTMENT_STATUS.COMPLETED ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Time */}
                <div className="sm:w-20 text-center">
                  <p className="text-lg font-bold text-slate-800">{formatTime(apt.datetime)}</p>
                  {apt.isWalkIn && <Badge variant="warning" size="sm">Walk-in</Badge>}
                </div>
                
                {/* Patient Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800">{getPatientName(apt.patientId)}</p>
                    <Badge variant={
                      apt.status === APPOINTMENT_STATUS.SCHEDULED ? 'info' :
                      apt.status === APPOINTMENT_STATUS.CHECKED_IN ? 'success' :
                      apt.status === APPOINTMENT_STATUS.IN_PROGRESS ? 'purple' :
                      apt.status === APPOINTMENT_STATUS.COMPLETED ? 'neutral' :
                      apt.status === APPOINTMENT_STATUS.NO_SHOW ? 'danger' : 'warning'
                    }>
                      {APPOINTMENT_STATUS_LABELS[apt.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {apt.clinician && <span>Dr. {apt.clinician}</span>}
                    {apt.type && <span className="ml-2 capitalize">• {apt.type}</span>}
                    {apt.notes && <span className="ml-2">• {apt.notes}</span>}
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-1">
                  {/* Status change actions */}
                  {apt.status === APPOINTMENT_STATUS.SCHEDULED && (
                    <>
                      <button
                        onClick={() => handleStatusChange(apt, APPOINTMENT_STATUS.CHECKED_IN)}
                        className="btn-primary py-1.5 px-3 text-sm"
                      >
                        Check In
                      </button>
                      <button
                        onClick={() => handleStatusChange(apt, APPOINTMENT_STATUS.NO_SHOW)}
                        className="btn-ghost text-red-600 py-1.5 px-3 text-sm"
                      >
                        No Show
                      </button>
                    </>
                  )}
                  {apt.status === APPOINTMENT_STATUS.CHECKED_IN && (
                    <button
                      onClick={() => handleStatusChange(apt, APPOINTMENT_STATUS.IN_PROGRESS)}
                      className="btn-primary py-1.5 px-3 text-sm"
                    >
                      Start
                    </button>
                  )}
                  {apt.status === APPOINTMENT_STATUS.IN_PROGRESS && (
                    <button
                      onClick={() => handleStatusChange(apt, APPOINTMENT_STATUS.COMPLETED)}
                      className="btn-primary py-1.5 px-3 text-sm"
                    >
                      Complete
                    </button>
                  )}
                  
                  {/* Edit/Delete */}
                  <button
                    onClick={() => setEditingAppointment(apt)}
                    className="btn-icon text-slate-500 hover:text-blue-600"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(apt)}
                    className="btn-icon text-slate-500 hover:text-red-600"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            title={statusFilter ? 'No appointments with this status' : 'No appointments scheduled'}
            description={statusFilter 
              ? 'Try selecting a different status filter'
              : `Schedule an appointment for ${formatDate(selectedDate, 'MMMM d')}`}
            action={!statusFilter && (
              <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                Schedule Appointment
              </button>
            )}
          />
        </div>
      )}
      
      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen || !!editingAppointment}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAppointment(null);
        }}
        title={editingAppointment ? 'Edit Appointment' : 'Schedule Appointment'}
        size="lg"
      >
        <AppointmentForm
          appointment={editingAppointment}
          patients={patients}
          defaultDate={selectedDate}
          onSubmit={editingAppointment ? handleUpdateAppointment : handleCreateAppointment}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingAppointment(null);
          }}
        />
      </Modal>
      
      {/* Walk-in Modal */}
      <Modal
        isOpen={showWalkIn}
        onClose={() => setShowWalkIn(false)}
        title="Add Walk-In Patient"
        size="lg"
      >
        <AppointmentForm
          patients={patients}
          defaultDate={selectedDate}
          isWalkIn={true}
          onSubmit={handleCreateAppointment}
          onCancel={() => setShowWalkIn(false)}
        />
      </Modal>
      
      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteAppointment}
        title="Cancel Appointment"
        message={`Are you sure you want to delete this appointment for ${getPatientName(deleteConfirm?.patientId)}?`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}

export default Appointments;


