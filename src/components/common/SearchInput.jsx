/**
 * Search Input Component
 * 
 * @description Stylized search input with icon and clear button
 * @props
 *   - value: string - Current search value
 *   - onChange: function - Change handler
 *   - placeholder: string - Placeholder text
 *   - onClear: function - Clear handler
 */

import React from 'react';

function SearchInput({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  className = '',
  autoFocus = false 
}) {
  const handleClear = () => {
    onChange({ target: { value: '' } });
  };
  
  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="input pl-10 pr-10"
        aria-label="Search"
      />
      
      {/* Clear Button */}
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full
                     text-slate-400 hover:text-slate-600 hover:bg-slate-100
                     transition-colors"
          aria-label="Clear search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default SearchInput;


