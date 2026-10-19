import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session: strictly isolated in sessionStorage per browser tab/window
  useEffect(() => {
    let savedToken = sessionStorage.getItem('biteflow_token');
    let savedUser = sessionStorage.getItem('biteflow_user');

    // One-time smooth migration if legacy token was in localStorage
    if (!savedToken && localStorage.getItem('biteflow_token')) {
      savedToken = localStorage.getItem('biteflow_token');
      savedUser = localStorage.getItem('biteflow_user');
      if (savedToken && savedUser) {
        sessionStorage.setItem('biteflow_token', savedToken);
        sessionStorage.setItem('biteflow_user', savedUser);
      }
      localStorage.removeItem('biteflow_token');
      localStorage.removeItem('biteflow_user');
    }

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsed);
      } catch {
        sessionStorage.removeItem('biteflow_token');
        sessionStorage.removeItem('biteflow_user');
        setUser(null);
        setToken(null);
      }
    } else {
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    const { user: userData, token: userToken } = res.data;

    setUser(userData);
    setToken(userToken);

    // Save strictly to this tab's sessionStorage (100% window/tab isolated)
    sessionStorage.setItem('biteflow_token', userToken);
    sessionStorage.setItem('biteflow_user', JSON.stringify(userData));

    return userData;
  }, []);

  const register = useCallback(async (userData) => {
    const res = await authService.register(userData);
    const { user: registeredUser, token: userToken } = res.data;

    setUser(registeredUser);
    setToken(userToken);

    sessionStorage.setItem('biteflow_token', userToken);
    sessionStorage.setItem('biteflow_user', JSON.stringify(registeredUser));

    return registeredUser;
  }, []);

  // Explicit logout only: logs out ONLY this window when user clicks the logout button
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('biteflow_token');
    sessionStorage.removeItem('biteflow_user');
    window.location.href = '/login';
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
