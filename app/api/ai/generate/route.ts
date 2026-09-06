import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { generateMultiPlatformContent } from '@/lib/ai/gemini';
import { detectDuplicateContent } from '@/lib/ai/similarity-engine';
import {
  SocialPlatform,
  ContentLanguage,
  ContentTone,
  BrandSettings,
} from '@/lib/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      postId,
      topic,
      additionalInstructions,
      language = 'urdu',
      tone = 'islamic',
      platforms = ['facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp'],
      mediaId,
    }: {
      postId?: string;
      topic: string;
      additionalInstructions?: string;
      language?: ContentLanguage;
      tone?: ContentTone;
      platforms?: SocialPlatform[];
      mediaId?: string;
    } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { error: 'Topic is required for AI content generation' },
        { status: 400 }
      );
    }

    if (!platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'At least one target social platform must be selected' },
        { status: 400 }
      );
    }

    let brandSettings: BrandSettings | null = null;
    let userId: string | null = null;
    let mediaUrl: string | null = null;
    let mediaType: 'image' | 'video' | null = null;

    const supabase = await createClient();

    try {
      const { user } = await getAuthUser();
      if (user) {
        userId = user.id;

        // Fetch brand settings
        const { data: brandData } = await supabase
          .from('brand_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (brandData) brandSettings = brandData;

        // Fetch media item if provided
        if (mediaId) {
          const { data: mediaData } = await supabase
            .from('media')
            .select('*')
            .eq('id', mediaId)
            .maybeSingle();

          if (mediaData) {
            mediaUrl = mediaData.public_url;
            mediaType = mediaData.file_type;
          }
        }
      }
    } catch (err) {
      console.warn('Auth lookup notice in generation route:', err);
    }

    // 1. Generate & Optimize Content across all selected platforms
    const generatedContent = await generateMultiPlatformContent({
      topic: topic.trim(),
      additionalInstructions: additionalInstructions?.trim(),
      language,
      tone,
      platforms,
      brandSettings,
      mediaUrl,
      mediaType,
    });

    // 2. Cross-platform duplicate content check
    const duplicateWarnings = detectDuplicateContent(generatedContent);

    // 3. Persist to Database if Supabase is connected
    if (userId && postId) {
      try {
        // Log generation entry
        await supabase.from('ai_generations').insert({
          post_id: postId,
          user_id: userId,
          model: process.env.GEMINI_API_KEY ? 'gemini-1.5-flash' : 'nur-intelligent-engine',
          prompt: topic.trim(),
          source_content: { topic, additionalInstructions, language, tone, platforms, mediaId },
          generated_content: generatedContent,
          status: 'completed',
        });

        // Insert platform contents & initial version 1 snapshots
        for (const platform of platforms) {
          const content = generatedContent[platform];
          if (!content) continue;

          await supabase.from('platform_content').upsert(
            {
              post_id: postId,
              user_id: userId,
              platform,
              title: content.title || null,
              hook: content.hook || null,
              caption: content.caption || null,
              description: content.description || null,
              hashtags: content.hashtags || [],
              keywords: content.keywords || [],
              tags: content.tags || [],
              cta: content.cta || null,
              alt_text: content.alt_text || null,
              suggested_on_screen_text: content.suggested_on_screen_text || null,
              suggested_opening_line: content.suggested_opening_line || null,
              chapters: content.chapters || [],
              seo_keywords: content.seo_keywords || {},
              hashtag_categories: content.hashtag_categories || {},
              status: 'draft',
              optimization_status: 'optimized',
              version: 1,
              quality_score: content.quality_score || 95,
              score_breakdown: content.score_breakdown || {},
              optimization_suggestions: content.optimization_suggestions || [],
              optimized_at: new Date().toISOString(),
            },
            { onConflict: 'post_id,platform' }
          );

          // Insert Version 1 snapshot
          await supabase.from('content_versions').insert({
            post_id: postId,
            user_id: userId,
            platform,
            version: 1,
            title: content.title || null,
            hook: content.hook || null,
            caption: content.caption || null,
            description: content.description || null,
            hashtags: content.hashtags || [],
            keywords: content.keywords || [],
            tags: content.tags || [],
            cta: content.cta || null,
            alt_text: content.alt_text || null,
            suggested_on_screen_text: content.suggested_on_screen_text || null,
            suggested_opening_line: content.suggested_opening_line || null,
            chapters: content.chapters || [],
            quality_score: content.quality_score || 95,
            score_breakdown: content.score_breakdown || {},
            optimization_suggestions: content.optimization_suggestions || [],
            revision_instruction: 'Initial Generation',
          });
        }
      } catch (dbErr) {
        console.warn('Database save warning during generation:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      content: generatedContent,
      duplicateWarnings,
    });
  } catch (error: unknown) {
    console.error('API /api/ai/generate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI Content Generation failed' },
      { status: 500 }
    );
  }
}
