import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call the database function to increment usage
    const { data, error } = await supabase.rpc('increment_usage', {
      user_id: user.id
    });

    if (error) {
      console.error('Error incrementing usage:', error);
      return NextResponse.json({ error: 'Failed to increment usage' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      new_usage_count: data
    });

  } catch (error) {
    console.error('Unexpected error in increment-usage API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}