import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { BrandKit } from '@/lib/types/thumbnail';

export const dynamic = 'force-dynamic';

const DEFAULT_BRAND_KIT: Partial<BrandKit> = {
  brand_name: 'Al Tanzeel Quran Academy',
  main_logo_url: null,
  secondary_logo_url: null,
  icon_logo_url: null,
  primary_color: '#0F4C3A',
  secondary_color: '#083B2E',
  accent_color: '#C9A227',
  background_color: '#F8F4E8',
  text_color: '#FFFDF7',
  heading_font: 'Playfair Display',
  body_font: 'Inter',
  default_logo_position: 'bottom-right',
  default_logo_size: 'medium',
  default_template: 'islamic_premium',
  watermark_enabled: false,
  watermark_url: null,
};

export async function GET() {
  try {
    const { user } = await getAuthUser();
    const userId = user?.id || '00000000-0000-0000-0000-000000000001';

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('brand_kit')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('brand_kit table fetch note:', error.message);
      return NextResponse.json({
        success: true,
        brandKit: { id: 'default', user_id: userId, ...DEFAULT_BRAND_KIT },
      });
    }

    if (!data) {
      return NextResponse.json({
        success: true,
        brandKit: { id: 'default', user_id: userId, ...DEFAULT_BRAND_KIT },
      });
    }

    return NextResponse.json({
      success: true,
      brandKit: data,
    });
  } catch (err: unknown) {
    console.error('Error fetching brand kit:', err);
    return NextResponse.json({
      success: true,
      brandKit: { id: 'default', user_id: 'default', ...DEFAULT_BRAND_KIT },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await getAuthUser();
    const userId = user?.id || '00000000-0000-0000-0000-000000000001';
    const body = await req.json();

    const payload = {
      user_id: userId,
      brand_name: body.brand_name || 'Al Tanzeel Quran Academy',
      main_logo_url: body.main_logo_url || null,
      secondary_logo_url: body.secondary_logo_url || null,
      icon_logo_url: body.icon_logo_url || null,
      primary_color: body.primary_color || '#0F4C3A',
      secondary_color: body.secondary_color || '#083B2E',
      accent_color: body.accent_color || '#C9A227',
      background_color: body.background_color || '#F8F4E8',
      text_color: body.text_color || '#FFFDF7',
      heading_font: body.heading_font || 'Playfair Display',
      body_font: body.body_font || 'Inter',
      default_logo_position: body.default_logo_position || 'bottom-right',
      default_logo_size: body.default_logo_size || 'medium',
      default_template: body.default_template || 'islamic_premium',
      watermark_enabled: Boolean(body.watermark_enabled),
      watermark_url: body.watermark_url || null,
    };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('brand_kit')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.warn('Supabase upsert brand_kit note:', error.message);
      return NextResponse.json({
        success: true,
        brandKit: { id: 'local_kit', ...payload },
      });
    }

    return NextResponse.json({
      success: true,
      brandKit: data,
    });
  } catch (err: unknown) {
    console.error('Error saving brand kit:', err);
    return NextResponse.json(
      { error: 'Failed to save Brand Kit' },
      { status: 500 }
    );
  }
}
