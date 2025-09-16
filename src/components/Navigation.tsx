"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, ChevronDown } from "lucide-react";
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
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-7xl"
    >
      <motion.div 
        animate={{
          scale: scrolled ? 0.98 : 1,
          y: scrolled ? 2 : 0
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`
          relative overflow-hidden rounded-3xl border 
          ${scrolled 
            ? 'border-white/20 bg-white/70 shadow-lg shadow-black/[0.04]' 
            : 'border-white/10 bg-white/60 shadow-xl shadow-black/[0.02]'
          }
          backdrop-blur-xl transition-all duration-500
        `}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.01] via-transparent to-accent/[0.01]" />
        
        {/* Glass reflection effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        
        <div className="relative px-8 py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-4 group">
              <motion.div 
                whileHover={{ scale: 1.08, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative h-11 w-11 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-primary via-primary to-accent p-[1.5px]"
              >
                <div className="h-full w-full rounded-2xl bg-white flex items-center justify-center">
                  <Image
                    src="/haircuttr.png"
                    alt="HaircutFun Logo"
                    width={28}
                    height={28}
                    className="object-contain"
                    priority
                  />
                </div>
              </motion.div>
              <motion.span 
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="font-bold text-xl tracking-tight text-gradient-primary"
              >
                HaircutFun
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div 
                    key={item.name} 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Link
                      href={item.href}
                      className={`
                        relative px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300
                        ${isActive
                          ? "text-primary bg-primary/8 shadow-sm"
                          : "text-gray-600 hover:text-primary hover:bg-primary/4"
                        }
                      `}
                    >
                      <span className="relative z-10">{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-primary/8 to-primary/12 rounded-2xl border border-primary/15"
                          transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
              
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="/try-on"
                  className="
                    group relative overflow-hidden px-6 py-2.5 rounded-2xl text-sm font-semibold
                    bg-gradient-to-r from-primary to-accent text-white shadow-lg
                    hover:shadow-xl hover:shadow-primary/25 transition-all duration-300
                    flex items-center space-x-2
                  "
                >
                  <Sparkles className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                </Link>
              </motion.div>
              
              {/* User Profile */}
              <div className="ml-4">
                <UserProfile />
              </div>
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-3 rounded-2xl bg-gray-50/80 hover:bg-gray-100/80 border border-gray-200/50 hover:border-gray-300/50 transition-all duration-300 shadow-sm"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <Menu className="h-5 w-5 text-gray-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="md:hidden border-t border-white/20 bg-white/50 backdrop-blur-xl"
              >
                <div className="px-8 py-8 space-y-3">
                  {navigation.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: index * 0.08,
                          type: "spring",
                          stiffness: 400,
                          damping: 25
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`
                            block px-5 py-3.5 rounded-2xl text-base font-medium transition-all duration-300
                            ${isActive
                              ? "text-primary bg-gradient-to-r from-primary/8 to-primary/12 border border-primary/15 shadow-sm"
                              : "text-gray-600 hover:text-primary hover:bg-primary/4"
                            }
                          `}
                        >
                          {item.name}
                        </Link>
                      </motion.div>
                    );
                  })}
                  
                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6" />
                  
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: navigation.length * 0.08 + 0.1,
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }}
                  >
                    <Link
                      href="/try-on"
                      onClick={() => setIsOpen(false)}
                      className="
                        flex items-center justify-center space-x-2 w-full px-6 py-4 rounded-2xl
                        bg-gradient-to-r from-primary to-accent text-white font-semibold
                        shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300
                      "
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Get Started</span>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.nav>
  );
}