import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service-client';

export async function GET() {
  try {
    // Get the authenticated user from cookies/session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = createServiceClient();

    // Fetch user profile (may not exist for new users)
    const { data: profile, error: profileError } = await service
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // Fetch most recent subscription (no status filter to avoid edge cases)
    const { data: subscription, error: subscriptionError } = await service
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch usage for current month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const { data: usage, error: usageError } = await service
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('month_year', currentMonth)
      .maybeSingle();

    // Log non-fatal errors server-side for diagnostics (no secrets)
    if (profileError) console.warn('user-data: profileError', profileError.message);
    if (subscriptionError) console.warn('user-data: subscriptionError', subscriptionError.message);
    if (usageError) console.warn('user-data: usageError', usageError.message);

    return NextResponse.json({ profile: profile ?? null, subscription: subscription ?? null, usage: usage ?? null });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}