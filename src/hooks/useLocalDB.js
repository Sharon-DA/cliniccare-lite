/**
 * useLocalDB Hook
 * 
 * @description Custom hook for offline-first data persistence using localStorage
 * @features
 *   - CRUD operations with automatic persistence
 *   - Change subscription for real-time updates
 *   - Export/Import functionality for backup and restore
 *   - Optimistic updates with error handling
 * 
 * @param {string} key - Storage key for the data collection
 * @param {Array} initialData - Initial data if storage is empty
 * @returns {Object} CRUD methods and state
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Custom event for cross-tab synchronization
const STORAGE_EVENT_NAME = 'cliniccare_storage_update';

export function useLocalDB(key, initialData = []) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const listenersRef = useRef([]);
  
  /**
   * Load data from localStorage on mount
   */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(Array.isArray(parsed) ? parsed : []);
      } else if (initialData.length > 0) {
        // Initialize with seed data if provided
        localStorage.setItem(key, JSON.stringify(initialData));
        setData(initialData);
      }
    } catch (e) {
      console.error(`Error loading data for key "${key}":`, e);
      setError(e);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [key, initialData]);
  
  /**
   * Listen for changes from other tabs/windows
   */
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue);
          setData(newData);
          notifyListeners(newData);
        } catch (err) {
          console.error('Error parsing storage event:', err);
        }
      }
    };
    
    const handleCustomEvent = (e) => {
      if (e.detail?.key === key) {
        setData(e.detail.data);
        notifyListeners(e.detail.data);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(STORAGE_EVENT_NAME, handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(STORAGE_EVENT_NAME, handleCustomEvent);
    };
  }, [key]);
  
  /**
   * Notify all subscribed listeners of data changes
   */
  const notifyListeners = useCallback((newData) => {
    listenersRef.current.forEach(listener => listener(newData));
  }, []);
  
  /**
   * Persist data to localStorage and notify listeners
   */
  const persist = useCallback((newData) => {
    try {
      localStorage.setItem(key, JSON.stringify(newData));
      setData(newData);
      notifyListeners(newData);
      
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT_NAME, {
        detail: { key, data: newData }
      }));
      
      setError(null);
      return { success: true };
    } catch (e) {
      console.error(`Error persisting data for key "${key}":`, e);
      setError(e);
      return { success: false, error: e };
    }
  }, [key, notifyListeners]);
  
  /**
   * Create a new item
   * @param {Object} item - Item data (id will be auto-generated if not provided)
   * @returns {Object} Created item with generated ID
   */
  const create = useCallback((item) => {
    const newItem = {
      id: item.id || uuidv4(),
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const newData = [...data, newItem];
    persist(newData);
    return newItem;
  }, [data, persist]);
  
  /**
   * Read item(s)
   * @param {string} id - Optional ID to get specific item
   * @returns {Object|Array} Single item or all items
   */
  const read = useCallback((id = null) => {
    if (id) {
      return data.find(item => item.id === id) || null;
    }
    return data;
  }, [data]);
  
  /**
   * Update an existing item
   * @param {string} id - Item ID to update
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated item or null if not found
   */
  const update = useCallback((id, updates) => {
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    const updatedItem = {
      ...data[index],
      ...updates,
      id: data[index].id, // Preserve original ID
      updatedAt: new Date().toISOString()
    };
    
    const newData = [...data];
    newData[index] = updatedItem;
    persist(newData);
    return updatedItem;
  }, [data, persist]);
  
  /**
   * Delete an item
   * @param {string} id - Item ID to delete
   * @returns {boolean} Whether deletion was successful
   */
  const remove = useCallback((id) => {
    const newData = data.filter(item => item.id !== id);
    if (newData.length === data.length) return false;
    persist(newData);
    return true;
  }, [data, persist]);
  
  /**
   * Find items matching criteria
   * @param {Function} predicate - Filter function
   * @returns {Array} Matching items
   */
  const find = useCallback((predicate) => {
    return data.filter(predicate);
  }, [data]);
  
  /**
   * Find a single item matching criteria
   * @param {Function} predicate - Filter function
   * @returns {Object|null} First matching item or null
   */
  const findOne = useCallback((predicate) => {
    return data.find(predicate) || null;
  }, [data]);
  
  /**
   * Clear all data
   */
  const clear = useCallback(() => {
    persist([]);
  }, [persist]);
  
  /**
   * Replace all data (useful for imports)
   * @param {Array} newData - New data array
   */
  const replaceAll = useCallback((newData) => {
    if (!Array.isArray(newData)) {
      console.error('replaceAll requires an array');
      return { success: false, error: 'Invalid data format' };
    }
    return persist(newData);
  }, [persist]);
  
  /**
   * Subscribe to data changes
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  const subscribe = useCallback((listener) => {
    listenersRef.current.push(listener);
    return () => {
      listenersRef.current = listenersRef.current.filter(l => l !== listener);
    };
  }, []);
  
  /**
   * Export data as JSON string
   * @returns {string} JSON string of data
   */
  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);
  
  /**
   * Import data from JSON string
   * @param {string} jsonString - JSON data to import
   * @param {boolean} merge - Whether to merge with existing data
   * @returns {Object} Result with success status
   */
  const importData = useCallback((jsonString, merge = false) => {
    try {
      const importedData = JSON.parse(jsonString);
      if (!Array.isArray(importedData)) {
        throw new Error('Imported data must be an array');
      }
      
      if (merge) {
        // Merge by ID, imported data takes precedence
        const mergedData = [...data];
        importedData.forEach(item => {
          const existingIndex = mergedData.findIndex(d => d.id === item.id);
          if (existingIndex >= 0) {
            mergedData[existingIndex] = { ...mergedData[existingIndex], ...item };
          } else {
            mergedData.push(item);
          }
        });
        persist(mergedData);
      } else {
        persist(importedData);
      }
      
      return { success: true, count: importedData.length };
    } catch (e) {
      console.error('Import error:', e);
      return { success: false, error: e.message };
    }
  }, [data, persist]);
  
  /**
   * Get count of items
   * @param {Function} predicate - Optional filter function
   * @returns {number} Count of items
   */
  const count = useCallback((predicate = null) => {
    if (predicate) {
      return data.filter(predicate).length;
    }
    return data.length;
  }, [data]);
  
  return {
    // State
    data,
    isLoading,
    error,
    
    // CRUD Operations
    create,
    read,
    update,
    remove,
    
    // Query Operations
    find,
    findOne,
    count,
    
    // Bulk Operations
    clear,
    replaceAll,
    
    // Subscription
    subscribe,
    
    // Import/Export
    exportData,
    importData
  };
}

export default useLocalDB;


