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
      return NextResponse.json(
        {
          error: 'GEMINI_API_KEY environment variable is missing on the server.',
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
    console.error('[Thumbnail AI] Error in /api/thumbnail/generate:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: 'Failed to generate thumbnail background.',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
