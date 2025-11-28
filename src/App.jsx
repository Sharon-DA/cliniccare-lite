/**
 * ClinicCare Lite - Main Application Component
 * 
 * @description Root component handling routing and layout structure
 * @features
 *   - Role-based route protection
 *   - Offline detection
 *   - Responsive sidebar navigation
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ToastContainer from './components/common/ToastContainer';

// Page Components
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Inventory from './pages/Inventory';
import Appointments from './pages/Appointments';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Workflow Pages
import CheckIn from './pages/CheckIn';
import Triage from './pages/Triage';
import Queue from './pages/Queue';
import Consultation from './pages/Consultation';
import Pharmacy from './pages/Pharmacy';
import Lab from './pages/Lab';
import VisitSummary from './pages/VisitSummary';

/**
 * Protected Route Wrapper
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

/**
 * Main Layout Component
 * Includes sidebar, header, and main content area
 */
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="p-4 lg:p-8 pb-24">
          {children}
        </main>
      </div>
      
      {/* Offline Indicator */}
      {isOffline && (
        <div className="offline-banner" role="alert">
          <span className="mr-2">📴</span>
          You're offline. Changes will sync when connection is restored.
        </div>
      )}
      
      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

/**
 * App Component
 * Main application with routing configuration
 */
function App() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />} 
      />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Navigate to="/dashboard" replace />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/patients" element={
        <ProtectedRoute allowedRoles={['clinician', 'admin']}>
          <MainLayout>
            <Patients />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/patients/:id" element={
        <ProtectedRoute allowedRoles={['clinician', 'admin']}>
          <MainLayout>
            <PatientDetail />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/inventory" element={
        <ProtectedRoute allowedRoles={['inventory_manager', 'clinician', 'admin']}>
          <MainLayout>
            <Inventory />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/appointments" element={
        <ProtectedRoute allowedRoles={['clinician', 'admin']}>
          <MainLayout>
            <Appointments />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/analytics" element={
        <ProtectedRoute>
          <MainLayout>
            <Analytics />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Clinic Workflow Routes */}
      <Route path="/check-in" element={
        <ProtectedRoute allowedRoles={['clinician', 'admin']}>
          <MainLayout>
            <CheckIn />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/triage" element={
        <ProtectedRoute allowedRoles={['clinician', 'admin']}>
          <MainLayout>
            <Triage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/queue" element={
        <ProtectedRoute allowedRoles={['clinician', 'admin']}>
          <MainLayout>
            <Queue />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/consultation" element={
        <ProtectedRoute allowedRoles={['clinician', 'admin']}>
          <MainLayout>
            <Consultation />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/pharmacy" element={
        <ProtectedRoute allowedRoles={['clinician', 'inventory_manager', 'admin']}>
          <MainLayout>
            <Pharmacy />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/lab" element={
        <ProtectedRoute allowedRoles={['clinician', 'admin']}>
          <MainLayout>
            <Lab />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/visit/:appointmentId" element={
        <ProtectedRoute allowedRoles={['clinician', 'admin']}>
          <MainLayout>
            <VisitSummary />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;


