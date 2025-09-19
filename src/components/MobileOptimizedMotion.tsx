"use client";

import { motion, MotionProps } from "framer-motion";
import { forwardRef, ReactNode } from "react";

// Mobile-optimized motion component that reduces animation complexity on mobile devices
interface MobileOptimizedMotionProps extends MotionProps {
  children: ReactNode;
  className?: string;
  reducedMotion?: boolean;
}

export const MobileOptimizedMotion = forwardRef<HTMLDivElement, MobileOptimizedMotionProps>(
  ({ children, className, reducedMotion = false, ...motionProps }, ref) => {
    // Check if user prefers reduced motion or if we're on a mobile device
    const shouldReduceMotion = reducedMotion || 
      (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
      (typeof window !== 'undefined' && window.innerWidth <= 768);

    if (shouldReduceMotion) {
      // Return a simple div without animations for better mobile performance
      return (
        <div ref={ref} className={className}>
          {children}
        </div>
      );
    }

    // Return full motion component for desktop
    return (
      <motion.div
        ref={ref}
        className={className}
        {...motionProps}
        style={{ willChange: 'transform, opacity', ...motionProps.style }}
      >
        {children}
      </motion.div>
    );
  }
);

MobileOptimizedMotion.displayName = "MobileOptimizedMotion";

// Utility function to get mobile-optimized transition settings
export const getMobileOptimizedTransition = (baseTransition: any) => {
  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    return {
      ...baseTransition,
      duration: Math.min(baseTransition.duration || 0.3, 0.2),
      ease: "easeOut"
    };
  }
  return baseTransition;
};

// Hook to detect if animations should be reduced
export const useReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
         window.innerWidth <= 768;
};