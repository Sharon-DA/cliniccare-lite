/**
 * Inventory Form Component
 * 
 * @description Form for creating and editing inventory items
 */

import React from 'react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { INVENTORY_CATEGORIES, INVENTORY_UNITS } from '../../utils/constants';

// Validation schema
const inventorySchema = {
  name: {
    label: 'Item Name',
    required: true,
    minLength: 2
  },
  sku: {
    label: 'SKU',
    pattern: /^[A-Za-z0-9\-]+$/
  },
  category: {
    label: 'Category',
    required: true
  },
  batch: {
    label: 'Batch Number'
  },
  quantity: {
    label: 'Quantity',
    required: true,
    min: 0
  },
  unit: {
    label: 'Unit',
    required: true
  },
  expiryDate: {
    label: 'Expiry Date',
    date: true
  },
  storageNotes: {
    label: 'Storage Notes',
    maxLength: 500
  }
};

function InventoryForm({ item, onSubmit, onCancel }) {
  const isEditing = !!item;
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    getFieldProps
  } = useFormValidation(inventorySchema, {
    name: item?.name || '',
    sku: item?.sku || '',
    category: item?.category || '',
    batch: item?.batch || '',
    quantity: item?.quantity ?? '',
    unit: item?.unit || 'units',
    expiryDate: item?.expiryDate || '',
    storageNotes: item?.storageNotes || ''
  });
  
  const onFormSubmit = async (data) => {
    // Convert quantity to number
    data.quantity = parseInt(data.quantity) || 0;
    
    // Preserve transactions if editing
    if (isEditing) {
      data.transactions = item.transactions || [];
    }
    
    onSubmit(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Name & Category Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="input-group">
          <label htmlFor="name" className="label">
            Item Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...getFieldProps('name')}
            className={`input ${touched.name && errors.name ? 'input-error' : ''}`}
            placeholder="e.g., Measles Vaccine"
          />
          {touched.name && errors.name && (
            <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        
        <div className="input-group">
          <label htmlFor="category" className="label">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            {...getFieldProps('category')}
            className={`select ${touched.category && errors.category ? 'input-error' : ''}`}
          >
            <option value="">Select category</option>
            {INVENTORY_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          {touched.category && errors.category && (
            <p className="mt-1.5 text-sm text-red-600">{errors.category}</p>
          )}
        </div>
      </div>
      
      {/* SKU & Batch Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="input-group">
          <label htmlFor="sku" className="label">SKU</label>
          <input
            id="sku"
            type="text"
            {...getFieldProps('sku')}
            className={`input ${touched.sku && errors.sku ? 'input-error' : ''}`}
            placeholder="e.g., VAC-MEAS-001"
          />
          {touched.sku && errors.sku && (
            <p className="mt-1.5 text-sm text-red-600">{errors.sku}</p>
          )}
        </div>
        
        <div className="input-group">
          <label htmlFor="batch" className="label">Batch Number</label>
          <input
            id="batch"
            type="text"
            {...getFieldProps('batch')}
            className={`input ${touched.batch && errors.batch ? 'input-error' : ''}`}
            placeholder="e.g., B001"
          />
        </div>
      </div>
      
      {/* Quantity & Unit Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="input-group">
          <label htmlFor="quantity" className="label">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            id="quantity"
            type="number"
            min="0"
            {...getFieldProps('quantity')}
            className={`input ${touched.quantity && errors.quantity ? 'input-error' : ''}`}
            placeholder="0"
          />
          {touched.quantity && errors.quantity && (
            <p className="mt-1.5 text-sm text-red-600">{errors.quantity}</p>
          )}
          {isEditing && (
            <p className="mt-1 text-xs text-slate-400">
              Use transactions to adjust stock instead of editing directly
            </p>
          )}
        </div>
        
        <div className="input-group">
          <label htmlFor="unit" className="label">
            Unit <span className="text-red-500">*</span>
          </label>
          <select
            id="unit"
            {...getFieldProps('unit')}
            className={`select ${touched.unit && errors.unit ? 'input-error' : ''}`}
          >
            {INVENTORY_UNITS.map(unit => (
              <option key={unit.value} value={unit.value}>{unit.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Expiry Date */}
      <div className="input-group">
        <label htmlFor="expiryDate" className="label">Expiry Date</label>
        <input
          id="expiryDate"
          type="date"
          {...getFieldProps('expiryDate')}
          className={`input ${touched.expiryDate && errors.expiryDate ? 'input-error' : ''}`}
        />
        {touched.expiryDate && errors.expiryDate && (
          <p className="mt-1.5 text-sm text-red-600">{errors.expiryDate}</p>
        )}
      </div>
      
      {/* Storage Notes */}
      <div className="input-group">
        <label htmlFor="storageNotes" className="label">Storage Notes</label>
        <textarea
          id="storageNotes"
          {...getFieldProps('storageNotes')}
          className={`input min-h-[80px] ${touched.storageNotes && errors.storageNotes ? 'input-error' : ''}`}
          placeholder="e.g., Store at 2-8°C, Keep away from light"
          rows={2}
        />
      </div>
      
      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Item' : 'Add Item'}
        </button>
      </div>
    </form>
  );
}

export default InventoryForm;

