/**
 * Queue Dashboard
 * 
 * @description Display and manage patient queue
 * @workflow Shows patients after triage, ready for consultation
 */

import React, { useState, useMemo } from 'react';
import { useLocalDB } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import { 
  STORAGE_KEYS, 
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
  SERVICE_TYPES 
} from '../utils/constants';
import { formatTime } from '../utils/helpers';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';

function Queue() {
  const { data: appointments, update: updateAppointment } = useLocalDB(STORAGE_KEYS.APPOINTMENTS);
  const { data: patients } = useLocalDB(STORAGE_KEYS.PATIENTS);
  const { data: queue, update: updateQueue, remove: removeFromQueue } = useLocalDB(STORAGE_KEYS.QUEUE);
  const { data: triageRecords } = useLocalDB(STORAGE_KEYS.TRIAGE);
  const { success } = useNotifications();
  
  const [selectedService, setSelectedService] = useState('all');
  const [showDetails, setShowDetails] = useState(null);
  
  // Get patient details
  const getPatient = (patientId) => patients.find(p => p.id === patientId);
  
  // Get triage data
  const getTriage = (appointmentId) => triageRecords.find(t => t.appointmentId === appointmentId);
  
  // Get appointment
  const getAppointment = (appointmentId) => appointments.find(a => a.id === appointmentId);
  
  // Active queue (not completed)
  const activeQueue = useMemo(() => {
    return queue
      .filter(q => !q.completed)
      .filter(q => selectedService === 'all' || q.service === selectedService)
      .sort((a, b) => {
        // Emergency first, then urgent, then by position
        if (a.urgency === 'emergency' && b.urgency !== 'emergency') return -1;
        if (b.urgency === 'emergency' && a.urgency !== 'emergency') return 1;
        if (a.urgency === 'urgent' && b.urgency === 'normal') return -1;
        if (b.urgency === 'urgent' && a.urgency === 'normal') return 1;
        return a.position - b.position;
      });
  }, [queue, selectedService]);
  
  // Stats by service
  const serviceStats = useMemo(() => {
    const stats = {};
    SERVICE_TYPES.forEach(type => {
      stats[type.value] = queue.filter(q => !q.completed && q.service === type.value).length;
    });
    return stats;
  }, [queue]);
  
  // Call next patient
  const handleCallNext = (queueItem) => {
    updateAppointment(queueItem.appointmentId, {
      status: APPOINTMENT_STATUS.WITH_DOCTOR,
      calledAt: new Date().toISOString()
    });
    
    updateQueue(queueItem.id, {
      called: true,
      calledAt: new Date().toISOString()
    });
    
    const patient = getPatient(queueItem.patientId);
    success(`${patient?.name} called for consultation`, 'Queue #' + queueItem.position);
  };
  
  // Skip patient
  const handleSkip = (queueItem) => {
    const maxPosition = Math.max(...activeQueue.map(q => q.position));
    updateQueue(queueItem.id, {
      position: maxPosition + 1,
      skipped: true
    });
    success('Patient moved to end of queue');
  };
  
  // Get wait time in minutes
  const getWaitTime = (addedAt) => {
    return Math.round((new Date() - new Date(addedAt)) / 60000);
  };
  
  // Get urgency color
  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'emergency':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'urgent':
        return 'border-l-4 border-orange-500 bg-orange-50';
      default:
        return 'border-l-4 border-slate-200';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-slate-800">Patient Queue</h1>
        <p className="text-slate-500">Manage patients waiting for consultation</p>
      </div>
      
      {/* Service Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <button
          onClick={() => setSelectedService('all')}
          className={`card p-3 text-center transition-all ${
            selectedService === 'all' ? 'ring-2 ring-clinic-500 bg-clinic-50' : ''
          }`}
        >
          <p className="text-2xl font-bold text-slate-800">{activeQueue.length}</p>
          <p className="text-xs text-slate-500">All Services</p>
        </button>
        {SERVICE_TYPES.slice(0, 6).map(type => (
          <button
            key={type.value}
            onClick={() => setSelectedService(type.value)}
            className={`card p-3 text-center transition-all ${
              selectedService === type.value ? 'ring-2 ring-clinic-500 bg-clinic-50' : ''
            }`}
          >
            <p className="text-2xl font-bold text-slate-800">{serviceStats[type.value] || 0}</p>
            <p className="text-xs text-slate-500 truncate">{type.label}</p>
          </button>
        ))}
      </div>
      
      {/* Queue Display */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Now Serving */}
        <div className="card lg:col-span-1">
          <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-clinic-500 to-clinic-600 rounded-t-xl">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
              Now Serving
            </h2>
          </div>
          
          {(() => {
            const currentPatient = activeQueue.find(q => q.called);
            if (!currentPatient) {
              return (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-500">No patient currently being served</p>
                  <p className="text-sm text-slate-400 mt-1">Call the next patient from the queue</p>
                </div>
              );
            }
            
            const patient = getPatient(currentPatient.patientId);
            const triage = getTriage(currentPatient.appointmentId);
            
            return (
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-clinic-500 to-clinic-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3">
                    {patient?.name?.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{patient?.name}</h3>
                  <p className="text-slate-500">Queue #{currentPatient.position}</p>
                </div>
                
                {triage && (
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chief Complaint:</span>
                      <span className="font-medium text-slate-700">{triage.chiefComplaint || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vitals:</span>
                      <span className="font-medium text-slate-700">
                        BP: {triage.bloodPressure}, T: {triage.temperature}°C
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
        
        {/* Queue List */}
        <div className="card lg:col-span-2">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">
              Waiting ({activeQueue.filter(q => !q.called).length})
            </h2>
          </div>
          
          {activeQueue.filter(q => !q.called).length === 0 ? (
            <EmptyState
              icon="queue"
              title="Queue is empty"
              description="Patients will appear here after triage"
            />
          ) : (
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {activeQueue.filter(q => !q.called).map((queueItem, index) => {
                const patient = getPatient(queueItem.patientId);
                const triage = getTriage(queueItem.appointmentId);
                const waitTime = getWaitTime(queueItem.addedAt);
                const serviceType = SERVICE_TYPES.find(s => s.value === queueItem.service);
                
                return (
                  <div
                    key={queueItem.id}
                    className={`p-4 ${getUrgencyStyle(queueItem.urgency)}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                          ${index === 0 ? 'bg-clinic-500 text-white' : 'bg-slate-100 text-slate-600'}
                        `}>
                          #{queueItem.position}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            {patient?.name}
                            {queueItem.urgency !== 'normal' && (
                              <Badge variant={queueItem.urgency === 'emergency' ? 'danger' : 'warning'}>
                                {queueItem.urgency}
                              </Badge>
                            )}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <span>{serviceType?.label}</span>
                            <span>•</span>
                            <span>Waiting {waitTime} min</span>
                          </div>
                          {triage?.chiefComplaint && (
                            <p className="text-sm text-slate-400 mt-1 truncate max-w-md">
                              {triage.chiefComplaint}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowDetails(queueItem)}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                          title="View details"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleSkip(queueItem)}
                          className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                          title="Skip"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                        </button>
                        {index === 0 && (
                          <button
                            onClick={() => handleCallNext(queueItem)}
                            className="btn-primary"
                          >
                            Call Patient
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Patient Details Modal */}
      <Modal
        isOpen={!!showDetails}
        onClose={() => setShowDetails(null)}
        title="Patient Details"
        size="lg"
      >
        {showDetails && (() => {
          const patient = getPatient(showDetails.patientId);
          const triage = getTriage(showDetails.appointmentId);
          const appointment = getAppointment(showDetails.appointmentId);
          
          return (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-clinic-500 to-clinic-600 flex items-center justify-center text-white text-2xl font-bold">
                  {patient?.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{patient?.name}</h3>
                  <p className="text-slate-500">{patient?.gender === 'M' ? 'Male' : 'Female'} • {patient?.contact}</p>
                </div>
              </div>
              
              {/* Triage Data */}
              {triage && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Triage Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Temperature</p>
                      <p className="font-semibold text-slate-800">{triage.temperature}°C</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Blood Pressure</p>
                      <p className="font-semibold text-slate-800">{triage.bloodPressure}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Pulse</p>
                      <p className="font-semibold text-slate-800">{triage.pulse} bpm</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Weight</p>
                      <p className="font-semibold text-slate-800">{triage.weight || '-'} kg</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Height</p>
                      <p className="font-semibold text-slate-800">{triage.height || '-'} cm</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">BMI</p>
                      <p className="font-semibold text-slate-800">{triage.bmi || '-'}</p>
                    </div>
                  </div>
                  
                  {triage.chiefComplaint && (
                    <div className="mt-4 bg-amber-50 p-4 rounded-lg">
                      <p className="text-xs text-amber-600 font-medium mb-1">Chief Complaint</p>
                      <p className="text-slate-800">{triage.chiefComplaint}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleCallNext(showDetails);
                    setShowDetails(null);
                  }}
                  className="btn-primary flex-1"
                >
                  Call Patient
                </button>
                <button
                  onClick={() => setShowDetails(null)}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

export default Queue;

