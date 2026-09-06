-- ==============================================================================
-- NŪR SOCIAL — PHASE 7: ANALYTICS & PERFORMANCE INTELLIGENCE MIGRATION
-- ==============================================================================
-- Description: Creates analytics_snapshots and post_analytics tables with
-- multi-platform metrics, historical tracking, performance indexes, and RLS.
-- ==============================================================================

-- 1. Create ANALYTICS_SNAPSHOTS table (Account-level periodic metrics)
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    social_account_id UUID NOT NULL REFERENCES public.social_accounts(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp')),
    account_name TEXT NOT NULL,
    metric_date DATE NOT NULL,
    followers BIGINT NOT NULL DEFAULT 0,
    views BIGINT NOT NULL DEFAULT 0,
    likes BIGINT NOT NULL DEFAULT 0,
    comments BIGINT NOT NULL DEFAULT 0,
    shares BIGINT NOT NULL DEFAULT 0,
    reach BIGINT NOT NULL DEFAULT 0,
    impressions BIGINT NOT NULL DEFAULT 0,
    engagement_rate NUMERIC(6, 3) NOT NULL DEFAULT 0.000,
    metrics_available JSONB NOT NULL DEFAULT '[]'::jsonb,
    metrics_unavailable JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(social_account_id, metric_date)
);

-- 2. Create POST_ANALYTICS table (Individual post performance metrics)
CREATE TABLE IF NOT EXISTS public.post_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
    publishing_job_id UUID REFERENCES public.publishing_jobs(id) ON DELETE SET NULL,
    scheduled_post_id UUID REFERENCES public.scheduled_posts(id) ON DELETE SET NULL,
    social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE SET NULL,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp')),
    platform_post_id TEXT NOT NULL,
    post_title TEXT,
    post_topic TEXT,
    content_type TEXT NOT NULL DEFAULT 'other' 
        CHECK (content_type IN ('video', 'image', 'reel_short', 'text', 'carousel', 'story', 'other')),
    published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    views BIGINT NOT NULL DEFAULT 0,
    likes BIGINT NOT NULL DEFAULT 0,
    comments BIGINT NOT NULL DEFAULT 0,
    shares BIGINT NOT NULL DEFAULT 0,
    reach BIGINT NOT NULL DEFAULT 0,
    impressions BIGINT NOT NULL DEFAULT 0,
    engagement_rate NUMERIC(6, 3) NOT NULL DEFAULT 0.000,
    metrics_available JSONB NOT NULL DEFAULT '[]'::jsonb,
    metrics_unavailable JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(social_account_id, platform_post_id)
);

-- 3. Query Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_user ON public.analytics_snapshots(user_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_account ON public.analytics_snapshots(social_account_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_platform ON public.analytics_snapshots(user_id, platform, metric_date);

CREATE INDEX IF NOT EXISTS idx_post_analytics_user ON public.post_analytics(user_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_analytics_post ON public.post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_account ON public.post_analytics(social_account_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_analytics_platform ON public.post_analytics(platform, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_analytics_topic ON public.post_analytics(user_id, post_topic);
CREATE INDEX IF NOT EXISTS idx_post_analytics_content_type ON public.post_analytics(user_id, content_type);

-- 4. Auto-update updated_at triggers
CREATE TRIGGER update_analytics_snapshots_updated_at 
    BEFORE UPDATE ON public.analytics_snapshots 
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_post_analytics_updated_at 
    BEFORE UPDATE ON public.post_analytics 
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;

-- analytics_snapshots RLS
CREATE POLICY "Users can view own analytics_snapshots"
    ON public.analytics_snapshots FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics_snapshots"
    ON public.analytics_snapshots FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics_snapshots"
    ON public.analytics_snapshots FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analytics_snapshots"
    ON public.analytics_snapshots FOR DELETE
    USING (auth.uid() = user_id);

-- post_analytics RLS
CREATE POLICY "Users can view own post_analytics"
    ON public.post_analytics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own post_analytics"
    ON public.post_analytics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own post_analytics"
    ON public.post_analytics FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own post_analytics"
    ON public.post_analytics FOR DELETE
    USING (auth.uid() = user_id);
