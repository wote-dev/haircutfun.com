'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../providers/AuthProvider';
import { SignInButton } from './SignInButton';
import { UserGallery } from '../UserGallery';

export function UserProfile() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
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
      const dropdownWidth = 320; // 80 * 4 (w-80 in Tailwind)
      const dropdownHeight = 400; // Approximate height
      const gap = 8;
      
      // Calculate optimal position
      let top = rect.bottom + gap;
      let left = rect.left;
      
      // Ensure dropdown doesn't go off-screen horizontally
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 16; // 16px margin from edge
      }
      
      // Ensure dropdown doesn't go off-screen vertically
      if (top + dropdownHeight > window.innerHeight) {
        top = rect.top - dropdownHeight - gap; // Position above button
      }
      
      // Ensure minimum distance from edges
      top = Math.max(16, top);
      left = Math.max(16, left);
      
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
    
    console.log('UserProfile: Sign out button clicked!');
    
    try {
      console.log('UserProfile: Initiating sign out');
      setIsOpen(false); // Close dropdown immediately for better UX
      
      console.log('UserProfile: Calling signOut function...');
      await signOut();
      console.log('UserProfile: Sign out completed successfully');
      
    } catch (error) {
      console.error('UserProfile: Error signing out:', error);
      // Force cleanup even on error
      setIsOpen(false);
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
            }}
            className="w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-2"
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

            {/* Image Gallery Section */}
            <div className="px-4 py-3 border-b border-gray-100/50">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Creations</h3>
              <div className="grid grid-cols-3 gap-2">
                {/* Mock images for now */}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => setShowGallery(true)}
                  >
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowGallery(true)}
                className="w-full mt-3 px-3 py-2 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                View All Images →
              </button>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to settings
                }}
                className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors group"
              >
                <svg className="h-4 w-4 mr-3 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>

              <button
                onClick={handleSignOut}
                className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50/80 transition-colors group"
              >
                <svg className="h-4 w-4 mr-3 text-red-400 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}