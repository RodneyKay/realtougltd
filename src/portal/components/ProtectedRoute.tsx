import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePortalAuth } from '../context/PortalAuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, agency } = usePortalAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading console…</p>
      </div>
    );
  }

  if (!agency) {
    return <Navigate to="/portal/login" replace />;
  }

  return <>{children}</>;
};
