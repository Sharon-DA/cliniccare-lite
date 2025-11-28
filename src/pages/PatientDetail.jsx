/**
 * Patient Detail Page
 * 
 * @description View and manage individual patient records and visits
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLocalDB } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import { STORAGE_KEYS, IMMUNIZATIONS, APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '../utils/constants';
import { formatDate, formatAge, getInitials, downloadFile, formatTime } from '../utils/helpers';

import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import VisitForm from '../components/patients/VisitForm';

function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: patients, update, remove } = useLocalDB(STORAGE_KEYS.PATIENTS);
  const { data: appointments } = useLocalDB(STORAGE_KEYS.APPOINTMENTS);
  const { data: consultations } = useLocalDB(STORAGE_KEYS.CONSULTATIONS);
  const { data: triageRecords } = useLocalDB(STORAGE_KEYS.TRIAGE);
  const { data: prescriptions } = useLocalDB(STORAGE_KEYS.PRESCRIPTIONS);
  const { data: labOrders } = useLocalDB(STORAGE_KEYS.LAB_ORDERS);
  const { success, error: showError } = useNotifications();
  
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('consultations');
  
  // Find patient
  const patient = useMemo(() => {
    return patients.find(p => p.id === id);
  }, [patients, id]);
  
  // Get patient's appointments with full consultation data
  const patientConsultations = useMemo(() => {
    if (!patient) return [];
    
    return appointments
      .filter(apt => apt.patientId === patient.id)
      .map(apt => {
        const consultation = consultations.find(c => c.appointmentId === apt.id);
        const triage = triageRecords.find(t => t.appointmentId === apt.id);
        const prescription = prescriptions.find(rx => rx.appointmentId === apt.id);
        const labOrder = labOrders.find(l => l.appointmentId === apt.id);
        return {
          ...apt,
          consultation,
          triage,
          prescription,
          labOrder
        };
      })
      .filter(apt => apt.consultation) // Only show appointments with consultations
      .sort((a, b) => new Date(b.datetime || b.date) - new Date(a.datetime || a.date));
  }, [patient, appointments, consultations, triageRecords, prescriptions, labOrders]);
  
  if (!patient) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Patient Not Found</h2>
        <p className="text-slate-500 mb-4">The patient you're looking for doesn't exist.</p>
        <Link to="/patients" className="btn-primary">Back to Patients</Link>
      </div>
    );
  }
  
  const visits = patient.visits || [];
  
  const handleAddVisit = (visitData) => {
    const newVisit = {
      id: `v_${Date.now()}`,
      ...visitData,
      createdAt: new Date().toISOString()
    };
    
    update(patient.id, {
      visits: [...visits, newVisit]
    });
    
    setIsVisitModalOpen(false);
    success('Visit added successfully');
  };
  
  const handleUpdateVisit = (visitData) => {
    const updatedVisits = visits.map(v => 
      v.id === editingVisit.id ? { ...v, ...visitData, updatedAt: new Date().toISOString() } : v
    );
    
    update(patient.id, { visits: updatedVisits });
    setEditingVisit(null);
    success('Visit updated successfully');
  };
  
  const handleDeleteVisit = (visitId) => {
    const updatedVisits = visits.filter(v => v.id !== visitId);
    update(patient.id, { visits: updatedVisits });
    setDeleteConfirm(null);
    success('Visit deleted successfully');
  };
  
  const handleExportPatient = () => {
    const exportData = JSON.stringify(patient, null, 2);
    downloadFile(exportData, `patient_${patient.id}.json`, 'application/json');
    success('Patient data exported');
  };
  
  // Get immunization info
  const getImmunizationInfo = (code) => {
    return IMMUNIZATIONS.find(i => i.code === code);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/patients" className="hover:text-clinic-600">Patients</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">{patient.name}</span>
      </nav>
      
      {/* Patient Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-clinic-400 to-clinic-600 
                          flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-clinic-500/30">
            {getInitials(patient.name)}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-heading font-bold text-slate-800">{patient.name}</h1>
                <p className="text-slate-500">ID: {patient.id}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleExportPatient} className="btn-secondary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Export
                </button>
              </div>
            </div>
            
            {/* Patient Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Gender</p>
                <p className="font-medium text-slate-800">
                  {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Date of Birth</p>
                <p className="font-medium text-slate-800">{formatDate(patient.dob)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Age</p>
                <p className="font-medium text-slate-800">{formatAge(patient.dob)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Blood Type</p>
                <p className="font-medium text-slate-800">{patient.bloodType || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Contact</p>
                <p className="font-medium text-slate-800">{patient.contact || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Email</p>
                <p className="font-medium text-slate-800">{patient.email || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Next of Kin</p>
                <p className="font-medium text-slate-800">{patient.nextOfKin || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">NOK Contact</p>
                <p className="font-medium text-slate-800">{patient.nextOfKinContact || '-'}</p>
              </div>
            </div>
            
            {patient.address && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Address</p>
                <p className="text-slate-700">{patient.address}</p>
              </div>
            )}
            
            {/* Allergies - Important Medical Alert */}
            {patient.allergies && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Known Allergies
                </p>
                <p className="text-red-800 font-medium">{patient.allergies}</p>
              </div>
            )}
            
            {/* Medical History */}
            {patient.medicalHistory && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-600 uppercase tracking-wide mb-1">Medical History</p>
                <p className="text-slate-700">{patient.medicalHistory}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('consultations')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'consultations'
              ? 'border-clinic-500 text-clinic-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Consultation History ({patientConsultations.length})
        </button>
        <button
          onClick={() => setActiveTab('visits')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'visits'
              ? 'border-clinic-500 text-clinic-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Quick Visits ({visits.length})
        </button>
      </div>
      
      {/* Consultation History Section */}
      {activeTab === 'consultations' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-heading font-semibold text-slate-800">
              Consultation History
            </h2>
          </div>
          
          {patientConsultations.length > 0 ? (
            <div className="space-y-4">
              {patientConsultations.map((apt) => (
                <div key={apt.id} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header with date and status */}
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="info">{formatDate(apt.datetime || apt.date)}</Badge>
                        <Badge className={APPOINTMENT_STATUS_COLORS[apt.status]}>
                          {APPOINTMENT_STATUS_LABELS[apt.status]}
                        </Badge>
                        {apt.clinician && (
                          <span className="text-sm text-slate-500">Dr. {apt.clinician}</span>
                        )}
                      </div>
                      
                      {/* Vitals from triage */}
                      {apt.triage && (
                        <div className="mb-3 p-3 bg-teal-50 rounded-lg">
                          <p className="text-xs text-teal-600 font-medium mb-2">Vitals</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="text-slate-700">BP: <strong>{apt.triage.bloodPressure}</strong></span>
                            <span className="text-slate-700">Temp: <strong>{apt.triage.temperature}°C</strong></span>
                            <span className="text-slate-700">Pulse: <strong>{apt.triage.pulse} bpm</strong></span>
                            {apt.triage.weight && <span className="text-slate-700">Weight: <strong>{apt.triage.weight} kg</strong></span>}
                          </div>
                        </div>
                      )}
                      
                      {/* Chief complaint */}
                      {apt.consultation?.complaint && (
                        <div className="mb-3">
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Chief Complaint</p>
                          <p className="text-slate-700 text-sm">{apt.consultation.complaint}</p>
                        </div>
                      )}
                      
                      {/* Diagnosis */}
                      {apt.consultation?.diagnosis && apt.consultation.diagnosis.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Diagnosis</p>
                          <div className="flex flex-wrap gap-2">
                            {apt.consultation.diagnosis.map((d, idx) => (
                              <Badge key={idx} variant="warning">
                                {d.name} ({d.code})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Medications */}
                      {apt.consultation?.medications && apt.consultation.medications.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Medications</p>
                          <div className="flex flex-wrap gap-2">
                            {apt.consultation.medications.map((med, idx) => (
                              <Badge key={idx} variant="success" size="sm">
                                {med.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Lab tests with results */}
                      {apt.labOrder && apt.labOrder.tests.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Lab Tests</p>
                          <div className="space-y-1">
                            {apt.labOrder.tests.map((test, idx) => {
                              const result = apt.labOrder.results?.[test.code];
                              return (
                                <div key={idx} className="flex items-center justify-between text-sm bg-indigo-50 px-2 py-1 rounded">
                                  <span className="text-indigo-700">{test.code}: {test.name}</span>
                                  {result ? (
                                    <span className="font-medium text-green-600">{result.value}</span>
                                  ) : (
                                    <span className="text-slate-400">Pending</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Prescription status */}
                      {apt.prescription && (
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Prescription</p>
                          <Badge variant={apt.prescription.dispensed ? 'success' : 'warning'}>
                            {apt.prescription.medications.length} medication(s) - 
                            {apt.prescription.dispensed ? ' Dispensed' : ' Pending'}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* View Full Summary Button */}
                    <Link
                      to={`/visit-summary/${apt.id}`}
                      className="btn-secondary whitespace-nowrap"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Summary
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No consultations recorded yet</p>
              <p className="text-sm text-slate-400 mt-1">Schedule an appointment to begin the consultation workflow</p>
              <Link to="/appointments" className="btn-outline mt-4">
                Schedule Appointment
              </Link>
            </div>
          )}
        </div>
      )}
      
      {/* Quick Visits Section */}
      {activeTab === 'visits' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-heading font-semibold text-slate-800">
              Quick Visits ({visits.length})
            </h2>
            <button onClick={() => setIsVisitModalOpen(true)} className="btn-primary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Visit
            </button>
          </div>
          
          {visits.length > 0 ? (
            <div className="space-y-4">
              {[...visits].reverse().map((visit) => (
                <div key={visit.id} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="info">{formatDate(visit.date)}</Badge>
                        {visit.reason && <span className="text-sm text-slate-600">{visit.reason}</span>}
                      </div>
                      
                      {/* Notes */}
                      {visit.notes && (
                        <div className="mb-3">
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Clinical Notes</p>
                          <p className="text-slate-700 text-sm whitespace-pre-wrap">{visit.notes}</p>
                        </div>
                      )}
                      
                      {/* Immunizations */}
                      {visit.immunizations && visit.immunizations.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Immunizations</p>
                          <div className="flex flex-wrap gap-2">
                            {visit.immunizations.map((imm, idx) => {
                              const info = getImmunizationInfo(imm.code);
                              return (
                                <Badge key={idx} variant="success" size="sm">
                                  {info?.name || imm.code}
                                  {imm.batch && ` (${imm.batch})`}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingVisit(visit)}
                        className="btn-icon text-slate-500 hover:text-blue-600"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'visit', id: visit.id })}
                        className="btn-icon text-slate-500 hover:text-red-600"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="text-center py-8 text-slate-500">
              <p>No quick visits recorded yet</p>
              <button onClick={() => setIsVisitModalOpen(true)} className="btn-outline mt-4">
                Add First Visit
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Visit Modal */}
      <Modal
        isOpen={isVisitModalOpen || !!editingVisit}
        onClose={() => {
          setIsVisitModalOpen(false);
          setEditingVisit(null);
        }}
        title={editingVisit ? 'Edit Visit' : 'Add New Visit'}
        size="lg"
      >
        <VisitForm
          visit={editingVisit}
          patientDob={patient.dob}
          onSubmit={editingVisit ? handleUpdateVisit : handleAddVisit}
          onCancel={() => {
            setIsVisitModalOpen(false);
            setEditingVisit(null);
          }}
        />
      </Modal>
      
      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDeleteVisit(deleteConfirm?.id)}
        title="Delete Visit"
        message="Are you sure you want to delete this visit? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}

export default PatientDetail;


