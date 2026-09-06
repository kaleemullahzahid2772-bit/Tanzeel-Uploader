-- ==============================================================================
-- NŪR SOCIAL - PHASE 8: AI MARKETING MANAGER DATABASE MIGRATION
-- Migration Date: 2026-09-05
-- Description: Creates brand_knowledge, ai_marketing_insights, and ai_content_ideas
-- tables with comprehensive RLS policies and performance indexes.
-- ==============================================================================

-- 1. Create BRAND_KNOWLEDGE table
CREATE TABLE IF NOT EXISTS public.brand_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL DEFAULT 'Nūr Social',
    description TEXT,
    target_audience TEXT,
    services TEXT,
    products_courses TEXT,
    brand_voice TEXT DEFAULT 'dignified_spiritual',
    preferred_language TEXT DEFAULT 'Urdu',
    tone TEXT DEFAULT 'islamic',
    primary_goal TEXT DEFAULT 'increase_engagement' 
        CHECK (primary_goal IN (
            'grow_followers',
            'increase_engagement',
            'increase_reach',
            'generate_leads',
            'promote_courses',
            'website_traffic',
            'brand_awareness',
            'video_views'
        )),
    keywords TEXT[] DEFAULT '{}',
    forbidden_keywords TEXT[] DEFAULT '{}',
    islamic_guidelines TEXT,
    content_rules JSONB DEFAULT '{"avoidUnverifiedHadith": true, "dignifiedAesthetics": true, "ethicalEngagement": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_brand_knowledge_user UNIQUE (user_id)
);

-- 2. Create AI_MARKETING_INSIGHTS table (Cached insights & action recommendations)
CREATE TABLE IF NOT EXISTS public.ai_marketing_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN (
        'overview',
        'content',
        'platform',
        'audience',
        'action',
        'strategy',
        'weekly_plan',
        'top_performing',
        'underperforming',
        'health_score',
        'repurpose'
    )),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT,
    supporting_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence TEXT NOT NULL DEFAULT 'medium' 
        CHECK (confidence IN ('high', 'medium', 'low', 'insufficient_data')),
    date_range JSONB DEFAULT '{"preset": "last_30d"}'::jsonb,
    platform TEXT CHECK (platform IS NULL OR platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp', 'all')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create AI_CONTENT_IDEAS table
CREATE TABLE IF NOT EXISTS public.ai_content_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    content_type TEXT NOT NULL DEFAULT 'reel_short' 
        CHECK (content_type IN ('video', 'image', 'reel_short', 'carousel', 'text', 'story', 'other')),
    target_platform TEXT NOT NULL DEFAULT 'all'
        CHECK (target_platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp', 'all')),
    objective TEXT NOT NULL,
    hook TEXT,
    cta TEXT,
    reason TEXT,
    estimated_resonance_score NUMERIC(4, 1) DEFAULT 8.5,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'saved', 'used', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    used_at TIMESTAMPTZ
);

-- 4. Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_brand_knowledge_user ON public.brand_knowledge(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_marketing_insights_user ON public.ai_marketing_insights(user_id, insight_type, is_active);
CREATE INDEX IF NOT EXISTS idx_ai_content_ideas_user ON public.ai_content_ideas(user_id, status, created_at DESC);

-- 5. Updated At Trigger for brand_knowledge
CREATE OR REPLACE FUNCTION public.handle_brand_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_brand_knowledge_updated_at ON public.brand_knowledge;
CREATE TRIGGER update_brand_knowledge_updated_at 
    BEFORE UPDATE ON public.brand_knowledge 
    FOR EACH ROW EXECUTE FUNCTION public.handle_brand_knowledge_updated_at();

-- 6. Row Level Security (RLS) Policies
ALTER TABLE public.brand_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_marketing_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_content_ideas ENABLE ROW LEVEL SECURITY;

-- brand_knowledge RLS
CREATE POLICY "Users can manage own brand_knowledge"
    ON public.brand_knowledge FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ai_marketing_insights RLS
CREATE POLICY "Users can manage own ai_marketing_insights"
    ON public.ai_marketing_insights FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ai_content_ideas RLS
CREATE POLICY "Users can manage own ai_content_ideas"
    ON public.ai_content_ideas FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
