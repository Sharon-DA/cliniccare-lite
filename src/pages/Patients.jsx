/**
 * Patients Page
 * 
 * @description Patient list with CRUD operations, search, and export
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLocalDB } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import { STORAGE_KEYS, GENDER_OPTIONS } from '../utils/constants';
import { formatDate, formatAge, searchFilter, getInitials } from '../utils/helpers';
import { exportPatients } from '../utils/exportUtils';

import Modal from '../components/common/Modal';
import SearchInput from '../components/common/SearchInput';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import PatientForm from '../components/patients/PatientForm';

function Patients() {
  const { data: patients, create, update, remove, exportData } = useLocalDB(STORAGE_KEYS.PATIENTS);
  const { success, error: showError } = useNotifications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Filter patients
  const filteredPatients = useMemo(() => {
    let result = patients;
    
    // Search filter
    if (searchQuery) {
      result = searchFilter(result, searchQuery, ['name', 'contact', 'id']);
    }
    
    // Gender filter
    if (genderFilter) {
      result = result.filter(p => p.gender === genderFilter);
    }
    
    // Sort by name
    return result.sort((a, b) => a.name?.localeCompare(b.name));
  }, [patients, searchQuery, genderFilter]);
  
  const handleCreatePatient = (data) => {
    create(data);
    setIsModalOpen(false);
    success('Patient added successfully');
  };
  
  const handleUpdatePatient = (data) => {
    update(editingPatient.id, data);
    setEditingPatient(null);
    success('Patient updated successfully');
  };
  
  const handleDeletePatient = () => {
    if (deleteConfirm) {
      remove(deleteConfirm.id);
      setDeleteConfirm(null);
      success('Patient deleted successfully');
    }
  };
  
  const handleExport = (format) => {
    try {
      exportPatients(patients, format);
      success(`Exported ${patients.length} patients to ${format.toUpperCase()}`);
    } catch (err) {
      showError('Failed to export patients');
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-800">Patients</h1>
          <p className="text-slate-500">{patients.length} total patients</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <button className="btn-secondary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export
            </button>
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-slate-200 
                            opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button 
                onClick={() => handleExport('json')}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-t-xl"
              >
                Export JSON
              </button>
              <button 
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-b-xl"
              >
                Export CSV
              </button>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Patient
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients..."
            className="flex-1"
          />
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="select w-full sm:w-40"
          >
            <option value="">All Genders</option>
            {GENDER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Patient List */}
      {filteredPatients.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Contact</th>
                  <th>Visits</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <Link 
                        to={`/patients/${patient.id}`}
                        className="flex items-center gap-3 hover:text-clinic-600"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-clinic-400 to-clinic-600 
                                        flex items-center justify-center text-white font-semibold text-sm">
                          {getInitials(patient.name)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{patient.name}</p>
                          <p className="text-xs text-slate-400">ID: {patient.id.slice(0, 8)}</p>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <Badge variant={patient.gender === 'M' ? 'info' : patient.gender === 'F' ? 'purple' : 'neutral'}>
                        {GENDER_OPTIONS.find(g => g.value === patient.gender)?.label || patient.gender}
                      </Badge>
                    </td>
                    <td className="text-slate-600">
                      {patient.dob ? formatAge(patient.dob) : '-'}
                    </td>
                    <td className="text-slate-600">
                      {patient.contact || '-'}
                    </td>
                    <td>
                      <Badge variant="neutral">{patient.visits?.length || 0}</Badge>
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Link 
                          to={`/patients/${patient.id}`}
                          className="btn-icon text-slate-500 hover:text-clinic-600"
                          title="View"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setEditingPatient(patient)}
                          className="btn-icon text-slate-500 hover:text-blue-600"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(patient)}
                          className="btn-icon text-slate-500 hover:text-red-600"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            title={searchQuery ? 'No patients found' : 'No patients yet'}
            description={searchQuery 
              ? 'Try adjusting your search or filters' 
              : 'Add your first patient to get started'}
            action={!searchQuery && (
              <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                Add First Patient
              </button>
            )}
          />
        </div>
      )}
      
      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen || !!editingPatient}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPatient(null);
        }}
        title={editingPatient ? 'Edit Patient' : 'Add New Patient'}
        size="lg"
      >
        <PatientForm
          patient={editingPatient}
          onSubmit={editingPatient ? handleUpdatePatient : handleCreatePatient}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingPatient(null);
          }}
        />
      </Modal>
      
      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeletePatient}
        title="Delete Patient"
        message={`Are you sure you want to delete ${deleteConfirm?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}

export default Patients;

