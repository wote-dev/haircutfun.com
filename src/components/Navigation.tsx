"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "./auth/UserProfile";
import { SignInButton } from "./auth/SignInButton";
import { useAuth } from "./providers/AuthProvider";
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
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
            scrolled 
              ? 'bg-background/95 border-b border-border/40'
              : 'bg-transparent'
          }`}
          style={scrolled ? {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)'
          } : {}}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center h-20 py-2">
            {/* Left side - Logo */}
            <div className="flex-1 flex justify-start">
              <Link href="/" className="flex items-center group">
                <div className="relative flex items-center justify-center py-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-sm group-hover:blur-none transition-all duration-300" />
                  <Image
                    src="/package.png"
                    alt="HaircutFun Logo"
                    width={120}
                    height={40}
                    className="relative object-contain w-auto h-auto"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Center - Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-1">
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
            </div>

            {/* Right side - Auth & CTA */}
            <div className="flex-1 flex justify-end">
              <div className="hidden lg:flex items-center space-x-4">
                <UserProfile />
                {!user && (
                  <SignInButton 
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Login
                  </SignInButton>
                )}
                <Button 
                  onClick={() => navigateWithLoading("/try-on", "Preparing your virtual try-on...")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </div>
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
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div
        className={`
          fixed top-0 right-0 bottom-0 z-50 w-full max-w-xs bg-background shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          lg:hidden
        `}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="p-2"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4">
          <div className="flex flex-col space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setIsOpen(false);
                    navigateWithLoading(item.href);
                  }}
                  className={`
                    block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-colors
                    ${isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }
                  `}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
          
          <div className="pt-6 border-t mt-4 space-y-4">
            <UserProfile />
            {!user && (
              <SignInButton 
                variant="outline"
                className="w-full"
                size="lg"
              >
                Login
              </SignInButton>
            )}
            <Button 
              onClick={() => {
                setIsOpen(false);
                navigateWithLoading("/try-on", "Preparing your virtual try-on...");
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}