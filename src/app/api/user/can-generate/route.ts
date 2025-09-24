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

    // Call the database function to check if user can generate
    const { data, error } = await supabase.rpc('can_user_generate', {
      user_id: user.id
    });

    if (error) {
      console.error('Error checking if user can generate:', error);
      return NextResponse.json({ error: 'Failed to check generation status' }, { status: 500 });
    }

    return NextResponse.json({
      can_generate: data,
      user_id: user.id
    });

  } catch (error) {
    console.error('Unexpected error in can-generate API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}