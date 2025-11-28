/**
 * Helper Utilities
 * 
 * @description Common utility functions for ClinicCare Lite
 */

import { format, parseISO, differenceInDays, differenceInYears, isAfter, isBefore, isToday, addDays } from 'date-fns';

/**
 * Format a date for display
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date string
 */
export function formatDate(date, formatStr = 'MMM d, yyyy') {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format date and time for display
 * @param {string|Date} datetime - DateTime to format
 * @returns {string} Formatted datetime string
 */
export function formatDateTime(datetime) {
  if (!datetime) return '';
  const dateObj = typeof datetime === 'string' ? parseISO(datetime) : datetime;
  return format(dateObj, 'MMM d, yyyy h:mm a');
}

/**
 * Format time for display
 * @param {string|Date} datetime - DateTime to format
 * @returns {string} Formatted time string
 */
export function formatTime(datetime) {
  if (!datetime) return '';
  const dateObj = typeof datetime === 'string' ? parseISO(datetime) : datetime;
  return format(dateObj, 'h:mm a');
}

/**
 * Calculate age from date of birth
 * @param {string|Date} dob - Date of birth
 * @returns {number} Age in years
 */
export function calculateAge(dob) {
  if (!dob) return null;
  const dateObj = typeof dob === 'string' ? parseISO(dob) : dob;
  return differenceInYears(new Date(), dateObj);
}

/**
 * Calculate age in months (for pediatric patients)
 * @param {string|Date} dob - Date of birth
 * @returns {number} Age in months
 */
export function calculateAgeInMonths(dob) {
  if (!dob) return null;
  const dateObj = typeof dob === 'string' ? parseISO(dob) : dob;
  const now = new Date();
  const years = differenceInYears(now, dateObj);
  const lastBirthday = new Date(dateObj);
  lastBirthday.setFullYear(lastBirthday.getFullYear() + years);
  const months = Math.floor(differenceInDays(now, lastBirthday) / 30);
  return years * 12 + months;
}

/**
 * Format age for display (years or months for young children)
 * @param {string|Date} dob - Date of birth
 * @returns {string} Formatted age string
 */
export function formatAge(dob) {
  const ageYears = calculateAge(dob);
  if (ageYears === null) return '';
  
  if (ageYears < 2) {
    const ageMonths = calculateAgeInMonths(dob);
    return `${ageMonths} month${ageMonths !== 1 ? 's' : ''}`;
  }
  
  return `${ageYears} year${ageYears !== 1 ? 's' : ''}`;
}

/**
 * Check if a date is within a certain number of days from now
 * @param {string|Date} date - Date to check
 * @param {number} days - Number of days
 * @returns {boolean} Whether date is within range
 */
export function isWithinDays(date, days) {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const futureDate = addDays(now, days);
  return isAfter(dateObj, now) && isBefore(dateObj, futureDate);
}

/**
 * Check if a date has passed
 * @param {string|Date} date - Date to check
 * @returns {boolean} Whether date has passed
 */
export function isPast(date) {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(dateObj, new Date());
}

/**
 * Get days until a date
 * @param {string|Date} date - Target date
 * @returns {number} Days until date (negative if past)
 */
export function daysUntil(date) {
  if (!date) return null;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(dateObj, new Date());
}

/**
 * Check if date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} Whether date is today
 */
export function isDateToday(date) {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isToday(dateObj);
}

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique ID
 */
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}${randomPart}` : `${timestamp}${randomPart}`;
}

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string|Function} key - Key to group by
 * @returns {Object} Grouped object
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    (result[groupKey] = result[groupKey] || []).push(item);
    return result;
  }, {});
}

/**
 * Sort array by key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Search filter for objects
 * @param {Array} array - Array to filter
 * @param {string} query - Search query
 * @param {string[]} fields - Fields to search in
 * @returns {Array} Filtered array
 */
export function searchFilter(array, query, fields) {
  if (!query) return array;
  
  const lowerQuery = query.toLowerCase();
  return array.filter(item => 
    fields.some(field => {
      const value = item[field];
      return value && String(value).toLowerCase().includes(lowerQuery);
    })
  );
}

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated text
 */
export function truncate(text, length = 50) {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '';
  return new Intl.NumberFormat().format(num);
}

/**
 * Download data as file
 * @param {string} data - Data to download
 * @param {string} filename - File name
 * @param {string} type - MIME type
 */
export function downloadFile(data, filename, type = 'application/json') {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV to JSON array
 * @param {string} csv - CSV string
 * @returns {Array} Array of objects
 */
export function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] || '';
      return obj;
    }, {});
  });
}

/**
 * Convert JSON array to CSV
 * @param {Array} data - Array of objects
 * @param {string[]} columns - Column headers (optional)
 * @returns {string} CSV string
 */
export function toCSV(data, columns = null) {
  if (!data || data.length === 0) return '';
  
  const headers = columns || Object.keys(data[0]);
  const rows = data.map(item => 
    headers.map(header => {
      const value = item[header];
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone format
 * @param {string} phone - Phone to validate
 * @returns {boolean} Whether phone is valid
 */
export function isValidPhone(phone) {
  return /^[\d\s\-+()]{7,20}$/.test(phone);
}


