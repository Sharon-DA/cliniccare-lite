/**
 * Lab Page
 * 
 * @description Manage lab test orders and results
 * @workflow Optional step - Records lab results
 */

import React, { useState, useMemo } from 'react';
import { useLocalDB } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import { 
  STORAGE_KEYS, 
  APPOINTMENT_STATUS,
  LAB_TESTS
} from '../utils/constants';
import { formatDate, formatTime } from '../utils/helpers';
import SearchInput from '../components/common/SearchInput';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';

function Lab() {
  const { data: appointments, update: updateAppointment } = useLocalDB(STORAGE_KEYS.APPOINTMENTS);
  const { data: patients } = useLocalDB(STORAGE_KEYS.PATIENTS);
  const { data: labOrders, update: updateLabOrder } = useLocalDB(STORAGE_KEYS.LAB_ORDERS);
  const { success, error: showError } = useNotifications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [results, setResults] = useState({});
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  
  // Get patient details
  const getPatient = (patientId) => patients.find(p => p.id === patientId);
  
  // Pending lab orders
  const pendingOrders = useMemo(() => {
    return labOrders
      .filter(order => order.status === 'pending' || order.status === 'in-progress')
      .filter(order => {
        const patient = getPatient(order.patientId);
        return searchQuery === '' || 
          patient?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));
  }, [labOrders, patients, searchQuery]);
  
  // Completed today
  const completedToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return labOrders.filter(order => {
      const completedDate = order.completedAt?.split('T')[0];
      return completedDate === today;
    });
  }, [labOrders]);
  
  // Start test
  const handleStartTest = (order) => {
    updateLabOrder(order.id, {
      status: 'in-progress',
      startedAt: new Date().toISOString()
    });
    success('Lab tests started');
    setSelectedOrder({ ...order, status: 'in-progress' });
  };
  
  // Open result entry modal
  const openResultEntry = (test) => {
    setCurrentTest(test);
    setShowResultModal(true);
  };
  
  // Save result for a test
  const saveResult = (value, notes) => {
    setResults(prev => ({
      ...prev,
      [currentTest.code]: {
        value,
        notes,
        recordedAt: new Date().toISOString()
      }
    }));
    setShowResultModal(false);
    setCurrentTest(null);
  };
  
  // Complete lab order
  const handleComplete = () => {
    if (!selectedOrder) return;
    
    const allCompleted = selectedOrder.tests.every(test => results[test.code]);
    
    if (!allCompleted) {
      showError('Please enter results for all tests');
      return;
    }
    
    try {
      // Update lab order
      updateLabOrder(selectedOrder.id, {
        status: 'completed',
        results,
        completedAt: new Date().toISOString(),
        completedBy: 'Lab Technician'
      });
      
      // Update appointment - send back to doctor for review
      const appointment = appointments.find(a => a.id === selectedOrder.appointmentId);
      if (appointment) {
        updateAppointment(selectedOrder.appointmentId, {
          status: APPOINTMENT_STATUS.LAB_RESULTS_READY,
          labCompletedAt: new Date().toISOString()
        });
      }
      
      const patient = getPatient(selectedOrder.patientId);
      success(`Lab results saved for ${patient?.name}`, 'Sent to Doctor for Review');
      
      setSelectedOrder(null);
      setResults({});
    } catch (err) {
      showError('Failed to save lab results');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-slate-800">Laboratory</h1>
        <p className="text-slate-500">Manage lab tests and record results</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 text-center bg-indigo-50 border-indigo-200">
          <p className="text-3xl font-bold text-indigo-600">{pendingOrders.length}</p>
          <p className="text-sm text-indigo-600">Pending Orders</p>
        </div>
        <div className="card p-4 text-center bg-yellow-50 border-yellow-200">
          <p className="text-3xl font-bold text-yellow-600">
            {pendingOrders.filter(o => o.status === 'in-progress').length}
          </p>
          <p className="text-sm text-yellow-600">In Progress</p>
        </div>
        <div className="card p-4 text-center bg-green-50 border-green-200">
          <p className="text-3xl font-bold text-green-600">{completedToday.length}</p>
          <p className="text-sm text-green-600">Completed Today</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-slate-600">
            {pendingOrders.reduce((sum, o) => sum + o.tests.length, 0)}
          </p>
          <p className="text-sm text-slate-500">Total Tests</p>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lab Orders */}
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-3">Lab Orders</h2>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search patients..."
            />
          </div>
          
          {pendingOrders.length === 0 ? (
            <EmptyState
              icon="lab"
              title="No pending lab orders"
              description="Lab orders will appear here after consultation"
            />
          ) : (
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {pendingOrders.map((order) => {
                const patient = getPatient(order.patientId);
                const waitTime = Math.round((new Date() - new Date(order.orderedAt)) / 60000);
                
                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      setResults(order.results || {});
                    }}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedOrder?.id === order.id 
                        ? 'bg-indigo-50 border-l-4 border-indigo-500' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          order.status === 'in-progress' 
                            ? 'bg-yellow-100' 
                            : 'bg-indigo-100'
                        }`}>
                          <svg className={`w-5 h-5 ${
                            order.status === 'in-progress' 
                              ? 'text-yellow-600' 
                              : 'text-indigo-600'
                          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-800">{patient?.name}</h3>
                          <p className="text-sm text-slate-500">
                            {order.tests.length} test(s) • {waitTime} min ago
                          </p>
                        </div>
                      </div>
                      <Badge variant={order.status === 'in-progress' ? 'warning' : 'info'}>
                        {order.status === 'in-progress' ? 'In Progress' : 'Pending'}
                      </Badge>
                    </div>
                    
                    {/* Tests preview */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {order.tests.map((test, idx) => (
                        <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          {test.code}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Test Results Entry */}
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">Enter Results</h2>
          </div>
          
          {!selectedOrder ? (
            <div className="p-12 text-center">
              <svg className="w-20 h-20 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-slate-500">Select a lab order to enter results</p>
            </div>
          ) : (() => {
            const patient = getPatient(selectedOrder.patientId);
            
            return (
              <div className="p-4">
                {/* Patient Info */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                      {patient?.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{patient?.name}</h3>
                      <p className="text-sm text-slate-500">
                        Ordered: {formatTime(selectedOrder.orderedAt)}
                      </p>
                    </div>
                  </div>
                  
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={() => handleStartTest(selectedOrder)}
                      className="btn-secondary"
                    >
                      Start Tests
                    </button>
                  )}
                </div>
                
                {/* Tests List */}
                <div className="space-y-3 max-h-[350px] overflow-y-auto">
                  {selectedOrder.tests.map((test) => {
                    const hasResult = results[test.code];
                    
                    return (
                      <div
                        key={test.code}
                        className={`p-3 rounded-lg border-2 ${
                          hasResult 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-slate-800 flex items-center gap-2">
                              {hasResult && (
                                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {test.name}
                            </h4>
                            <p className="text-sm text-slate-500">Code: {test.code}</p>
                            {hasResult && (
                              <p className="text-sm text-green-600 mt-1">
                                Result: {results[test.code].value}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => openResultEntry(test)}
                            className={`px-3 py-1.5 text-sm rounded-lg ${
                              hasResult 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            }`}
                          >
                            {hasResult ? 'Edit' : 'Enter Result'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Progress */}
                <div className="mt-4 mb-4">
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>
                      {Object.keys(results).length} / {selectedOrder.tests.length}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{
                        width: `${(Object.keys(results).length / selectedOrder.tests.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedOrder(null);
                      setResults({});
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={Object.keys(results).length !== selectedOrder.tests.length}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    Complete & Send Results
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      
      {/* Result Entry Modal */}
      <Modal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          setCurrentTest(null);
        }}
        title={`Enter Result: ${currentTest?.name || ''}`}
      >
        {currentTest && (
          <ResultEntryForm
            test={currentTest}
            existingResult={results[currentTest.code]}
            onSave={saveResult}
            onCancel={() => {
              setShowResultModal(false);
              setCurrentTest(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

// Result Entry Form Component
function ResultEntryForm({ test, existingResult, onSave, onCancel }) {
  const [value, setValue] = useState(existingResult?.value || '');
  const [notes, setNotes] = useState(existingResult?.notes || '');
  
  return (
    <div className="space-y-4">
      <div className="input-group">
        <label className="label">Test Result *</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input"
          placeholder="Enter test result..."
        />
        <p className="text-xs text-slate-400 mt-1">
          Enter the result value (e.g., "Positive", "120 mg/dL", "Normal")
        </p>
      </div>
      
      <div className="input-group">
        <label className="label">Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input min-h-[80px]"
          placeholder="Additional observations..."
        />
      </div>
      
      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button
          onClick={() => onSave(value, notes)}
          disabled={!value.trim()}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          Save Result
        </button>
      </div>
    </div>
  );
}

export default Lab;

