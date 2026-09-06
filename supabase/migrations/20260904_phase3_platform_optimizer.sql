-- ==============================================================================
-- NŪR SOCIAL — PHASE 3: PLATFORM OPTIMIZATION ENGINE MIGRATION
-- ==============================================================================
-- Description: Extends platform_content with optimization metrics and creates
-- content_versions table for historical revisions with full RLS.
-- ==============================================================================

-- 1. Extend PLATFORM_CONTENT table with Phase 3 Optimization columns
ALTER TABLE public.platform_content 
    ADD COLUMN IF NOT EXISTS optimization_status TEXT NOT NULL DEFAULT 'draft' 
        CHECK (optimization_status IN ('draft', 'optimizing', 'optimized', 'needs_review', 'approved', 'edited', 'failed')),
    ADD COLUMN IF NOT EXISTS seo_keywords JSONB NOT NULL DEFAULT '{"primary": [], "secondary": [], "long_tail": []}'::jsonb,
    ADD COLUMN IF NOT EXISTS hashtag_categories JSONB NOT NULL DEFAULT '{"brand": [], "topic": [], "audience": []}'::jsonb,
    ADD COLUMN IF NOT EXISTS optimization_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS alt_text TEXT,
    ADD COLUMN IF NOT EXISTS suggested_on_screen_text TEXT,
    ADD COLUMN IF NOT EXISTS suggested_opening_line TEXT,
    ADD COLUMN IF NOT EXISTS chapters JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS optimized_at TIMESTAMPTZ;

-- 2. Create CONTENT_VERSIONS table for version snapshots & restore
CREATE TABLE IF NOT EXISTS public.content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp')),
    version INTEGER NOT NULL DEFAULT 1,
    title TEXT,
    hook TEXT,
    caption TEXT,
    description TEXT,
    hashtags JSONB NOT NULL DEFAULT '[]'::jsonb,
    keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    cta TEXT,
    alt_text TEXT,
    suggested_on_screen_text TEXT,
    suggested_opening_line TEXT,
    chapters JSONB NOT NULL DEFAULT '[]'::jsonb,
    quality_score INTEGER NOT NULL DEFAULT 100,
    score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    optimization_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
    revision_instruction TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Add Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_content_versions_post_id ON public.content_versions(post_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_user_id ON public.content_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_platform ON public.content_versions(platform);
CREATE INDEX IF NOT EXISTS idx_content_versions_post_platform_ver ON public.content_versions(post_id, platform, version);

-- 4. Enable Row Level Security (RLS) on content_versions
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for content_versions
CREATE POLICY "Users can view own content_versions"
    ON public.content_versions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content_versions"
    ON public.content_versions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content_versions"
    ON public.content_versions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content_versions"
    ON public.content_versions FOR DELETE
    USING (auth.uid() = user_id);
