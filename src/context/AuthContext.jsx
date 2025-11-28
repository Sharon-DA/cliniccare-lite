/**
 * Authentication Context
 * 
 * @description Provides authentication state and methods throughout the app
 * @features
 *   - Client-side authentication using localStorage
 *   - Role-based access control (clinician, inventory_manager, admin)
 *   - Persistent sessions across browser reloads
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Storage keys
const AUTH_USER_KEY = 'cliniccare_user';
const AUTH_USERS_KEY = 'cliniccare_users';

/**
 * AuthProvider Component
 * Wraps the application to provide authentication state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Result with success status and message
   */
  const signup = (userData) => {
    const { username, password, name, role } = userData;
    
    // Get existing users
    const usersJson = localStorage.getItem(AUTH_USERS_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];
    
    // Check if username already exists
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: 'Username already exists' };
    }
    
    // Create new user (in production, password would be hashed)
    const newUser = {
      id: `user_${Date.now()}`,
      username,
      password, // Note: In production, never store plain passwords
      name,
      role: role || 'clinician',
      createdAt: new Date().toISOString()
    };
    
    // Save to users list
    users.push(newUser);
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
    
    // Auto-login the new user
    const sessionUser = { ...newUser };
    delete sessionUser.password;
    setUser(sessionUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionUser));
    
    return { success: true, message: 'Account created successfully' };
  };
  
  /**
   * Login with credentials
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Object} Result with success status and message
   */
  const login = (username, password) => {
    const usersJson = localStorage.getItem(AUTH_USERS_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];
    
    const foundUser = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    
    if (!foundUser) {
      return { success: false, message: 'Invalid username or password' };
    }
    
    // Create session (exclude password)
    const sessionUser = { ...foundUser };
    delete sessionUser.password;
    setUser(sessionUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sessionUser));
    
    return { success: true, message: 'Login successful' };
  };
  
  /**
   * Logout current user
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };
  
  /**
   * Update user role
   * @param {string} newRole - New role to set
   */
  const updateRole = (newRole) => {
    if (!user) return;
    
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
    
    // Also update in users list
    const usersJson = localStorage.getItem(AUTH_USERS_KEY);
    if (usersJson) {
      const users = JSON.parse(usersJson);
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx].role = newRole;
        localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
      }
    }
  };
  
  /**
   * Check if user has specific role
   * @param {string|string[]} roles - Role(s) to check
   * @returns {boolean} Whether user has the role
   */
  const hasRole = (roles) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role) || user.role === 'admin';
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signup,
    login,
    logout,
    updateRole,
    hasRole
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


