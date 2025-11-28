/**
 * Confirm Dialog Component
 * 
 * @description Confirmation modal for destructive actions
 * @props
 *   - isOpen: boolean - Whether dialog is visible
 *   - onClose: function - Close handler
 *   - onConfirm: function - Confirm action handler
 *   - title: string - Dialog title
 *   - message: string - Confirmation message
 *   - confirmText: string - Confirm button text
 *   - confirmVariant: string - Button variant ('danger', 'primary')
 */

import React from 'react';
import Modal from './Modal';

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  isLoading = false
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  
  const buttonClass = confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary';
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={buttonClass}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : confirmText}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        {confirmVariant === 'danger' && (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )}
        <p className="text-slate-600">{message}</p>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;


