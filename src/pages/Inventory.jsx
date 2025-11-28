/**
 * Inventory Page
 * 
 * @description Inventory management with CRUD, transactions, alerts, and import/export
 */

import React, { useState, useMemo } from 'react';
import { useLocalDB } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import { STORAGE_KEYS, INVENTORY_CATEGORIES, INVENTORY_UNITS } from '../utils/constants';
import { formatDate, searchFilter, isWithinDays, isPast, daysUntil } from '../utils/helpers';
import { exportInventory, exportInventoryTransactions, parseCSVFile } from '../utils/exportUtils';

import Modal from '../components/common/Modal';
import SearchInput from '../components/common/SearchInput';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import FileUpload from '../components/common/FileUpload';
import InventoryForm from '../components/inventory/InventoryForm';
import TransactionForm from '../components/inventory/TransactionForm';

function Inventory() {
  const { data: inventory, create, update, remove, importData } = useLocalDB(STORAGE_KEYS.INVENTORY);
  const { data: settingsArray } = useLocalDB(STORAGE_KEYS.SETTINGS);
  const settings = settingsArray[0] || { lowStockThreshold: 20, nearExpiryDays: 30 };
  const { success, error: showError, warning } = useNotifications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [alertFilter, setAlertFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [transactionItem, setTransactionItem] = useState(null);
  const [showImport, setShowImport] = useState(false);
  
  // Filter inventory
  const filteredInventory = useMemo(() => {
    let result = inventory;
    
    // Search filter
    if (searchQuery) {
      result = searchFilter(result, searchQuery, ['name', 'sku', 'batch']);
    }
    
    // Category filter
    if (categoryFilter) {
      result = result.filter(item => item.category === categoryFilter);
    }
    
    // Alert filter
    if (alertFilter === 'low_stock') {
      result = result.filter(item => item.quantity <= settings.lowStockThreshold);
    } else if (alertFilter === 'near_expiry') {
      result = result.filter(item => 
        item.expiryDate && isWithinDays(item.expiryDate, settings.nearExpiryDays) && !isPast(item.expiryDate)
      );
    } else if (alertFilter === 'expired') {
      result = result.filter(item => item.expiryDate && isPast(item.expiryDate));
    }
    
    // Sort by name
    return result.sort((a, b) => a.name?.localeCompare(b.name));
  }, [inventory, searchQuery, categoryFilter, alertFilter, settings]);
  
  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: inventory.length,
      lowStock: inventory.filter(item => item.quantity <= settings.lowStockThreshold).length,
      nearExpiry: inventory.filter(item => 
        item.expiryDate && isWithinDays(item.expiryDate, settings.nearExpiryDays) && !isPast(item.expiryDate)
      ).length,
      expired: inventory.filter(item => item.expiryDate && isPast(item.expiryDate)).length
    };
  }, [inventory, settings]);
  
  const handleCreateItem = (data) => {
    create({
      ...data,
      transactions: [{
        t: 'in',
        qty: data.quantity,
        date: new Date().toISOString(),
        notes: 'Initial stock'
      }]
    });
    setIsModalOpen(false);
    success('Item added successfully');
  };
  
  const handleUpdateItem = (data) => {
    update(editingItem.id, data);
    setEditingItem(null);
    success('Item updated successfully');
  };
  
  const handleDeleteItem = () => {
    if (deleteConfirm) {
      remove(deleteConfirm.id);
      setDeleteConfirm(null);
      success('Item deleted successfully');
    }
  };
  
  const handleTransaction = (transaction) => {
    const item = transactionItem;
    const newQty = transaction.type === 'in' 
      ? item.quantity + transaction.quantity
      : item.quantity - transaction.quantity;
    
    if (newQty < 0) {
      showError('Cannot reduce stock below zero');
      return;
    }
    
    const newTransaction = {
      t: transaction.type,
      qty: transaction.quantity,
      date: new Date().toISOString(),
      notes: transaction.notes || ''
    };
    
    update(item.id, {
      quantity: newQty,
      transactions: [...(item.transactions || []), newTransaction]
    });
    
    setTransactionItem(null);
    success(`Stock ${transaction.type === 'in' ? 'increased' : 'decreased'} successfully`);
    
    // Check for low stock warning
    if (newQty <= settings.lowStockThreshold) {
      warning(`${item.name} is now low on stock (${newQty} remaining)`);
    }
  };
  
  const handleExport = (format) => {
    try {
      exportInventory(inventory, format);
      success(`Exported ${inventory.length} items to ${format.toUpperCase()}`);
    } catch (err) {
      showError('Failed to export inventory');
    }
  };
  
  const handleExportTransactions = () => {
    try {
      exportInventoryTransactions(inventory);
      success('Exported transaction history');
    } catch (err) {
      showError('Failed to export transactions');
    }
  };
  
  const handleImport = async (file) => {
    try {
      let data;
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        data = await parseCSVFile(file);
        // Transform CSV data to proper format
        data = data.map(item => ({
          id: item.id || `inv_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: item.name,
          sku: item.sku || '',
          category: item.category || 'other',
          batch: item.batch || '',
          quantity: parseInt(item.quantity) || 0,
          unit: item.unit || 'units',
          expiryDate: item.expiryDate || '',
          storageNotes: item.storageNotes || '',
          transactions: []
        }));
      }
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format');
      }
      
      const result = importData(JSON.stringify(data), true);
      if (result.success) {
        success(`Imported ${result.count} items`);
        setShowImport(false);
      } else {
        showError(result.error);
      }
    } catch (err) {
      showError('Failed to import: ' + err.message);
    }
  };
  
  const getStatusBadge = (item) => {
    if (item.expiryDate && isPast(item.expiryDate)) {
      return <Badge variant="danger" dot>Expired</Badge>;
    }
    if (item.quantity <= settings.lowStockThreshold) {
      return <Badge variant="warning" dot>Low Stock</Badge>;
    }
    if (item.expiryDate && isWithinDays(item.expiryDate, settings.nearExpiryDays)) {
      return <Badge variant="info" dot>Expires Soon</Badge>;
    }
    return <Badge variant="success">In Stock</Badge>;
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-800">Inventory</h1>
          <p className="text-slate-500">{inventory.length} total items</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowImport(true)} className="btn-secondary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Import
          </button>
          <div className="relative group">
            <button className="btn-secondary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export
            </button>
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-200 
                            opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button 
                onClick={() => handleExport('json')}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-t-xl"
              >
                Export JSON
              </button>
              <button 
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Export CSV
              </button>
              <button 
                onClick={handleExportTransactions}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-b-xl"
              >
                Export Transactions
              </button>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Item
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setAlertFilter('')}
          className={`p-4 rounded-xl text-center transition-all ${
            alertFilter === '' ? 'bg-clinic-100 ring-2 ring-clinic-500' : 'bg-white shadow-card hover:shadow-card-hover'
          }`}
        >
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-sm text-slate-500">Total Items</p>
        </button>
        <button
          onClick={() => setAlertFilter('low_stock')}
          className={`p-4 rounded-xl text-center transition-all ${
            alertFilter === 'low_stock' ? 'bg-amber-100 ring-2 ring-amber-500' : 'bg-white shadow-card hover:shadow-card-hover'
          }`}
        >
          <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
          <p className="text-sm text-slate-500">Low Stock</p>
        </button>
        <button
          onClick={() => setAlertFilter('near_expiry')}
          className={`p-4 rounded-xl text-center transition-all ${
            alertFilter === 'near_expiry' ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-white shadow-card hover:shadow-card-hover'
          }`}
        >
          <p className="text-2xl font-bold text-blue-600">{stats.nearExpiry}</p>
          <p className="text-sm text-slate-500">Expiring Soon</p>
        </button>
        <button
          onClick={() => setAlertFilter('expired')}
          className={`p-4 rounded-xl text-center transition-all ${
            alertFilter === 'expired' ? 'bg-red-100 ring-2 ring-red-500' : 'bg-white shadow-card hover:shadow-card-hover'
          }`}
        >
          <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
          <p className="text-sm text-slate-500">Expired</p>
        </button>
      </div>
      
      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, SKU, batch..."
            className="flex-1"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select w-full sm:w-44"
          >
            <option value="">All Categories</option>
            {INVENTORY_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Inventory List */}
      {filteredInventory.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>SKU / Batch</th>
                  <th>Quantity</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{item.category}</p>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <p className="text-slate-700">{item.sku || '-'}</p>
                        {item.batch && <p className="text-slate-400">{item.batch}</p>}
                      </div>
                    </td>
                    <td>
                      <span className={`font-semibold ${
                        item.quantity <= settings.lowStockThreshold ? 'text-amber-600' : 'text-slate-800'
                      }`}>
                        {item.quantity}
                      </span>
                      <span className="text-slate-400 text-sm ml-1">{item.unit}</span>
                    </td>
                    <td>
                      {item.expiryDate ? (
                        <div className="text-sm">
                          <p className={isPast(item.expiryDate) ? 'text-red-600 font-medium' : 'text-slate-700'}>
                            {formatDate(item.expiryDate)}
                          </p>
                          <p className="text-xs text-slate-400">
                            {isPast(item.expiryDate) 
                              ? 'Expired' 
                              : `${daysUntil(item.expiryDate)} days`}
                          </p>
                        </div>
                      ) : '-'}
                    </td>
                    <td>{getStatusBadge(item)}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setTransactionItem(item)}
                          className="btn-icon text-slate-500 hover:text-clinic-600"
                          title="Add Transaction"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setEditingItem(item)}
                          className="btn-icon text-slate-500 hover:text-blue-600"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item)}
                          className="btn-icon text-slate-500 hover:text-red-600"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            title={searchQuery || categoryFilter || alertFilter ? 'No items found' : 'No inventory items'}
            description={searchQuery || categoryFilter || alertFilter 
              ? 'Try adjusting your search or filters' 
              : 'Add your first inventory item to get started'}
            action={!(searchQuery || categoryFilter || alertFilter) && (
              <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                Add First Item
              </button>
            )}
          />
        </div>
      )}
      
      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen || !!editingItem}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
        size="lg"
      >
        <InventoryForm
          item={editingItem}
          onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
        />
      </Modal>
      
      {/* Transaction Modal */}
      <Modal
        isOpen={!!transactionItem}
        onClose={() => setTransactionItem(null)}
        title={`Stock Transaction - ${transactionItem?.name}`}
        size="md"
      >
        {transactionItem && (
          <TransactionForm
            item={transactionItem}
            onSubmit={handleTransaction}
            onCancel={() => setTransactionItem(null)}
          />
        )}
      </Modal>
      
      {/* Import Modal */}
      <Modal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        title="Import Inventory"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Upload a CSV or JSON file to import inventory items. Existing items with matching IDs will be updated.
          </p>
          <FileUpload
            onFileSelect={handleImport}
            accept=".json,.csv"
            label="Select File"
            description="Drag and drop or click to upload"
          />
          <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
            <p className="font-medium mb-1">CSV Format:</p>
            <code className="text-xs">name,sku,category,batch,quantity,unit,expiryDate,storageNotes</code>
          </div>
        </div>
      </Modal>
      
      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteItem}
        title="Delete Inventory Item"
        message={`Are you sure you want to delete ${deleteConfirm?.name}? This will also delete all transaction history.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}

export default Inventory;

