import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { optimizeSinglePlatformContent } from '@/lib/ai/gemini';
import {
  SocialPlatform,
  ContentLanguage,
  ContentTone,
  BrandSettings,
  PlatformContentData,
} from '@/lib/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      postId,
      platform,
      currentContent,
      instruction,
      topic,
      language = 'urdu',
      tone = 'islamic',
    }: {
      postId?: string;
      platform: SocialPlatform;
      currentContent: PlatformContentData;
      instruction: string;
      topic?: string;
      language?: ContentLanguage;
      tone?: ContentTone;
    } = body;

    if (!platform || !currentContent) {
      return NextResponse.json(
        { error: 'Platform and currentContent are required for optimization' },
        { status: 400 }
      );
    }

    let brandSettings: BrandSettings | null = null;
    let userId: string | null = null;
    const supabase = await createClient();

    try {
      const { user } = await getAuthUser();
      if (user) {
        userId = user.id;
        const { data: brandData } = await supabase
          .from('brand_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (brandData) brandSettings = brandData;
      }
    } catch (err) {
      console.warn('User auth lookup notice in optimize route:', err);
    }

    // 1. Optimize Single Platform Content
    const optimizedContent = await optimizeSinglePlatformContent({
      platform,
      currentContent,
      instruction: instruction || 'Optimize for maximum engagement and platform fit.',
      topic: topic || currentContent.title || 'Islamic Reflection',
      language,
      tone,
      brandSettings,
    });

    let currentVersion = 1;

    // 2. Persist to Supabase if connected and authenticated
    if (userId && postId) {
      try {
        // Fetch current version from platform_content
        const { data: existingRow } = await supabase
          .from('platform_content')
          .select('version')
          .eq('post_id', postId)
          .eq('platform', platform)
          .maybeSingle();

        currentVersion = (existingRow?.version || 1) + 1;

        // Upsert into platform_content
        await supabase.from('platform_content').upsert(
          {
            post_id: postId,
            user_id: userId,
            platform,
            title: optimizedContent.title || null,
            hook: optimizedContent.hook || null,
            caption: optimizedContent.caption || null,
            description: optimizedContent.description || null,
            hashtags: optimizedContent.hashtags || [],
            keywords: optimizedContent.keywords || [],
            tags: optimizedContent.tags || [],
            cta: optimizedContent.cta || null,
            alt_text: optimizedContent.alt_text || null,
            suggested_on_screen_text: optimizedContent.suggested_on_screen_text || null,
            suggested_opening_line: optimizedContent.suggested_opening_line || null,
            chapters: optimizedContent.chapters || [],
            seo_keywords: optimizedContent.seo_keywords || {},
            hashtag_categories: optimizedContent.hashtag_categories || {},
            status: 'draft',
            optimization_status: 'optimized',
            version: currentVersion,
            quality_score: optimizedContent.quality_score || 95,
            score_breakdown: optimizedContent.score_breakdown || {},
            optimization_suggestions: optimizedContent.optimization_suggestions || [],
            optimized_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'post_id,platform' }
        );

        // Save Version Snapshot in content_versions
        await supabase.from('content_versions').insert({
          post_id: postId,
          user_id: userId,
          platform,
          version: currentVersion,
          title: optimizedContent.title || null,
          hook: optimizedContent.hook || null,
          caption: optimizedContent.caption || null,
          description: optimizedContent.description || null,
          hashtags: optimizedContent.hashtags || [],
          keywords: optimizedContent.keywords || [],
          tags: optimizedContent.tags || [],
          cta: optimizedContent.cta || null,
          alt_text: optimizedContent.alt_text || null,
          suggested_on_screen_text: optimizedContent.suggested_on_screen_text || null,
          suggested_opening_line: optimizedContent.suggested_opening_line || null,
          chapters: optimizedContent.chapters || [],
          quality_score: optimizedContent.quality_score || 95,
          score_breakdown: optimizedContent.score_breakdown || {},
          optimization_suggestions: optimizedContent.optimization_suggestions || [],
          revision_instruction: instruction || 'One-click AI optimization',
        });
      } catch (dbErr) {
        console.warn('Database save warning in optimize route:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      platform,
      version: currentVersion,
      content: optimizedContent,
    });
  } catch (error: unknown) {
    console.error('API /api/ai/optimize error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Platform optimization failed' },
      { status: 500 }
    );
  }
}
