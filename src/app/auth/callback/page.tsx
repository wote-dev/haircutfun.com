'use client'

import { createClient } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function AuthCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        console.error('Auth error:', error)
        setStatus('Authentication failed')
        setIsLoading(false)
        setTimeout(() => {
          router.push('/auth/error?message=' + encodeURIComponent(error))
        }, 1000)
        return
      }

      if (code) {
        const supabase = createClient()
        
        try {
          setStatus('Exchanging authorization code...')
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError)
            setStatus('Authentication failed')
            setIsLoading(false)
            setTimeout(() => {
              router.push('/auth/error?message=' + encodeURIComponent(exchangeError.message))
            }, 1000)
            return
          }
          
          if (data.session) {
            console.log('Auth callback: Session established successfully')
            setStatus('Authentication successful! Redirecting...')
            
            // Validate that the session is actually accessible
            const { data: sessionCheck } = await supabase.auth.getSession()
            if (sessionCheck.session) {
              console.log('Auth callback: Session validation successful')
              
              // Get the intended redirect URL from localStorage or default to home
              const redirectTo = localStorage.getItem('auth_redirect_to') || '/'
              localStorage.removeItem('auth_redirect_to')
              
              console.log('Auth callback: Redirecting to:', redirectTo)
              setIsLoading(false)
              
              // Use replace instead of push to avoid back button issues
              router.replace(redirectTo)
            } else {
              throw new Error('Session validation failed after code exchange')
            }
          } else {
            throw new Error('No session received after code exchange')
          }
        } catch (err) {
          console.error('Unexpected error during auth callback:', err)
          setStatus('Authentication failed')
          setIsLoading(false)
          setTimeout(() => {
            router.push('/auth/error?message=Authentication failed')
          }, 1000)
        }
      } else {
        // No code provided
        setStatus('No authorization code provided')
        setIsLoading(false)
        setTimeout(() => {
          router.push('/auth/error?message=No authorization code provided')
        }, 1000)
      }
    }

    handleAuthCallback()
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