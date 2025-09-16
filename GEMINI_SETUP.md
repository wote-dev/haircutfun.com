# Gemini API Setup for HairCuttr

This guide will help you set up the Google Gemini API for AI-powered haircut descriptions in your HairCuttr application.

## Current Implementation Status

**✅ Phase 1: AI-Powered Image Generation (Currently Active)**
- Uses Gemini 2.5 Flash Image Preview for visual haircut transformations
- Generates actual images showing how users would look with different styles
- Real-time AI-powered image generation and manipulation
- Professional-quality haircut previews with uploaded photos

## Prerequisites

- A Google account
- Access to Google AI Studio
- Node.js and npm installed

## Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key" or "Get Started"
3. Sign in with your Google account
4. Create a new API key or use an existing one
5. Copy your API key

## Step 2: Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace `your_gemini_api_key_here` with your actual API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

**Important**: Never commit your API key to version control. The `.env.local` file should be in your `.gitignore`.

## Step 3: Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Navigate to the try-on page
3. Upload a photo and select a haircut style
4. Wait for AI processing (10-30 seconds)
5. View the generated image showing your new hairstyle
6. Save or share your AI-generated transformation

## Current Features

- **AI-Powered Image Generation**: Uses Gemini 2.5 Flash Image Preview to create actual visual previews
- **Real-Time Transformations**: Advanced AI creates realistic haircut previews using your uploaded photo
- **Professional Quality**: High-quality image generation maintaining your facial features
- **Smart Processing**: Seamlessly applies new hairstyles while preserving your natural appearance
- **Error Handling**: Graceful error handling with retry functionality
- **Loading States**: User-friendly loading indicators during generation
- **Save & Share**: Options to save and share your AI-generated transformations

## API Usage

The integration uses the `/api/generate-haircut` endpoint which:

1. Accepts user photo and haircut style preferences
2. Sends the image and prompt to Gemini API
3. Returns the generated image with the new hairstyle
4. Handles errors and provides meaningful feedback

## Troubleshooting

### Common Issues

1. **API Key Error**: Make sure your API key is correctly set in `.env.local`
2. **Rate Limits**: Gemini API has usage limits. Check your quota in Google AI Studio
3. **Image Format**: Ensure uploaded images are in supported formats (JPEG, PNG)
4. **Network Issues**: Check your internet connection and firewall settings

### Error Messages

- `Missing required fields`: Check that both image and haircut style are provided
- `Failed to generate haircut image`: API request failed, try again
- `No image generated`: The API didn't return an image, possibly due to content policies

## API Limits

- **Free Tier**: Limited requests per minute/day
- **Image Size**: Recommended max 4MB per image
- **Processing Time**: Typically 10-30 seconds per generation

## Security Notes

- API keys should never be exposed in client-side code
- All API calls are made server-side through Next.js API routes
- User images are processed temporarily and not stored permanently

## Support

For issues with:
- **Gemini API**: Check [Google AI Documentation](https://ai.google.dev/docs)
- **Application**: Create an issue in the project repository