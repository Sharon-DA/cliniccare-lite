/**
 * Transaction Form Component
 * 
 * @description Form for recording inventory intake/outtake transactions
 */

import React, { useState } from 'react';
import { useFormValidation } from '../../hooks/useFormValidation';
import Badge from '../common/Badge';

// Validation schema
const transactionSchema = {
  quantity: {
    label: 'Quantity',
    required: true,
    min: 1
  },
  notes: {
    label: 'Notes',
    maxLength: 200
  }
};

function TransactionForm({ item, onSubmit, onCancel }) {
  const [transactionType, setTransactionType] = useState('out'); // 'in' or 'out'
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    setError
  } = useFormValidation(transactionSchema, {
    quantity: '',
    notes: ''
  });
  
  const maxOut = transactionType === 'out' ? item.quantity : Infinity;
  
  const onFormSubmit = async (data) => {
    const qty = parseInt(data.quantity);
    
    // Validate outtake doesn't exceed stock
    if (transactionType === 'out' && qty > item.quantity) {
      setError('quantity', `Cannot remove more than ${item.quantity} ${item.unit}`);
      return;
    }
    
    onSubmit({
      type: transactionType,
      quantity: qty,
      notes: data.notes
    });
  };
  
  const newQuantity = transactionType === 'in' 
    ? item.quantity + (parseInt(values.quantity) || 0)
    : item.quantity - (parseInt(values.quantity) || 0);
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Current Stock Info */}
      <div className="p-4 bg-slate-50 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Current Stock</p>
            <p className="text-2xl font-bold text-slate-800">
              {item.quantity} <span className="text-sm font-normal text-slate-500">{item.unit}</span>
            </p>
          </div>
          {item.expiryDate && (
            <Badge variant="neutral">
              Expires: {new Date(item.expiryDate).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Transaction Type Toggle */}
      <div className="input-group">
        <label className="label">Transaction Type</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTransactionType('in')}
            className={`
              flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-medium
              transition-all duration-200
              ${transactionType === 'in'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'}
            `}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Stock In
          </button>
          <button
            type="button"
            onClick={() => setTransactionType('out')}
            className={`
              flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-medium
              transition-all duration-200
              ${transactionType === 'out'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'}
            `}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Stock Out
          </button>
        </div>
      </div>
      
      {/* Quantity */}
      <div className="input-group">
        <label htmlFor="quantity" className="label">
          Quantity <span className="text-red-500">*</span>
        </label>
        <input
          id="quantity"
          type="number"
          min="1"
          max={transactionType === 'out' ? item.quantity : undefined}
          {...getFieldProps('quantity')}
          className={`input ${touched.quantity && errors.quantity ? 'input-error' : ''}`}
          placeholder={`Enter ${item.unit} to ${transactionType === 'in' ? 'add' : 'remove'}`}
        />
        {touched.quantity && errors.quantity && (
          <p className="mt-1.5 text-sm text-red-600">{errors.quantity}</p>
        )}
        {transactionType === 'out' && (
          <p className="mt-1 text-xs text-slate-400">
            Maximum: {item.quantity} {item.unit}
          </p>
        )}
      </div>
      
      {/* Notes */}
      <div className="input-group">
        <label htmlFor="notes" className="label">Notes (Optional)</label>
        <input
          id="notes"
          type="text"
          {...getFieldProps('notes')}
          className={`input ${touched.notes && errors.notes ? 'input-error' : ''}`}
          placeholder={transactionType === 'in' 
            ? "e.g., Received from supplier" 
            : "e.g., Dispensed to patient"}
        />
      </div>
      
      {/* New Quantity Preview */}
      {values.quantity && !isNaN(parseInt(values.quantity)) && newQuantity >= 0 && (
        <div className={`p-4 rounded-xl ${
          newQuantity < 0 ? 'bg-red-50' : 
          transactionType === 'in' ? 'bg-green-50' : 'bg-amber-50'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">New Stock Level:</span>
            <span className={`text-xl font-bold ${
              newQuantity < 0 ? 'text-red-600' :
              transactionType === 'in' ? 'text-green-600' : 'text-amber-600'
            }`}>
              {newQuantity} {item.unit}
            </span>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting || (transactionType === 'out' && parseInt(values.quantity) > item.quantity)} 
          className={transactionType === 'in' ? 'btn-primary' : 'btn-danger'}
        >
          {isSubmitting ? 'Processing...' : `Confirm ${transactionType === 'in' ? 'Stock In' : 'Stock Out'}`}
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;


