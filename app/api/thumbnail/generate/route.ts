import { NextRequest, NextResponse } from 'next/server';
import { generateThumbnailBackground } from '@/lib/ai/thumbnail-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, width = 1599, height = 892, customPrompt } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Blog Title is required.' },
        { status: 400 }
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
    console.error('Error generating thumbnail background:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate thumbnail background.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
