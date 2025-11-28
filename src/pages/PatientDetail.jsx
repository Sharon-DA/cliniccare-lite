/**
 * Patient Detail Page
 * 
 * @description View and manage individual patient records and visits
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLocalDB } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import { STORAGE_KEYS, IMMUNIZATIONS } from '../utils/constants';
import { formatDate, formatAge, getInitials, downloadFile } from '../utils/helpers';

import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import VisitForm from '../components/patients/VisitForm';

function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: patients, update, remove } = useLocalDB(STORAGE_KEYS.PATIENTS);
  const { success, error: showError } = useNotifications();
  
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Find patient
  const patient = useMemo(() => {
    return patients.find(p => p.id === id);
  }, [patients, id]);
  
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
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Contact</p>
                <p className="font-medium text-slate-800">{patient.contact || '-'}</p>
              </div>
            </div>
            
            {patient.address && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Address</p>
                <p className="text-slate-700">{patient.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Visits Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-heading font-semibold text-slate-800">
            Visit History ({visits.length})
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
            <p>No visits recorded yet</p>
            <button onClick={() => setIsVisitModalOpen(true)} className="btn-outline mt-4">
              Add First Visit
            </button>
          </div>
        )}
      </div>
      
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

