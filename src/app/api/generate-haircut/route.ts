import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export async function POST(request: NextRequest) {
  try {
    const { userPhoto, haircutStyle, haircutDescription } = await request.json();

    if (!userPhoto || !haircutStyle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const base64Data = userPhoto.includes(',') ? userPhoto.split(',')[1] : userPhoto;
    
    // --- THE SOLUTION: SWITCHING TO A MORE POWERFUL MODEL ---
    // We are changing from "gemini-1.5-flash" to "gemini-1.5-pro-latest".
    // This model is more capable and less likely to refuse the image editing task.
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

    console.log(`Calling Gemini 1.5 Pro API for: ${haircutStyle}`);
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;

    const candidate = response.candidates?.[0];

    if (!candidate || candidate.finishReason !== 'STOP') {
      const finishReason = candidate?.finishReason || 'Unknown';
      const safetyMessage = `Image generation was blocked. Reason: ${finishReason}.`;
      console.error('Gemini API Blocked:', { finishReason, safetyRatings: candidate?.safetyRatings });
      return NextResponse.json({ details: safetyMessage }, { status: 500 });
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
    return NextResponse.json({ details: errorMessage }, { status: 500 });
  }
}