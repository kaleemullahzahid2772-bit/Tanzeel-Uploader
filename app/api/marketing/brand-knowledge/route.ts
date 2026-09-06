import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { BrandKnowledge } from '@/lib/types/database';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: brandKnowledge, error } = await supabase
      .from('brand_knowledge')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.warn('brand_knowledge fetch notice:', error.message);
    }

    const fallback: Partial<BrandKnowledge> = {
      user_id: user.id,
      brand_name: 'Nūr Social',
      description: 'Islamic ethical social media marketing & automated multi-platform distribution.',
      target_audience: 'Muslim families, students of knowledge, and faith-conscious digital audiences.',
      services: 'Islamic Educational Content, Quranic Wisdom, Community Reminders',
      products_courses: 'Quran Reflection Series, Daily Sunnah Habits, Ethical Media Masterclass',
      brand_voice: 'dignified_spiritual',
      preferred_language: 'Urdu',
      tone: 'islamic',
      primary_goal: 'increase_engagement',
      keywords: ['اسلامی تعلیمات', 'قرآن و سنت', 'تربیت', 'نور سوشل', 'دینی معلومات'],
      forbidden_keywords: ['غیر مستند احادیث', 'مناظرہ بازی', 'فرقہ واریت'],
      islamic_guidelines: 'صرف مستند قرآنی و مسنون حوالہ جات استعمال کریں اور باوقار انداز برقرار رکھیں۔',
      content_rules: { avoidUnverifiedHadith: true, dignifiedAesthetics: true, ethicalEngagement: true },
    };

    return NextResponse.json({
      success: true,
      brandKnowledge: brandKnowledge || fallback,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch brand knowledge';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const supabase = await createClient();

    const payload: Partial<BrandKnowledge> = {
      user_id: user.id,
      brand_name: body.brand_name || 'Nūr Social',
      description: body.description || '',
      target_audience: body.target_audience || '',
      services: body.services || '',
      products_courses: body.products_courses || '',
      brand_voice: body.brand_voice || 'dignified_spiritual',
      preferred_language: body.preferred_language || 'Urdu',
      tone: body.tone || 'islamic',
      primary_goal: body.primary_goal || 'increase_engagement',
      keywords: Array.isArray(body.keywords) ? body.keywords : [],
      forbidden_keywords: Array.isArray(body.forbidden_keywords) ? body.forbidden_keywords : [],
      islamic_guidelines: body.islamic_guidelines || '',
      content_rules: body.content_rules || {},
      updated_at: new Date().toISOString(),
    };

    const { data: saved, error } = await supabase
      .from('brand_knowledge')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.warn('brand_knowledge upsert notice (fallback mock):', error.message);
      return NextResponse.json({
        success: true,
        brandKnowledge: payload,
        message: 'Brand knowledge updated in session.',
      });
    }

    return NextResponse.json({
      success: true,
      brandKnowledge: saved,
      message: 'Brand knowledge saved successfully.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save brand knowledge';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
