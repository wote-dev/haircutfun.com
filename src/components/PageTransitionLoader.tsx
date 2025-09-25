"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ThreeDotLoader } from "@/components/ui/three-dot-loader";

interface PageTransitionLoaderProps {
  isLoading: boolean;
  message?: string;
}

export function PageTransitionLoader({ isLoading, message = "Loading..." }: PageTransitionLoaderProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] bg-background/80 flex items-center justify-center"
          style={{ 
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ 
              duration: 0.2, 
              ease: "easeOut"
            }}
            className="text-center max-w-sm mx-auto px-6"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Three Dot Loading Animation */}
            <div className="mb-6">
              <ThreeDotLoader size="lg" className="mb-4" />
            </div>

            {/* Loading Text */}
            <motion.h3
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-lg font-semibold text-foreground"
            >
              {message}
            </motion.h3>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Minimal loader for quick transitions
export function MiniPageLoader({ isLoading }: { isLoading: boolean }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 right-4 z-[9999] bg-background/90 backdrop-blur-sm border border-border/40 rounded-xl p-3 shadow-lg"
        >
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
            />
            <span className="text-sm font-medium text-foreground">Loading...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}