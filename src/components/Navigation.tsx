"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "./auth/UserProfile";

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40 transition-all duration-300">
      <div className="container mx-auto px-6">
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
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }
                  `}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side - Auth & CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <UserProfile />
            <Button 
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/dashboard">
                <Sparkles className="h-4 w-4 mr-2" />
                Get Started
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
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
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-border/40 mt-2 pt-4 pb-6"
            >
              <div className="flex flex-col space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? 'text-primary bg-primary/10 border border-primary/20' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }
                      `}
                    >
                      {item.name}
                    </Link>
                  );
                })}
                <div className="pt-4 border-t border-border/40 mt-4">
                  <UserProfile />
                  <Button 
                    asChild
                    className="w-full mt-3 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Link href="/dashboard">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}