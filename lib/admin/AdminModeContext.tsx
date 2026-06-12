'use client';

import { createContext, useContext, useMemo, useState } from 'react';

/**
 * Admin mode (DEMO_MODE, session-only) — ported from EvHub-D's
 * AdminModeContext. A single boolean toggle that the Library uses to reveal
 * curator affordances: inline cell editing and tag-a-publication-to-a-dossier-
 * section. No persistence; refreshing the browser resets to read-only, in line
 * with the rest of the demo's lossy-on-refresh stores.
 */
interface AdminModeContextValue {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
}

const AdminModeContext = createContext<AdminModeContextValue | null>(null);

export function AdminModeProvider({ children }: { children: React.ReactNode }) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const value = useMemo<AdminModeContextValue>(
    () => ({ isAdminMode, toggleAdminMode: () => setIsAdminMode(p => !p) }),
    [isAdminMode],
  );
  return <AdminModeContext.Provider value={value}>{children}</AdminModeContext.Provider>;
}

export function useAdminMode(): AdminModeContextValue {
  const ctx = useContext(AdminModeContext);
  if (!ctx) {
    throw new Error('useAdminMode must be used within an AdminModeProvider');
  }
  return ctx;
}
