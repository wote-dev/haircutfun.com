"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function usePageTransition() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const router = useRouter();
  const pathname = usePathname();

  // Custom navigation function with loading state
  const navigateWithLoading = (href: string, message?: string) => {
    if (href === pathname) return; // Don't load if already on the page
    
    setLoadingMessage(message || getLoadingMessage(href));
    setIsLoading(true);
    
    // Add a minimum loading time for better UX
    const minLoadingTime = 300;
    const startTime = Date.now();
    
    router.push(href);
    
    // Hide loading after minimum time and route change
    const hideLoading = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);
      
      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    };

    // Set a timeout as fallback in case route change doesn't trigger
    const fallbackTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    // Listen for route change completion
    const handleRouteChange = () => {
      clearTimeout(fallbackTimeout);
      hideLoading();
    };

    // Since Next.js 13+ doesn't have router events, we'll use a different approach
    // We'll check for pathname changes
    const checkPathChange = () => {
      if (window.location.pathname !== pathname) {
        handleRouteChange();
      } else {
        requestAnimationFrame(checkPathChange);
      }
    };
    
    requestAnimationFrame(checkPathChange);
  };

  // Get contextual loading messages based on destination
  const getLoadingMessage = (href: string): string => {
    if (href.includes('/try-on')) {
      return "Preparing your virtual try-on...";
    }
    if (href.includes('/gallery')) {
      return "Loading gallery...";
    }
    if (href.includes('/pricing')) {
      return "Loading pricing options...";
    }
    if (href.includes('/dashboard')) {
      return "Loading your dashboard...";
    }
    if (href === '/') {
      return "Going home...";
    }
    return "Loading...";
  };

  // Auto-hide loading on pathname change (for browser back/forward)
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  return {
    isLoading,
    loadingMessage,
    navigateWithLoading,
    setIsLoading,
    setLoadingMessage
  };
}