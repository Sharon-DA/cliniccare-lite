/**
 * Empty State Component
 * 
 * @description Displays a friendly message when there's no data
 * @props
 *   - icon: ReactNode - Icon to display
 *   - title: string - Main message
 *   - description: string - Additional description
 *   - action: ReactNode - Optional action button
 */

import React from 'react';

// Default icon
const DefaultIcon = () => (
  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

function EmptyState({ 
  icon, 
  title = 'No data found', 
  description = 'Get started by creating your first item.', 
  action 
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {icon || <DefaultIcon />}
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">
        {title}
      </h3>
      <p className="text-slate-500 mb-6 max-w-sm">
        {description}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}

export default EmptyState;

