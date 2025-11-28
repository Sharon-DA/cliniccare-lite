/**
 * File Upload Component
 * 
 * @description Drag and drop file upload with preview
 * @props
 *   - onFileSelect: function - Handler when file is selected
 *   - accept: string - Accepted file types
 *   - label: string - Upload label
 */

import React, { useState, useRef } from 'react';

function FileUpload({ 
  onFileSelect, 
  accept = '.json,.csv', 
  label = 'Upload File',
  description = 'Drag and drop or click to select'
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };
  
  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };
  
  const handleFile = (file) => {
    setFileName(file.name);
    onFileSelect(file);
  };
  
  const handleClick = () => {
    inputRef.current?.click();
  };
  
  return (
    <div
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center
        transition-all duration-200 cursor-pointer
        ${isDragging 
          ? 'border-clinic-500 bg-clinic-50' 
          : 'border-slate-300 hover:border-clinic-400 hover:bg-slate-50'}
      `}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={label}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
      
      {/* Icon */}
      <div className={`
        w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center
        ${isDragging ? 'bg-clinic-100 text-clinic-600' : 'bg-slate-100 text-slate-500'}
      `}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      
      {/* Label */}
      <p className="font-medium text-slate-700 mb-1">{label}</p>
      <p className="text-sm text-slate-500">{description}</p>
      
      {/* Selected File */}
      {fileName && (
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-medium text-slate-700">{fileName}</span>
        </div>
      )}
      
      {/* Accepted formats */}
      <p className="mt-4 text-xs text-slate-400">
        Accepted formats: {accept.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')}
      </p>
    </div>
  );
}

export default FileUpload;

