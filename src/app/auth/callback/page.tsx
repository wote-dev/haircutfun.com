"use client"

import { createClient } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

function AuthCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    let isMounted = true
    let unsubscribe: (() => void) | null = null
    let pollTimer: any = null
    let forceNavTimer: any = null
    let redirected = false

    const cleanup = () => {
      try { localStorage.removeItem('auth_callback_in_progress') } catch {}
      if (unsubscribe) {
        try { unsubscribe() } catch {}
        unsubscribe = null
      }
      if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
      }
      if (forceNavTimer) {
        clearTimeout(forceNavTimer)
        forceNavTimer = null
      }
    }

    const safeRedirect = (to: string) => {
      if (!isMounted || redirected) return
      redirected = true
      setIsLoading(false)
      cleanup()
      try {
        // Use hard navigation for maximum reliability from the callback route
        window.location.replace(to)
      } catch {
        // Fallback to Next.js router if window API is unavailable for some reason
        router.replace(to)
      }
    }

    const handleAuthCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        console.error('Auth error:', error)
        setStatus('Authentication failed')
        setIsLoading(false)
        setTimeout(() => {
          router.push('/auth/error?message=' + encodeURIComponent(error))
        }, 500)
        return
      }

      // Create Supabase client with auto-detect disabled to avoid duplicate exchange
      const supabase = createClient({ detectSessionInUrl: false })

      // Fallback 1: if we receive a SIGNED_IN event while on this page, redirect immediately
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
          if (event === 'SIGNED_IN' && session) {
            console.log('Auth callback: Detected SIGNED_IN via onAuthStateChange, redirecting')
            const redirectTo = localStorage.getItem('auth_redirect_to') || '/'
            localStorage.removeItem('auth_redirect_to')
            safeRedirect(redirectTo)
          }
        })
        unsubscribe = () => subscription.unsubscribe()
      } catch {}

      // Fallback 2: short polling for session presence (handles rare storage propagation races)
      const startPollingForSession = () => {
        let attempts = 0
        pollTimer = setInterval(async () => {
          attempts += 1
          try {
            const { data } = await supabase.auth.getSession()
            if (data?.session) {
              console.log('Auth callback: Session detected via polling, redirecting')
              const redirectTo = localStorage.getItem('auth_redirect_to') || '/'
              localStorage.removeItem('auth_redirect_to')
              safeRedirect(redirectTo)
            }
          } catch {}
          if (attempts >= 20 && pollTimer) { // ~5s
            clearInterval(pollTimer)
            pollTimer = null
          }
        }, 250)
      }

      // Add a final safety: force navigation after a short delay if we detect a signed-in state but didn't leave the page
      const startForceNavigation = () => {
        // 3.5s should be enough for exchange + storage propagation
        forceNavTimer = setTimeout(() => {
          if (!redirected) {
            const redirectTo = localStorage.getItem('auth_redirect_to') || '/'
            localStorage.removeItem('auth_redirect_to')
            console.warn('Auth callback: forcing navigation fallback')
            safeRedirect(redirectTo)
          }
        }, 3500)
      }

      if (code) {
        // Set flag ASAP to prevent AuthProvider from auto-detecting and exchanging the code concurrently
        try { localStorage.setItem('auth_callback_in_progress', 'true') } catch {}

        // If a session already exists (e.g., another instance already exchanged), skip exchange
        try {
          const { data: existing } = await supabase.auth.getSession()
          if (existing?.session) {
            console.log('Auth callback: Session already present, skipping code exchange')
            const redirectTo = localStorage.getItem('auth_redirect_to') || '/'
            localStorage.removeItem('auth_redirect_to')
            safeRedirect(redirectTo)
            return
          }
        } catch (e) {
          console.warn('Auth callback: getSession check failed, continuing with code exchange', e)
        }

        try {
          setStatus('Exchanging authorization code...')
          console.log('Auth callback: Starting code exchange with code:', code.substring(0, 10) + '...')

          // Start polling and force-navigation fallback in parallel as a safety net
          startPollingForSession()
          startForceNavigation()

          // Exchange code directly
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('Code exchange error:', exchangeError)
            setStatus(`Authentication failed: ${exchangeError.message}`)
            setIsLoading(false)
            cleanup()
            setTimeout(() => {
              router.push('/auth/error?message=' + encodeURIComponent(exchangeError.message))
            }, 500)
            return
          }

          if (data.session) {
            console.log('Auth callback: Session established successfully')
            setStatus('Authentication successful! Redirecting...')
            // Extra validation and redirect (on success, onAuthStateChange/polling will also catch it)
            try {
              const { data: sessionCheck } = await supabase.auth.getSession()
              if (sessionCheck.session) {
                const redirectTo = localStorage.getItem('auth_redirect_to') || '/'
                localStorage.removeItem('auth_redirect_to')
                safeRedirect(redirectTo)
                return
              }
            } catch {}
            // If validation path didn’t fire, polling/auth change or force-navigation will handle redirect shortly
          } else {
            throw new Error('No session received after code exchange')
          }
        } catch (err) {
          console.error('Unexpected error during auth callback:', err)
          setStatus('Authentication failed')
          setIsLoading(false)
          cleanup()
          setTimeout(() => {
            router.push('/auth/error?message=Authentication failed')
          }, 500)
        }
      } else {
        // No code provided
        setStatus('No authorization code provided')
        setIsLoading(false)
        setTimeout(() => {
          router.push('/auth/error?message=No authorization code provided')
        }, 500)
      }
    }

    handleAuthCallback()

    return () => {
      isMounted = false
      cleanup()
    }
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Almost there!</h2>
          <p className="text-muted-foreground text-lg">{status}</p>
          <div className="mt-6 w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}