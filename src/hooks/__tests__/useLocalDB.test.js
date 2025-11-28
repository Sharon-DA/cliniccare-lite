/**
 * useLocalDB Hook Tests
 * 
 * @description Unit tests for the useLocalDB custom hook
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get store() {
      return store;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Import after mocking
import { useLocalDB } from '../useLocalDB';

describe('useLocalDB', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty array when no data exists', () => {
    const { result } = renderHook(() => useLocalDB('test_key'));
    
    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should initialize with stored data', () => {
    const initialData = [{ id: '1', name: 'Test' }];
    localStorageMock.setItem('test_key', JSON.stringify(initialData));
    
    const { result } = renderHook(() => useLocalDB('test_key'));
    
    expect(result.current.data).toEqual(initialData);
  });

  it('should create new items', () => {
    const { result } = renderHook(() => useLocalDB('test_key'));
    
    act(() => {
      result.current.create({ name: 'New Item' });
    });
    
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].name).toBe('New Item');
    expect(result.current.data[0].id).toBeDefined();
  });

  it('should read items by id', () => {
    const initialData = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' }
    ];
    localStorageMock.setItem('test_key', JSON.stringify(initialData));
    
    const { result } = renderHook(() => useLocalDB('test_key'));
    
    const item = result.current.read('1');
    expect(item.name).toBe('Item 1');
  });

  it('should update existing items', () => {
    const initialData = [{ id: '1', name: 'Original' }];
    localStorageMock.setItem('test_key', JSON.stringify(initialData));
    
    const { result } = renderHook(() => useLocalDB('test_key'));
    
    act(() => {
      result.current.update('1', { name: 'Updated' });
    });
    
    expect(result.current.data[0].name).toBe('Updated');
  });

  it('should remove items', () => {
    const initialData = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' }
    ];
    localStorageMock.setItem('test_key', JSON.stringify(initialData));
    
    const { result } = renderHook(() => useLocalDB('test_key'));
    
    act(() => {
      result.current.remove('1');
    });
    
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].id).toBe('2');
  });

  it('should find items by predicate', () => {
    const initialData = [
      { id: '1', name: 'Apple', category: 'fruit' },
      { id: '2', name: 'Banana', category: 'fruit' },
      { id: '3', name: 'Carrot', category: 'vegetable' }
    ];
    localStorageMock.setItem('test_key', JSON.stringify(initialData));
    
    const { result } = renderHook(() => useLocalDB('test_key'));
    
    const fruits = result.current.find(item => item.category === 'fruit');
    expect(fruits).toHaveLength(2);
  });

  it('should export data as JSON', () => {
    const initialData = [{ id: '1', name: 'Test' }];
    localStorageMock.setItem('test_key', JSON.stringify(initialData));
    
    const { result } = renderHook(() => useLocalDB('test_key'));
    
    const exported = result.current.exportData();
    expect(JSON.parse(exported)).toEqual(initialData);
  });

  it('should import data', () => {
    const { result } = renderHook(() => useLocalDB('test_key'));
    
    const importData = [{ id: '1', name: 'Imported' }];
    
    act(() => {
      result.current.importData(JSON.stringify(importData));
    });
    
    expect(result.current.data).toEqual(importData);
  });

  it('should clear all data', () => {
    const initialData = [{ id: '1', name: 'Test' }];
    localStorageMock.setItem('test_key', JSON.stringify(initialData));
    
    const { result } = renderHook(() => useLocalDB('test_key'));
    
    act(() => {
      result.current.clear();
    });
    
    expect(result.current.data).toEqual([]);
  });

  it('should count items', () => {
    const initialData = [
      { id: '1', active: true },
      { id: '2', active: false },
      { id: '3', active: true }
    ];
    localStorageMock.setItem('test_key', JSON.stringify(initialData));
    
    const { result } = renderHook(() => useLocalDB('test_key'));
    
    expect(result.current.count()).toBe(3);
    expect(result.current.count(item => item.active)).toBe(2);
  });
});


