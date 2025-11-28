/**
 * Notification Context
 * 
 * @description Provides toast notification system throughout the app
 * @features
 *   - Multiple notification types (success, error, warning, info)
 *   - Auto-dismiss with configurable duration
 *   - Stack multiple notifications
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const NotificationContext = createContext(null);

// Default durations for different notification types (ms)
const DEFAULT_DURATIONS = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3500
};

/**
 * NotificationProvider Component
 * Manages notification state and provides methods to show notifications
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  
  /**
   * Remove a notification by ID
   * @param {string} id - Notification ID to remove
   */
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  /**
   * Add a new notification
   * @param {Object} notification - Notification configuration
   * @returns {string} Notification ID
   */
  const addNotification = useCallback(({ type = 'info', title, message, duration }) => {
    const id = uuidv4();
    const actualDuration = duration ?? DEFAULT_DURATIONS[type] ?? 3000;
    
    const notification = {
      id,
      type,
      title,
      message,
      createdAt: Date.now()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-dismiss after duration
    if (actualDuration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, actualDuration);
    }
    
    return id;
  }, [removeNotification]);
  
  // Convenience methods for each notification type
  const success = useCallback((message, title = 'Success') => {
    return addNotification({ type: 'success', title, message });
  }, [addNotification]);
  
  const error = useCallback((message, title = 'Error') => {
    return addNotification({ type: 'error', title, message });
  }, [addNotification]);
  
  const warning = useCallback((message, title = 'Warning') => {
    return addNotification({ type: 'warning', title, message });
  }, [addNotification]);
  
  const info = useCallback((message, title = 'Info') => {
    return addNotification({ type: 'info', title, message });
  }, [addNotification]);
  
  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);
  
  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
    clearAll
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Custom hook to access notification context
 * @returns {Object} Notification context value
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

