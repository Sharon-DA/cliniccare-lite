/**
 * Loading Spinner Component
 * 
 * @description Animated loading indicator
 * @props
 *   - size: string - Spinner size ('sm', 'md', 'lg')
 *   - text: string - Optional loading text
 */

import React from 'react';

const SIZES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4'
};

function LoadingSpinner({ size = 'md', text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status">
      <div 
        className={`${SIZES[size]} border-clinic-200 border-t-clinic-600 rounded-full animate-spin`}
        aria-hidden="true"
      />
      {text && (
        <span className="text-sm text-slate-500">{text}</span>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default LoadingSpinner;


