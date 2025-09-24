import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

console.log("GEMINI_API_KEY check:", process.env.GEMINI_API_KEY ? `Loaded, starting with ${process.env.GEMINI_API_KEY.substring(0, 8)}...` : "!!!!!!!! NOT LOADED !!!!!!!");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { userPhoto, haircutStyle, haircutDescription, isFirstTry } = await request.json();

    console.log('API: Request received - user:', !!user, 'isFirstTry:', isFirstTry);

    if (!userPhoto || !haircutStyle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Handle authenticated users
    if (user) {
      try {
        // Check if user can generate using the database function
        const { data: canGenerate, error: canGenerateError } = await supabase
          .rpc('can_user_generate', { p_user_id: user.id });

        if (canGenerateError) {
          console.error('Error checking user generation permission:', canGenerateError);
          return NextResponse.json({ 
            details: 'Database connection error. Please try again later.' 
          }, { status: 503 });
        }

        if (!canGenerate) {
          return NextResponse.json({ 
            error: 'Free trial used',
            details: 'You\'ve used your free try! Upgrade to Pro for unlimited generations with a one-time payment of $4.99.' 
          }, { status: 402 });
        }
      } catch (error) {
        console.error('Database error for authenticated user:', error);
        return NextResponse.json({ 
          details: 'Database connection error. Please try again later.' 
        }, { status: 503 });
      }
    } else {
      // Handle non-authenticated users
      console.log('API: Non-authenticated user attempting to generate haircut, isFirstTry:', isFirstTry);
      
      // Allow non-authenticated users only if it's their first try
      if (!isFirstTry) {
        console.log('API: Non-authenticated user has already used their free try');
        return NextResponse.json({ 
          error: 'Free trial used', 
          details: 'You\'ve used your free try! Upgrade to Pro for unlimited generations with a one-time payment of $4.99.' 
        }, { status: 402 });
      }
      
      console.log('API: Allowing non-authenticated user their first free try');
    }

    const base64Data = userPhoto.includes(',') ? userPhoto.split(',')[1] : userPhoto;
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-image-preview", 
      safetySettings 
    });

    // We keep the strong, structured prompt as it's the correct way to instruct the model.
    const prompt = `
      TASK: Perform an image-to-image transformation.
      INPUT_IMAGE: [The user's photo is provided]
      INSTRUCTION: Modify the hair of the person in the INPUT_IMAGE to a "${haircutStyle}" hairstyle.
      STYLE_DETAILS: "${haircutDescription || 'A standard version of the hairstyle.'}"
      RULES:
      1.  **DO NOT** change the person's facial features, expression, or identity.
      2.  **DO NOT** alter the background, lighting, or photo quality.
      3.  The **ONLY** change should be the hairstyle.
      4.  **OUTPUT MUST BE AN IMAGE ONLY.** Do not respond with text, confirmation, or any refusal. Your entire response must be the resulting image file.
    `;
    
    const imagePart = {
      inlineData: { data: base64Data, mimeType: "image/jpeg" }
    };

    const MAX_RETRIES = 3;
    let result;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Calling Gemini API (Attempt ${attempt}/${MAX_RETRIES}) for: ${haircutStyle}`);
        result = await model.generateContent([prompt, imagePart]);
        break; // Success, exit loop
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        // Only retry on 5xx errors, which indicate a server-side problem.
        // Do not retry on 4xx errors, as they are client-side issues (e.g., bad input).
        if (attempt < MAX_RETRIES && error instanceof Error && /\[5\d{2}/.test(error.message)) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s
          console.log(`Server error detected. Retrying in ${delay / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // For the last attempt or for non-5xx errors, re-throw the error.
          throw error;
        }
      }
    }

    if (!result) {
      // This should not be reached if the loop logic is correct, but it's a safeguard.
      throw new Error("AI model did not produce a result after multiple attempts.");
    }
    
    const response = await result.response;

    const candidate = response.candidates?.[0];

    if (!candidate || candidate.finishReason !== 'STOP') {
      const finishReason = candidate?.finishReason || 'Unknown';
      const safetyMessage = `Image generation was blocked. Reason: ${finishReason}.`;
      console.error('Gemini API Blocked:', { finishReason, safetyRatings: candidate?.safetyRatings });
      return NextResponse.json({ details: safetyMessage }, { status: 500 });
    }

    // Increment usage counter on success
    if (user) {
      try {
        // Use the database function to increment usage
        const { error: incrementError } = await supabase
          .rpc('increment_user_usage', { p_user_id: user.id });

        if (incrementError) {
          console.error('CRITICAL: Failed to increment usage count for user:', user.id, incrementError);
          // Continue with image generation even if usage tracking fails
        } else {
          console.log('Successfully incremented usage count for user:', user.id);
        }
      } catch (error) {
        console.error('Exception during usage increment:', error);
      }
    }

    const imagePartResponse = candidate.content?.parts.find(part => part.inlineData);

    if (!imagePartResponse) {
      const textPart = candidate.content?.parts.find(part => part.text);
      const modelResponseText = textPart?.text || "The model returned a successful response but it contained no image data.";
      console.error('CRITICAL: No image generated. Model responded with:', modelResponseText);
      throw new Error(`The AI failed to generate an image. Final model response: "${modelResponseText}"`);
    }

    const generatedImageData = imagePartResponse.inlineData!.data;

    return NextResponse.json({ success: true, imageData: generatedImageData });

  } catch (error) {
    console.error('Critical Error in generate-haircut API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown internal error occurred.';
    // Provide a more user-friendly message for common API errors
    if (errorMessage.includes('500') || errorMessage.includes('Internal error')) {
      return NextResponse.json({ details: 'The AI service is currently experiencing issues. Please try again in a few moments.' }, { status: 503 });
    }
    return NextResponse.json({ details: errorMessage }, { status: 500 });
  }
}