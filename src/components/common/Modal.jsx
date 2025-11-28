/**
 * Modal Component
 * 
 * @description Reusable modal dialog component with accessible markup
 * @props
 *   - isOpen: boolean - Whether modal is visible
 *   - onClose: function - Close handler
 *   - title: string - Modal title
 *   - size: string - Modal size ('sm', 'md', 'lg', 'xl', 'full')
 *   - children: ReactNode - Modal content
 *   - footer: ReactNode - Optional footer content
 */

import React, { useEffect, useCallback } from 'react';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  full: 'max-w-full mx-4'
};

function Modal({ 
  isOpen, 
  onClose, 
  title, 
  size = 'md', 
  children, 
  footer,
  showCloseButton = true 
}) {
  // Handle escape key
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);
  
  // Add/remove escape listener and prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`modal-content ${SIZES[size]}`}>
        {/* Header */}
        <div className="modal-header">
          <h2 id="modal-title" className="text-lg font-heading font-semibold text-slate-800">
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="btn-icon text-slate-400 hover:text-slate-600"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Body */}
        <div className="modal-body">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;

