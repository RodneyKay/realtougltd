import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PortalAuthProvider } from './context/PortalAuthContext';
import { PortalLogin } from './pages/Login';
import { PortalRegister } from './pages/Register';
import { PortalDashboard } from './pages/Dashboard';
import { PortalListings } from './pages/Listings';
import { PortalTeam } from './pages/Team';
import { PortalVerification } from './pages/Verification';
import { PortalLeads } from './pages/Leads';
import { PortalMarketing } from './pages/Marketing';
import { PortalBilling } from './pages/Billing';
import { PortalEnquiries, PortalViewings } from './pages/Enquiries';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PortalSidebar } from './components/PortalSidebar';
import { PortalTopbar } from './components/PortalTopbar';

const PortalShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-stone-50 flex">
    <PortalSidebar />
    <div className="flex-1 min-w-0 flex flex-col">
      <PortalTopbar />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  </div>
);

const protectedPage = (element: React.ReactNode) => (
  <ProtectedRoute>
    <PortalShell>{element}</PortalShell>
  </ProtectedRoute>
);

export default function PortalApp() {
  return (
    <PortalAuthProvider>
      <Routes>
        <Route index element={<Navigate to="login" replace />} />
        <Route path="login" element={<PortalLogin />} />
        <Route path="register" element={<PortalRegister />} />
        <Route path="dashboard" element={protectedPage(<PortalDashboard />)} />
        <Route path="listings" element={protectedPage(<PortalListings />)} />
        <Route path="leads" element={protectedPage(<PortalLeads />)} />
        <Route path="marketing" element={protectedPage(<PortalMarketing />)} />
        <Route path="team" element={protectedPage(<PortalTeam />)} />
        <Route path="verification" element={protectedPage(<PortalVerification />)} />
        <Route path="billing" element={protectedPage(<PortalBilling />)} />
        <Route path="enquiries" element={protectedPage(<PortalEnquiries />)} />
        <Route path="viewings" element={protectedPage(<PortalViewings />)} />
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    </PortalAuthProvider>
  );
}
