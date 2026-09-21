import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ContactRecord, Agency, Property, InvestmentOpportunity } from '../types';
import { supabase } from '../lib/supabaseClient';
import {
  signUpWithEmail,
  signInWithEmail,
  signOut as supabaseSignOut,
  fetchProfile,
  fetchFavoriteListingIds,
  toggleFavorite,
  createViewingRequest,
  submitEnquiry,
  fetchMyEnquiries,
} from '../lib/api';

interface AppContextType {
  user: User | null;
  authLoading: boolean;
  authError: string | null;
  setIsLoginModalOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  handleLogin: (details: { email: string; password: string }) => Promise<void>;
  handleRegister: (details: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  handleLogout: () => void;
  handleSaveToggle: (id: string, e: React.MouseEvent) => void;

  // Contact Modal State
  isContactModalOpen: boolean;
  setIsContactModalOpen: (open: boolean) => void;
  activeContactAgency: Agency | null;
  activeContactProperty: Property | null;
  activeContactInvestment: InvestmentOpportunity | null;
  contactInitialMode: 'viewing' | 'enquiry' | 'investment';
  triggerContactAgency: (
    agency: Agency,
    property?: Property,
    investment?: InvestmentOpportunity,
    initialType?: 'viewing' | 'enquiry' | 'investment'
  ) => void;
  handleContactSubmit: (details: { name: string; email: string; phone: string; message: string; type: 'viewing' | 'enquiry' | 'investment'; scheduledAt?: string }) => Promise<void>;

  // Mobile Sidebar
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [activeContactAgency, setActiveContactAgency] = useState<Agency | null>(null);
  const [activeContactProperty, setActiveContactProperty] = useState<Property | null>(null);
  const [activeContactInvestment, setActiveContactInvestment] = useState<InvestmentOpportunity | null>(null);
  const [contactInitialMode, setContactInitialMode] = useState<'viewing' | 'enquiry' | 'investment'>('enquiry');

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const loadUser = async (authUserId: string, email: string) => {
    const [profile, savedPropertyIds, contactHistory] = await Promise.all([
      fetchProfile(authUserId),
      fetchFavoriteListingIds(authUserId),
      fetchMyEnquiries(authUserId).catch(() => [] as ContactRecord[]),
    ]);
    setUser({
      id: authUserId,
      name: profile?.name ?? email,
      email: profile?.email ?? email,
      phone: profile?.phone ?? '',
      savedPropertyIds,
      contactHistory,
    });
  };

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user) {
        loadUser(session.user.id, session.user.email ?? '').finally(() => setAuthLoading(false));
      } else {
        setAuthLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser(session.user.id, session.user.email ?? '');
      } else {
        setUser(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (details: { email: string; password: string }) => {
    setAuthError(null);
    try {
      await signInWithEmail(details.email, details.password);
      setIsLoginModalOpen(false);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to sign in');
      throw err;
    }
  };

  const handleRegister = async (details: { name: string; email: string; phone: string; password: string }) => {
    setAuthError(null);
    try {
      await signUpWithEmail(details);
      setIsLoginModalOpen(false);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to register');
      throw err;
    }
  };

  const handleLogout = () => {
    supabaseSignOut();
  };

  const handleSaveToggle = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    const wasSaved = user.savedPropertyIds.includes(id);
    const previousSaves = user.savedPropertyIds;
    const optimisticSaves = wasSaved
      ? previousSaves.filter((pId) => pId !== id)
      : [...previousSaves, id];

    setUser({ ...user, savedPropertyIds: optimisticSaves });

    toggleFavorite(user.id, id, wasSaved).catch(() => {
      // Revert on failure.
      setUser((u) => (u ? { ...u, savedPropertyIds: previousSaves } : u));
    });
  };

  const triggerContactAgency = (
    agency: Agency,
    property?: Property,
    investment?: InvestmentOpportunity,
    initialType: 'viewing' | 'enquiry' | 'investment' = 'enquiry'
  ) => {
    // Enquiries go to the agency's inbox, so we need to know who is asking.
    if (!user) {
      setAuthMode('login');
      setIsLoginModalOpen(true);
      return;
    }
    setActiveContactAgency(agency);
    setActiveContactProperty(property || null);
    setActiveContactInvestment(investment || null);
    setContactInitialMode(initialType);
    setIsContactModalOpen(true);
  };

  const handleContactSubmit = async (details: { name: string; email: string; phone: string; message: string; type: 'viewing' | 'enquiry' | 'investment'; scheduledAt?: string }) => {
    if (!activeContactAgency || !user) return;

    const message = activeContactInvestment
      ? `[Investment opportunity #${activeContactInvestment.id}] ${details.message}`
      : details.message;

    // Throws on failure so the modal can show what went wrong instead of a false "sent".
    const enquiryId = await submitEnquiry({
      kind: details.type,
      name: details.name,
      email: details.email,
      phone: details.phone,
      message,
      listingId: activeContactProperty?.id,
      agencyId: activeContactAgency.id,
      scheduledAt: details.scheduledAt,
    });

    const newRecord: ContactRecord = {
      id: enquiryId,
      propertyId: activeContactProperty?.id,
      propertyName: activeContactProperty?.title || (activeContactInvestment?.id ? `Investment Offer #${activeContactInvestment?.id}` : undefined),
      investmentId: activeContactInvestment?.id,
      agencyId: activeContactAgency.id,
      agencyName: activeContactAgency.name,
      type: details.type,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      message,
      name: details.name,
      email: details.email,
      phone: details.phone,
    };
    setUser({ ...user, contactHistory: [newRecord, ...user.contactHistory.filter((r) => r.id !== enquiryId)] });

    // Keep the scheduled-viewing record too (best effort; the enquiry above is what the agency sees).
    if (details.type === 'viewing' && details.scheduledAt && activeContactProperty?.agentId) {
      createViewingRequest({
        listingId: activeContactProperty.id,
        buyerId: user.id,
        agentId: activeContactProperty.agentId,
        scheduledAt: details.scheduledAt,
        notes: details.message,
      }).catch((err) => console.error('Failed to save viewing request:', err));
    }
    // The modal shows its own success state and closes itself.
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        authError,
        isLoginModalOpen, setIsLoginModalOpen,
        authMode, setAuthMode,
        handleLogin, handleRegister, handleLogout, handleSaveToggle,
        isContactModalOpen, setIsContactModalOpen,
        activeContactAgency, activeContactProperty, activeContactInvestment, contactInitialMode,
        triggerContactAgency, handleContactSubmit,
        mobileSidebarOpen, setMobileSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
