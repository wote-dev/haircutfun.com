import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return key;
}

export async function POST() {
  const cookieStore = await cookies();
  let response = NextResponse.json({ ok: true });

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (e) {
    response = NextResponse.json({ ok: false, error: 'supabase_signout_failed' }, { status: 200 });
  }

  // Fallback: proactively clear common auth cookies
  const cookieNames = [
    'sb-access-token',
    'sb-refresh-token',
  ];
  cookieNames.forEach((name) => {
    response.cookies.set(name, '', { path: '/', expires: new Date(0) });
  });

  return response;
}