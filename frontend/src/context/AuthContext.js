import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { login as loginAPI, logout as logoutAPI, getMe, exchangeGitHubSession } from '../api/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    if (window.location.pathname === '/auth/github/complete') {
      setLoading(false);
      return;
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await getMe();
        setUser(response.data.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await loginAPI({ email, password });
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const completeGitHubLogin = useCallback(async () => {
    const response = await exchangeGitHubSession();
    const { user, token } = response.data.data;
    localStorage.setItem('token', token);
    setUser(user);
    setIsAuthenticated(true);
  }, []);

  const logout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    setUser,
    isAuthenticated,
    loading,
    login,
    completeGitHubLogin,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

