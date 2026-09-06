-- ==============================================================================
-- NŪR SOCIAL — ALL PHASES (1 to 5) CONSOLIDATED DATABASE SCHEMA
-- ==============================================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cdiapfbgzmdkgsuwvbfh/sql
-- ==============================================================================

-- 1. Helper function for auto-updating updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==============================================================================
-- 2. PHASE 1: MEDIA & POSTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    width INT,
    height INT,
    duration NUMERIC,
    status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('uploaded', 'processing', 'ready', 'failed', 'deleted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    media_id UUID REFERENCES public.media(id) ON DELETE SET NULL,
    title TEXT,
    topic TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'ready', 'published', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. PHASE 2 & 3: PLATFORM CONTENT & OPTIMIZATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.platform_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp')),
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
    seo_keywords JSONB NOT NULL DEFAULT '{"primary":[], "secondary":[], "long_tail":[]}'::jsonb,
    hashtag_categories JSONB NOT NULL DEFAULT '{"brand":[], "topic":[], "audience":[]}'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'needs_review')),
    optimization_status TEXT NOT NULL DEFAULT 'optimized' CHECK (optimization_status IN ('draft', 'optimizing', 'optimized', 'needs_review', 'approved', 'edited', 'failed')),
    version INT NOT NULL DEFAULT 1,
    quality_score INT NOT NULL DEFAULT 95,
    score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    quality_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    optimization_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
    optimized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_post_platform UNIQUE (post_id, platform)
);

CREATE TABLE IF NOT EXISTS public.content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp')),
    version INT NOT NULL,
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
    quality_score INT NOT NULL DEFAULT 95,
    score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    optimization_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
    revision_instruction TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. PHASE 4: SOCIAL MEDIA ACCOUNTS & OAUTH
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp')),
    account_id TEXT NOT NULL,
    account_name TEXT NOT NULL,
    username TEXT,
    profile_image_url TEXT,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'connected' 
        CHECK (status IN ('connected', 'expiring_soon', 'expired', 'revoked', 'error', 'disconnected')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_platform_account UNIQUE (user_id, platform, account_id)
);

CREATE TABLE IF NOT EXISTS public.oauth_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp')),
    state_token TEXT NOT NULL UNIQUE,
    code_verifier TEXT,
    redirect_uri TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 5. PHASE 5: PUBLISHING JOBS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.publishing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
    social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE SET NULL,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp')),
    account_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'published', 'failed', 'cancelled', 'unsupported', 'needs_reconnect')),
    platform_post_id TEXT,
    platform_post_url TEXT,
    error_code TEXT,
    error_message TEXT,
    retry_count INT NOT NULL DEFAULT 0,
    request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    response_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 6. PHASE 6: SMART SCHEDULING & NOTIFICATIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
    social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE SET NULL,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'whatsapp')),
    account_name TEXT NOT NULL,
    content_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    media_id UUID REFERENCES public.media(id) ON DELETE SET NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    status TEXT NOT NULL DEFAULT 'scheduled' 
        CHECK (status IN ('scheduled', 'processing', 'published', 'failed', 'cancelled', 'paused', 'needs_reconnect')),
    publishing_job_id UUID REFERENCES public.publishing_jobs(id) ON DELETE SET NULL,
    locked_at TIMESTAMPTZ,
    locked_by TEXT,
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    error_message TEXT,
    published_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.in_app_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('success', 'error', 'warning', 'info')),
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 7. INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_media_user_id ON public.media(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_platform_content_post_id ON public.platform_content(post_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON public.social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON public.social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_publishing_jobs_user_id ON public.publishing_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_publishing_jobs_post_id ON public.publishing_jobs(post_id);
CREATE INDEX IF NOT EXISTS idx_publishing_jobs_status ON public.publishing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_publishing_jobs_created_at ON public.publishing_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON public.scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_due_status ON public.scheduled_posts(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_calendar ON public.scheduled_posts(user_id, scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_platform ON public.scheduled_posts(platform);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user ON public.in_app_notifications(user_id, is_read, created_at DESC);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publishing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

-- media
DO $$ BEGIN
  CREATE POLICY "Users can manage own media" ON public.media FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- posts
DO $$ BEGIN
  CREATE POLICY "Users can manage own posts" ON public.posts FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- platform_content
DO $$ BEGIN
  CREATE POLICY "Users can manage own platform_content" ON public.platform_content FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- content_versions
DO $$ BEGIN
  CREATE POLICY "Users can manage own content_versions" ON public.content_versions FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- social_accounts
DO $$ BEGIN
  CREATE POLICY "Users can manage own social_accounts" ON public.social_accounts FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- oauth_states
DO $$ BEGIN
  CREATE POLICY "Users can manage own oauth_states" ON public.oauth_states FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- publishing_jobs
DO $$ BEGIN
  CREATE POLICY "Users can manage own publishing_jobs" ON public.publishing_jobs FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- scheduled_posts
DO $$ BEGIN
  CREATE POLICY "Users can manage own scheduled_posts" ON public.scheduled_posts FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- in_app_notifications
DO $$ BEGIN
  CREATE POLICY "Users can manage own in_app_notifications" ON public.in_app_notifications FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==============================================================================
-- PHASE 7: ANALYTICS & PERFORMANCE INTELLIGENCE
-- ==============================================================================

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

CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_user ON public.analytics_snapshots(user_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_account ON public.analytics_snapshots(social_account_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_platform ON public.analytics_snapshots(user_id, platform, metric_date);

CREATE INDEX IF NOT EXISTS idx_post_analytics_user ON public.post_analytics(user_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_analytics_post ON public.post_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_analytics_account ON public.post_analytics(social_account_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_analytics_platform ON public.post_analytics(platform, published_at DESC);

ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage own analytics_snapshots" ON public.analytics_snapshots FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own post_analytics" ON public.post_analytics FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


