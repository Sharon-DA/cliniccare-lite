/**
 * Visit Summary Page
 * 
 * @description Comprehensive view of a patient's visit
 * @workflow Final view showing all visit data
 */

import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLocalDB } from '../hooks/useLocalDB';
import { 
  STORAGE_KEYS, 
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS
} from '../utils/constants';
import { formatDate, formatTime } from '../utils/helpers';
import Badge from '../components/common/Badge';

function VisitSummary() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  const { data: appointments } = useLocalDB(STORAGE_KEYS.APPOINTMENTS);
  const { data: patients } = useLocalDB(STORAGE_KEYS.PATIENTS);
  const { data: triageRecords } = useLocalDB(STORAGE_KEYS.TRIAGE);
  const { data: consultations } = useLocalDB(STORAGE_KEYS.CONSULTATIONS);
  const { data: prescriptions } = useLocalDB(STORAGE_KEYS.PRESCRIPTIONS);
  const { data: labOrders } = useLocalDB(STORAGE_KEYS.LAB_ORDERS);
  
  // Get all visit data
  const visitData = useMemo(() => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return null;
    
    const patient = patients.find(p => p.id === appointment.patientId);
    const triage = triageRecords.find(t => t.appointmentId === appointmentId);
    const consultation = consultations.find(c => c.appointmentId === appointmentId);
    const prescription = prescriptions.find(rx => rx.appointmentId === appointmentId);
    const labOrder = labOrders.find(l => l.appointmentId === appointmentId);
    
    return {
      appointment,
      patient,
      triage,
      consultation,
      prescription,
      labOrder
    };
  }, [appointmentId, appointments, patients, triageRecords, consultations, prescriptions, labOrders]);
  
  if (!visitData) {
    return (
      <div className="card p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Visit Not Found</h2>
        <p className="text-slate-500 mb-4">The requested visit record could not be found.</p>
        <Link to="/appointments" className="btn-primary">
          Back to Appointments
        </Link>
      </div>
    );
  }
  
  const { appointment, patient, triage, consultation, prescription, labOrder } = visitData;
  
  // Print summary
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-slate-500 hover:text-slate-700 mb-2 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-heading font-bold text-slate-800">Visit Summary</h1>
        </div>
        <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
      </div>
      
      {/* Patient & Visit Info */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-clinic-500 to-clinic-600 flex items-center justify-center text-white text-2xl font-bold">
              {patient?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{patient?.name}</h2>
              <p className="text-slate-500">
                {patient?.gender === 'M' ? 'Male' : patient?.gender === 'F' ? 'Female' : 'Other'} • 
                DOB: {formatDate(patient?.dob)} • 
                Contact: {patient?.contact}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Visit Date: {formatDate(appointment.datetime || appointment.date)}
              </p>
            </div>
          </div>
          <Badge className={APPOINTMENT_STATUS_COLORS[appointment.status]}>
            {APPOINTMENT_STATUS_LABELS[appointment.status]}
          </Badge>
        </div>
      </div>
      
      {/* Triage Information */}
      {triage && (
        <div className="card">
          <div className="p-4 border-b border-slate-200 bg-teal-50">
            <h3 className="font-semibold text-teal-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Triage Information
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Temperature</p>
                <p className="text-lg font-bold text-slate-800">{triage.temperature}°C</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Blood Pressure</p>
                <p className="text-lg font-bold text-slate-800">{triage.bloodPressure}</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Pulse</p>
                <p className="text-lg font-bold text-slate-800">{triage.pulse} bpm</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">O2 Saturation</p>
                <p className="text-lg font-bold text-slate-800">{triage.oxygenSaturation || '-'}%</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Weight</p>
                <p className="text-lg font-bold text-slate-800">{triage.weight || '-'} kg</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Height</p>
                <p className="text-lg font-bold text-slate-800">{triage.height || '-'} cm</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">BMI</p>
                <p className="text-lg font-bold text-slate-800">{triage.bmi || '-'}</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Pain Level</p>
                <p className="text-lg font-bold text-slate-800">{triage.painLevel || 0}/10</p>
              </div>
            </div>
            
            {triage.chiefComplaint && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-amber-600 font-medium mb-1">Chief Complaint</p>
                <p className="text-slate-800">{triage.chiefComplaint}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Consultation */}
      {consultation && (
        <div className="card">
          <div className="p-4 border-b border-slate-200 bg-purple-50">
            <h3 className="font-semibold text-purple-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Consultation Notes
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {consultation.complaint && (
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Chief Complaint</p>
                <p className="text-slate-800">{consultation.complaint}</p>
              </div>
            )}
            
            {consultation.history && (
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">History of Present Illness</p>
                <p className="text-slate-800">{consultation.history}</p>
              </div>
            )}
            
            {consultation.examination && (
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Physical Examination</p>
                <p className="text-slate-800">{consultation.examination}</p>
              </div>
            )}
            
            {consultation.diagnosis && consultation.diagnosis.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 font-medium mb-2">Diagnosis</p>
                <div className="flex flex-wrap gap-2">
                  {consultation.diagnosis.map(d => (
                    <Badge key={d.code} variant="info">
                      {d.name} ({d.code})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {consultation.notes && (
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Additional Notes</p>
                <p className="text-slate-800">{consultation.notes}</p>
              </div>
            )}
            
            {consultation.followUpDate && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Follow-up:</strong> {formatDate(consultation.followUpDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Lab Results */}
      {labOrder && labOrder.status === 'completed' && (
        <div className="card">
          <div className="p-4 border-b border-slate-200 bg-indigo-50">
            <h3 className="font-semibold text-indigo-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Lab Results
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {labOrder.tests.map(test => {
                const result = labOrder.results?.[test.code];
                return (
                  <div key={test.code} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800">{test.name}</p>
                      <p className="text-sm text-slate-500">Code: {test.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">{result?.value || 'Pending'}</p>
                      {result?.notes && (
                        <p className="text-xs text-slate-500">{result.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Prescription */}
      {prescription && (
        <div className="card">
          <div className="p-4 border-b border-slate-200 bg-orange-50">
            <h3 className="font-semibold text-orange-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Prescription
              {prescription.dispensed && (
                <Badge variant="success" className="ml-2">Dispensed</Badge>
              )}
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {prescription.medications.map((med, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-800">{med.name}</p>
                  <div className="text-sm text-slate-500 mt-1 space-y-0.5">
                    <p>Dosage: {med.dosage}</p>
                    <p>Frequency: {med.frequency}</p>
                    <p>Duration: {med.duration}</p>
                    {med.instructions && (
                      <p className="text-orange-600">Instructions: {med.instructions}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {prescription.dispensedAt && (
              <p className="text-sm text-slate-500 mt-4">
                Dispensed on: {formatDate(prescription.dispensedAt)} at {formatTime(prescription.dispensedAt)}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Timeline */}
      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Visit Timeline</h3>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {appointment.checkedInAt && (
              <TimelineItem
                time={appointment.checkedInAt}
                title="Checked In"
                icon="check"
                color="green"
              />
            )}
            {triage?.recordedAt && (
              <TimelineItem
                time={triage.recordedAt}
                title="Triage Completed"
                icon="vitals"
                color="teal"
              />
            )}
            {appointment.calledAt && (
              <TimelineItem
                time={appointment.calledAt}
                title="Called for Consultation"
                icon="call"
                color="yellow"
              />
            )}
            {consultation?.completedAt && (
              <TimelineItem
                time={consultation.completedAt}
                title="Consultation Completed"
                icon="document"
                color="purple"
              />
            )}
            {labOrder?.completedAt && (
              <TimelineItem
                time={labOrder.completedAt}
                title="Lab Tests Completed"
                icon="lab"
                color="indigo"
              />
            )}
            {prescription?.dispensedAt && (
              <TimelineItem
                time={prescription.dispensedAt}
                title="Medications Dispensed"
                icon="pharmacy"
                color="orange"
              />
            )}
            {appointment.completedAt && (
              <TimelineItem
                time={appointment.completedAt}
                title="Visit Completed"
                icon="complete"
                color="slate"
                isLast
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Timeline Item Component
function TimelineItem({ time, title, icon, color, isLast = false }) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    teal: 'bg-teal-100 text-teal-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    orange: 'bg-orange-100 text-orange-600',
    slate: 'bg-slate-100 text-slate-600'
  };
  
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {!isLast && <div className="w-0.5 h-full bg-slate-200 my-1" />}
      </div>
      <div className="pb-4">
        <p className="font-medium text-slate-800">{title}</p>
        <p className="text-sm text-slate-500">{formatTime(time)}</p>
      </div>
    </div>
  );
}

export default VisitSummary;

