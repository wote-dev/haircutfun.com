"use client";

import { createContext, useContext, ReactNode } from "react";
import { usePageTransition } from "@/hooks/usePageTransition";
import { PageTransitionLoader } from "@/components/PageTransitionLoader";

interface PageTransitionContextType {
  isLoading: boolean;
  loadingMessage: string;
  navigateWithLoading: (href: string, message?: string) => void;
  setIsLoading: (loading: boolean) => void;
  setLoadingMessage: (message: string) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType | undefined>(undefined);

export function usePageTransitionContext() {
  const context = useContext(PageTransitionContext);
  if (context === undefined) {
    throw new Error('usePageTransitionContext must be used within a PageTransitionProvider');
  }
  return context;
}

interface PageTransitionProviderProps {
  children: ReactNode;
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const pageTransition = usePageTransition();

  return (
    <PageTransitionContext.Provider value={pageTransition}>
      {children}
      <PageTransitionLoader 
        isLoading={pageTransition.isLoading} 
        message={pageTransition.loadingMessage} 
      />
    </PageTransitionContext.Provider>
  );
}