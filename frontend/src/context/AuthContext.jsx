import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount and sync across tabs
  useEffect(() => {
    const syncSession = () => {
      const savedToken = localStorage.getItem('biteflow_token');
      const savedUser = localStorage.getItem('biteflow_user');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem('biteflow_token');
          localStorage.removeItem('biteflow_user');
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    syncSession();
    window.addEventListener('storage', syncSession);
    return () => window.removeEventListener('storage', syncSession);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    const { user: userData, token: userToken } = res.data;

    setUser(userData);
    setToken(userToken);

    localStorage.setItem('biteflow_token', userToken);
    localStorage.setItem('biteflow_user', JSON.stringify(userData));

    return userData;
  }, []);

  const register = useCallback(async (userData) => {
    const res = await authService.register(userData);
    const { user: registeredUser, token: userToken } = res.data;

    setUser(registeredUser);
    setToken(userToken);

    localStorage.setItem('biteflow_token', userToken);
    localStorage.setItem('biteflow_user', JSON.stringify(registeredUser));

    return registeredUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('biteflow_token');
    localStorage.removeItem('biteflow_user');
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
