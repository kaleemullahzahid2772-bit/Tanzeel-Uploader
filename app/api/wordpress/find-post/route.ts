import { NextRequest, NextResponse } from 'next/server';
import { getStoredWordPressSettings, findPostBySlug } from '@/lib/wordpress/client';

export const dynamic = 'force-dynamic';

/**
 * POST: Searches for a WordPress post by slug and checks existing featured image.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug } = body;

    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      return NextResponse.json(
        { found: false, message: 'Slug is required to search for a WordPress post.' },
        { status: 400 }
      );
    }

    const settings = await getStoredWordPressSettings();
    if (!settings || !settings.website_url || !settings.username || !settings.application_password) {
      return NextResponse.json(
        {
          found: false,
          message: 'WordPress settings are not configured. Please configure your WordPress site first in Settings.',
          needs_configuration: true,
        },
        { status: 400 }
      );
    }

    const match = await findPostBySlug(settings, slug.trim());
    return NextResponse.json({
      success: true,
      data: match,
    });
  } catch (err: unknown) {
    console.error('Error finding WordPress post by slug:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { found: false, message: `Failed to query WordPress: ${msg}` },
      { status: 500 }
    );
  }
}
