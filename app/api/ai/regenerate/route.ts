import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { regenerateSinglePlatformContent } from '@/lib/ai/gemini';
import { validatePlatformContent } from '@/lib/ai/validator';
import {
  SocialPlatform,
  ContentLanguage,
  ContentTone,
  PlatformContentData,
  BrandSettings,
} from '@/lib/types/database';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      postId,
      platform,
      currentContent,
      instruction,
      language = 'urdu',
      tone = 'islamic',
    } = body;

    if (!platform) {
      return NextResponse.json(
        { error: 'Target platform is required for regeneration.' },
        { status: 400 }
      );
    }

    if (!instruction || typeof instruction !== 'string' || !instruction.trim()) {
      return NextResponse.json(
        { error: 'Specific instructions or modification feedback is required.' },
        { status: 400 }
      );
    }

    // Connect to Supabase to fetch user & brand settings
    const supabase = await createClient();
    let userId: string | null = null;
    let brandSettings: BrandSettings | null = null;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        userId = user.id;

        const { data: brandData } = await supabase
          .from('brand_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (brandData) {
          brandSettings = brandData as BrandSettings;
        }
      }
    } catch (authErr) {
      console.warn('Auth check skipped in regenerate route:', authErr);
    }

    // Regenerate content for the platform
    const regenerated = await regenerateSinglePlatformContent({
      platform: platform as SocialPlatform,
      currentContent: (currentContent || {}) as PlatformContentData,
      instruction: instruction.trim(),
      language: language as ContentLanguage,
      tone: tone as ContentTone,
      brandSettings,
    });

    // Validate regenerated content
    const validation = validatePlatformContent(platform as SocialPlatform, regenerated);
    const qualityNotes = [
      ...(validation.issues || []),
      ...(validation.islamicSafetyNotes || []),
    ];

    // If authenticated & postId present, update database with incremented version
    if (userId && postId) {
      try {
        // Fetch current version
        const { data: existingContent } = await supabase
          .from('platform_content')
          .select('version')
          .eq('post_id', postId)
          .eq('platform', platform)
          .maybeSingle();

        const nextVersion = (existingContent?.version || 1) + 1;

        await supabase.from('platform_content').upsert(
          {
            post_id: postId,
            user_id: userId,
            platform,
            title: regenerated.title || null,
            hook: regenerated.hook || null,
            caption: regenerated.caption || null,
            description: regenerated.description || null,
            hashtags: regenerated.hashtags || [],
            keywords: regenerated.keywords || [],
            tags: regenerated.tags || [],
            cta: regenerated.cta || null,
            status: validation.needsReview ? 'needs_review' : 'draft',
            version: nextVersion,
            quality_score: validation.score,
            quality_notes: qualityNotes,
          },
          { onConflict: 'post_id,platform' }
        );
      } catch (dbErr) {
        console.warn('Error updating platform_content version in regenerate:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      platform,
      content: regenerated,
      validation,
    });
  } catch (error: unknown) {
    console.error('AI Regenerate API Route error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error during regeneration',
      },
      { status: 500 }
    );
  }
}
