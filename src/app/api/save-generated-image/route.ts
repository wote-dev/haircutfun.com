import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service-client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Parse request body with better error handling
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { imageData, originalImageUrl, haircutStyle, gender, promptUsed } = requestData;

    // Validate required fields
    if (!imageData || !haircutStyle) {
      return NextResponse.json(
        { error: 'Missing required fields: imageData and haircutStyle are required' },
        { status: 400 }
      );
    }

    // Get the authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Use service client for database operations
    const serviceSupabase = createServiceClient();

    // Convert base64 image data to a proper URL or store it
    // For now, we'll store the base64 data directly
    const imageUrl = imageData;

    // Insert the generated image record
    const { data: savedImage, error: insertError } = await serviceSupabase
      .from('generated_images')
      .insert({
        user_id: user.id,
        image_url: imageUrl,
        original_image_url: originalImageUrl,
        haircut_style: haircutStyle,
        gender: gender,
        prompt_used: promptUsed,
        processing_time_ms: null, // Could be tracked if needed
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save image to database', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: savedImage,
      message: 'Image saved successfully'
    });

  } catch (error) {
    console.error('Error saving generated image:', error);
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: 'Request body must be valid JSON' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}