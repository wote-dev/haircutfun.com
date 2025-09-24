import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile with all necessary fields
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, user_id, full_name, avatar_url, email, has_pro_access, created_at, updated_at')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Get user usage data
    const { data: usage, error: usageError } = await supabase
      .from('user_usage')
      .select('free_tries_used')
      .eq('user_id', user.id)
      .single();

    if (usageError) {
      console.error('Error fetching user usage:', usageError);
      // If no usage record exists, assume 0 free tries used
      return NextResponse.json({
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        email: profile.email,
        has_pro_access: profile.has_pro_access || false,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        free_tries_used: 0
      });
    }

    return NextResponse.json({
      id: profile.id,
      user_id: profile.user_id,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      email: profile.email,
      has_pro_access: profile.has_pro_access || false,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      free_tries_used: usage.free_tries_used || 0
    });

  } catch (error) {
    console.error('Unexpected error in profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}