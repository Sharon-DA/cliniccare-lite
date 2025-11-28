/**
 * Badge Component
 * 
 * @description Status badge with various color variants
 * @props
 *   - variant: string - Color variant
 *   - children: ReactNode - Badge content
 *   - size: string - Badge size
 */

import React from 'react';

const VARIANTS = {
  success: 'bg-green-100 text-green-700 ring-green-600/20',
  warning: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  danger: 'bg-red-100 text-red-700 ring-red-600/20',
  info: 'bg-blue-100 text-blue-700 ring-blue-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  primary: 'bg-clinic-100 text-clinic-700 ring-clinic-600/20',
  purple: 'bg-purple-100 text-purple-700 ring-purple-600/20'
};

const SIZES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm'
};

function Badge({ 
  variant = 'neutral', 
  size = 'md', 
  children,
  className = '',
  dot = false 
}) {
  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 font-semibold rounded-full ring-1 ring-inset
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' ? 'bg-green-500' :
          variant === 'warning' ? 'bg-amber-500' :
          variant === 'danger' ? 'bg-red-500' :
          variant === 'info' ? 'bg-blue-500' :
          variant === 'primary' ? 'bg-clinic-500' :
          variant === 'purple' ? 'bg-purple-500' :
          'bg-slate-500'
        }`} />
      )}
      {children}
    </span>
  );
}

export default Badge;

