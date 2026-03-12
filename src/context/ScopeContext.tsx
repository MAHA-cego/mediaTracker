"use client";

import { createContext, useContext } from "react";
import { Scope } from "@/types/scope";

const ScopeContext = createContext<Scope | null>(null);

export function ScopeProvider({
  scope,
  children,
}: {
  scope: Scope;
  children: React.ReactNode;
}) {
  return (
    <ScopeContext.Provider value={scope}>{children}</ScopeContext.Provider>
  );
}

export function useScope() {
  const scope = useContext(ScopeContext);

  if (!scope) {
    throw new Error("useScope must be used within ScopeProvider");
  }

  return scope;
}
