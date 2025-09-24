'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';
import { SignInButton } from './SignInButton';
import { UserGallery } from '../UserGallery';

export function UserProfile() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update button position when dropdown opens or on scroll/resize
  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768; // md breakpoint
      const dropdownWidth = isMobile ? Math.min(320, window.innerWidth - 32) : 320; // Responsive width
      const dropdownHeight = 400; // Approximate height
      const gap = 8;
      
      let top = rect.bottom + gap;
      let left = rect.left;
      
      if (isMobile) {
        // On mobile, center the dropdown horizontally and ensure it fits
        left = Math.max(16, Math.min(
          (window.innerWidth - dropdownWidth) / 2, // Center it
          window.innerWidth - dropdownWidth - 16 // But don't go off-screen
        ));
        
        // On mobile, prefer positioning below the button, but with better spacing
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        if (spaceBelow < dropdownHeight + 32 && spaceAbove > spaceBelow) {
          // Position above if there's more space above
          top = Math.max(16, rect.top - dropdownHeight - gap);
        } else {
          // Position below with safe margins
          top = Math.min(rect.bottom + gap, window.innerHeight - dropdownHeight - 16);
        }
      } else {
        // Desktop positioning logic
        // Ensure dropdown doesn't go off-screen horizontally
        if (left + dropdownWidth > window.innerWidth) {
          left = window.innerWidth - dropdownWidth - 16;
        }
        
        // Ensure dropdown doesn't go off-screen vertically
        if (top + dropdownHeight > window.innerHeight) {
          top = rect.top - dropdownHeight - gap;
        }
        
        // Ensure minimum distance from edges
        top = Math.max(16, top);
        left = Math.max(16, left);
      }
      
      setButtonPosition({ top, left });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      
      // Update position on scroll and resize
      const handleUpdate = () => updatePosition();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
      
      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSigningOut) return;
    setIsSigningOut(true);
    
    console.log('UserProfile: Sign out button clicked!');
    
    try {
      console.log('UserProfile: Initiating sign out');
      setIsOpen(false); // Close dropdown immediately for better UX
      
      console.log('UserProfile: Calling signOut function...');
      await signOut();
      console.log('UserProfile: Sign out completed successfully');
      
    } catch (error) {
      console.error('UserProfile: Error signing out:', error);
      setIsOpen(false);
      // On error, force a reload as fallback
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!user) {
    return null;
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;

  if (showGallery) {
    return <UserGallery />;
  }

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-2 rounded-2xl hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 hover:shadow-sm border border-transparent hover:border-white/30"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover border border-gray-200 shadow-sm"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <svg
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown - Rendered via portal to avoid z-index issues */}
      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div 
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: `${buttonPosition.top}px`,
              left: `${buttonPosition.left}px`,
              width: window.innerWidth < 768 ? `${Math.min(320, window.innerWidth - 32)}px` : '320px',
            }}
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-2 max-h-[80vh] overflow-y-auto"
          >
            {/* User Info Section */}
            <div className="px-4 py-4 border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/dashboard');
                }}
                className="flex items-center w-full text-left px-4 py-4 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors group touch-manipulation"
              >
                <svg className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                Dashboard
              </button>

              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className={`flex items-center w-full text-left px-4 py-4 text-sm text-red-600 hover:bg-red-50/80 transition-colors group touch-manipulation ${isSigningOut ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <svg className="h-4 w-4 mr-3 text-red-400 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {isSigningOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}