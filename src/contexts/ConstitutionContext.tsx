"use client";

import { createContext, useContext } from "react";

export interface ConstitutionContextValue {
  id: string;
  slug: string;
  name: string;
  content_hash: string;
  version: string;
  snapshot_space: string;
  founder_address: string | null;
  bootstrap_tier2_limit: number;
  member_count?: number;
  proposal_count?: number;
}

const ConstitutionContext = createContext<ConstitutionContextValue | null>(null);

export function useConstitution(): ConstitutionContextValue {
  const ctx = useContext(ConstitutionContext);
  if (!ctx) throw new Error("useConstitution must be used within ConstitutionProvider");
  return ctx;
}

export function ConstitutionProvider({
  constitution,
  children,
}: {
  constitution: ConstitutionContextValue;
  children: React.ReactNode;
}) {
  return (
    <ConstitutionContext.Provider value={constitution}>
      {children}
    </ConstitutionContext.Provider>
  );
}
