"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "./auth/UserProfile";
import { usePageTransitionContext } from "@/components/providers/PageTransitionProvider";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Gallery", href: "/gallery" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
];

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { navigateWithLoading } = usePageTransitionContext();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (isOpen && !target.closest('nav')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-background/95 backdrop-blur-lg border-b border-border/40' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-sm group-hover:blur-none transition-all duration-300" />
              <Image
                src="/haircuttr.png"
                alt="HaircutFun Logo"
                width={40}
                height={40}
                className="relative rounded-xl"
              />
            </div>
            <span className="text-xl font-bold" style={{color: '#584678'}}>
              HaircutFun
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => navigateWithLoading(item.href)}
                  className={`
                    relative px-4 py-2 rounded-lg text-sm font-medium cursor-pointer
                    ${isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors'
                    }
                  `}
                >
                  {item.name}
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right side - Auth & CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <UserProfile />
            <Button 
              onClick={() => navigateWithLoading("/try-on", "Preparing your virtual try-on...")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-accent/50 transition-colors"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence mode="wait">
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden"
                style={{ top: '64px' }}
                onClick={() => setIsOpen(false)}
              />
              
              {/* Menu Content */}
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.3, 
                  ease: [0.4, 0.0, 0.2, 1],
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                className={`lg:hidden absolute top-full left-0 right-0 backdrop-blur-xl border-b shadow-xl ${
                  scrolled 
                    ? 'bg-background/98 border-border/40' 
                    : 'bg-background/90 border-border/20'
                }`}
              >
                <div className="container mx-auto px-4 sm:px-6 py-6">
                  <div className="flex flex-col space-y-1">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <div key={item.name}>
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              navigateWithLoading(item.href);
                            }}
                            className={`
                              block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-colors
                              ${isActive 
                                ? 'text-primary bg-primary/10 border border-primary/20' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                              }
                            `}
                          >
                            {item.name}
                          </button>
                        </div>
                      );
                    })}
                    
                    {/* Mobile Auth & CTA */}
                    <div className="pt-6 border-t border-border/40 mt-4 space-y-4">
                      <UserProfile />
                      <Button 
                        onClick={() => {
                          setIsOpen(false);
                          navigateWithLoading("/try-on", "Preparing your virtual try-on...");
                        }}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                        size="lg"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Get Started
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}