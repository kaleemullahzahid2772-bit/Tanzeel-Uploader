-- ==============================================================================
-- NŪR SOCIAL — PHASE: AI THUMBNAIL MAKER & BRAND KIT
-- Migration: 20260908_thumbnail_maker_and_brand_kit.sql
-- Description: Creates brand_kit and thumbnail_projects tables with RLS & updated_at triggers
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.brand_kit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL DEFAULT 'Al Tanzeel Quran Academy',
    main_logo_url TEXT,
    secondary_logo_url TEXT,
    icon_logo_url TEXT,
    primary_color TEXT NOT NULL DEFAULT '#0F4C3A',
    secondary_color TEXT NOT NULL DEFAULT '#083B2E',
    accent_color TEXT NOT NULL DEFAULT '#C9A227',
    background_color TEXT NOT NULL DEFAULT '#F8F4E8',
    text_color TEXT NOT NULL DEFAULT '#FFFDF7',
    heading_font TEXT NOT NULL DEFAULT 'Playfair Display',
    body_font TEXT NOT NULL DEFAULT 'Inter',
    default_logo_position TEXT NOT NULL DEFAULT 'bottom-right' 
        CHECK (default_logo_position IN ('top-left', 'top-right', 'bottom-left', 'bottom-right')),
    default_logo_size TEXT NOT NULL DEFAULT 'medium' 
        CHECK (default_logo_size IN ('small', 'medium', 'large', 'none')),
    default_template TEXT NOT NULL DEFAULT 'islamic_premium'
        CHECK (default_template IN ('islamic_premium', 'minimal_quran', 'educational', 'blog_news', 'islamic_luxury')),
    watermark_enabled BOOLEAN NOT NULL DEFAULT false,
    watermark_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.thumbnail_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    width INTEGER NOT NULL DEFAULT 1599,
    height INTEGER NOT NULL DEFAULT 892,
    template TEXT NOT NULL DEFAULT 'islamic_premium',
    background_image_url TEXT,
    final_thumbnail_url TEXT,
    image_prompt TEXT,
    visual_concept TEXT,
    logo_url TEXT,
    logo_position TEXT NOT NULL DEFAULT 'bottom-right'
        CHECK (logo_position IN ('top-left', 'top-right', 'bottom-left', 'bottom-right')),
    logo_size TEXT NOT NULL DEFAULT 'medium'
        CHECK (logo_size IN ('small', 'medium', 'large', 'none')),
    title_position TEXT NOT NULL DEFAULT 'center'
        CHECK (title_position IN ('top', 'center', 'bottom')),
    text_align TEXT NOT NULL DEFAULT 'center'
        CHECK (text_align IN ('left', 'center', 'right')),
    overlay_opacity TEXT NOT NULL DEFAULT 'medium'
        CHECK (overlay_opacity IN ('light', 'medium', 'dark', 'none')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_brand_kit_user ON public.brand_kit(user_id);
CREATE INDEX IF NOT EXISTS idx_thumbnail_projects_user ON public.thumbnail_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_thumbnail_projects_created_at ON public.thumbnail_projects(created_at DESC);

CREATE OR REPLACE FUNCTION public.handle_thumbnail_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_brand_kit_updated_at ON public.brand_kit;
CREATE TRIGGER trg_brand_kit_updated_at
    BEFORE UPDATE ON public.brand_kit
    FOR EACH ROW EXECUTE FUNCTION public.handle_thumbnail_updated_at();

DROP TRIGGER IF EXISTS trg_thumbnail_projects_updated_at ON public.thumbnail_projects;
CREATE TRIGGER trg_thumbnail_projects_updated_at
    BEFORE UPDATE ON public.thumbnail_projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_thumbnail_updated_at();

ALTER TABLE public.brand_kit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thumbnail_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brand_kit" ON public.brand_kit FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brand_kit" ON public.brand_kit FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand_kit" ON public.brand_kit FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brand_kit" ON public.brand_kit FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own thumbnail_projects" ON public.thumbnail_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own thumbnail_projects" ON public.thumbnail_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own thumbnail_projects" ON public.thumbnail_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own thumbnail_projects" ON public.thumbnail_projects FOR DELETE USING (auth.uid() = user_id);
