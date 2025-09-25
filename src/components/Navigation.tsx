"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Sparkles, Home, Image as ImageIcon, DollarSign, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "./auth/UserProfile";
import { SignInButton } from "./auth/SignInButton";
import { useAuth } from "./providers/AuthProvider";
import { usePageTransitionContext } from "@/components/providers/PageTransitionProvider";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Gallery", href: "/gallery", icon: ImageIcon },
  { name: "Pricing", href: "/pricing", icon: DollarSign },
  { name: "About", href: "/about", icon: Info },
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

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, href: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigateWithLoading(href);
    }
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 mobile-nav-optimized ${
          scrolled 
            ? 'bg-background/95 border-b border-border/40'
            : 'bg-transparent'
        }`}
        style={scrolled ? {
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        } : {}}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center h-20 py-2">
            {/* Left side - Logo */}
            <div className="flex-1 flex justify-start">
              <Link 
                href="/" 
                className="flex items-center group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
                aria-label="HaircutFun - Go to homepage"
              >
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
              <div className="flex items-center space-x-1" role="menubar">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => navigateWithLoading(item.href)}
                      onKeyDown={(e) => handleKeyDown(e, item.href)}
                      className={`
                        relative px-4 py-2 rounded-lg text-sm font-medium cursor-pointer
                        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                        ${isActive 
                          ? 'text-primary bg-primary/10 border border-primary/20' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }
                      `}
                      role="menuitem"
                      aria-current={isActive ? 'page' : undefined}
                      tabIndex={0}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </div>
                      {isActive && (
                        <div 
                          className="absolute inset-0 bg-primary/5 rounded-lg border border-primary/30"
                        />
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
                    className="text-muted-foreground hover:text-foreground hover:text-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Login
                  </SignInButton>
                )}
                <Button 
                  onClick={() => navigateWithLoading("/try-on", "Preparing your virtual try-on...")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Started
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Free
                  </Badge>
                </Button>
              </div>
            </div>

            {/* Mobile menu button - Ultra-optimized for Safari */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  setIsOpen(!isOpen);
                }}
                className="p-2 hover:bg-accent/50 focus:ring-2 focus:ring-primary focus:ring-offset-2 hamburger-btn"
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                style={{
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  transform: 'translateZ(0)',
                  WebkitTransform: 'translateZ(0)',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                <div 
                  className={`hamburger-icon ${isOpen ? 'rotated' : ''}`}
                  style={{
                    touchAction: 'manipulation',
                    pointerEvents: 'none'
                  }}
                >
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu - Pure CSS, smooth as butter */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 lg:hidden mobile-overlay ${isOpen ? 'show' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div
         id="mobile-menu"
         className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-xs bg-background shadow-2xl border-l border-border lg:hidden mobile-menu-slide rounded-l-2xl ${
           isOpen ? 'open' : ''
         }`}
         role="dialog"
         aria-modal="true"
         aria-labelledby="mobile-menu-title"
       >
            <div className="flex items-center justify-between p-4 border-b bg-muted/30 rounded-tl-2xl"
                 style={{
                   willChange: 'auto',
                   transform: 'translateZ(0)',
                   WebkitTransform: 'translateZ(0)',
                   WebkitBackfaceVisibility: 'hidden'
                 }}>
              <h2 id="mobile-menu-title" className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Menu
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-2 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Close menu"
                style={{
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                  WebkitTransform: 'translateZ(0)',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4 h-full overflow-y-auto"
                 style={{
                   WebkitOverflowScrolling: 'touch',
                   willChange: 'scroll-position',
                   transform: 'translateZ(0)',
                   WebkitTransform: 'translateZ(0)',
                   WebkitBackfaceVisibility: 'hidden'
                 }}>
              <div className="flex flex-col space-y-2" role="menu">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setIsOpen(false);
                        navigateWithLoading(item.href);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setIsOpen(false);
                          navigateWithLoading(item.href);
                        }
                      }}
                      className={`
                        flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-base font-medium 
                        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                        ${isActive 
                          ? 'text-primary bg-primary/10 border border-primary/20' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }
                      `}
                      role="menuitem"
                      aria-current={isActive ? 'page' : undefined}
                      tabIndex={0}
                      style={{
                        willChange: 'transform',
                        transform: 'translateZ(0)',
                        WebkitTransform: 'translateZ(0)',
                        WebkitBackfaceVisibility: 'hidden'
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                      {isActive && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Current
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="pt-6 border-t mt-6 space-y-4">
                <UserProfile />
                {!user && (
                  <SignInButton 
                    variant="outline"
                    className="w-full focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-lg"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Started
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Free
                  </Badge>
                </Button>
              </div>
            </div>
          </div>
    </>
  );
}