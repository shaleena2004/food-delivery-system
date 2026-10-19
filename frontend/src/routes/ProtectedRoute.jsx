import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/Spinner';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/common/Button';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-semibold text-slate-400">Verifying security credentials...</p>
      </div>
    );
  }

  // 1. Unauthenticated users go to /login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Users with the wrong role see an "Access denied" message
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="py-20 px-4 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Your account role (<strong className="text-slate-700">{user.role}</strong>) does not have
          permission to access this page.
        </p>
        <Button variant="primary" onClick={() => (window.location.href = '/')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return children;
};
