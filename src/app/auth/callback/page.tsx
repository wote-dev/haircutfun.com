import { createClient } from '../../../lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; error?: string };
}) {
  const { code, error } = searchParams;

  if (error) {
    console.error('Auth error:', error);
    redirect('/auth/error?message=' + encodeURIComponent(error));
  }

  if (code) {
    const supabase = await createClient();
    
    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        redirect('/auth/error?message=' + encodeURIComponent(exchangeError.message));
      }
      
      // Successful authentication - redirect to home or intended page
      redirect('/');
    } catch (err) {
      console.error('Unexpected error during auth callback:', err);
      redirect('/auth/error?message=Authentication failed');
    }
  }

  // No code provided
  redirect('/auth/error?message=No authorization code provided');
}