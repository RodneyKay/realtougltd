import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { AgencyBusinessType, AgencyMemberRole } from '../../lib/database.types';
import {
  PortalProfile,
  PortalAgency,
  RegisterAgencyDetails,
  registerAgency,
  signInAgency,
  signOutPortal,
  fetchPortalProfile,
  fetchAgencyMembershipForUser,
} from '../lib/portalApi';

interface PortalAuthContextType {
  loading: boolean;
  profile: PortalProfile | null;
  agency: PortalAgency | null;
  role: AgencyMemberRole | null;
  error: string | null;
  needsEmailConfirmation: boolean;
  login: (details: { email: string; password: string }) => Promise<void>;
  register: (details: RegisterAgencyDetails, inviteToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const PortalAuthContext = createContext<PortalAuthContextType | undefined>(undefined);

export const PortalAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [agency, setAgency] = useState<PortalAgency | null>(null);
  const [role, setRole] = useState<AgencyMemberRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  const loadForUser = async (userId: string) => {
    const [portalProfile, membership] = await Promise.all([
      fetchPortalProfile(userId),
      fetchAgencyMembershipForUser(userId),
    ]);
    setProfile(portalProfile);
    setAgency(membership?.agency ?? null);
    setRole(membership?.role ?? null);
  };

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user) {
        loadForUser(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadForUser(session.user.id);
      } else {
        setProfile(null);
        setAgency(null);
        setRole(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const login = async (details: { email: string; password: string }) => {
    setError(null);
    try {
      const { user } = await signInAgency(details.email, details.password);
      if (user) {
        const membership = await fetchAgencyMembershipForUser(user.id);
        if (!membership) {
          await signOutPortal();
          throw new Error("We couldn't find an agency or developer account for this login. Register one first.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      throw err;
    }
  };

  const register = async (details: RegisterAgencyDetails, inviteToken?: string) => {
    setError(null);
    setNeedsEmailConfirmation(false);
    try {
      const result = await registerAgency(details, inviteToken);
      setNeedsEmailConfirmation(result.needsEmailConfirmation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
      throw err;
    }
  };

  const logout = async () => {
    await signOutPortal();
  };

  const clearError = () => setError(null);

  return (
    <PortalAuthContext.Provider
      value={{ loading, profile, agency, role, error, needsEmailConfirmation, login, register, logout, clearError }}
    >
      {children}
    </PortalAuthContext.Provider>
  );
};

export const usePortalAuth = () => {
  const context = useContext(PortalAuthContext);
  if (context === undefined) {
    throw new Error('usePortalAuth must be used within a PortalAuthProvider');
  }
  return context;
};
