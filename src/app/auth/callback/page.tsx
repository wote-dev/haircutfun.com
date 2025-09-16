'use client'

import { createClient } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function AuthCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        console.error('Auth error:', error)
        router.push('/auth/error?message=' + encodeURIComponent(error))
        return
      }

      if (code) {
        const supabase = createClient()
        
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError)
            router.push('/auth/error?message=' + encodeURIComponent(exchangeError.message))
            return
          }
          
          // Successful authentication - redirect to home or intended page
          router.push('/')
        } catch (err) {
          console.error('Unexpected error during auth callback:', err)
          router.push('/auth/error?message=Authentication failed')
        }
      } else {
        // No code provided
        router.push('/auth/error?message=No authorization code provided')
      }
      
      setIsLoading(false)
    }

    handleAuthCallback()
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Completing authentication...</p>
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