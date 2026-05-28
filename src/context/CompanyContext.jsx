"use client";

import { createContext, useContext, useState, useCallback } from 'react';

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const [selectedCompany, setSelectedCompany] = useState(null);

  const selectCompany = useCallback((company) => {
    setSelectedCompany(company);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCompany(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <CompanyContext.Provider value={{ selectedCompany, selectCompany, clearSelection }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
}
