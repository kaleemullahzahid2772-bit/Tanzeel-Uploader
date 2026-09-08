import { NextRequest, NextResponse } from 'next/server';
import { generateThumbnailBackground } from '@/lib/ai/thumbnail-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, width = 1599, height = 892, customPrompt } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Thumbnail title is required. Please provide a valid title.' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn('[Thumbnail AI] GEMINI_API_KEY is not set in environment variables.');
      return NextResponse.json(
        {
          error: 'GEMINI_API_KEY environment variable is missing on the server. Please add your Google Gemini API key to .env.local to enable AI generation.',
          code: 'API_KEY_MISSING',
        },
        { status: 500 }
      );
    }

    const parsedWidth = Math.max(200, Math.min(4000, Number(width) || 1599));
    const parsedHeight = Math.max(200, Math.min(4000, Number(height) || 892));

    const result = await generateThumbnailBackground(
      title.trim(),
      parsedWidth,
      parsedHeight,
      { customPrompt }
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error('[Thumbnail AI] Error in /api/ai/generate-thumbnail:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    let userFriendlyMessage = 'Failed to generate thumbnail. Please try again.';

    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      userFriendlyMessage = 'Google Gemini API rate limit or quota exceeded. Please try again in a few moments.';
    } else if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid api key')) {
      userFriendlyMessage = 'The configured GEMINI_API_KEY is invalid. Please verify your Google Gemini API key.';
    } else if (errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE')) {
      userFriendlyMessage = 'Gemini model is currently experiencing high demand. Please try again in a moment.';
    }

    return NextResponse.json(
      {
        error: userFriendlyMessage,
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
