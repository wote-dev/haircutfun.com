'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { SignInButton } from './SignInButton';

export function UserProfile() {
  const { user, profile, subscription, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <SignInButton />;
  }

  const avatarUrl = user.user_metadata?.avatar_url || profile?.avatar_url;
  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email;
  const isPremium = subscription?.status === 'active';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName || 'User avatar'}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        
        {isPremium && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ✨ Premium
          </span>
        )}
        
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {displayName}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user.email}
            </p>
            {subscription && (
              <p className="text-xs text-gray-400 mt-1">
                {subscription.status === 'active' ? (
                  <span className="text-green-600">Premium Active</span>
                ) : (
                  <span className="text-gray-500">Free Plan</span>
                )}
              </p>
            )}
          </div>
          
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to profile page when implemented
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Profile Settings
            </button>
            
            {!isPremium && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to pricing page
                  window.location.href = '/pricing';
                }}
                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Upgrade to Premium
              </button>
            )}
            
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}