/**
 * Toast Container Component
 * 
 * @description Displays toast notifications from the notification context
 */

import React from 'react';
import { useNotifications } from '../../context/NotificationContext';

// Icon components for each toast type
const ToastIcons = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

function ToastContainer() {
  const { notifications, removeNotification } = useNotifications();
  
  if (notifications.length === 0) return null;
  
  return (
    <div 
      className="toast-container"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className={`toast toast-${notification.type}`}
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            {ToastIcons[notification.type]}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {notification.title && (
              <p className="font-semibold text-sm">{notification.title}</p>
            )}
            {notification.message && (
              <p className="text-sm opacity-90">{notification.message}</p>
            )}
          </div>
          
          {/* Close Button */}
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 ml-2 p-1 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;


