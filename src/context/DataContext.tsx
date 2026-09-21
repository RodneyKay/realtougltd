import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchProperties, fetchAgencies } from '../lib/api';
import type { Property, Agency } from '../types';

interface DataContextType {
  properties: Property[];
  agencies: Agency[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/**
 * Fetches listings + agencies from Supabase once at the app root and shares
 * the result via context, so individual cards/pages don't each trigger their
 * own network request.
 */
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTick, setRefetchTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchProperties(), fetchAgencies()])
      .then(([props, agcs]) => {
        if (cancelled) return;
        setProperties(props);
        setAgencies(agcs);
        setError(null);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refetchTick]);

  return (
    <DataContext.Provider
      value={{ properties, agencies, loading, error, refetch: () => setRefetchTick((t) => t + 1) }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within a DataProvider');
  }
  return context;
};
