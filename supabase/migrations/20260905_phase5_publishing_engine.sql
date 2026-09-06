-- ==============================================================================
-- NŪR SOCIAL — PHASE 5: AUTOMATIC SOCIAL MEDIA PUBLISHING ENGINE MIGRATION
-- ==============================================================================
-- Description: Creates publishing_jobs table with platform tracking, status,
-- error logging, payload persistence, indexes, triggers, and Row Level Security.
-- ==============================================================================

-- 1. Create PUBLISHING_JOBS table
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

-- 2. Add Indexes for Query Optimization and Idempotency
CREATE INDEX IF NOT EXISTS idx_publishing_jobs_user_id ON public.publishing_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_publishing_jobs_post_id ON public.publishing_jobs(post_id);
CREATE INDEX IF NOT EXISTS idx_publishing_jobs_social_account_id ON public.publishing_jobs(social_account_id);
CREATE INDEX IF NOT EXISTS idx_publishing_jobs_platform ON public.publishing_jobs(platform);
CREATE INDEX IF NOT EXISTS idx_publishing_jobs_status ON public.publishing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_publishing_jobs_created_at ON public.publishing_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_publishing_jobs_user_post ON public.publishing_jobs(user_id, post_id, platform);

-- 3. Auto-update updated_at trigger on publishing_jobs
CREATE TRIGGER update_publishing_jobs_updated_at 
    BEFORE UPDATE ON public.publishing_jobs 
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.publishing_jobs ENABLE ROW LEVEL SECURITY;

-- publishing_jobs RLS policies
CREATE POLICY "Users can view own publishing_jobs"
    ON public.publishing_jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own publishing_jobs"
    ON public.publishing_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own publishing_jobs"
    ON public.publishing_jobs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own publishing_jobs"
    ON public.publishing_jobs FOR DELETE
    USING (auth.uid() = user_id);
