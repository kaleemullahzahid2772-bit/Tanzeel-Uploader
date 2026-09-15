import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from '@/lib/supabase/server';
import { BrandKit } from '@/lib/types/thumbnail';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const LOCAL_BRAND_KIT_PATH = path.join(process.cwd(), 'data', 'brand-kit.json');

function readLocalBrandKit(): Partial<BrandKit> | null {
  try {
    if (fs.existsSync(LOCAL_BRAND_KIT_PATH)) {
      const content = fs.readFileSync(LOCAL_BRAND_KIT_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Error reading local brand kit file:', err);
  }
  return null;
}

function writeLocalBrandKit(kit: Partial<BrandKit>): void {
  try {
    const dir = path.dirname(LOCAL_BRAND_KIT_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_BRAND_KIT_PATH, JSON.stringify(kit, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error writing local brand kit file:', err);
  }
}

const DEFAULT_BRAND_KIT: Partial<BrandKit> = {
  brand_name: 'Al-Ulama',
  main_logo_url: '/uploads/brand-kit/main_logo.png',
  secondary_logo_url: null,
  icon_logo_url: '/uploads/brand-kit/icon_logo.png',
  primary_color: '#0F4C3A',
  secondary_color: '#083B2E',
  accent_color: '#C9A227',
  background_color: '#F8F4E8',
  text_color: '#FFFDF7',
  heading_font: 'Playfair Display',
  body_font: 'Inter',
  default_logo_position: 'top-right',
  default_logo_size: 'medium',
  default_template: 'islamic_premium',
  watermark_enabled: false,
  watermark_url: null,
};

export async function GET() {
  try {
    const local = readLocalBrandKit();
    const { user } = await getAuthUser();
    const userId = user?.id || '00000000-0000-0000-0000-000000000001';

    let dbData: any = null;
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('brand_kit')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) {
        dbData = data;
      }
    } catch {
      // Supabase connection fallback
    }

    // Merge: Local disk kit takes precedence for logo if present, followed by DB, then default
    const mergedKit = {
      id: dbData?.id || local?.id || 'default',
      user_id: userId,
      ...DEFAULT_BRAND_KIT,
      ...(dbData || {}),
      ...(local || {}),
      main_logo_url: local?.main_logo_url || dbData?.main_logo_url || DEFAULT_BRAND_KIT.main_logo_url || null,
      secondary_logo_url: local?.secondary_logo_url || dbData?.secondary_logo_url || null,
      icon_logo_url: local?.icon_logo_url || dbData?.icon_logo_url || DEFAULT_BRAND_KIT.icon_logo_url || null,
      default_logo_position: local?.default_logo_position || dbData?.default_logo_position || 'top-right',
    };

    return NextResponse.json({
      success: true,
      brandKit: mergedKit,
    });
  } catch (err: unknown) {
    console.error('Error fetching brand kit:', err);
    const local = readLocalBrandKit();
    return NextResponse.json({
      success: true,
      brandKit: { id: 'default', user_id: 'default', ...DEFAULT_BRAND_KIT, ...(local || {}) },
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
      default_logo_position: body.default_logo_position || 'top-right',
      default_logo_size: body.default_logo_size || 'medium',
      default_template: body.default_template || 'islamic_premium',
      watermark_enabled: Boolean(body.watermark_enabled),
      watermark_url: body.watermark_url || null,
    };

    // Save to local disk immediately for guaranteed local persistence
    writeLocalBrandKit(payload);

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
